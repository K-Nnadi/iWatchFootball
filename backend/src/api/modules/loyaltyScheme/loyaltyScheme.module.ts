import {Injectable, Module} from '@nestjs/common';
import {InjectRepository, TypeOrmModule} from "@nestjs/typeorm";
import {CreateLoyaltySchemeDTO, LoyaltyScheme} from "./loyaltyScheme";
import {CrudController} from "@iWatchFootball/base-tools/crud/crud.controller";
import {AuthedController} from "@iWatchFootball/base-tools/decorators/controller.decorator";
import {CrudRepoAdapter} from "@iWatchFootball/base-tools/crud/crud.repo.adapter";
import {Repository} from "typeorm";


@Injectable()
export class LoyaltySchemeService extends CrudRepoAdapter<LoyaltyScheme, CreateLoyaltySchemeDTO> {
    constructor(@InjectRepository(LoyaltyScheme) private entityRepo: Repository<LoyaltyScheme>) {
        super(entityRepo);
    }
}

@AuthedController('loyaltyScheme')
export class LoyaltySchemeController extends CrudController<LoyaltyScheme, CreateLoyaltySchemeDTO>(LoyaltyScheme, CreateLoyaltySchemeDTO) {
    constructor(private service: LoyaltySchemeService) {
        super(service)
    }
}

@Module({
    imports: [TypeOrmModule.forFeature([LoyaltyScheme])],
    controllers: [LoyaltySchemeController],
    providers: [LoyaltySchemeService],
    exports: [LoyaltySchemeService]
})

export class LoyaltySchemeModule {
}

