import { Controller, Get, Res } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { SkipThrottle } from '@nestjs/throttler';
import type { FastifyReply } from 'fastify';
import { HealthService } from './health.service';

@ApiTags('Health')
@SkipThrottle()
@Controller('health')
export class HealthController {
    constructor(private readonly health: HealthService) {}

    @Get()
    @ApiOperation({ summary: 'Health check endpoint with dependency status' })
    @ApiResponse({ status: 200, description: 'Service health summary' })
    async check() {
        return this.health.getSummary();
    }

    @Get('ready')
    @ApiOperation({ summary: 'Readiness check — Postgres required; Redis when REDIS_HOST is set' })
    @ApiResponse({ status: 200, description: 'Service is ready to accept traffic' })
    @ApiResponse({ status: 503, description: 'A required dependency is unavailable' })
    async ready(@Res() reply: FastifyReply) {
        const { ready, summary } = await this.health.isReady();
        const code = ready ? 200 : 503;
        void reply.code(code).send({
            status: ready ? 'ready' : 'not_ready',
            timestamp: summary.timestamp,
            dependencies: summary.dependencies,
        });
    }

    @Get('live')
    @ApiOperation({ summary: 'Liveness check endpoint' })
    @ApiResponse({ status: 200, description: 'Service is alive' })
    live() {
        return {
            status: 'alive',
            timestamp: new Date().toISOString(),
        };
    }
}
