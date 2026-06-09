import { Injectable, Module } from '@nestjs/common';
import { InjectRepository, TypeOrmModule } from '@nestjs/typeorm';
import { CreatePaymentProcessorDTO, PaymentProcessor } from './paymentProcessor.entity';
import { CrudController } from '@iWatchFootball/base-tools/crud/crud.controller';
import { AuthedController } from '@iWatchFootball/base-tools/decorators/controller.decorator';
import { CrudRepoAdapter } from '@iWatchFootball/base-tools/crud/crud.repo.adapter';
import { Repository } from 'typeorm';

@Injectable()
export class PaymentProcessorService extends CrudRepoAdapter<PaymentProcessor, CreatePaymentProcessorDTO> {
    constructor(@InjectRepository(PaymentProcessor) private entityRepo: Repository<PaymentProcessor>) {
        super(entityRepo);
    }

    /** Enabled processors for checkout UI (no secrets). */
    async getEnabledProcessors(): Promise<PaymentProcessor[]> {
        return this.entityRepo.find({
            where: { enabled: true },
            select: ['id', 'name', 'slug', 'type', 'logoUrl'],
        });
    }

    async findBySlug(slug: string): Promise<PaymentProcessor | null> {
        return this.entityRepo.findOne({ where: { slug, enabled: true } });
    }
}

@AuthedController('paymentProcessor')
export class PaymentProcessorController extends CrudController<PaymentProcessor, CreatePaymentProcessorDTO>(
    PaymentProcessor,
    CreatePaymentProcessorDTO,
) {
    constructor(private service: PaymentProcessorService) {
        super(service);
    }
}

@Module({
    imports: [TypeOrmModule.forFeature([PaymentProcessor])],
    controllers: [PaymentProcessorController],
    providers: [PaymentProcessorService],
    exports: [PaymentProcessorService],
})
export class PaymentProcessorModule {}
