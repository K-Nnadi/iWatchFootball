import {Injectable, Logger} from '@nestjs/common';
import {Goal} from '../../modules/goal/goal';
import {Position} from '../../modules/position/position';
import {Stadium} from '../../modules/stadium/stadium';
import {CompetitionType} from '../../enums/competition.enum';
import {FixtureStage, FixtureStatus} from '../../enums/fixture.enum';
import {StatsBombHttpService} from './statsbomb-http.service';
import {CompetitionService} from '../../modules/competition/competition.module';
import {SeasonService} from '../../modules/season/season.module';
import {TeamService} from '../../modules/team/team.module';
import {StadiumService} from '../../modules/stadium/stadium.module';
import {PositionService} from '../../modules/position/position.module';
import {FixtureService} from '../../modules/fixture/fixture.module';
import {GoalService} from '../../modules/goal/goal.module';
import {PlayerService} from '../../modules/player/player.module';
import {TeamType} from "../../enums/team.enum";

// StatsBomb API Types
interface StatsBombCompetition {
  competition_id: number;
  season_id: number;
  country_name: string;
  competition_name: string;
  season_name: string;
  match_updated: string;
  match_updated_360: string;
  match_available: string;
  match_available_360: string;
}

interface StatsBombMatch {
  match_id: number;
  match_date: string;
  kick_off: string;
  competition: {
    competition_id: number;
    country_name: string;
    competition_name: string;
  };
  season: {
    season_id: number;
    season_name: string;
  };
  home_team: {
    home_team_id: number;
    home_team_name: string;
    home_team_gender: string;
    home_team_group: string;
    home_team_country: string;
    home_team_manager: {
      id: number;
      name: string;
      nickname: string;
      dob: string;
      country: string;
    };
  };
  away_team: {
    away_team_id: number;
    away_team_name: string;
    away_team_gender: string;
    away_team_group: string;
    away_team_country: string;
    away_team_manager: {
      id: number;
      name: string;
      nickname: string;
      dob: string;
      country: string;
    };
  };
  home_score: number;
  away_score: number;
  match_status: string;
  match_week: number;
  competition_stage: {
    id: number;
    name: string;
  };
  stadium: {
    id: number;
    name: string;
    country: string;
  };
  referee: {
    id: number;
    name: string;
    country: string;
  };
}

interface StatsBombEvent {
  id: string;
  index: number;
  period: number;
  timestamp: string;
  minute: number;
  second: number;
  type: {
    id: number;
    name: string;
  };
  possession: number;
  possession_team: {
    id: number;
    name: string;
  };
  play_pattern: {
    id: number;
    name: string;
  };
  team: {
    id: number;
    name: string;
  };
  player: {
    id: number;
    name: string;
  };
  position: {
    id: number;
    name: string;
  };
  location: [number, number];
  duration?: number;
  under_pressure?: boolean;
  off_camera?: boolean;
  out?: boolean;
  tactics?: {
    formation: number;
    line_up: Array<{
      player: {
        id: number;
        name: string;
      };
      position: {
        id: number;
        name: string;
      };
      jersey_number: number;
    }>;
  };
  shot?: {
    key_pass_id?: string;
    end_location: [number, number];
    aerial_won?: boolean;
    follows_dribble?: boolean;
    first_time?: boolean;
    open_goal?: boolean;
    technique: {
      id: number;
      name: string;
    };
    body_part: {
      id: number;
      name: string;
    };
    type: {
      id: number;
      name: string;
    };
    outcome: {
      id: number;
      name: string;
    };
  };
  pass?: {
    recipient: {
      id: number;
      name: string;
    };
    length: number;
    angle: number;
    height: {
      id: number;
      name: string;
    };
    end_location: [number, number];
    assisted_shot_id?: string;
    backheel?: boolean;
    deflected?: boolean;
    miscommunication?: boolean;
    cross?: boolean;
    cut_back?: boolean;
    switch?: boolean;
    shot_assist?: boolean;
    goal_assist?: boolean;
    through_ball?: boolean;
    technique: {
      id: number;
      name: string;
    };
    body_part: {
      id: number;
      name: string;
    };
    type: {
      id: number;
      name: string;
    };
    outcome: {
      id: number;
      name: string;
    };
  };
}

interface StatsBombLineup {
  team_id: number;
  team_name: string;
  lineups: Array<{
    player_id: number;
    player_name: string;
    player_nickname: string;
    jersey_number: number;
    country: {
      id: number;
      name: string;
    };
    positions: Array<{
      position_id: number;
      position: string;
      from: string;
      to: string;
      from_period: number;
      to_period: number;
      start_reason: string;
      end_reason: string;
    }>;
  }>;
}

@Injectable()
export class StatsBombAdapterService {
  private readonly logger = new Logger(StatsBombAdapterService.name);

  constructor(
    private competitionService: CompetitionService,
    private seasonService: SeasonService,
    private teamService: TeamService,
    private playerService: PlayerService,
    private fixtureService: FixtureService,
    private goalService: GoalService,
    private positionService: PositionService,
    private stadiumService: StadiumService,
    private readonly httpService: StatsBombHttpService,
  ) {}

  /**
   * Main method to sync StatsBomb data with local database
   */
  async syncStatsBombData(): Promise<void> {
    try {
      this.logger.log('Starting StatsBomb data synchronization...');
      
      // Step 1: Fetch and sync competitions
      await this.syncCompetitions();
      
      // Step 2: Fetch and sync teams and players
      await this.syncTeamsAndPlayers();
      
      // Step 3: Fetch and sync fixtures
      await this.syncFixtures();
      
      // Step 4: Fetch and sync events (goals, etc.)
      await this.syncEvents();
      
      this.logger.log('StatsBomb data synchronization completed successfully');
    } catch (error) {
      this.logger.error('Error during StatsBomb data synchronization:', error);
      throw error;
    }
  }

  /**
   * Fetch competitions from StatsBomb API
   */
  private async fetchCompetitions(): Promise<StatsBombCompetition[]> {
    try {
      return await this.httpService.fetchCompetitions();
    } catch (error) {
      this.logger.error('Error fetching competitions:', error);
      throw error;
    }
  }

  /**
   * Sync competitions to database
   */
  private async syncCompetitions(): Promise<void> {
    this.logger.log('Syncing competitions...');
    
    const competitions = await this.fetchCompetitions();
    
    for (const comp of competitions) {
      // Check if competition already exists
      let [competition] = await this.competitionService.getQuery({
        where: { name: comp.competition_name }
      });

      if (!competition) {
      competition = await this.competitionService.create({
        name: comp.competition_name,
        country: comp.country_name,
        type: this.mapCompetitionType(comp.competition_name),
        metadata: {
          source: 'StatsBomb',
          statsbombId: comp.competition_id,
          seasonId: comp.season_id,
          seasonName: comp.season_name,
          matchUpdated: comp.match_updated,
          matchAvailable: comp.match_available,
          lastSync: new Date().toISOString()
        }
      });
        this.logger.log(`Created competition: ${comp.competition_name}`);
      }

      // Create season if it doesn't exist
      const seasonYear = parseInt(comp.season_name.split('/')[0]);
      let [season] = await this.seasonService.getQuery({
        where: { yearStart: seasonYear }
      });

      if (!season) {
      season = await this.seasonService.create({
        yearStart: seasonYear,
        yearEnd: seasonYear + 1,
        metadata: {
          source: 'StatsBomb',
          statsbombSeasonId: comp.season_id,
          seasonName: comp.season_name,
          lastSync: new Date().toISOString()
        }
      });
        this.logger.log(`Created season: ${seasonYear}/${seasonYear + 1}`);
      }
    }
  }

  /**
   * Sync teams and players from StatsBomb data
   */
  private async syncTeamsAndPlayers(): Promise<void> {
    this.logger.log('Syncing teams and players...');
    
    const competitions = await this.fetchCompetitions();
    
    for (const comp of competitions) {
      try {
        // Fetch matches for this competition/season
        const matches = await this.fetchMatches(comp.competition_id, comp.season_id);
        
        // Process matches in parallel batches of 50
        const batchSize = 50;
        for (let i = 0; i < matches.length; i += batchSize) {
          const batch = matches.slice(i, i + batchSize);
          
          this.logger.log(`Processing batch ${Math.floor(i / batchSize) + 1} of ${Math.ceil(matches.length / batchSize)} (${batch.length} matches)`);
          
          // Process all matches in the batch in parallel
          const batchPromises = batch.map(async (match) => {
            try {
              // Sync home team
              await this.syncTeam(match.home_team);
              
              // Sync away team
              await this.syncTeam(match.away_team);
              
              // Sync players from lineups
              await this.syncPlayersFromMatch(match.match_id);
            } catch (error) {
              this.logger.warn(`Error processing match ${match.match_id}:`, error);
              throw error; // Re-throw to be caught by Promise.allSettled
            }
          });
          
          // Wait for all matches in the batch to complete (or fail)
          const results = await Promise.allSettled(batchPromises);
          
          // Log results
          const successful = results.filter(result => result.status === 'fulfilled').length;
          const failed = results.filter(result => result.status === 'rejected').length;
          
          this.logger.log(`Batch completed: ${successful} successful, ${failed} failed`);
          
          // Log any failures for debugging
          results.forEach((result, index) => {
            if (result.status === 'rejected') {
              this.logger.warn(`Match ${batch[index].match_id} failed:`, result.reason);
            }
          });
        }
      } catch (error) {
        this.logger.warn(`Error syncing teams for competition ${comp.competition_name}:`, error);
      }
    }
  }

  /**
   * Fetch matches for a specific competition and season
   */
  private async fetchMatches(competitionId: number, seasonId: number): Promise<StatsBombMatch[]> {
    try {
      return await this.httpService.fetchMatches(competitionId, seasonId);
    } catch (error) {
      this.logger.error(`Error fetching matches for competition ${competitionId}, season ${seasonId}:`, error);
      return [];
    }
  }

  /**
   * Sync a team to database
   */
  private async syncTeam(teamData: any): Promise<void> {
    const teamName = teamData.home_team_name || teamData.away_team_name;
    const teamCountry = teamData.home_team_country || teamData.away_team_country;
    
    let [team] = await this.teamService.getQuery({
      where: { name: teamName }
    });

    if (!team) {
      // Determine team type based on StatsBomb data patterns
      const teamType = this.determineTeamType(teamName, teamCountry);
      
      team = await this.teamService.create({
        name: teamName,
        country: teamCountry,
        type: teamType,
        metadata: {
          source: 'StatsBomb',
          statsbombId: teamData.home_team_id || teamData.away_team_id,
          gender: teamData.home_team_gender || teamData.away_team_gender,
          group: teamData.home_team_group || teamData.away_team_group,
          manager: teamData.home_team_manager || teamData.away_team_manager,
          lastSync: new Date().toISOString()
        }
      });
      this.logger.log(`Created team: ${teamName} (${teamType})`);
    }
  }

  /**
   * Determine team type based on StatsBomb data patterns
   */
  private determineTeamType(teamName: string, teamCountry: string): TeamType {
    const nameLower = teamName.toLowerCase();
    const countryLower = teamCountry.toLowerCase();

    // Check if team name matches country name exactly
    if (teamName === teamCountry) {
      return TeamType.COUNTRY;
    }

    // Check for common club team indicators first (more specific)
    const clubIndicators = [
      'fc', 'football club', 'united', 'city', 'town', 'athletic', 'sporting',
      'real', 'cf', 'ac', 'as', 'sc', 'rc', 'ud', 'cd', 'sd', 'se',
      'club', 'team', 'soccer', 'football', 'munich', 'madrid', 'barcelona',
      'juventus', 'milan', 'saint-germain', 'saint germain', 'psg'
    ];

    for (const indicator of clubIndicators) {
      if (nameLower.includes(indicator)) {
        return TeamType.CLUB;
      }
    }

    // Check for national team patterns (less specific, so check after club indicators)
    const nationalTeamPatterns = [
      // FIFA country names
      'argentina', 'brazil', 'germany', 'spain', 'france', 'italy', 'england', 'netherlands',
      'portugal', 'belgium', 'croatia', 'denmark', 'switzerland', 'poland', 'austria',
      'sweden', 'norway', 'finland', 'iceland', 'wales', 'scotland', 'ireland', 'northern ireland',
      'czech republic', 'slovakia', 'slovenia', 'hungary', 'romania', 'bulgaria', 'greece',
      'turkey', 'russia', 'ukraine', 'belarus', 'estonia', 'latvia', 'lithuania',
      'mexico', 'united states', 'canada', 'costa rica', 'jamaica', 'honduras', 'panama',
      'colombia', 'chile', 'peru', 'ecuador', 'venezuela', 'bolivia', 'paraguay', 'uruguay',
      'japan', 'south korea', 'china', 'australia', 'new zealand', 'saudi arabia', 'iran',
      'iraq', 'united arab emirates', 'qatar', 'kuwait', 'oman', 'bahrain', 'jordan',
      'lebanon', 'syria', 'palestine', 'israel', 'egypt', 'morocco', 'tunisia', 'algeria',
      'libya', 'sudan', 'ethiopia', 'kenya', 'uganda', 'tanzania', 'ghana', 'nigeria',
      'cameroon', 'senegal', 'mali', 'burkina faso', 'ivory coast', 'guinea', 'sierra leone',
      'liberia', 'gambia', 'guinea-bissau', 'cape verde', 'são tomé and príncipe',
      'south africa', 'zimbabwe', 'zambia', 'malawi', 'mozambique', 'madagascar',
      'mauritius', 'seychelles', 'comoros', 'djibouti', 'somalia', 'eritrea',
      // Common national team suffixes
      'national team', 'nt', 'national', 'selection', 'squad'
    ];

    // Check against known national team patterns
    for (const pattern of nationalTeamPatterns) {
      if (nameLower.includes(pattern)) {
        return TeamType.COUNTRY;
      }
    }

    // If team name contains country name, it's likely a national team
    if (nameLower.includes(countryLower) || countryLower.includes(nameLower)) {
      return TeamType.COUNTRY;
    }

    // Default to club if no clear indicators
    return TeamType.CLUB;
  }

  /**
   * Sync players from match lineups
   */
  private async syncPlayersFromMatch(matchId: number): Promise<void> {
    try {
      const lineup = await this.fetchLineup(matchId);
      
      for (const teamLineup of lineup) {
        for (const playerData of teamLineup.lineups) {
          await this.syncPlayer(playerData, teamLineup.team_id);
        }
      }
    } catch (error) {
      this.logger.warn(`Error syncing players for match ${matchId}:`, error);
    }
  }

  /**
   * Fetch lineup for a specific match
   */
  private async fetchLineup(matchId: number): Promise<StatsBombLineup[]> {
    try {
      return await this.httpService.fetchLineup(matchId);
    } catch (error) {
      this.logger.error(`Error fetching lineup for match ${matchId}:`, error);
      return [];
    }
  }

  /**
   * Sync a player to database
   */
  private async syncPlayer(playerData: any, teamId: number): Promise<void> {
    let [player] = await this.playerService.getQuery({
      where: { name: playerData.player_name }
    });

    if (!player) {
      // Get position ID (you might need to create positions first)
      const positionIds: number[] = []
      for (const position of playerData.positions) {
        const playerPosition  = await this.getOrCreatePosition(position.position);
        positionIds.push(playerPosition.id);
      }

      
      player = await this.playerService.create({
        name: playerData.player_name,
        nickname: playerData.player_nickname,
        nationality: playerData.country.name,
        dateOfBirth: playerData.dob,
        positionIds,
        kitNumber: playerData.jersey_number,
        teamIds: [teamId],
        metadata: {
          source: 'StatsBomb',
          statsbombId: playerData.player_id,
          positions: playerData.positions.map((p: any) => ({
            position: p.position,
            from: p.from,
            to: p.to,
            fromPeriod: p.from_period,
            toPeriod: p.to_period,
            startReason: p.start_reason,
            endReason: p.end_reason
          })),
          country: playerData.country,
          jerseyNumber: playerData.jersey_number,
          lastSync: new Date().toISOString()
        }
      });
      this.logger.log(`Created player: ${playerData.player_name}`);
    }
  }

  /**
   * Get or create a position
   */
  private async getOrCreatePosition(positionName: string): Promise<Position> {
    let [position] = await this.positionService.getQuery({
      where: { name: positionName }
    });

    if (!position) {
      position = await this.positionService.create({
        name: positionName,
      });
    }

    return position;
  }

  /**
   * Sync fixtures to database
   */
  private async syncFixtures(): Promise<void> {
    this.logger.log('Syncing fixtures...');
    
    const competitions = await this.fetchCompetitions();
    
    for (const comp of competitions) {
      try {
        const matches = await this.fetchMatches(comp.competition_id, comp.season_id);
        
        for (const match of matches) {
          await this.syncFixture(match);
        }
      } catch (error) {
        this.logger.warn(`Error syncing fixtures for competition ${comp.competition_name}:`, error);
      }
    }
  }

  /**
   * Sync a single fixture
   */
  private async syncFixture(matchData: StatsBombMatch): Promise<void> {
    // Check if fixture already exists
    let [fixture] = await this.fixtureService.getQuery({
      where: { id: matchData.match_id }
    });

    if (fixture) {
      return; // Already exists
    }

    // Get related entities
    const [homeTeam] = await this.teamService.getQuery({
      where: { name: matchData.home_team.home_team_name }
    });
    
    const [awayTeam] = await this.teamService.getQuery({
      where: { name: matchData.away_team.away_team_name }
    });

    const [competition] = await this.competitionService.getQuery({
      where: { name: matchData.competition.competition_name }
    });

    const [season] = await this.seasonService.getQuery({
      where: { yearStart: parseInt(matchData.season.season_name.split('/')[0]) }
    });

    // Create or get stadium
    const stadium = await this.getOrCreateStadium(matchData.stadium);

    if (homeTeam && awayTeam && competition && season) {
      fixture = await this.fixtureService.create({
        date: new Date(`${matchData.match_date} ${matchData.kick_off}`),
        homeTeamId: homeTeam.id,
        awayTeamId: awayTeam.id,
        competitionId: competition.id,
        seasonId: season.id,
        stadiumId: stadium.id,
        status: this.mapFixtureStatus(matchData.match_status),
        stage: this.mapFixtureStage(matchData.competition_stage.name),
        attendance: 0, // StatsBomb doesn't always provide attendance
        metadata: {
          source: 'StatsBomb',
          statsbombId: matchData.match_id,
          competitionStage: matchData.competition_stage,
          matchWeek: matchData.match_week,
          referee: matchData.referee,
          homeScore: matchData.home_score,
          awayScore: matchData.away_score,
          lastSync: new Date().toISOString()
        }
      });

      this.logger.log(`Created fixture: ${matchData.home_team.home_team_name} vs ${matchData.away_team.away_team_name}`);
    }
  }

  /**
   * Get or create a stadium
   */
  private async getOrCreateStadium(stadiumData: any): Promise<Stadium> {
    let [stadium] = await this.stadiumService.getQuery({
      where: { name: stadiumData.name }
    });

    if (!stadium) {
      stadium = await this.stadiumService.create({
        name: stadiumData.name,
        country: stadiumData.country,
      });
    }

    return stadium;
  }

  /**
   * Sync events (goals, etc.) to database
   */
  private async syncEvents(): Promise<void> {
    this.logger.log('Syncing events...');
    
    const competitions = await this.fetchCompetitions();
    
    for (const comp of competitions) {
      try {
        const matches = await this.fetchMatches(comp.competition_id, comp.season_id);
        
        for (const match of matches) {
          await this.syncEventsFromMatch(match.match_id);
        }
      } catch (error) {
        this.logger.warn(`Error syncing events for competition ${comp.competition_name}:`, error);
      }
    }
  }

  /**
   * Sync events from a specific match
   */
  private async syncEventsFromMatch(matchId: number): Promise<void> {
    try {
      const events = await this.fetchEvents(matchId);
      
      for (const event of events) {
        if (event.type.name === 'Shot' && event.shot?.outcome?.name === 'Goal') {
          await this.syncGoal(event, matchId);
        }
      }
    } catch (error) {
      this.logger.warn(`Error syncing events for match ${matchId}:`, error);
    }
  }

  /**
   * Fetch events for a specific match
   */
  private async fetchEvents(matchId: number): Promise<StatsBombEvent[]> {
    try {
      return await this.httpService.fetchEvents(matchId);
    } catch (error) {
      this.logger.error(`Error fetching events for match ${matchId}:`, error);
      return [];
    }
  }

  /**
   * Sync a goal to database
   */
  private async syncGoal(eventData: StatsBombEvent, matchId: number): Promise<void> {
    // Check if goal already exists
    const [existingGoal] = await this.goalService.getQuery({
      where: { 
        fixtureId: matchId,
        minute: eventData.minute,
        scorerId: eventData.player.id
      }
    });

    if (existingGoal) {
      return; // Already exists
    }

    // Get player
    const [player] = await this.playerService.getQuery({
      where: { name: eventData.player.name }
    });

    // Get team
    const [team] = await this.teamService.getQuery({
      where: { name: eventData.team.name }
    });

    if (player && team) {
      const goal = await this.goalService.create({
        minute: eventData.minute,
        scorerId: player.id,
        fixtureId: matchId,
        teamId: team.id,
        penalty: eventData.shot?.type?.name === 'Penalty',
        ownGoal: false, // Would need additional logic to determine this
      });

      this.logger.log(`Created goal: ${eventData.player.name} at ${eventData.minute}'`);
    }
  }

  /**
   * Map StatsBomb competition type to our enum
   */
  private mapCompetitionType(competitionName: string): CompetitionType {
    const name = competitionName.toLowerCase();
    if (name.includes('champions league') || name.includes('europa league')) {
      return CompetitionType.CUP;
    }
    return CompetitionType.LEAGUE;
  }

  /**
   * Map StatsBomb match status to our enum
   */
  private mapFixtureStatus(status: string): FixtureStatus {
    switch (status.toLowerCase()) {
      case 'available':
        return FixtureStatus.COMPLETED;
      case 'scheduled':
        return FixtureStatus.SCHEDULED;
      case 'in_play':
        return FixtureStatus.LIVE;
      default:
        return FixtureStatus.SCHEDULED;
    }
  }

  /**
   * Map StatsBomb competition stage to our enum
   */
  private mapFixtureStage(stage: string): FixtureStage {
    const stageLower = stage.toLowerCase();
    if (stageLower.includes('final') || stageLower.includes('semi') || stageLower.includes('quarter')) {
      switch (stageLower) {
        case 'final':
          return FixtureStage.FINAL;
        case 'semi':
          return FixtureStage.SEMI_FINAL;
        case 'quarter':
          return FixtureStage.QUARTER_FINAL;
        case 'last 16':
          return FixtureStage.LAST_16;
        case 'last 32':
          return FixtureStage.LAST_32;
        case 'group':
          return FixtureStage.GROUP_STAGE;
        case 'third':
          return FixtureStage.THIRD_PLACE;
        case 'playoff':
          return FixtureStage.PLAY_OFF;
        default:
          return FixtureStage.LEAGUE;
      }
    }


    return FixtureStage.LEAGUE;
  }

  /**
   * Test team type detection with sample data
   */
  testTeamTypeDetection(): { teamName: string; teamCountry: string; detectedType: TeamType }[] {
    const testCases = [
      { teamName: 'Brazil', teamCountry: 'Brazil' },
      { teamName: 'Argentina', teamCountry: 'Argentina' },
      { teamName: 'Manchester United', teamCountry: 'England' },
      { teamName: 'Real Madrid', teamCountry: 'Spain' },
      { teamName: 'Barcelona', teamCountry: 'Spain' },
      { teamName: 'Germany', teamCountry: 'Germany' },
      { teamName: 'France', teamCountry: 'France' },
      { teamName: 'Liverpool FC', teamCountry: 'England' },
      { teamName: 'Bayern Munich', teamCountry: 'Germany' },
      { teamName: 'Juventus', teamCountry: 'Italy' },
      { teamName: 'AC Milan', teamCountry: 'Italy' },
      { teamName: 'Paris Saint-Germain', teamCountry: 'France' },
      { teamName: 'Chelsea FC', teamCountry: 'England' },
      { teamName: 'Arsenal', teamCountry: 'England' },
      { teamName: 'Spain', teamCountry: 'Spain' },
      { teamName: 'Italy', teamCountry: 'Italy' },
      { teamName: 'Netherlands', teamCountry: 'Netherlands' },
      { teamName: 'Portugal', teamCountry: 'Portugal' },
      { teamName: 'Belgium', teamCountry: 'Belgium' },
      { teamName: 'Croatia', teamCountry: 'Croatia' },
    ];

    return testCases.map(testCase => ({
      teamName: testCase.teamName,
      teamCountry: testCase.teamCountry,
      detectedType: this.determineTeamType(testCase.teamName, testCase.teamCountry)
    }));
  }

  /**
   * Get sync status and statistics
   */
  async getSyncStatus(): Promise<any> {
    const competitionCount = await this.competitionService.count();
    const teamCount = await this.teamService.count();
    const playerCount = await this.playerService.count();
    const fixtureCount = await this.fixtureService.count();
    const goalCount = await this.goalService.count();

    return {
      competitions: competitionCount,
      teams: teamCount,
      players: playerCount,
      fixtures: fixtureCount,
      goals: goalCount,
      lastSync: new Date().toISOString(),
    };
  }
}
