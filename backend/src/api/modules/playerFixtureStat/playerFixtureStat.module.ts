import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PlayerFixtureStat } from './playerFixtureStat.entity';
import { PlayerFixtureStatService } from './player-fixture-stat.service';
import { PlayerAdvancedStatsService } from './player-advanced-stats.service';
import { AttendanceAdvancedStatsService } from './attendance-advanced-stats.service';
import { Goal } from '../goal/goal.entity';
import { Card } from '../card/card.entity';
import { PlayerLineUp } from '../playerLineUp/playerLineUp.entity';
import { Fixture } from '../fixture/fixture.entity';
import { Log } from '../log/log.entity';
import { Player } from '../player/player.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([
            PlayerFixtureStat,
            Goal,
            Card,
            PlayerLineUp,
            Fixture,
            Log,
            Player,
        ]),
    ],
    providers: [
        PlayerFixtureStatService,
        PlayerAdvancedStatsService,
        AttendanceAdvancedStatsService,
    ],
    exports: [
        PlayerFixtureStatService,
        PlayerAdvancedStatsService,
        AttendanceAdvancedStatsService,
    ],
})
export class PlayerFixtureStatModule {}
