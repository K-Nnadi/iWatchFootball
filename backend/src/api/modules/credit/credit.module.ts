import {Injectable, Module} from '@nestjs/common';
import {InjectRepository, TypeOrmModule} from "@nestjs/typeorm";
import {CreateCreditDTO, Credit} from "./credit";
import {CrudController} from "@iWatchFootball/base-tools/crud/crud.controller";
import {AuthedController} from "@iWatchFootball/base-tools/decorators/controller.decorator";
import {CrudRepoAdapter} from "@iWatchFootball/base-tools/crud/crud.repo.adapter";
import {Repository} from "typeorm";


@Injectable()
export class CreditService extends CrudRepoAdapter<Credit, CreateCreditDTO> {
    constructor(@InjectRepository(Credit) private entityRepo: Repository<Credit>) {
        super(entityRepo);
    }
}

@AuthedController('credit')
export class CreditController extends CrudController<Credit, CreateCreditDTO>(Credit, CreateCreditDTO) {
    constructor(private service: CreditService) {
        super(service)
    }
}

@Module({
    imports: [TypeOrmModule.forFeature([Credit])],
    controllers: [CreditController],
    providers: [CreditService],
    exports: [CreditService]
})

export class CreditModule {
}


