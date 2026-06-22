import {Injectable, Module} from '@nestjs/common';
import {InjectRepository, TypeOrmModule} from "@nestjs/typeorm";
import {CreateFixtureDTO, Fixture} from "./fixture.entity";
import {CrudController} from "@iWatchFootball/base-tools/crud/crud.controller";
import {AuthedController} from "@iWatchFootball/base-tools/decorators/controller.decorator";
import {CrudRepoAdapter} from "@iWatchFootball/base-tools/crud/crud.repo.adapter";
import {Repository} from "typeorm";
import { Goal } from '../goal/goal.entity';
import { Card } from '../card/card.entity';
import { Substitution } from '../substitution/substitution.entity';
import { Player } from '../player/player.entity';
import { FixtureTimelineService } from './fixture-timeline.service';
import { FixtureTimelineController } from './fixture-timeline.controller';
import { FixtureTeamStatModule } from '../fixtureTeamStat/fixtureTeamStat.module';
import { FixtureTeamStatsController } from './fixture-team-stats.controller';


@Injectable()
export class FixtureService extends CrudRepoAdapter<Fixture, CreateFixtureDTO> {
  constructor(@InjectRepository(Fixture) private entityRepo: Repository<Fixture>) {
    super(entityRepo);
  }
}

@AuthedController('fixture')
export class FixtureController extends CrudController<Fixture, CreateFixtureDTO>(Fixture, CreateFixtureDTO){
  constructor(private service: FixtureService) {
    super(service)
  }
}

@Module({
  imports: [
    TypeOrmModule.forFeature([Fixture, Goal, Card, Substitution, Player]),
    FixtureTeamStatModule,
  ],
  controllers: [FixtureController, FixtureTimelineController, FixtureTeamStatsController],
  providers: [FixtureService, FixtureTimelineService],
  exports: [FixtureService]
})


export class FixtureModule {}
