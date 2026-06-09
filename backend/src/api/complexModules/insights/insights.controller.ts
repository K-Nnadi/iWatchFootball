import { Controller, Get, Post, Body, Param, ParseIntPipe, Req, Res, UseGuards, UsePipes, ValidationPipe } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { FastifyReply } from 'fastify';
import { JwtAuthGuard } from '../../../auth/guards/jwt-auth.guard';
import { IntegrationResolverService } from './integration-resolver.service';
import { InsightsService, StreamInsightBody } from './insights.service';
import { InsightsAccessGuard } from './insights-access.guard';
import { IsInt, IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class StreamFixtureInsightDto {
    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    integrationSlug?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsInt()
    integrationId?: number;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    question?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    locale?: string;
}

@ApiTags('insights')
@Controller('insights')
@UsePipes(new ValidationPipe({ whitelist: true }))
export class InsightsController {
    constructor(
        private readonly insightsService: InsightsService,
        private readonly integrationResolver: IntegrationResolverService,
    ) {}

    @Get('integrations/llm')
    @UseGuards(JwtAuthGuard, InsightsAccessGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'List configured LLM integrations (staff)' })
    async listLlm() {
        return this.integrationResolver.listLlmIntegrationsForStaff();
    }

    @Post('fixtures/:fixtureId/stream')
    @UseGuards(JwtAuthGuard, InsightsAccessGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Stream AI match insight as SSE' })
    @ApiBody({ type: StreamFixtureInsightDto, required: false })
    async streamFixtureInsight(
        @Param('fixtureId', ParseIntPipe) fixtureId: number,
        @Body() body: StreamFixtureInsightDto,
        @Req() req: { user: { id: number } },
        @Res({ passthrough: false }) reply: FastifyReply,
    ): Promise<void> {
        await this.insightsService.streamFixtureInsightToSse({
            fixtureId,
            userId: req.user.id,
            body: body as StreamInsightBody,
            reply,
        });
    }
}
