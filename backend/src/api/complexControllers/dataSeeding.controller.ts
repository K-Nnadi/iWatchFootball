import { ApiBearerAuth, ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Controller, Module, Post, Response, UseGuards } from '@nestjs/common';
import { FastifyReply } from 'fastify';
import { CompetitionModule, CompetitionService } from "../modules/competition/competition.module";
import { TeamModule, TeamService } from "../modules/team/team.module";
import { TeamCompetitionSeasonModule, TeamCompetitionSeasonService } from "../modules/teamCompetitionSeason/teamCompetitionSeason.module";
import { FixtureModule, FixtureService } from "../modules/fixture/fixture.module";
import { PlayerModule, PlayerService } from "../modules/player/player.module";
import { GoalModule, GoalService } from "../modules/goal/goal.module";
import { SeasonModule, SeasonService } from "../modules/season/season.module";
import { StadiumModule, StadiumService } from "../modules/stadium/stadium.module";
import { RefereeModule, RefereeService } from "../modules/referee/referee.module";
import { CardModule, CardService } from "../modules/card/card.module";
import { LineUpModule, LineupService } from "../modules/lineUp/lineUp.module";
import { PlayerLineUpModule, PlayerLineUpService } from "../modules/playerLineUp/playerLineUp.module";
import { ManagerModule, ManagerService } from "../modules/manager/manager.module";
import { CompetitionStandingModule, CompetitionStandingService } from "../modules/competitionStanding/competitionStanding.module";
import { SubstitutionModule, SubstitutionService } from "../modules/substitution/substitution.module";
import {FootballDataApiAdapter} from "../adapters/footballApiSports/footballDataApi.adapter";
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { UserRole } from '../../auth/types/security.types';

/**
 * Admin-only stub endpoints for pulling API-Football samples into local entities.
 *
 * When you enable persistence for fixtures or incidents (`Goal`, `Card`, `Substitution`):
 * - **Goals**: already require `teamId` (the scorer's side). Map API-Football `team.id` → local `Team` FK.
 * - **Cards**: set **`teamId`** to the booked player's club side in that fixture (same mapping).
 *   Do not omit `teamId` on new rows unless ingesting legacy data; timelines / aggregations assume it is present.
 * - **Substitutions**: already carry `teamId`; keep mapping consistent with goals/cards.
 *
 * `GoalModule`, `CardModule`, `SubstitutionModule` are wired here for upcoming ingest implementations.
 */

@ApiTags('dataSeeding')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@Controller('dataSeeding')
export class DataSeedingController {
    private readonly footballApi: FootballDataApiAdapter;

    constructor(
        private teamCompetitionSeasonService: TeamCompetitionSeasonService,
        private competitionService: CompetitionService,
        private competitionStandingService: CompetitionStandingService,
        private teamService: TeamService,
        private fixtureService: FixtureService,
        private lineupService: LineupService,
        private playerLineupService: PlayerLineUpService,
        private playerService: PlayerService,
        private managerService: ManagerService,
        private goalService: GoalService,
        private cardService: CardService,
        private substitutionService: SubstitutionService,
        private seasonService: SeasonService,
        private stadiumService: StadiumService,
        private refereeService: RefereeService
    ) {
        this.footballApi = new FootballDataApiAdapter(); // Initialize API adapter
    }

    @Post('teams')
    @ApiOperation({summary: 'Seed teams data', operationId: 'seedTeams'})
    @ApiBody({ type: 'any' })
    async teams(@Response() response: FastifyReply) {
        try {
            const teamsData = await this.footballApi.getTeams({ league: 39, season: 2023 });

            if (!teamsData || !teamsData.response) {
                return response.status(400).send({ message: 'No teams found' });
            }

            for (const team of teamsData.response) {
                // await this.teamService.createOrUpdate({
                //     teamId: team.team.id,
                //     name: team.team.name,
                //     logo: team.team.logo,
                //     country: team.team.country,
                //     founded: team.team.founded,
                //     stadium: team.venue.name,
                // });
            }

            return response.status(201).send({ message: 'Teams seeded successfully' });
        } catch (error) {
            console.error('Error seeding teams:', error);
            return response.status(500).send({ message: 'Error seeding teams' });
        }
    }

    @Post('leagues')
    @ApiOperation({summary: 'Seed leagues data', operationId: 'seedLeagues'})
    @ApiBody({ type: 'any' })
    async leagues(@Response() response: FastifyReply) {
        try {
            const leaguesData = await this.footballApi.getLeagues();

            if (!leaguesData || !leaguesData.response) {
                return response.status(400).send({ message: 'No leagues found' });
            }

            for (const league of leaguesData.response) {
                // await this.competitionService.createOrUpdate({
                //     leagueId: league.league.id,
                //     name: league.league.name,
                //     country: league.country.name,
                //     logo: league.league.logo,
                //     type: league.league.type,
                //     season: league.seasons.map(s => s.year),
                // });
            }

            return response.status(201).send({ message: 'Leagues seeded successfully' });
        } catch (error) {
            console.error('Error seeding leagues:', error);
            return response.status(500).send({ message: 'Error seeding leagues' });
        }
    }

    @Post('fixtures')
    @ApiOperation({summary: 'Seed fixtures data', operationId: 'seedFixtures'})
    @ApiBody({ type: 'any' })
    async fixtures(@Response() response: FastifyReply) {
        try {
            const fixturesData = await this.footballApi.getFixtures( 39, 2023 )

            if (!fixturesData || !fixturesData.response) {
                return response.status(400).send({ message: 'No fixtures found' });
            }

            for (const fixture of fixturesData.response) {
                void fixture;
                // When enabling persistence, map scores from API-Football `goals` / `score.fulltime`
                // onto Fixture.homeScore / Fixture.awayScore so standings work without goal rows.
                // Example: const g = fixture.goals;
                //   homeScore: g?.home != null ? Number(g.home) : undefined,
                //   awayScore: g?.away != null ? Number(g.away) : undefined,
                // await this.fixtureService.createOrUpdate({ ... });

                // Events ingest (e.g. `/fixtures/events`): each incident lists `team.id` — resolve to local team id and pass:
                // - goalService.create({ ..., teamId })
                // - cardService.create({ ..., teamId })  // required for new seeds; see module doc comment above
                // Map players similarly (`player.id` → local `Player`).
            }

            return response.status(201).send({ message: 'Fixtures seeded successfully' });
        } catch (error) {
            console.error('Error seeding fixtures:', error);
            return response.status(500).send({ message: 'Error seeding fixtures' });
        }
    }

    @Post('standings')
    @ApiOperation({summary: 'Seed standings data', operationId: 'seedStandings'})
    @ApiBody({ type: 'any' })
    async standings(@Response() response: FastifyReply) {
        try {
            const standingsData = await this.footballApi.getStandings( 39, 2023 );

            if (!standingsData || !standingsData.response) {
                return response.status(400).send({ message: 'No standings found' });
            }

            for (const standing of standingsData.response[0].league.standings[0]) {
                // await this.competitionStandingService.createOrUpdate({
                //     teamId: standing.team.id,
                //     rank: standing.rank,
                //     points: standing.points,
                //     goalsFor: standing.all.goals.for,
                //     goalsAgainst: standing.all.goals.against,
                // });
            }

            return response.status(201).send({ message: 'Standings seeded successfully' });
        } catch (error) {
            console.error('Error seeding standings:', error);
            return response.status(500).send({ message: 'Error seeding standings' });
        }
    }

    @Post('players')
    @ApiOperation({summary: 'Seed players data', operationId: 'seedPlayers'})
    @ApiBody({ type: 'any' })
    async players(@Response() response: FastifyReply) {
        try {
            const playersData = await this.footballApi.getPlayers({ league: 39, season: 2023 });

            if (!playersData || !playersData.response) {
                return response.status(400).send({ message: 'No players found' });
            }

            for (const player of playersData.response) {
                // await this.playerService.createOrUpdate({
                //     playerId: player.player.id,
                //     name: player.player.name,
                //     position: player.statistics[0].games.position,
                //     nationality: player.player.nationality,
                //     team: player.statistics[0].team.name,
                // });
            }

            return response.status(201).send({ message: 'Players seeded successfully' });
        } catch (error) {
            console.error('Error seeding players:', error);
            return response.status(500).send({ message: 'Error seeding players' });
        }
    }
}

@Module({
    imports: [
        TeamCompetitionSeasonModule,
        CompetitionModule,
        CompetitionStandingModule,
        TeamModule,
        FixtureModule,
        LineUpModule,
        PlayerLineUpModule,
        PlayerModule,
        ManagerModule,
        GoalModule,
        CardModule,
        SubstitutionModule,
        SeasonModule,
        StadiumModule,
        RefereeModule
    ],
    controllers: [DataSeedingController]
})
export class DataSeedingModule {}
