import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ExternalIntegration } from './external-integration.entity';
import {
    ExternalIntegrationKind,
    ExternalIntegrationProvider,
} from '../../enums/external-integration.enum';

export type ResolveLlmArgs = {
    slug?: string;
    id?: number;
};

export type ResolvedLlmIntegration = {
    source: 'db' | 'env';
    externalIntegrationId?: number;
    provider: ExternalIntegrationProvider;
    apiKey: string;
    model: string;
    baseUrl?: string;
    timeoutMs: number;
};

const DEFAULT_ANTHROPIC_MODEL = 'claude-3-5-haiku-20241022';
const DEFAULT_OPENAI_MODEL = 'gpt-4o-mini';

function isOpenAiProvider(p: string): boolean {
    return (
        p === ExternalIntegrationProvider.OPENAI ||
        p === (ExternalIntegrationProvider.OPENAI as string)
    );
}

function isAnthropicProvider(p: string): boolean {
    return (
        p === ExternalIntegrationProvider.ANTHROPIC ||
        p === (ExternalIntegrationProvider.ANTHROPIC as string)
    );
}

@Injectable()
export class IntegrationResolverService {
    private readonly logger = new Logger(IntegrationResolverService.name);

    constructor(
        @InjectRepository(ExternalIntegration)
        private readonly integrationRepo: Repository<ExternalIntegration>,
    ) {}

    async resolveLlm(args: ResolveLlmArgs): Promise<ResolvedLlmIntegration> {
        const row = await this.findLlmRow(args);
        if ((args.slug || args.id != null) && !row) {
            throw new NotFoundException('LLM integration not found or disabled');
        }
        if (!row) {
            return this.fromEnvFallback();
        }

        const apiKey = this.resolveSecret(row);
        if (!apiKey) {
            this.logger.warn('Integration row missing API key; trying env keys for provider');
            const fallbackKey = this.envKeyForProvider(row.provider);
            if (!fallbackKey) {
                return this.fromEnvFallback();
            }
            return this.fromRowWithKey(row, fallbackKey);
        }
        return this.fromRowWithKey(row, apiKey);
    }

    private fromRowWithKey(row: ExternalIntegration, apiKey: string): ResolvedLlmIntegration {
        if (
            !isAnthropicProvider(row.provider) &&
            !isOpenAiProvider(row.provider)
        ) {
            this.logger.warn(
                `Provider ${row.provider} not supported; use anthropic or openai. Falling back to OpenAI-compatible URL only if baseUrl is set.`,
            );
        }

        const timeoutMs =
            typeof (row.config as Record<string, unknown> | undefined)?.timeoutMs ===
                'number' &&
            ((row.config as Record<string, unknown>).timeoutMs as number) > 0
                ? ((row.config as Record<string, unknown>).timeoutMs as number)
                : parseInt(process.env.INSIGHTS_LLM_TIMEOUT_MS || '120000', 10);

        return {
            source: 'db',
            externalIntegrationId: row.id,
            provider: row.provider as ExternalIntegrationProvider,
            apiKey,
            model: this.resolveModelForRow(row),
            baseUrl: row.baseUrl,
            timeoutMs,
        };
    }

    private resolveModelForRow(row: ExternalIntegration): string {
        const config = (row.config ?? {}) as Record<string, unknown>;
        const modelFromConfig =
            (typeof config.model === 'string' && config.model) ||
            (typeof config.modelId === 'string' && config.modelId) ||
            undefined;

        if (isOpenAiProvider(row.provider)) {
            return (
                process.env.INSIGHTS_OPENAI_MODEL ||
                modelFromConfig ||
                DEFAULT_OPENAI_MODEL
            );
        }
        return (
            process.env.INSIGHTS_ANTHROPIC_MODEL ||
            modelFromConfig ||
            DEFAULT_ANTHROPIC_MODEL
        );
    }

    private envKeyForProvider(provider: string): string | undefined {
        if (isOpenAiProvider(provider)) {
            return process.env.OPENAI_API_KEY;
        }
        if (isAnthropicProvider(provider)) {
            return process.env.ANTHROPIC_API_KEY;
        }
        return undefined;
    }

    private async findLlmRow(args: ResolveLlmArgs): Promise<ExternalIntegration | null> {
        if (args.id != null) {
            return this.integrationRepo.findOne({
                where: {
                    id: args.id,
                    kind: ExternalIntegrationKind.LLM,
                    enabled: true,
                },
            });
        }
        if (args.slug) {
            return this.integrationRepo.findOne({
                where: {
                    slug: args.slug,
                    kind: ExternalIntegrationKind.LLM,
                    enabled: true,
                },
            });
        }
        return this.integrationRepo.findOne({
            where: {
                kind: ExternalIntegrationKind.LLM,
                isDefault: true,
                enabled: true,
            },
        });
    }

    async listLlmIntegrationsForStaff(): Promise<
        Pick<
            ExternalIntegration,
            'id' | 'slug' | 'provider' | 'description' | 'isDefault' | 'enabled'
        >[]
    > {
        return this.integrationRepo.find({
            where: { kind: ExternalIntegrationKind.LLM },
            order: { slug: 'ASC' },
            select: ['id', 'slug', 'provider', 'description', 'isDefault', 'enabled'],
        });
    }

    private resolveSecret(row: ExternalIntegration): string | undefined {
        if (row.authType === 'ENV_VAR' && row.secretRef) {
            return process.env[row.secretRef];
        }
        return undefined;
    }

    /**
     * Env-only: prefers `INSIGHTS_DEFAULT_LLM_PROVIDER` (`anthropic` | `openai`) when both keys exist;
     * otherwise uses whichever key is set.
     */
    fromEnvFallback(): ResolvedLlmIntegration {
        const anthropicKey = process.env.ANTHROPIC_API_KEY;
        const openaiKey = process.env.OPENAI_API_KEY;
        const prefer = (process.env.INSIGHTS_DEFAULT_LLM_PROVIDER || 'anthropic').toLowerCase();

        const timeoutMs = parseInt(process.env.INSIGHTS_LLM_TIMEOUT_MS || '120000', 10);

        if (prefer === 'openai' && openaiKey) {
            return {
                source: 'env',
                provider: ExternalIntegrationProvider.OPENAI,
                apiKey: openaiKey,
                model: process.env.INSIGHTS_OPENAI_MODEL || DEFAULT_OPENAI_MODEL,
                timeoutMs,
            };
        }
        if (anthropicKey) {
            return {
                source: 'env',
                provider: ExternalIntegrationProvider.ANTHROPIC,
                apiKey: anthropicKey,
                model: process.env.INSIGHTS_ANTHROPIC_MODEL || DEFAULT_ANTHROPIC_MODEL,
                timeoutMs,
            };
        }
        if (openaiKey) {
            return {
                source: 'env',
                provider: ExternalIntegrationProvider.OPENAI,
                apiKey: openaiKey,
                model: process.env.INSIGHTS_OPENAI_MODEL || DEFAULT_OPENAI_MODEL,
                timeoutMs,
            };
        }
        throw new NotFoundException(
            'No LLM integration configured: add externalIntegration row or set ANTHROPIC_API_KEY or OPENAI_API_KEY',
        );
    }
}
