import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
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

@Injectable()
export class PlatformConfigService implements OnModuleInit {
    private readonly cache = new Map<string, PlatformConfig>();

    constructor(
        @InjectRepository(PlatformConfig)
        private readonly repo: Repository<PlatformConfig>,
    ) {}

    async onModuleInit(): Promise<void> {
        const all = await this.repo.find();
        for (const row of all) {
            this.cache.set(row.key, row);
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
    }
}
