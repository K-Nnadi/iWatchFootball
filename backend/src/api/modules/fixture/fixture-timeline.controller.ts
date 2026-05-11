import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Public } from '../../../auth/decorators/public.decorator';
import { FixtureTimelinePayload, FixtureTimelineService } from './fixture-timeline.service';

@ApiTags('fixture')
@Controller('fixture')
export class FixtureTimelineController {
  constructor(private readonly timeline: FixtureTimelineService) {}

  @Get(':fixtureId/events')
  @Public()
  @ApiOperation({ summary: 'Goals, cards and substitutions for a fixture (public)' })
  @ApiOkResponse({
    description: 'Timeline entities scoped to the fixture',
    schema: {
      type: 'object',
      properties: {
        goals: { type: 'array', items: { type: 'object' } },
        cards: { type: 'array', items: { type: 'object' } },
        substitutions: { type: 'array', items: { type: 'object' } },
        players: {
          type: 'array',
          items: {
            type: 'object',
            properties: { id: { type: 'number' }, name: { type: 'string' } },
          },
        },
      },
    },
  })
  async getFixtureEvents(@Param('fixtureId', ParseIntPipe) fixtureId: number): Promise<FixtureTimelinePayload> {
    return this.timeline.getEventsForFixture(fixtureId);
  }
}
