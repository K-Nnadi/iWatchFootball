// import { ApiBody, ApiOkResponse, ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
// import { Body, Get, Module, Param, Post, Query } from '@nestjs/common';
// import { IsNumber, IsOptional, IsString } from 'class-validator';
// import { AuthController } from '@iWatchFootball/base-tools/decorators/controller.decorator';
// import { Competition } from '../modules/competition/competition';
// import { Season } from '../modules/season/season';
// import { Team } from '../modules/team/team';
// import { Fixture } from '../modules/fixture/fixture';
// import { CompetitionStanding } from '../modules/competitionStanding/competitionStanding';
// import { CompetitionModule, CompetitionService } from '../modules/competition/competition.module';
// import { SeasonModule, SeasonService } from '../modules/season/season.module';
// import { TeamCompetitionSeasonModule, TeamCompetitionSeasonService } from '../modules/teamCompetitionSeason/teamCompetitionSeason.module';
// import { FixtureModule, FixtureService } from '../modules/fixture/fixture.module';
// import { TeamModule, TeamService } from '../modules/team/team.module';
// import { CompetitionStandingModule, CompetitionStandingService } from '../modules/competitionStanding/competitionStanding.module';
//
// export class CompetitionSeasonResponse {
//     @ApiProperty({ type: Competition })
//     competition!: Competition;
//
//     @ApiProperty({ type: Season })
//     season!: Season;
//
//     @ApiProperty({ type: [Team] })
//     teams!: Team[];
//
//     @ApiProperty({ type: [Fixture] })
//     fixtures!: Fixture[];
//
//     @ApiProperty({ type: [CompetitionStanding] })
//     standings!: CompetitionStanding[];
// }
//
// @AuthController('competition')
// export class CompetitionController {
//     constructor(
//         private competitionService: CompetitionService,
//         private seasonService: SeasonService,
//         private teamCompetitionSeasonService: TeamCompetitionSeasonService,
//         private fixtureService: FixtureService,
//         private teamService: TeamService,
//         private standingService: CompetitionStandingService,
//     ) {}
//
//     @Get(':competitionId/season/:seasonId/complete')
//     @ApiOkResponse({ type: CompetitionSeasonResponse })
//     async getCompetitionSeasonData(
//         @Param('competitionId') competitionId: number,
//         @Param('seasonId') seasonId: number
//     ) {
//         const competition = await this.competitionService.findOne(competitionId);
//         const season = await this.seasonService.findOne(seasonId);
//
//         const teams = await this.teamCompetitionSeasonService.find({
//             where: { competitionId, seasonId },
//             relations: ['team']
//         });
//
//         const fixtures = await this.fixtureService.find({
//             where: { competitionId, seasonId },
//             relations: ['homeTeam', 'awayTeam', 'stadium']
//         });
//
//         const standings = await this.standingService.find({
//             where: { competitionId, seasonId },
//             relations: ['team'],
//             order: { position: 'ASC' }
//         });
//
//         return {
//             competition,
//             season,
//             teams: teams.map(t => t.team),
//             fixtures,
//             standings
//         };
//     }
//
//     @Get(':competitionId/standings')
//     @ApiOkResponse({ type: [CompetitionStanding] })
//     async getCompetitionStandings(
//         @Param('competitionId') competitionId: number,
//         @Query('seasonId') @IsOptional() @IsNumber() seasonId?: number
//     ) {
//         if (!seasonId) {
//             const currentSeason = await this.seasonService.findOne({
//                 where: { isCurrent: true }
//             });
//             seasonId = currentSeason?.id;
//         }
//
//         return this.standingService.find({
//             where: { competitionId, seasonId },
//             relations: ['team'],
//             order: { position: 'ASC' }
//         });
//     }
//
//     @Post(':competitionId/standings/update')
//     @ApiOkResponse({ type: [CompetitionStanding] })
//     async updateStandings(
//         @Param('competitionId') competitionId: number,
//         @Query('seasonId') @IsOptional() @IsNumber() seasonId?: number
//     ) {
//         if (!seasonId) {
//             const currentSeason = await this.seasonService.findOne({
//                 where: { isCurrent: true }
//             });
//             seasonId = currentSeason?.id;
//         }
//
//         // Get all teams in the competition
//         const teams = await this.teamCompetitionSeasonService.find({
//             where: { competitionId, seasonId },
//             relations: ['team']
//         });
//
//         // Get all finished fixtures
//         const fixtures = await this.fixtureService.find({
//             where: { competitionId, seasonId, status: 'FINISHED' },
//             relations: ['homeTeam', 'awayTeam', 'goals']
//         });
//
//         // Calculate standings for each team
//         const standings = teams.map(t => {
//             const teamFixtures = fixtures.filter(f =>
//                 f.homeTeamId === t.teamId || f.awayTeamId === t.teamId
//             );
//
//             const standing = new CompetitionStanding();
//             standing.competitionId = competitionId;
//             standing.seasonId = seasonId!;
//             standing.teamId = t.teamId;
//             standing.team = t.team;
//             standing.played = teamFixtures.length;
//             standing.won = 0;
//             standing.drawn = 0;
//             standing.lost = 0;
//             standing.goalsFor = 0;
//             standing.goalsAgainst = 0;
//
//             // Calculate stats from fixtures
//             teamFixtures.forEach(f => {
//                 const isHome = f.homeTeamId === t.teamId;
//                 const homeGoals = f.goals.filter(g => g.teamId === f.homeTeamId).length;
//                 const awayGoals = f.goals.filter(g => g.teamId === f.awayTeamId).length;
//
//                 if (isHome) {
//                     standing.goalsFor += homeGoals;
//                     standing.goalsAgainst += awayGoals;
//                     if (homeGoals > awayGoals) standing.won++;
//                     else if (homeGoals < awayGoals) standing.lost++;
//                     else standing.drawn++;
//                 } else {
//                     standing.goalsFor += awayGoals;
//                     standing.goalsAgainst += homeGoals;
//                     if (awayGoals > homeGoals) standing.won++;
//                     else if (awayGoals < homeGoals) standing.lost++;
//                     else standing.drawn++;
//                 }
//             });
//
//             standing.points = (standing.won * 3) + standing.drawn;
//             standing.goalDifference = standing.goalsFor - standing.goalsAgainst;
//
//             return standing;
//         });
//
//         // Sort standings by points, goal difference, goals scored
//         standings.sort((a, b) => {
//             if (a.points !== b.points) return b.points - a.points;
//             if (a.goalDifference !== b.goalDifference) return b.goalDifference - a.goalDifference;
//             return b.goalsFor - a.goalsFor;
//         });
//
//         // Update positions
//         standings.forEach((s, index) => {
//             s.position = index + 1;
//         });
//
//         // Save all standings
//         await this.standingService.save(standings);
//
//         return standings;
//     }
//
//     @Get(':competitionId/fixtures')
//     @ApiOkResponse({ type: [Fixture] })
//     async getCompetitionFixtures(
//         @Param('competitionId') competitionId: number,
//         @Query('seasonId') @IsOptional() @IsNumber() seasonId?: number,
//         @Query('status') @IsOptional() @IsString() status?: string
//     ) {
//         const query = this.fixtureService
//             .createQueryBuilder('fixture')
//             .leftJoinAndSelect('fixture.homeTeam', 'homeTeam')
//             .leftJoinAndSelect('fixture.awayTeam', 'awayTeam')
//             .leftJoinAndSelect('fixture.stadium', 'stadium')
//             .where('fixture.competitionId = :competitionId', { competitionId });
//
//         if (seasonId) {
//             query.andWhere('fixture.seasonId = :seasonId', { seasonId });
//         }
//
//         if (status) {
//             query.andWhere('fixture.status = :status', { status });
//         }
//
//         return query.getMany();
//     }
//
//     @Get(':competitionId/teams')
//     @ApiOkResponse({ type: [Team] })
//     async getCompetitionTeams(
//         @Param('competitionId') competitionId: number,
//         @Query('seasonId') @IsOptional() @IsNumber() seasonId?: number
//     ) {
//         if (!seasonId) {
//             const currentSeason = await this.seasonService.findOne({
//                 where: { isCurrent: true }
//             });
//             seasonId = currentSeason?.id;
//         }
//
//         const teams = await this.teamCompetitionSeasonService.find({
//             where: { competitionId, seasonId },
//             relations: ['team']
//         });
//
//         return teams.map(t => t.team);
//     }
// }
//
// @Module({
//     imports: [
//         CompetitionModule,
//         SeasonModule,
//         TeamCompetitionSeasonModule,
//         FixtureModule,
//         TeamModule,
//         CompetitionStandingModule
//     ],
//     controllers: [CompetitionController],
//     providers: [],
//     exports: []
// })
// export class CompetitionModule {}
