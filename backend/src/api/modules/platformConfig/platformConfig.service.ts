import { Inject, Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import type Redis from 'ioredis';
import {
    PLATFORM_CONFIG_INVALIDATE_CHANNEL,
    REDIS_CLIENT,
    REDIS_ENABLED,
    REDIS_SUBSCRIBER,
} from '../../../shared/redis/redis.constants';
import { ConfigValueType, PlatformConfig } from './platformConfig.entity';

export interface SetConfigPayload {
    valueType: ConfigValueType;
    numberValue?: number;
    stringValue?: string;
    booleanValue?: boolean;
    arrayValue?: unknown[];
    jsonValue?: Record<string, unknown>;
    description?: string;
}

const CACHE_TTL_MS = parseInt(process.env.PLATFORM_CONFIG_CACHE_TTL_MS || '30000', 10);

@Injectable()
export class PlatformConfigService implements OnModuleInit, OnModuleDestroy {
    private readonly logger = new Logger(PlatformConfigService.name);
    private readonly cache = new Map<string, PlatformConfig>();
    private lastCacheRefresh = 0;

    constructor(
        @InjectRepository(PlatformConfig)
        private readonly repo: Repository<PlatformConfig>,
        @Inject(REDIS_CLIENT) private readonly redis: Redis | null,
        @Inject(REDIS_SUBSCRIBER) private readonly subscriber: Redis | null,
        @Inject(REDIS_ENABLED) private readonly redisEnabled: boolean,
    ) {}

    async onModuleInit(): Promise<void> {
        await this.reloadAll();
        if (this.redisEnabled && this.subscriber) {
            await this.subscriber.subscribe(PLATFORM_CONFIG_INVALIDATE_CHANNEL);
            this.subscriber.on('message', (channel: string, message: string) => {
                if (channel !== PLATFORM_CONFIG_INVALIDATE_CHANNEL) return;
                this.handleInvalidation(message);
            });
            this.logger.log('Subscribed to platform-config cache invalidation channel');
        }
    }

    async onModuleDestroy(): Promise<void> {
        if (this.subscriber) {
            await this.subscriber.unsubscribe(PLATFORM_CONFIG_INVALIDATE_CHANNEL).catch(() => undefined);
        }
    }

    private async reloadAll(): Promise<void> {
        const all = await this.repo.find();
        this.cache.clear();
        for (const row of all) {
            this.cache.set(row.key, row);
        }
        this.lastCacheRefresh = Date.now();
    }

    private handleInvalidation(message: string): void {
        const key = message?.trim();
        if (!key || key === '*') {
            this.cache.clear();
            this.lastCacheRefresh = 0;
            void this.reloadAll();
            return;
        }
        this.cache.delete(key);
    }

    private async publishInvalidation(key: string): Promise<void> {
        if (!this.redis) return;
        await this.redis.publish(PLATFORM_CONFIG_INVALIDATE_CHANNEL, key);
    }

    private maybeExpireCache(): void {
        if (this.redisEnabled) return;
        if (Date.now() - this.lastCacheRefresh > CACHE_TTL_MS) {
            this.cache.clear();
            this.lastCacheRefresh = Date.now();
        }
    }

    private extractValue(row: PlatformConfig): unknown {
        switch (row.valueType) {
            case ConfigValueType.NUMBER:  return row.numberValue;
            case ConfigValueType.STRING:  return row.stringValue;
            case ConfigValueType.BOOLEAN: return row.booleanValue;
            case ConfigValueType.ARRAY:   return row.arrayValue;
            case ConfigValueType.JSON:    return row.jsonValue;
        }
    }

    private async findRow(key: string): Promise<PlatformConfig | undefined> {
        this.maybeExpireCache();
        if (this.cache.has(key)) return this.cache.get(key)!;
        const row = await this.repo.findOne({ where: { key } });
        if (row) this.cache.set(key, row);
        return row ?? undefined;
    }

    async getValue(key: string): Promise<unknown | undefined> {
        const row = await this.findRow(key);
        return row ? this.extractValue(row) : undefined;
    }

    async getNumber(key: string, fallback: number): Promise<number> {
        const row = await this.findRow(key);
        if (!row || row.valueType !== ConfigValueType.NUMBER || row.numberValue == null) return fallback;
        return Number(row.numberValue);
    }

    async getString(key: string, fallback: string): Promise<string> {
        const row = await this.findRow(key);
        if (!row || row.valueType !== ConfigValueType.STRING || row.stringValue == null) return fallback;
        return row.stringValue;
    }

    async getBoolean(key: string, fallback: boolean): Promise<boolean> {
        const row = await this.findRow(key);
        if (!row || row.valueType !== ConfigValueType.BOOLEAN || row.booleanValue == null) return fallback;
        return row.booleanValue;
    }

    async getArray(key: string, fallback: unknown[] = []): Promise<unknown[]> {
        const row = await this.findRow(key);
        if (!row || row.valueType !== ConfigValueType.ARRAY || row.arrayValue == null) return fallback;
        return row.arrayValue;
    }

    async getJson(key: string, fallback: Record<string, unknown> = {}): Promise<Record<string, unknown>> {
        const row = await this.findRow(key);
        if (!row || row.valueType !== ConfigValueType.JSON || row.jsonValue == null) return fallback;
        return row.jsonValue;
    }

    async listAll(): Promise<Array<{
        key: string;
        valueType: ConfigValueType;
        value: unknown;
        description?: string;
        createdAt: Date;
        updatedAt: Date;
    }>> {
        const all = await this.repo.find({ order: { key: 'ASC' } });
        return all.map((row) => ({
            key: row.key,
            valueType: row.valueType,
            value: this.extractValue(row),
            description: row.description,
            createdAt: row.createdAt,
            updatedAt: row.updatedAt,
        }));
    }

    async set(key: string, payload: SetConfigPayload): Promise<void> {
        const existing = await this.repo.findOne({ where: { key } });

        const data: Partial<PlatformConfig> = {
            key,
            valueType:    payload.valueType,
            numberValue:  payload.valueType === ConfigValueType.NUMBER  ? payload.numberValue  : undefined,
            stringValue:  payload.valueType === ConfigValueType.STRING  ? payload.stringValue  : undefined,
            booleanValue: payload.valueType === ConfigValueType.BOOLEAN ? payload.booleanValue : undefined,
            arrayValue:   payload.valueType === ConfigValueType.ARRAY   ? payload.arrayValue   : undefined,
            jsonValue:    payload.valueType === ConfigValueType.JSON    ? payload.jsonValue    : undefined,
            ...(payload.description != null ? { description: payload.description } : {}),
        };

        if (existing) {
            Object.assign(existing, data);
            await this.repo.save(existing);
            this.cache.set(key, existing);
        } else {
            const created = this.repo.create(data as PlatformConfig);
            await this.repo.save(created);
            this.cache.set(key, created);
        }

        await this.publishInvalidation(key);
    }
}
