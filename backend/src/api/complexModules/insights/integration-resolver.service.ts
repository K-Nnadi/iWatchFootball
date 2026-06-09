import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { IntegrationService } from '../../modules/integration/integration.service';
import { Integration } from '../../modules/integration/integration.entity';
import {
    IntegrationKind,
    IntegrationProvider,
} from '../../enums/integration.enum';

export type ResolveLlmArgs = {
    slug?: string;
    id?: number;
};

export type ResolvedLlmIntegration = {
    source: 'db' | 'env';
    integrationId?: number;
    provider: IntegrationProvider | string;
    apiKey: string;
    model: string;
    baseUrl?: string;
    timeoutMs: number;
};

const DEFAULT_ANTHROPIC_MODEL = 'claude-3-5-haiku-20241022';
const DEFAULT_OPENAI_MODEL = 'gpt-4o-mini';

function isOpenAiProvider(p: string): boolean {
    return p === IntegrationProvider.OPENAI || p === 'openai';
}

function isAnthropicProvider(p: string): boolean {
    return p === IntegrationProvider.ANTHROPIC || p === 'anthropic';
}

@Injectable()
export class IntegrationResolverService {
    private readonly logger = new Logger(IntegrationResolverService.name);

    constructor(private readonly integrationService: IntegrationService) {}

    async resolveLlm(args: ResolveLlmArgs): Promise<ResolvedLlmIntegration> {
        const row = await this.findLlmRow(args);
        if ((args.slug || args.id != null) && !row) {
            throw new NotFoundException('LLM integration not found or disabled');
        }
        if (!row) {
            return this.fromEnvFallback();
        }

        const apiKey = this.integrationService.resolveSecret(row);
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

    private fromRowWithKey(row: Integration, apiKey: string): ResolvedLlmIntegration {
        if (!isAnthropicProvider(row.provider) && !isOpenAiProvider(row.provider)) {
            this.logger.warn(
                `Provider ${row.provider} not supported; use anthropic or openai. Falling back to OpenAI-compatible URL only if baseUrl is set.`,
            );
        }

        const config = row.config ?? {};
        const timeoutMs =
            this.integrationService.getConfigNumber(config, 'timeoutMs') ??
            parseInt(process.env.INSIGHTS_LLM_TIMEOUT_MS || '120000', 10);

        const baseUrl = this.integrationService.getConfigString(config, 'baseUrl');

        return {
            source: 'db',
            integrationId: row.id,
            provider: row.provider,
            apiKey,
            model: this.resolveModelForRow(row),
            baseUrl,
            timeoutMs,
        };
    }

    private resolveModelForRow(row: Integration): string {
        const config = row.config ?? {};
        const modelFromConfig =
            this.integrationService.getConfigString(config, 'model') ??
            this.integrationService.getConfigString(config, 'modelId');

        if (isOpenAiProvider(row.provider)) {
            return process.env.INSIGHTS_OPENAI_MODEL || modelFromConfig || DEFAULT_OPENAI_MODEL;
        }
        return process.env.INSIGHTS_ANTHROPIC_MODEL || modelFromConfig || DEFAULT_ANTHROPIC_MODEL;
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

    private async findLlmRow(args: ResolveLlmArgs): Promise<Integration | null> {
        if (args.id != null) {
            return this.integrationService.findById(args.id, IntegrationKind.LLM);
        }
        if (args.slug) {
            return this.integrationService.findBySlug(args.slug, IntegrationKind.LLM);
        }
        return this.integrationService.findDefault(IntegrationKind.LLM);
    }

    async listLlmIntegrationsForStaff(): Promise<
        Pick<Integration, 'id' | 'slug' | 'provider' | 'description' | 'isDefault' | 'enabled'>[]
    > {
        const rows = await this.integrationService.listByKind(IntegrationKind.LLM);
        return rows.map(({ id, slug, provider, description, isDefault, enabled }) => ({
            id,
            slug,
            provider,
            description,
            isDefault,
            enabled,
        }));
    }

    fromEnvFallback(): ResolvedLlmIntegration {
        const anthropicKey = process.env.ANTHROPIC_API_KEY;
        const openaiKey = process.env.OPENAI_API_KEY;
        const prefer = (process.env.INSIGHTS_DEFAULT_LLM_PROVIDER || 'anthropic').toLowerCase();
        const timeoutMs = parseInt(process.env.INSIGHTS_LLM_TIMEOUT_MS || '120000', 10);

        if (prefer === 'openai' && openaiKey) {
            return {
                source: 'env',
                provider: IntegrationProvider.OPENAI,
                apiKey: openaiKey,
                model: process.env.INSIGHTS_OPENAI_MODEL || DEFAULT_OPENAI_MODEL,
                timeoutMs,
            };
        }
        if (anthropicKey) {
            return {
                source: 'env',
                provider: IntegrationProvider.ANTHROPIC,
                apiKey: anthropicKey,
                model: process.env.INSIGHTS_ANTHROPIC_MODEL || DEFAULT_ANTHROPIC_MODEL,
                timeoutMs,
            };
        }
        if (openaiKey) {
            return {
                source: 'env',
                provider: IntegrationProvider.OPENAI,
                apiKey: openaiKey,
                model: process.env.INSIGHTS_OPENAI_MODEL || DEFAULT_OPENAI_MODEL,
                timeoutMs,
            };
        }
        throw new NotFoundException(
            'No LLM integration configured: add integration row (kind LLM) or set ANTHROPIC_API_KEY / OPENAI_API_KEY',
        );
    }
}
