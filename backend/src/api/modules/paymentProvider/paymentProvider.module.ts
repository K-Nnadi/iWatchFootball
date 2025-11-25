import { Injectable, Module } from '@nestjs/common';
import { InjectRepository, TypeOrmModule } from '@nestjs/typeorm';
import { CreatePaymentProviderDTO, PaymentProvider } from './paymentProvider';
import { CrudController } from '@iWatchFootball/base-tools/crud/crud.controller';
import { AuthedController } from '@iWatchFootball/base-tools/decorators/controller.decorator';
import { CrudRepoAdapter } from '@iWatchFootball/base-tools/crud/crud.repo.adapter';
import { Repository } from 'typeorm';

@Injectable()
export class PaymentProviderService extends CrudRepoAdapter<PaymentProvider, CreatePaymentProviderDTO> {
    constructor(@InjectRepository(PaymentProvider) private entityRepo: Repository<PaymentProvider>) {
        super(entityRepo);
    }

    /**
     * Get all enabled payment providers (public endpoint)
     */
    async getEnabledProviders(): Promise<PaymentProvider[]> {
        return this.entityRepo.find({
            where: { enabled: true },
            select: ['id', 'name', 'slug', 'type', 'logoUrl'],
        });
    }
}

@AuthedController('paymentProvider')
export class PaymentProviderController extends CrudController<PaymentProvider, CreatePaymentProviderDTO>(
    PaymentProvider,
    CreatePaymentProviderDTO,
) {
    constructor(private service: PaymentProviderService) {
        super(service);
    }
}

@Module({
    imports: [TypeOrmModule.forFeature([PaymentProvider])],
    controllers: [PaymentProviderController],
    providers: [PaymentProviderService],
    exports: [PaymentProviderService],
})
export class PaymentProviderModule {}

