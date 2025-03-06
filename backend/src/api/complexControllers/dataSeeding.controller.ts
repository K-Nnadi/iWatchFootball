import { ApiBody } from '@nestjs/swagger';
import { Module, Post, Response } from '@nestjs/common';
import { FastifyReply } from 'fastify';
import { NoAuthController } from "@iWatchFootball/base-tools/decorators/controller.decorator";
import { CompetitionService } from "../modules/competition/competition.module";
import { TeamService } from "../modules/team/team.module";
import { TeamCompetitionSeasonService } from "../modules/teamCompetitionSeason/teamCompetitionSeason.module";
import { FixtureService } from "../modules/fixture/fixture.module";
import { PlayerService } from "../modules/player/player.module";
import { GoalService } from "../modules/goal/goal.module";
import { SeasonService } from "../modules/season/season.module";
import { StadiumService } from "../modules/stadium/stadium.module";
import { RefereeService } from "../modules/referee/referee.module";
import { CardService } from "../modules/card/card.module";
import { LineupService } from "../modules/lineUp/lineUp.module";
import { PlayerLineUpService } from "../modules/playerLineUp/playerLineUp.module";
import { ManagerService } from "../modules/manager/manager.module";
import { CompetitionStandingService } from "../modules/competitionStanding/competitionStanding.module";
import { SubstitutionService } from "../modules/substitution/substitution.module";
import {FootballDataApiAdapter} from "../adapters/footballApiSports/footballDataApi.adapter";

@NoAuthController('dataSeeding')
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
    @ApiBody({ type: 'any' })
    async teams(@Response() response: FastifyReply) {
        try {
            const teamsData = await this.footballApi.getTeams({ league: 39, season: 2023 });

            if (!teamsData || !teamsData.response) {
                return response.status(400).send({ message: 'No teams found' });
            }

            for (const team of teamsData.response) {
                await this.teamService.createOrUpdate({
                    teamId: team.team.id,
                    name: team.team.name,
                    logo: team.team.logo,
                    country: team.team.country,
                    founded: team.team.founded,
                    stadium: team.venue.name,
                });
            }

            return response.status(201).send({ message: 'Teams seeded successfully' });
        } catch (error) {
            console.error('Error seeding teams:', error);
            return response.status(500).send({ message: 'Error seeding teams' });
        }
    }

    @Post('leagues')
    @ApiBody({ type: 'any' })
    async leagues(@Response() response: FastifyReply) {
        try {
            const leaguesData = await this.footballApi.getLeagues();

            if (!leaguesData || !leaguesData.response) {
                return response.status(400).send({ message: 'No leagues found' });
            }

            for (const league of leaguesData.response) {
                await this.competitionService.createOrUpdate({
                    leagueId: league.league.id,
                    name: league.league.name,
                    country: league.country.name,
                    logo: league.league.logo,
                    type: league.league.type,
                    season: league.seasons.map(s => s.year),
                });
            }

            return response.status(201).send({ message: 'Leagues seeded successfully' });
        } catch (error) {
            console.error('Error seeding leagues:', error);
            return response.status(500).send({ message: 'Error seeding leagues' });
        }
    }

    @Post('fixtures')
    @ApiBody({ type: 'any' })
    async fixtures(@Response() response: FastifyReply) {
        try {
            const fixturesData = await this.footballApi.getFixtures({ league: 39, season: 2023 });

            if (!fixturesData || !fixturesData.response) {
                return response.status(400).send({ message: 'No fixtures found' });
            }

            for (const fixture of fixturesData.response) {
                await this.fixtureService.createOrUpdate({
                    fixtureId: fixture.fixture.id,
                    date: fixture.fixture.date,
                    venue: fixture.fixture.venue.name,
                    referee: fixture.fixture.referee,
                    homeTeam: fixture.teams.home.name,
                    awayTeam: fixture.teams.away.name,
                });
            }

            return response.status(201).send({ message: 'Fixtures seeded successfully' });
        } catch (error) {
            console.error('Error seeding fixtures:', error);
            return response.status(500).send({ message: 'Error seeding fixtures' });
        }
    }

    @Post('standings')
    @ApiBody({ type: 'any' })
    async standings(@Response() response: FastifyReply) {
        try {
            const standingsData = await this.footballApi.getStandings({ league: 39, season: 2023 });

            if (!standingsData || !standingsData.response) {
                return response.status(400).send({ message: 'No standings found' });
            }

            for (const standing of standingsData.response[0].league.standings[0]) {
                await this.competitionStandingService.createOrUpdate({
                    teamId: standing.team.id,
                    rank: standing.rank,
                    points: standing.points,
                    goalsFor: standing.all.goals.for,
                    goalsAgainst: standing.all.goals.against,
                });
            }

            return response.status(201).send({ message: 'Standings seeded successfully' });
        } catch (error) {
            console.error('Error seeding standings:', error);
            return response.status(500).send({ message: 'Error seeding standings' });
        }
    }

    @Post('players')
    @ApiBody({ type: 'any' })
    async players(@Response() response: FastifyReply) {
        try {
            const playersData = await this.footballApi.getPlayers({ league: 39, season: 2023 });

            if (!playersData || !playersData.response) {
                return response.status(400).send({ message: 'No players found' });
            }

            for (const player of playersData.response) {
                await this.playerService.createOrUpdate({
                    playerId: player.player.id,
                    name: player.player.name,
                    position: player.statistics[0].games.position,
                    nationality: player.player.nationality,
                    team: player.statistics[0].team.name,
                });
            }

            return response.status(201).send({ message: 'Players seeded successfully' });
        } catch (error) {
            console.error('Error seeding players:', error);
            return response.status(500).send({ message: 'Error seeding players' });
        }
    }
}

@Module({
    imports: [],
    controllers: [DataSeedingController]
})
export class DataSeedingModule {}
