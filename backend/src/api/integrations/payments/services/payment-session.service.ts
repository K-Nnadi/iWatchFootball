import {
    BadRequestException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { PaymentSession, PaymentSessionCheckoutContext } from '../entities/payment-session.entity';
import { PaymentSessionStatus } from '../../../enums/paymentSession.enum';
import { PaymentIntegrationRegistry } from '../registry/payment-integration.registry';
import { TicketHoldService } from '../../../modules/ticketHold/ticketHold.service';
import { DiscountCodeService } from '../../../modules/discountCode/discountCode.service';
import { PaymentProcessorService } from '../../../modules/paymentProcessor/paymentProcessor.module';
import { CreatePaymentSessionDto } from '../dto/create-payment-session.dto';

@Injectable()
export class PaymentSessionService {
    constructor(
        @InjectRepository(PaymentSession)
        private readonly sessionRepo: Repository<PaymentSession>,
        private readonly registry: PaymentIntegrationRegistry,
        private readonly ticketHoldService: TicketHoldService,
        private readonly discountCodeService: DiscountCodeService,
        private readonly paymentProcessorService: PaymentProcessorService,
        private readonly dataSource: DataSource,
    ) {}

    async createSession(userId: number, dto: CreatePaymentSessionDto) {
        if (dto.quantity < 1 || dto.quantity > 20) {
            throw new BadRequestException('Invalid quantity');
        }
        if (dto.unitPrice <= 0) {
            throw new BadRequestException('Invalid price');
        }

        const hold = await this.ticketHoldService.verify({
            fixtureId: dto.fixtureId,
            offerKey: dto.offerKey,
            holderId: dto.holderId,
            userId,
        });

        const processor = await this.paymentProcessorService.findBySlug(dto.providerSlug ?? 'stripe');
        if (!processor) {
            throw new BadRequestException('Payment processor not available');
        }

        const amount = await this.computeTotal(userId, dto);
        const holdExpiresAt = new Date(hold.expiresAt as string);

        const checkoutContext: PaymentSessionCheckoutContext = {
            fixtureId: dto.fixtureId,
            offerKey: dto.offerKey,
            holderId: dto.holderId,
            quantity: dto.quantity,
            unitPrice: dto.unitPrice,
            category: dto.category,
            discountCodeId: dto.discountCodeId,
            paymentProcessorId: processor.id,
        };

        const session = await this.sessionRepo.save(
            this.sessionRepo.create({
                userId,
                providerSlug: processor.slug,
                status: PaymentSessionStatus.PENDING,
                amount: amount.toFixed(2),
                currency: 'gbp',
                checkoutContext,
                idempotencyKey: dto.idempotencyKey,
                expiresAt: holdExpiresAt,
            }),
        );

        const adapter = this.registry.get(processor.slug);
        const stripeSession = await adapter.createCheckoutSession({
            type: 'primary_checkout',
            userId,
            amount,
            currency: 'gbp',
            idempotencyKey: dto.idempotencyKey ?? `ps-${session.id}`,
            paymentSessionId: session.id,
            checkout: checkoutContext,
            holdExpiresAt,
        });

        session.providerSessionId = stripeSession.providerSessionId;
        await this.sessionRepo.save(session);

        return {
            paymentSessionId: session.id,
            clientSecret: stripeSession.clientSecret,
            publishableKey: stripeSession.publishableKey,
            providerSlug: processor.slug,
            amount,
            currency: 'gbp',
            expiresAt: stripeSession.expiresAt.toISOString(),
        };
    }

    async getSession(userId: number, sessionId: number) {
        const session = await this.sessionRepo.findOne({ where: { id: sessionId, userId } });
        if (!session) {
            throw new NotFoundException('Payment session not found');
        }
        return {
            id: session.id,
            status: session.status,
            amount: session.amount,
            currency: session.currency,
            providerSlug: session.providerSlug,
            expiresAt: session.expiresAt.toISOString(),
            providerPaymentRef: session.providerPaymentRef,
        };
    }

    private async computeTotal(userId: number, dto: CreatePaymentSessionDto): Promise<number> {
        const baseTotal = Math.round(dto.unitPrice * dto.quantity * 100) / 100;
        if (!dto.discountCodeId) return baseTotal;

        return this.dataSource.transaction(async (manager) => {
            const discountAmount = await this.discountCodeService.assertEligible(
                manager,
                dto.discountCodeId!,
                userId,
                baseTotal,
            );
            return Math.max(0, Math.round((baseTotal - discountAmount) * 100) / 100);
        });
    }
}
