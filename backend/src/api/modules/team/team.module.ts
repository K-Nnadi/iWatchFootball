import {Injectable, Module} from '@nestjs/common';
import {InjectRepository, TypeOrmModule} from "@nestjs/typeorm";
import {CreateTeamDTO, Team} from "./team.entity";
import {CrudController} from "@iWatchFootball/base-tools/crud/crud.controller";
import {AuthedController} from "@iWatchFootball/base-tools/decorators/controller.decorator";
import {CrudRepoAdapter} from "@iWatchFootball/base-tools/crud/crud.repo.adapter";
import {Repository} from "typeorm";


@Injectable()
export class TeamService extends CrudRepoAdapter<Team, CreateTeamDTO> {
  constructor(@InjectRepository(Team) private entityRepo: Repository<Team>) {
    super(entityRepo);
  }
}

@AuthedController('team')
export class TeamController extends CrudController<Team, CreateTeamDTO>(Team, CreateTeamDTO){
  constructor(private service: TeamService) {
    super(service)
  }
}

@Module({
  imports: [TypeOrmModule.forFeature([Team])],
  controllers: [TeamController],
  providers: [TeamService],
  exports: [TeamService]
})


export class TeamModule {}
