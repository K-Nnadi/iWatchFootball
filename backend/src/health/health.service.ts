import { Inject, Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import type Redis from 'ioredis';
import { DataSource } from 'typeorm';
import { REDIS_CLIENT, REDIS_ENABLED } from '../shared/redis/redis.constants';

export interface DependencyCheck {
    ok: boolean;
    latencyMs?: number;
    error?: string;
    skipped?: boolean;
}

export interface HealthSummary {
    status: 'ok' | 'degraded' | 'unhealthy';
    timestamp: string;
    uptime: number;
    environment: string;
    dependencies: {
        postgres: DependencyCheck;
        redis: DependencyCheck;
    };
}

@Injectable()
export class HealthService {
    constructor(
        @InjectDataSource() private readonly dataSource: DataSource,
        @Inject(REDIS_CLIENT) private readonly redis: Redis | null,
        @Inject(REDIS_ENABLED) private readonly redisEnabled: boolean,
    ) {}

    async checkPostgres(): Promise<DependencyCheck> {
        const start = Date.now();
        try {
            await this.dataSource.query('SELECT 1');
            return { ok: true, latencyMs: Date.now() - start };
        } catch (e) {
            const msg = e instanceof Error ? e.message : String(e);
            return { ok: false, error: msg, latencyMs: Date.now() - start };
        }
    }

    async checkRedis(): Promise<DependencyCheck> {
        if (!this.redisEnabled || !this.redis) {
            return { ok: true, skipped: true };
        }
        const start = Date.now();
        try {
            const pong = await this.redis.ping();
            return {
                ok: pong === 'PONG',
                latencyMs: Date.now() - start,
                error: pong === 'PONG' ? undefined : `unexpected ping response: ${pong}`,
            };
        } catch (e) {
            const msg = e instanceof Error ? e.message : String(e);
            return { ok: false, error: msg, latencyMs: Date.now() - start };
        }
    }

    async getSummary(): Promise<HealthSummary> {
        const [postgres, redis] = await Promise.all([this.checkPostgres(), this.checkRedis()]);
        const postgresOk = postgres.ok;
        const redisOk = redis.skipped || redis.ok;
        let status: HealthSummary['status'] = 'ok';
        if (!postgresOk) {
            status = 'unhealthy';
        } else if (!redisOk) {
            status = 'degraded';
        }

        return {
            status,
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
            environment: process.env.NODE_ENV || 'development',
            dependencies: { postgres, redis },
        };
    }

    async isReady(): Promise<{ ready: boolean; summary: HealthSummary }> {
        const summary = await this.getSummary();
        const postgresOk = summary.dependencies.postgres.ok;
        const redisRequired = this.redisEnabled;
        const redisOk = summary.dependencies.redis.skipped || summary.dependencies.redis.ok;
        const ready = postgresOk && (!redisRequired || redisOk);
        return { ready, summary };
    }
}
