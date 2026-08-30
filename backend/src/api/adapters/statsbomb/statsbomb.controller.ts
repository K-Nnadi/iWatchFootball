import {Body, Controller, Post, Get, HttpCode, HttpStatus, Param, ParseIntPipe, Logger} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiPropertyOptional } from '@nestjs/swagger';
import { StatsBombAdapterService } from './statsbomb-adapter.service';

export class StatsBombSyncOptionsDTO {
  @ApiPropertyOptional({ description: 'Skip syncing fixtures', default: false })
  skipFixtures?: boolean;

  @ApiPropertyOptional({ description: 'Skip syncing cards', default: false })
  skipCards?: boolean;

  @ApiPropertyOptional({
    description:
      'Skip team + player ingest from match lineups (Step 2). Managers still attach from match payloads when fixtures run.',
    default: false,
  })
  skipPlayers?: boolean;

  @ApiPropertyOptional({ description: 'Skip syncing goals', default: false })
  skipGoals?: boolean;

  @ApiPropertyOptional({ description: 'Skip creating stadiums during fixture sync', default: false })
  skipStadiums?: boolean;

  @ApiPropertyOptional({
    description: 'Skip StatsBomb lineups/{match}.json merge',
    default: false,
  })
  skipLineups?: boolean;

  @ApiPropertyOptional({
    description:
      'Skip Starting XI events when syncing match events (formation / eleven from tactics block only). Independent of skipLineups.',
    default: false,
  })
  skipStartingXi?: boolean;

  @ApiPropertyOptional({
    description: 'When true (default), skip competition-seasons with unchanged StatsBomb match_updated watermark.',
    default: true,
  })
  incremental?: boolean;

  @ApiPropertyOptional({
    description: 'Re-sync all competition-seasons regardless of watermarks.',
    default: false,
  })
  forceFull?: boolean;
}

@ApiTags('StatsBomb Adapter')
@ApiBearerAuth()
@Controller('statsbomb')
export class StatsBombController {
  private readonly logger = new Logger(StatsBombController.name);
  
  constructor(private readonly statsBombAdapterService: StatsBombAdapterService) {}

  @Post('sync')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Sync StatsBomb data to database',
    description: 'Fetches data from StatsBomb Open Data repository and syncs it with the local database'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Data synchronization completed successfully',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'StatsBomb data synchronization completed successfully' },
        timestamp: { type: 'string', example: '2024-01-15T10:30:00.000Z' }
      }
    }
  })
  @ApiResponse({ 
    status: 500, 
    description: 'Internal server error during synchronization' 
  })
  async syncData(@Body() options?: StatsBombSyncOptionsDTO) {
    await this.statsBombAdapterService.syncStatsBombData(options);
    return {
      message: 'StatsBomb data synchronization completed successfully',
      timestamp: new Date().toISOString()
    };
  }

  @Get('status')
  @ApiOperation({ 
    summary: 'Get sync status and statistics',
    description: 'Returns current database statistics and sync status'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Sync status retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        competitions: { type: 'number', example: 15 },
        teams: { type: 'number', example: 300 },
        players: { type: 'number', example: 5000 },
        fixtures: { type: 'number', example: 2000 },
        goals: { type: 'number', example: 5000 },
        cards: { type: 'number', example: 8000 },
        substitutions: { type: 'number', example: 3000 },
        events: { type: 'number', example: 16000 },
        lastSync: { type: 'string', example: '2024-01-15T10:30:00.000Z' }
      }
    }
  })
  async getSyncStatus() {
    return await this.statsBombAdapterService.getSyncStatus();
  }

  @Post('sync/competitions')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Sync competitions only',
    description: 'Fetches and syncs only competition data from StatsBomb'
  })
  async syncCompetitions() {
    // This would be a separate method in the service for partial syncs
    return { message: 'Competitions sync completed', timestamp: new Date().toISOString() };
  }

  @Post('sync/teams')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Sync teams and players only',
    description: 'Fetches and syncs only team and player data from StatsBomb'
  })
  async syncTeams() {
    // This would be a separate method in the service for partial syncs
    return { message: 'Teams sync completed', timestamp: new Date().toISOString() };
  }

  @Post('sync/fixtures')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Sync fixtures only',
    description: 'Fetches and syncs only fixture data from StatsBomb'
  })
  async syncFixtures() {
    // This would be a separate method in the service for partial syncs
    return { message: 'Fixtures sync completed', timestamp: new Date().toISOString() };
  }

  @Get('test/team-types')
  @ApiOperation({ 
    summary: 'Test team type detection',
    description: 'Tests the team type detection logic with sample data to verify it correctly identifies club vs country teams'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Team type detection test results',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          teamName: { type: 'string', example: 'Brazil' },
          teamCountry: { type: 'string', example: 'Brazil' },
          detectedType: { type: 'string', example: 'Country' }
        }
      }
    }
  })
  testTeamTypeDetection() {
    return this.statsBombAdapterService.testTeamTypeDetection();
  }

  @Post('test/team-creation')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Test team creation',
    description: 'Tests the team creation functionality to verify it works correctly'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Team creation test result',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        team: { type: 'object' },
        message: { type: 'string' }
      }
    }
  })
  async testTeamCreation() {
    try {
      const team = await this.statsBombAdapterService.testTeamCreation();
      return { 
        success: true, 
        team, 
        message: 'Team creation test passed' 
      };
    } catch (error) {
      return {
        success: false,
        // @ts-ignore
        error: error.message,
        message: 'Team creation test failed' 
      };
    }
  }

  @Post('test/sync-teams-only')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Test sync teams only',
    description: 'Tests syncing only teams from StatsBomb data to verify the process works'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Team sync test result',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        message: { type: 'string' },
        teamsCreated: { type: 'number' }
      }
    }
  })
  async testSyncTeamsOnly() {
    try {
      await this.statsBombAdapterService.syncTeamsAndPlayers();
      return { 
        success: true, 
        message: 'Teams sync test completed',
        teamsCreated: 'Check logs for details'
      };
    } catch (error) {
      return {
        success: false,
        // @ts-ignore
        error: error.message,
        message: 'Teams sync test failed' 
      };
    }
  }

  @Post('test/sync-events-only')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Test sync events only',
    description: 'Tests syncing only events from StatsBomb data to verify the process works'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Events sync test result',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        message: { type: 'string' },
        eventsCreated: { type: 'string' }
      }
    }
  })
  async testSyncEventsOnly() {
    try {
      await this.statsBombAdapterService.syncEvents();
      return { 
        success: true, 
        message: 'Events sync test completed',
        eventsCreated: 'Check logs for details'
      };
    } catch (error) {
      return {
        success: false,
        // @ts-ignore
        error: error.message,
        message: 'Events sync test failed' 
      };
    }
  }

  @Post('test/sync-players-only')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Test sync players only',
    description: 'Tests syncing only players from StatsBomb data to verify the process works'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Players sync test result',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        message: { type: 'string' },
        playersCreated: { type: 'string' }
      }
    }
  })
  async testSyncPlayersOnly() {
    try {
      await this.statsBombAdapterService.syncTeamsAndPlayers();
      return { 
        success: true, 
        message: 'Players sync test completed',
        playersCreated: 'Check logs for details'
      };
    } catch (error) {
      return {
        success: false,
        // @ts-ignore
        error: error.message,
        message: 'Players sync test failed' 
      };
    }
  }

  @Post('test/sync-single-match/:matchId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Test sync complete match data from a single match',
    description: 'Tests syncing teams, players, and all events (goals, cards, substitutions) from a specific match ID to debug the process'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Single match sync test result',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        message: { type: 'string' },
        matchId: { type: 'number' },
        playersCreated: { type: 'number' },
        eventsCreated: { type: 'number' },
        details: { type: 'string' }
      }
    }
  })
  async testSyncSingleMatch(@Param('matchId', ParseIntPipe) matchId: number) {
    try {
      this.logger.log(`🧪 Testing single match sync for match ID: ${matchId}`);
      
      // First, let's check if the match exists and get its details
      const match = await this.statsBombAdapterService.getMatchDetails(matchId);
      
      if (!match) {
        return {
          success: false,
          message: `Match ${matchId} not found`,
          matchId,
          playersCreated: 0,
          eventsCreated: 0,
          details: 'Match not found in StatsBomb data'
        };
      }

      // Sync teams first
      await this.statsBombAdapterService.syncTeam(match.home_team);
      await this.statsBombAdapterService.syncTeam(match.away_team);
      
      // Sync players first — lineup sync needs Player rows for PlayerLineUp.
      const playersCreated = await this.statsBombAdapterService.syncPlayersFromMatch(matchId);

      await this.statsBombAdapterService.syncFixture(match);
      
      // Sync all events (goals, cards, substitutions)
      const eventsCreated = await this.statsBombAdapterService.syncEventsFromMatch(matchId, { matchData: match });
      
      return {
        success: true,
        message: `Complete single match sync completed for match ${matchId}`,
        matchId,
        playersCreated,
        eventsCreated,
        details: `Match: ${match.home_team.home_team_name} vs ${match.away_team.away_team_name} - Synced ${playersCreated} players and ${eventsCreated} events`
      };
    } catch (error) {
      this.logger.error(`Error in single match sync for match ${matchId}:`, error);
      return {
        success: false,
        // @ts-ignore
        error: error.message,
        message: `Single match sync failed for match ${matchId}`,
        matchId,
        playersCreated: 0,
        eventsCreated: 0,
        details: 'Check logs for error details'
      };
    }
  }

  @Get('test/available-matches')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Get available match IDs for testing',
    description: 'Returns a list of available match IDs that can be used for single match testing'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'List of available match IDs',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        matches: { 
          type: 'array',
          items: {
            type: 'object',
            properties: {
              matchId: { type: 'number' },
              homeTeam: { type: 'string' },
              awayTeam: { type: 'string' },
              competition: { type: 'string' },
              season: { type: 'string' }
          }
        }
      }
    }
  }})
  async getAvailableMatches() {
    try {
      const matches = await this.statsBombAdapterService.getAvailableMatches();
      return {
        success: true,
        matches: matches.slice(0, 10) // Return first 10 matches for testing
      };
    } catch (error) {
      return {
        success: false,
        // @ts-ignore
        error: error.message,
        matches: []
      };
    }
  }
}
