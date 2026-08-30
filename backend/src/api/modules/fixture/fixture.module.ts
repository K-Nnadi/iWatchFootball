import {Injectable, Logger, Module} from '@nestjs/common';
import {InjectRepository, TypeOrmModule} from "@nestjs/typeorm";
import {CreateFixtureDTO, Fixture} from "./fixture.entity";
import {CrudController} from "@iWatchFootball/base-tools/crud/crud.controller";
import {AuthedController} from "@iWatchFootball/base-tools/decorators/controller.decorator";
import {CrudRepoAdapter} from "@iWatchFootball/base-tools/crud/crud.repo.adapter";
import {DeepPartial, Repository} from "typeorm";
import { Goal } from '../goal/goal.entity';
import { Card } from '../card/card.entity';
import { Substitution } from '../substitution/substitution.entity';
import { Player } from '../player/player.entity';
import { FixtureTimelineService } from './fixture-timeline.service';
import { FixtureTimelineController } from './fixture-timeline.controller';
import { FixtureTeamStatModule } from '../fixtureTeamStat/fixtureTeamStat.module';
import { FixtureTeamStatsController } from './fixture-team-stats.controller';
import { FixtureLifecycleModule } from '../../complexModules/fixtureLifecycle/fixture-lifecycle.module';
import { FixtureLifecycleService } from '../../complexModules/fixtureLifecycle/fixture-lifecycle.service';
import { FixtureStatus } from '../../enums/fixture.enum';
import { isAbandonedFixtureStatus } from '../../complexModules/fixtureLifecycle/fixture-lifecycle.rules';


@Injectable()
export class FixtureService extends CrudRepoAdapter<Fixture, CreateFixtureDTO> {
  private readonly fixtureLogger = new Logger(FixtureService.name);

  constructor(
    @InjectRepository(Fixture) private entityRepo: Repository<Fixture>,
    private readonly lifecycle: FixtureLifecycleService,
  ) {
    super(entityRepo);
  }

  async update(id: number, entity: DeepPartial<Fixture>): Promise<DeepPartial<Fixture> | null> {
    const incomingStatus = entity.status as FixtureStatus | undefined;
    let previousStatus: FixtureStatus | undefined;
    if (isAbandonedFixtureStatus(incomingStatus)) {
      const current = await this.entityRepo.findOne({
        where: { id },
        select: ['id', 'status'],
      });
      previousStatus = current?.status;
    }

    const result = await super.update(id, entity);

    if (isAbandonedFixtureStatus(incomingStatus)) {
      try {
        await this.lifecycle.onStatusChange(id, previousStatus, incomingStatus);
      } catch (err) {
        this.fixtureLogger.error(
          `Fixture lifecycle cascade failed for fixture ${id}: ${err instanceof Error ? err.message : err}`,
        );
      }
    }

    return result;
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
    FixtureLifecycleModule,
  ],
  controllers: [FixtureController, FixtureTimelineController, FixtureTeamStatsController],
  providers: [FixtureService, FixtureTimelineService],
  exports: [FixtureService]
})


export class FixtureModule {}
