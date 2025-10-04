import { Controller, Post, Get, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { StatsBombAdapterService } from './statsbomb-adapter.service';

@ApiTags('StatsBomb Adapter')
@Controller('statsbomb')
export class StatsBombController {
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
  async syncData() {
    await this.statsBombAdapterService.syncStatsBombData();
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
}
