import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FixtureTeamStat } from './fixtureTeamStat.entity';
import { FixtureTeamStatService } from './fixtureTeamStat.service';
import { PlayerFixtureStatModule } from '../playerFixtureStat/playerFixtureStat.module';
import { LineUpModule } from '../lineUp/lineUp.module';
import { PlayerFixtureStat } from '../playerFixtureStat/playerFixtureStat.entity';
import { Card } from '../card/card.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([FixtureTeamStat, PlayerFixtureStat, Card]),
        PlayerFixtureStatModule,
        LineUpModule,
    ],
    providers: [FixtureTeamStatService],
    exports: [FixtureTeamStatService],
})
export class FixtureTeamStatModule {}
