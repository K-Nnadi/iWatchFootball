import {Injectable, Module} from '@nestjs/common';
import {InjectRepository, TypeOrmModule} from "@nestjs/typeorm";
import {CreateLoyaltyEventDTO, LoyaltyEvent} from "./loyaltyEvent.entity";
import {CrudController} from "@iWatchFootball/base-tools/crud/crud.controller";
import {AuthedController} from "@iWatchFootball/base-tools/decorators/controller.decorator";
import {CrudRepoAdapter} from "@iWatchFootball/base-tools/crud/crud.repo.adapter";
import {Repository} from "typeorm";


@Injectable()
export class LoyaltyEventService extends CrudRepoAdapter<LoyaltyEvent, CreateLoyaltyEventDTO> {
    constructor(@InjectRepository(LoyaltyEvent) private entityRepo: Repository<LoyaltyEvent>) {
        super(entityRepo);
    }
}

@AuthedController('loyaltyEvent')
export class LoyaltyEventController extends CrudController<LoyaltyEvent, CreateLoyaltyEventDTO>(LoyaltyEvent, CreateLoyaltyEventDTO) {
    constructor(private service: LoyaltyEventService) {
        super(service)
    }
}

@Module({
    imports: [TypeOrmModule.forFeature([LoyaltyEvent])],
    controllers: [LoyaltyEventController],
    providers: [LoyaltyEventService],
    exports: [LoyaltyEventService]
})

export class LoyaltyEventModule {
}

