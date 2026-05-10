import {
    BadRequestException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { DiscountCode, DiscountType } from './discountCode.entity';
import { DiscountCodeUsage } from './discountCodeUsage.entity';

export interface ValidationResult {
    valid: boolean;
    discountAmount: number;
    type: DiscountType;
    value: number;
    discountCodeId: number;
}

export interface CreateDiscountCodeDto {
    code: string;
    type: DiscountType;
    value: number;
    maxUsesPerUser?: number;
    expiresAt?: string;
}

@Injectable()
export class DiscountCodeService {
    constructor(
        @InjectRepository(DiscountCode)
        private readonly codeRepo: Repository<DiscountCode>,
        @InjectRepository(DiscountCodeUsage)
        private readonly usageRepo: Repository<DiscountCodeUsage>,
    ) {}

    async validate(code: string, orderTotal: number, userId: number): Promise<ValidationResult> {
        const discount = await this.codeRepo.findOne({ where: { code } });

        if (!discount || discount.deletedAt) {
            throw new BadRequestException('Discount code not found');
        }
        if (!discount.active) {
            throw new BadRequestException('Discount code is no longer active');
        }
        if (discount.expiresAt && discount.expiresAt < new Date()) {
            throw new BadRequestException('Discount code has expired');
        }

        const usageCount = await this.usageRepo.count({
            where: { discountCodeId: discount.id, userId },
        });
        if (usageCount >= discount.maxUsesPerUser) {
            throw new BadRequestException('You have already used this discount code');
        }

        const discountAmount = this.computeDiscount(discount, orderTotal);

        return {
            valid: true,
            discountAmount,
            type: discount.type,
            value: Number(discount.value),
            discountCodeId: discount.id,
        };
    }

    /**
     * Validate eligibility inside a txn (writes nothing). Call before creating the Payment row
     * when {@link paymentId} is only known after save.
     */
    async assertEligible(
        manager: EntityManager,
        discountCodeId: number,
        userId: number,
        orderTotal: number,
    ): Promise<number> {
        const codeRepo = manager.getRepository(DiscountCode);
        const usageRepo = manager.getRepository(DiscountCodeUsage);

        const discount = await codeRepo.findOne({
            where: { id: discountCodeId },
            lock: { mode: 'pessimistic_write' },
        });
        if (!discount || !discount.active) {
            throw new BadRequestException('Discount code is no longer valid');
        }
        if (discount.expiresAt && discount.expiresAt < new Date()) {
            throw new BadRequestException('Discount code has expired');
        }

        const usageCount = await usageRepo.count({
            where: { discountCodeId: discount.id, userId },
        });
        if (usageCount >= discount.maxUsesPerUser) {
            throw new BadRequestException('You have already used this discount code');
        }

        return this.computeDiscount(discount, orderTotal);
    }

    /**
     * Persist usage after amount is finalized (pair with {@link assertEligible}).
     */
    async recordUsage(
        manager: EntityManager,
        discountCodeId: number,
        userId: number,
        discountAmount: number,
        paymentId?: number,
    ): Promise<void> {
        const codeRepo = manager.getRepository(DiscountCode);
        const usageRepo = manager.getRepository(DiscountCodeUsage);

        const discount = await codeRepo.findOne({
            where: { id: discountCodeId },
            lock: { mode: 'pessimistic_write' },
        });
        if (!discount) {
            throw new BadRequestException('Discount code not found');
        }

        const usage = usageRepo.create({
            discountCodeId: discount.id,
            userId,
            paymentId,
            discountAmount,
        });
        await usageRepo.save(usage);

        discount.totalUsesCount += 1;
        await codeRepo.save(discount);
    }

    /**
     * Apply discount in one shot (eligible + record). Prefer {@link assertEligible}+{@link recordUsage}
     * for card flows that need paymentId populated.
     */
    async apply(
        manager: EntityManager,
        discountCodeId: number,
        userId: number,
        orderTotal: number,
        paymentId?: number,
    ): Promise<number> {
        const amount = await this.assertEligible(manager, discountCodeId, userId, orderTotal);
        await this.recordUsage(manager, discountCodeId, userId, amount, paymentId);
        return amount;
    }

    async create(dto: CreateDiscountCodeDto): Promise<DiscountCode> {
        const existing = await this.codeRepo.findOne({ where: { code: dto.code } });
        if (existing) {
            throw new BadRequestException('A discount code with that code already exists');
        }
        const entity = this.codeRepo.create({
            code: dto.code.toUpperCase().trim(),
            type: dto.type,
            value: dto.value,
            maxUsesPerUser: dto.maxUsesPerUser ?? 1,
            expiresAt: dto.expiresAt ? new Date(dto.expiresAt) : undefined,
            active: true,
            totalUsesCount: 0,
        });
        return this.codeRepo.save(entity);
    }

    async findAll(): Promise<DiscountCode[]> {
        return this.codeRepo.find({ order: { createdAt: 'DESC' } });
    }

    async findOne(id: number): Promise<DiscountCode> {
        const code = await this.codeRepo.findOne({ where: { id } });
        if (!code) throw new NotFoundException('Discount code not found');
        return code;
    }

    /** Compute discount amount by ID (no DB write) — used to pre-check before payment creation */
    async previewById(discountCodeId: number, orderTotal: number, userId: number): Promise<number> {
        const discount = await this.codeRepo.findOne({ where: { id: discountCodeId } });
        if (!discount || !discount.active) return 0;
        if (discount.expiresAt && discount.expiresAt < new Date()) return 0;
        const usageCount = await this.usageRepo.count({ where: { discountCodeId, userId } });
        if (usageCount >= discount.maxUsesPerUser) return 0;
        return this.computeDiscount(discount, orderTotal);
    }

    async toggleActive(id: number): Promise<DiscountCode> {
        const code = await this.findOne(id);
        code.active = !code.active;
        return this.codeRepo.save(code);
    }

    private computeDiscount(discount: DiscountCode, orderTotal: number): number {
        const value = Number(discount.value);
        if (discount.type === DiscountType.PERCENTAGE) {
            return Math.round((orderTotal * value) / 100 * 100) / 100;
        }
        return Math.min(value, orderTotal);
    }
}
