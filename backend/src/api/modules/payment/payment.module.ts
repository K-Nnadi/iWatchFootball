import {Injectable, Module} from '@nestjs/common';
import {InjectRepository, TypeOrmModule} from "@nestjs/typeorm";
import {CreatePaymentDTO, Payment} from "./payment.entity";
import {CrudController} from "@iWatchFootball/base-tools/crud/crud.controller";
import {AuthedController} from "@iWatchFootball/base-tools/decorators/controller.decorator";
import {CrudRepoAdapter} from "@iWatchFootball/base-tools/crud/crud.repo.adapter";
import {Repository} from "typeorm";


@Injectable()
export class PaymentService extends CrudRepoAdapter<Payment, CreatePaymentDTO> {
    constructor(@InjectRepository(Payment) private entityRepo: Repository<Payment>) {
        super(entityRepo);
    }
}

@AuthedController('payment')
export class PaymentController extends CrudController<Payment, CreatePaymentDTO>(Payment, CreatePaymentDTO) {
    constructor(private service: PaymentService) {
        super(service)
    }
}

@Module({
    imports: [TypeOrmModule.forFeature([Payment])],
    controllers: [PaymentController],
    providers: [PaymentService],
    exports: [PaymentService]
})


export class PaymentModule {
}
