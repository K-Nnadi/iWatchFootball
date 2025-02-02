import { ApiBody, ApiOkResponse, ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Body, Get, Module, Param, Query } from '@nestjs/common';
import { IsNumber, IsOptional, IsString } from 'class-validator';
import { AuthController } from '@iWatchFootball/base-tools/decorators/controller.decorator';
import { Competition } from '../modules/competition/competition';
import { Season } from '../modules/season/season';
import { Team } from '../modules/team/team';
import { Fixture } from '../modules/fixture/fixture';
import { CompetitionModule, CompetitionService } from '../modules/competition/competition.module';
import { SeasonModule, SeasonService } from '../modules/season/season.module';
import { TeamCompetitionSeasonModule, TeamCompetitionSeasonService } from '../modules/teamCompetitionSeason/teamCompetitionSeason.module';
import { FixtureModule, FixtureService } from '../modules/fixture/fixture.module';
import { TeamModule, TeamService } from '../modules/team/team.module';

export class CompetitionSeasonResponse {
    @ApiProperty({ type: Competition })
    competition!: Competition;

    @ApiProperty({ type: Season })
    season!: Season;

    @ApiProperty({ type: [Team] })
    teams!: Team[];

    @ApiProperty({ type: [Fixture] })
    fixtures!: Fixture[];
}

export class TeamStanding {
    @ApiProperty({ type: Team })
    team!: Team;

    @ApiProperty()
    @IsNumber()
    played!: number;

    @ApiProperty()
    @IsNumber()
    won!: number;

    @ApiProperty()
    @IsNumber()
    drawn!: number;

    @ApiProperty()
    @IsNumber()
    lost!: number;

    @ApiProperty()
    @IsNumber()
    goalsFor!: number;

    @ApiProperty()
    @IsNumber()
    goalsAgainst!: number;

    @ApiProperty()
    @IsNumber()
    points!: number;
}

@AuthController('competition')
export class CompetitionController {
    constructor(
        private competitionService: CompetitionService,
        private seasonService: SeasonService,
        private teamCompetitionSeasonService: TeamCompetitionSeasonService,
        private fixtureService: FixtureService,
        private teamService: TeamService,
    ) {}

    @Get(':competitionId/season/:seasonId/complete')
    @ApiOkResponse({ type: CompetitionSeasonResponse })
    async getCompetitionSeasonData(
        @Param('competitionId') competitionId: number,
        @Param('seasonId') seasonId: number
    ) {
        const competition = await this.competitionService.findOne(competitionId);
        const season = await this.seasonService.findOne(seasonId);

        const teams = await this.teamCompetitionSeasonService.find({
            where: { competitionId, seasonId },
            relations: ['team']
        });

        const fixtures = await this.fixtureService.find({
            where: { competitionId, seasonId },
            relations: ['homeTeam', 'awayTeam', 'stadium']
        });

        return {
            competition,
            season,
            teams: teams.map(t => t.team),
            fixtures
        };
    }


    @Get(':competitionId/fixtures')
    @ApiOkResponse({ type: [Fixture] })
    async getCompetitionFixtures(
        @Param('competitionId') competitionId: number,
        @Query('seasonId') @IsOptional() @IsNumber() seasonId?: number,
        @Query('status') @IsOptional() @IsString() status?: string
    ) {
        const query = this.fixtureService
            .createQueryBuilder('fixture')
            .leftJoinAndSelect('fixture.homeTeam', 'homeTeam')
            .leftJoinAndSelect('fixture.awayTeam', 'awayTeam')
            .leftJoinAndSelect('fixture.stadium', 'stadium')
            .where('fixture.competitionId = :competitionId', { competitionId });

        if (seasonId) {
            query.andWhere('fixture.seasonId = :seasonId', { seasonId });
        }

        if (status) {
            query.andWhere('fixture.status = :status', { status });
        }

        return query.getMany();
    }

    @Get(':competitionId/teams')
    @ApiOkResponse({ type: [Team] })
    async getCompetitionTeams(
        @Param('competitionId') competitionId: number,
        @Query('seasonId') @IsOptional() @IsNumber() seasonId?: number
    ) {
        if (!seasonId) {
            const currentSeason = await this.seasonService.findOne({
                where: { isCurrent: true }
            });
            seasonId = currentSeason?.id;
        }

        const teams = await this.teamCompetitionSeasonService.find({
            where: { competitionId, seasonId },
            relations: ['team']
        });

        return teams.map(t => t.team);
    }
}

@Module({
    imports: [
        CompetitionModule,
        SeasonModule,
        TeamCompetitionSeasonModule,
        FixtureModule,
        TeamModule
    ],
    controllers: [CompetitionController],
    providers: [],
    exports: []
})
export class CompetitionModule {}
