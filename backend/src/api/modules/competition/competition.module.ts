import {Injectable, Module} from '@nestjs/common';
import {InjectRepository, TypeOrmModule} from "@nestjs/typeorm";
import {CreateCompetitionDTO, Competition} from "./competition.entity";
import {CrudController} from "@iWatchFootball/base-tools/crud/crud.controller";
import {AuthedController} from "@iWatchFootball/base-tools/decorators/controller.decorator";
import {CrudRepoAdapter} from "@iWatchFootball/base-tools/crud/crud.repo.adapter";
import {Repository} from "typeorm";


@Injectable()
export class CompetitionService extends CrudRepoAdapter<Competition, CreateCompetitionDTO> {
  constructor(@InjectRepository(Competition) private entityRepo: Repository<Competition>) {
    super(entityRepo);
  }
}

@AuthedController('competition')
export class CompetitionController extends CrudController<Competition, CreateCompetitionDTO>(Competition, CreateCompetitionDTO){
  constructor(private service: CompetitionService) {
    super(service)
  }
}

@Module({
  imports: [TypeOrmModule.forFeature([Competition])],
  controllers: [CompetitionController],
  providers: [CompetitionService],
  exports: [CompetitionService]
})


export class CompetitionModule {}
