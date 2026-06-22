import {Injectable, Module} from '@nestjs/common';
import {InjectRepository, TypeOrmModule} from "@nestjs/typeorm";
import {CreatePlayerDTO, Player} from "./player.entity";
import {CrudController} from "@iWatchFootball/base-tools/crud/crud.controller";
import {AuthedController} from "@iWatchFootball/base-tools/decorators/controller.decorator";
import {CrudRepoAdapter} from "@iWatchFootball/base-tools/crud/crud.repo.adapter";
import {Repository} from "typeorm";
import { PlayerLineUp } from '../playerLineUp/playerLineUp.entity';
import { Goal } from '../goal/goal.entity';
import { Team } from '../team/team.entity';
import { Card } from '../card/card.entity';
import { Substitution } from '../substitution/substitution.entity';
import { PlayerMatchesService } from './player-matches.service';
import { PlayerProfileController } from './player-profile.controller';
import { PlayerFixtureStatModule } from '../playerFixtureStat/playerFixtureStat.module';
import { PlatformConfigModule } from '../platformConfig/platformConfig.module';


@Injectable()
export class PlayerService extends CrudRepoAdapter<Player, CreatePlayerDTO> {
    constructor(@InjectRepository(Player) private entityRepo: Repository<Player>) {
        super(entityRepo);
    }
}

@AuthedController('player')
export class PlayerController extends CrudController<Player, CreatePlayerDTO>(Player, CreatePlayerDTO){
    constructor(private service: PlayerService) {
        super(service)
    }
}

@Module({
    imports: [
        TypeOrmModule.forFeature([Player, PlayerLineUp, Goal, Team, Card, Substitution]),
        PlayerFixtureStatModule,
        PlatformConfigModule,
    ],
    controllers: [PlayerController, PlayerProfileController],
    providers: [PlayerService, PlayerMatchesService],
    exports: [PlayerService, PlayerMatchesService]
})


export class PlayerModule {}
