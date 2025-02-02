import {Injectable, Module} from '@nestjs/common';
import {InjectRepository, TypeOrmModule} from "@nestjs/typeorm";
import {CreateCompetitionStandingDTO, CompetitionStanding} from "./competitionStanding";
import {CrudController} from "@iWatchFootball/base-tools/crud/crud.controller";
import {AuthedController} from "@iWatchFootball/base-tools/decorators/controller.decorator";
import {CrudRepoAdapter} from "@iWatchFootball/base-tools/crud/crud.repo.adapter";
import {Repository} from "typeorm";


@Injectable()
export class CompetitionStandingService extends CrudRepoAdapter<CompetitionStanding, CreateCompetitionStandingDTO> {
    constructor(@InjectRepository(CompetitionStanding) private entityRepo: Repository<CompetitionStanding>) {
        super(entityRepo);
    }
}

@AuthedController('competitionStanding')
export class CompetitionStandingController extends CrudController<CompetitionStanding, CreateCompetitionStandingDTO>(CompetitionStanding, CreateCompetitionStandingDTO){
    constructor(private service: CompetitionStandingService) {
        super(service)
    }
}

@Module({
    imports: [TypeOrmModule.forFeature([CompetitionStanding])],
    controllers: [CompetitionStandingController],
    providers: [CompetitionStandingService],
    exports: [CompetitionStandingService]
})


export class CompetitionStandingModule {}
