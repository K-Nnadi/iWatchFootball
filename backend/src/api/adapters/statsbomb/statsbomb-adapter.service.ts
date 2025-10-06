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
import {CardService} from '../../modules/card/card.module';
import {SubstitutionService} from '../../modules/substitution/substitution.module';
import {TeamType} from "../../enums/team.enum";
import {PositionType} from "../../enums/position.enum";
import {CardType} from "../../enums/card.enum";
import {Raw} from "typeorm";
import { QueryRunner } from "typeorm";
import {JsonbWhere} from "@iWatchFootball/base-tools/helpers";

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
  bad_behaviour?: {
    card: {
      id: number;
      name: string;
    };
  };
  substitution?: {
    outcome: {
      id: number;
      name: string;
    };
    replacement: {
      id: number;
      name: string;
    };
  };
}

interface StatsBombLineup {
  team_id: number;
  team_name: string;
  lineup: Array<{
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
    private cardService: CardService,
    private substitutionService: SubstitutionService,
    private readonly httpService: StatsBombHttpService,
  ) {}

  /**
   * Main method to sync StatsBomb data with local database
   */
  async syncStatsBombData(): Promise<void> {
    try {
      this.logger.log('🚀 Starting StatsBomb data synchronization...');
      
      // Step 1: Fetch and sync competitions
      this.logger.log('📊 Step 1: Syncing competitions...');
      await this.syncCompetitions();
      
      // Step 2: Fetch and sync teams and players
      this.logger.log('👥 Step 2: Syncing teams and players...');
      await this.syncTeamsAndPlayers();
      
      // Step 3: Fetch and sync fixtures
      this.logger.log('⚽ Step 3: Syncing fixtures...');
      await this.syncFixtures();
      
      // Step 4: Fetch and sync events (goals, etc.)
      this.logger.log('🎯 Step 4: Syncing events...');
      await this.syncEvents();
      
      this.logger.log('✅ StatsBomb data synchronization completed successfully');
    } catch (error) {
      this.logger.error('❌ Error during StatsBomb data synchronization:', error);
      throw error;
    }
  }

  /**
   * Test method to verify team creation works
   */
  async testTeamCreation(): Promise<any> {
    try {
      this.logger.log('Testing team creation...');
      
      const testTeamData = {
        name: 'Test Team',
        country: 'Test Country',
        type: TeamType.CLUB,
        metadata: {
          source: 'StatsBomb',
          statsbombId: 99999,
          lastSync: new Date().toISOString()
        }
      };
      
      const createdTeam = await this.teamService.create(testTeamData);
      this.logger.log(`✅ Test team created successfully: ${JSON.stringify(createdTeam)}`);
      
      return createdTeam;
    } catch (error) {
      this.logger.error('❌ Test team creation failed:', error);
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
  async syncTeamsAndPlayers(): Promise<void> {
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
              this.logger.debug(`Processing match ${match.match_id}: ${match.home_team.home_team_name} vs ${match.away_team.away_team_name}`);
              
              // Sync home team
              await this.syncTeam(match.home_team);
              
              // Sync away team
              await this.syncTeam(match.away_team);
              
              // Sync players from lineup
              const playersCreated = await this.syncPlayersFromMatch(match.match_id);
              this.logger.debug(`Created ${playersCreated} players for match ${match.match_id}`);
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
   * Get available matches for testing
   */
  async getAvailableMatches(): Promise<any[]> {
    try {
      const competitions = await this.fetchCompetitions();
      const allMatches = [];
      
      for (const comp of competitions) {
        const matches = await this.fetchMatches(comp.competition_id, comp.season_id);
        
        for (const match of matches) {
          allMatches.push({
            matchId: match.match_id,
            homeTeam: match.home_team.home_team_name,
            awayTeam: match.away_team.away_team_name,
            competition: comp.competition_name,
            season: comp.season_name,
            date: match.match_date
          });
        }
      }
      
      this.logger.log(`Found ${allMatches.length} available matches`);
      return allMatches;
    } catch (error) {
      this.logger.error(`Error getting available matches:`, error);
      return [];
    }
  }

  /**
   * Get match details by ID
   */
  async getMatchDetails(matchId: number): Promise<any> {
    try {
      const competitions = await this.fetchCompetitions();
      
      for (const comp of competitions) {
        const matches = await this.fetchMatches(comp.competition_id, comp.season_id);
        const match = matches.find(m => m.match_id === matchId);
        
        if (match) {
          this.logger.log(`Found match ${matchId}: ${match.home_team.home_team_name} vs ${match.away_team.away_team_name}`);
          return match;
        }
      }
      
      this.logger.warn(`Match ${matchId} not found in any competition`);
      return null;
    } catch (error) {
      this.logger.error(`Error getting match details for ${matchId}:`, error);
      return null;
    }
  }

  /**
   * Sync a team to database
   */
  async syncTeam(teamData: any): Promise<void> {
    try {
      // Extract team information from the team data object
      const teamName = teamData.home_team_name || teamData.away_team_name;
      const teamCountry = teamData.home_team_country || teamData.away_team_country || teamData.country?.name;
      const teamId = teamData.home_team_id || teamData.away_team_id;
      const teamGender = teamData.home_team_gender || teamData.away_team_gender;
      const teamGroup = teamData.home_team_group || teamData.away_team_group;
      const teamManager = teamData.home_team_manager || teamData.away_team_manager || teamData.managers?.[0];
      
      if (!teamName || !teamCountry) {
        this.logger.warn(`Skipping team sync - missing name or country: ${JSON.stringify(teamData)}`);
        return;
      }
      
      this.logger.debug(`Syncing team: ${teamName} from ${teamCountry}`);
      
      const existingTeams = await this.teamService.getQuery({
        where: { name: teamName }
      });
      let team = existingTeams[0];

      if (!team) {
        // Determine team type based on StatsBomb data patterns
        const teamType = this.determineTeamType(teamName, teamCountry);
        
        const teamCreateData = {
          name: teamName,
          country: teamCountry,
          type: teamType,
          metadata: {
            source: 'StatsBomb',
            statsbombId: teamId,
            gender: teamGender,
            group: teamGroup,
            manager: teamManager,
            lastSync: new Date().toISOString()
          }
        };
        
        this.logger.debug(`Creating team with data: ${JSON.stringify(teamCreateData)}`);
        
        team = await this.teamService.create(teamCreateData);
        this.logger.log(`✅ Created team: ${teamName} (${teamType})`);
      } else {
        this.logger.debug(`Team already exists: ${teamName}`);
      }
    } catch (error) {
      this.logger.error(`Error syncing team ${teamData.home_team_name || teamData.away_team_name}:`, error);
      throw error;
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
   * Sync players from match lineup
   */
  async syncPlayersFromMatch(matchId: number): Promise<number> {
    try {
      const lineup = await this.fetchLineup(matchId);
      
      if (!lineup || !Array.isArray(lineup)) {
        this.logger.warn(`No lineup data found for match ${matchId}`);
        return 0;
      }
      
      let playersCreated = 0;
      
      for (const teamLineup of lineup) {
        if (!teamLineup) {
          this.logger.warn(`Empty team lineup for match ${matchId}`);
          continue;
        }
        
        // Check if lineup exists and is an array
        if (!teamLineup.lineup || !Array.isArray(teamLineup.lineup)) {
          this.logger.warn(`No lineup array found for team ${teamLineup.team_id} in match ${matchId}. Data structure:`, JSON.stringify(teamLineup, null, 2));
          continue;
        }
        
        this.logger.debug(`Processing ${teamLineup.lineup.length} players for team ${teamLineup.team_id}`);
        
        for (const playerData of teamLineup.lineup) {
          if (playerData && playerData.player_name) {
            await this.syncPlayer(playerData, teamLineup.team_id);
            playersCreated++;
          } else {
            this.logger.warn(`Invalid player data in lineup:`, JSON.stringify(playerData));
          }
        }
      }
      
      this.logger.debug(`✅ Created ${playersCreated} players for match ${matchId}`);
      return playersCreated;
    } catch (error) {
      this.logger.error(`Error syncing players for match ${matchId}:`, error);
      return 0;
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
    try {
      if (!playerData || !playerData.player_name) {
        this.logger.warn(`Invalid player data:`, JSON.stringify(playerData));
        return;
      }

      this.logger.debug(`Syncing player: ${playerData.player_name}`);
      
      let [player] = await this.playerService.getQuery({
        where: { name: playerData.player_name }
      });

      if (!player) {
        // Get position ID (you might need to create positions first)
        const positionIds: number[] = []
        
        // Check if positions exists and is an array
        if (playerData.positions && Array.isArray(playerData.positions)) {
          for (const position of playerData.positions) {
            if (position && position.position) {
              const playerPosition = await this.getOrCreatePosition(position.position);
              positionIds.push(playerPosition.id);
            }
          }
        } else {
          this.logger.warn(`No positions array found for player ${playerData.player_name}`);
        }

        const playerCreateData = {
          name: playerData.player_name,
          nickname: playerData.player_nickname || null,
          nationality: playerData.country?.name || 'Unknown',
          dateOfBirth: playerData.dob ? new Date(playerData.dob) : new Date('1900-01-01'),
          positionIds,
          kitNumber: playerData.jersey_number || null,
          teamIds: [teamId],
          metadata: {
            source: 'StatsBomb',
            statsbombId: playerData.player_id,
            positions: playerData.positions && Array.isArray(playerData.positions) 
              ? playerData.positions.map((p: any) => ({
                  position: p.position,
                  from: p.from,
                  to: p.to,
                  fromPeriod: p.from_period,
                  toPeriod: p.to_period,
                  startReason: p.start_reason,
                  endReason: p.end_reason
                }))
              : [],
            country: playerData.country,
            jerseyNumber: playerData.jersey_number,
            lastSync: new Date().toISOString()
          }
        };
        
        this.logger.debug(`Creating player with data: ${JSON.stringify(playerCreateData)}`);
        
        player = await this.playerService.create(playerCreateData);
        this.logger.log(`✅ Created player: ${playerData.player_name}`);
      } else {
        this.logger.debug(`Player already exists: ${playerData.player_name}`);
      }
    } catch (error) {
      this.logger.error(`Error syncing player ${playerData?.player_name}:`, error);
      throw error;
    }
  }

  /**
   * Determine position type from position name
   */
  private determinePositionType(positionName: string): PositionType {
    const name = positionName.toLowerCase();
    
    // Goalkeeper positions
    if (name.includes('goalkeeper') || name.includes('keeper') || name.includes('gk')) {
      return PositionType.GOALKEEPER;
    }
    
    // Defender positions
    if (name.includes('defender') || name.includes('defence') || name.includes('defense') || 
        name.includes('centre-back') || name.includes('center-back') || name.includes('full-back') ||
        name.includes('left-back') || name.includes('right-back') || name.includes('wing-back') ||
        name.includes('sweeper') || name.includes('libero')) {
      return PositionType.DEFENDER;
    }
    
    // Midfielder positions
    if (name.includes('midfielder') || name.includes('midfield') || name.includes('centre-midfield') ||
        name.includes('center-midfield') || name.includes('left-midfield') || name.includes('right-midfield') ||
        name.includes('attacking-midfield') || name.includes('defensive-midfield') || name.includes('winger') ||
        name.includes('wide-midfield') || name.includes('central-midfield')) {
      return PositionType.MIDFIELDER;
    }
    
    // Forward positions
    if (name.includes('forward') || name.includes('striker') || name.includes('centre-forward') ||
        name.includes('center-forward') || name.includes('left-forward') || name.includes('right-forward') ||
        name.includes('attacker') || name.includes('winger') || name.includes('inside-forward')) {
      return PositionType.FORWARD;
    }
    
    // Default fallback - try to infer from common patterns
    if (name.includes('attack') || name.includes('strike')) {
      return PositionType.FORWARD;
    }
    
    if (name.includes('mid') || name.includes('centre') || name.includes('center')) {
      return PositionType.MIDFIELDER;
    }
    
    if (name.includes('def') || name.includes('back')) {
      return PositionType.DEFENDER;
    }
    
    // Default to midfielder if unclear
    return PositionType.MIDFIELDER;
  }

  /**
   * Get or create a position
   */
  private async getOrCreatePosition(positionName: string): Promise<Position> {
    let [position] = await this.positionService.getQuery({
      where: { name: positionName }
    });

    if (!position) {
      const positionType = this.determinePositionType(positionName);
      position = await this.positionService.create({
        name: positionName,
        type: positionType,
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
  async syncFixture(matchData: StatsBombMatch): Promise<void> {
    // Check if fixture already exists by StatsBomb match ID in metadata
    const [existingFixture] = await this.fixtureService.getQuery({
      where: {
        metadata: Raw(`metadata->>'statsbombId' = '${matchData.match_id}'`)
      }
    });

    if (existingFixture) {
      this.logger.debug(`Fixture already exists for StatsBomb match ${matchData.match_id}`);
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

    let fixture;
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

      this.logger.log(`✅ Created fixture ID ${fixture.id} for StatsBomb match ${matchData.match_id}: ${matchData.home_team.home_team_name} vs ${matchData.away_team.away_team_name} with metadata: ${JSON.stringify(fixture.metadata)}`);
    }
  }

  /**
   * Get fixture ID by StatsBomb match ID
   */
  private async getFixtureIdByStatsBombMatchId(statsbombMatchId: number): Promise<number | null> {
    try {


      const [fixture] = await this.fixtureService.getQuery({
        where: {
          metadata: JsonbWhere('statsbombId', '=', 3895302),
        }
      });


      return fixture ? fixture.id : null;
    } catch (error) {
      this.logger.error(`Error getting fixture ID for StatsBomb match ${statsbombMatchId}:`, error);
      return null;
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
        metadata:{
          source: 'StatsBomb',
          lastSync: new Date().toISOString(),
          statsbombId: stadiumData.id
        }
      });
    }

    return stadium;
  }

  /**
   * Sync events (goals, etc.) to database
   */
  async syncEvents(): Promise<void> {
    this.logger.log('🎯 Syncing events...');
    
    const competitions = await this.fetchCompetitions();
    this.logger.log(`📊 Found ${competitions.length} competitions for events sync`);
    
    let totalEventsProcessed = 0;
    let totalGoalsCreated = 0;
    
    for (const comp of competitions) {
      try {
        this.logger.log(`🏆 Processing events for competition: ${comp.competition_name}`);
        const matches = await this.fetchMatches(comp.competition_id, comp.season_id);
        this.logger.log(`⚽ Found ${matches.length} matches for events sync`);
        
        for (const match of matches) {
          const eventsCreated = await this.syncEventsFromMatch(match.match_id);
          totalEventsProcessed += eventsCreated;
        }
      } catch (error) {
        this.logger.warn(`Error syncing events for competition ${comp.competition_name}:`, error);
      }
    }
    
    this.logger.log(`🎉 Events sync completed! Processed ${totalEventsProcessed} events, created ${totalGoalsCreated} goals`);
  }

  /**
   * Sync events from a specific match
   */
  async syncEventsFromMatch(matchId: number): Promise<number> {
    try {
      // Get the internal fixture ID for this StatsBomb match ID
      const fixtureId = await this.getFixtureIdByStatsBombMatchId(matchId);
      
      if (!fixtureId) {
        this.logger.warn(`⚠️ No fixture found for StatsBomb match ${matchId}. Make sure the fixture is synced first.`);
        return 0;
      }

      const events = await this.fetchEvents(matchId);
      this.logger.debug(`📊 Found ${events.length} events for StatsBomb match ${matchId} (fixture ID: ${fixtureId})`);
      
      let goalsCreated = 0;
      let cardsCreated = 0;
      let substitutionsCreated = 0;
      
      for (const event of events) {
        if (event.type.name === 'Shot' && event.shot?.outcome?.name === 'Goal') {
          await this.syncGoal(event, fixtureId);
          goalsCreated++;
        } else if (event.type.name === 'Foul Committed' && event.bad_behaviour) {
          await this.syncCard(event, fixtureId);
          cardsCreated++;
        } else if (event.type.name === 'Substitution') {
          await this.syncSubstitution(event, fixtureId);
          substitutionsCreated++;
        }
      }
      
      this.logger.debug(`⚽ Created ${goalsCreated} goals, 🟨🟥 ${cardsCreated} cards, 🔄 ${substitutionsCreated} substitutions for StatsBomb match ${matchId} (fixture ID: ${fixtureId})`);
      return goalsCreated + cardsCreated + substitutionsCreated;
    } catch (error) {
      this.logger.warn(`Error syncing events for match ${matchId}:`, error);
      return 0;
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
  private async syncGoal(eventData: StatsBombEvent, fixtureId: number): Promise<void> {
    try {
      this.logger.debug(`🎯 Processing goal: ${eventData.player.name} at ${eventData.minute}'`);
      
      // Check if goal already exists
      const [existingGoal] = await this.goalService.getQuery({
        where: { 
          fixtureId: fixtureId,
          minute: eventData.minute,
          scorerId: eventData.player.id
        }
      });

      if (existingGoal) {
        this.logger.debug(`Goal already exists for ${eventData.player.name} at ${eventData.minute}'`);
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

      if (!player) {
        this.logger.warn(`⚠️ Player not found for goal: ${eventData.player.name}`);
        return;
      }

      if (!team) {
        this.logger.warn(`⚠️ Team not found for goal: ${eventData.team.name}`);
        return;
      }

      const goalData = {
        minute: eventData.minute,
        scorerId: player.id,
        fixtureId: fixtureId,
        teamId: team.id,
        penalty: eventData.shot?.type?.name === 'Penalty',
        ownGoal: false, // Would need additional logic to determine this
        metadata: {
          source: 'StatsBomb',
          statsbombEventId: eventData.id,
          shotType: eventData.shot?.type?.name,
          technique: eventData.shot?.technique?.name,
          bodyPart: eventData.shot?.body_part?.name,
          lastSync: new Date().toISOString()
        }
      };

      this.logger.debug(`Creating goal with data: ${JSON.stringify(goalData)}`);
      
      const goal = await this.goalService.create(goalData);
      this.logger.log(`✅ Created goal: ${eventData.player.name} at ${eventData.minute}' with metadata: ${JSON.stringify(goal.metadata)}`);
      
      // Verify metadata was stored by querying the database
      const [verificationGoal] = await this.goalService.getQuery({
        where: { id: goal.id }
      });
      this.logger.debug(`Verification - Goal metadata from DB: ${JSON.stringify(verificationGoal?.metadata)}`);
    } catch (error) {
      this.logger.error(`Error creating goal for ${eventData.player.name}:`, error);
      throw error;
    }
  }

  /**
   * Sync a card to database
   */
  private async syncCard(eventData: StatsBombEvent, fixtureId: number): Promise<void> {
    try {
      this.logger.debug(`🟨🟥 Processing card: ${eventData.player.name} at ${eventData.minute}'`);
      
      // Check if card already exists
      const [existingCard] = await this.cardService.getQuery({
        where: { 
          fixtureId: fixtureId,
          minute: eventData.minute,
          playerId: eventData.player.id
        }
      });

      if (existingCard) {
        this.logger.debug(`Card already exists for ${eventData.player.name} at ${eventData.minute}'`);
        return; // Already exists
      }

      // Get player
      const [player] = await this.playerService.getQuery({
        where: { name: eventData.player.name }
      });

      if (!player) {
        this.logger.warn(`⚠️ Player not found for card: ${eventData.player.name}`);
        return;
      }

      // Determine card type
      const cardType = eventData.bad_behaviour?.card?.name?.toLowerCase().includes('red') 
        ? CardType.RED 
        : CardType.YELLOW;

      const cardData = {
        minute: eventData.minute,
        playerId: player.id,
        fixtureId: fixtureId,
        type: cardType,
        metadata: {
          source: 'StatsBomb',
          statsbombEventId: eventData.id,
          cardName: eventData.bad_behaviour?.card?.name,
          lastSync: new Date().toISOString()
        }
      };

      this.logger.debug(`Creating card with data: ${JSON.stringify(cardData)}`);
      
      const card = await this.cardService.create(cardData);
      this.logger.log(`✅ Created ${cardType.toLowerCase()} card: ${eventData.player.name} at ${eventData.minute}' with metadata: ${JSON.stringify(card.metadata)}`);
    } catch (error) {
      this.logger.error(`Error creating card for ${eventData.player.name}:`, error);
      throw error;
    }
  }

  /**
   * Sync a substitution to database
   */
  private async syncSubstitution(eventData: StatsBombEvent, fixtureId: number): Promise<void> {
    try {
      this.logger.debug(`🔄 Processing substitution: ${eventData.player.name} at ${eventData.minute}'`);
      
      // Check if substitution already exists
      const [existingSubstitution] = await this.substitutionService.getQuery({
        where: { 
          fixtureId: fixtureId,
          minute: eventData.minute,
          playerOutId: eventData.player.id
        }
      });

      if (existingSubstitution) {
        this.logger.debug(`Substitution already exists for ${eventData.player.name} at ${eventData.minute}'`);
        return; // Already exists
      }

      // Get players
      const [playerOut] = await this.playerService.getQuery({
        where: { name: eventData.player.name }
      });

      const [playerIn] = await this.playerService.getQuery({
        where: { name: eventData.substitution?.replacement?.name }
      });

      // Get team
      const [team] = await this.teamService.getQuery({
        where: { name: eventData.team.name }
      });

      if (!playerOut) {
        this.logger.warn(`⚠️ Player out not found for substitution: ${eventData.player.name}`);
        return;
      }

      if (!playerIn) {
        this.logger.warn(`⚠️ Player in not found for substitution: ${eventData.substitution?.replacement?.name}`);
        return;
      }

      if (!team) {
        this.logger.warn(`⚠️ Team not found for substitution: ${eventData.team.name}`);
        return;
      }

      const substitutionData = {
        minute: eventData.minute,
        playerOutId: playerOut.id,
        playerInId: playerIn.id,
        fixtureId: fixtureId,
        teamId: team.id,
        metadata: {
          source: 'StatsBomb',
          statsbombEventId: eventData.id,
          outcome: eventData.substitution?.outcome?.name,
          lastSync: new Date().toISOString()
        }
      };

      this.logger.debug(`Creating substitution with data: ${JSON.stringify(substitutionData)}`);
      
      const substitution = await this.substitutionService.create(substitutionData);
      this.logger.log(`✅ Created substitution: ${eventData.player.name} → ${eventData.substitution?.replacement?.name} at ${eventData.minute}' with metadata: ${JSON.stringify(substitution.metadata)}`);
    } catch (error) {
      this.logger.error(`Error creating substitution for ${eventData.player.name}:`, error);
      throw error;
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
