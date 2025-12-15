import {Injectable, Module} from '@nestjs/common';
import {InjectRepository, TypeOrmModule} from "@nestjs/typeorm";
import {CreateSeasonDTO, Season} from "./season.entity";
import {CrudController} from "@iWatchFootball/base-tools/crud/crud.controller";
import {AuthedController} from "@iWatchFootball/base-tools/decorators/controller.decorator";
import {CrudRepoAdapter} from "@iWatchFootball/base-tools/crud/crud.repo.adapter";
import {Repository} from "typeorm";


@Injectable()
export class SeasonService extends CrudRepoAdapter<Season, CreateSeasonDTO> {
    constructor(@InjectRepository(Season) private entityRepo: Repository<Season>) {
        super(entityRepo);
    }
}

@AuthedController('season')
export class SeasonController extends CrudController<Season, CreateSeasonDTO>(Season, CreateSeasonDTO) {
    constructor(private service: SeasonService) {
        super(service)
    }
}

@Module({
    imports: [TypeOrmModule.forFeature([Season])],
    controllers: [SeasonController],
    providers: [SeasonService],
    exports: [SeasonService]
})


export class SeasonModule {
}
