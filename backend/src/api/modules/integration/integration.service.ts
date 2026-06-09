import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateIntegrationDTO, Integration } from './integration.entity';
import { CrudRepoAdapter } from '@iWatchFootball/base-tools/crud/crud.repo.adapter';
import { IntegrationAuthType, IntegrationKind } from '../../enums/integration.enum';

@Injectable()
export class IntegrationService extends CrudRepoAdapter<Integration, CreateIntegrationDTO> {
    constructor(
        @InjectRepository(Integration) private readonly entityRepo: Repository<Integration>,
    ) {
        super(entityRepo);
    }

    async findBySlug(slug: string, kind?: IntegrationKind): Promise<Integration | null> {
        return this.entityRepo.findOne({
            where: { slug, enabled: true, ...(kind ? { kind } : {}) },
        });
    }

    async findById(id: number, kind?: IntegrationKind): Promise<Integration | null> {
        return this.entityRepo.findOne({
            where: { id, enabled: true, ...(kind ? { kind } : {}) },
        });
    }

    async findDefault(kind: IntegrationKind): Promise<Integration | null> {
        return this.entityRepo.findOne({
            where: { kind, enabled: true, isDefault: true },
        });
    }

    /** Payment config row — includes disabled integrations (e.g. stripe-primary seed). */
    async findDefaultPaymentIntegration(): Promise<Integration | null> {
        const byDefault = await this.entityRepo.findOne({
            where: { kind: IntegrationKind.PAYMENT, isDefault: true },
        });
        if (byDefault) return byDefault;
        return this.entityRepo.findOne({ where: { slug: 'stripe-primary' } });
    }

    async listByKind(kind: IntegrationKind): Promise<Integration[]> {
        return this.entityRepo.find({
            where: { kind },
            order: { slug: 'ASC' },
        });
    }

    async resolveConfig(slug?: string, kind?: IntegrationKind): Promise<Record<string, unknown>> {
        let row: Integration | null = null;
        if (slug) {
            row = await this.findBySlug(slug, kind);
        } else if (kind) {
            row = await this.findDefault(kind);
        }
        if (!row) {
            throw new NotFoundException(
                slug
                    ? `Integration "${slug}" not found or disabled`
                    : `No default integration for kind ${kind}`,
            );
        }
        return row.config ?? {};
    }

    /** Resolve API key / secret from config (inline, secretKey, or env ref). */
    resolveSecret(row: Integration): string | undefined {
        const config = row.config ?? {};
        const apiKey = this.getConfigString(config, 'apiKey') ?? this.getConfigString(config, 'secretKey');
        if (apiKey) return apiKey;

        const authType = this.getConfigString(config, 'authType');
        const secretRef = this.getConfigString(config, 'secretRef');
        if (
            (authType === IntegrationAuthType.ENV_VAR || authType === 'ENV_VAR') &&
            secretRef
        ) {
            return process.env[secretRef];
        }
        return undefined;
    }

    getConfigString(config: Record<string, unknown>, key: string, fallback?: string): string | undefined {
        const val = config[key];
        if (typeof val === 'string' && val.length > 0) return val;
        return fallback;
    }

    getConfigNumber(config: Record<string, unknown>, key: string, fallback?: number): number | undefined {
        const val = config[key];
        if (typeof val === 'number' && !Number.isNaN(val)) return val;
        if (typeof val === 'string' && val !== '' && !Number.isNaN(Number(val))) return Number(val);
        return fallback;
    }
}
