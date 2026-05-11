import { HttpException, HttpStatus, Injectable, ServiceUnavailableException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AiUsageEvent } from './ai-usage-event.entity';
import { AiUsageOperation } from '../../enums/external-integration.enum';

@Injectable()
export class AiUsageService {
    constructor(
        @InjectRepository(AiUsageEvent)
        private readonly usageRepo: Repository<AiUsageEvent>,
    ) {}

    /**
     * Haiku-class rough pricing fallback (override via env USD per 1M tokens).
     */
    estimateUsd(inputTokens: number, outputTokens: number): number {
        const inRate = parseFloat(process.env.INSIGHTS_USD_PER_1M_INPUT_TOKENS || '1');
        const outRate = parseFloat(process.env.INSIGHTS_USD_PER_1M_OUTPUT_TOKENS || '5');
        return (inputTokens / 1_000_000) * inRate + (outputTokens / 1_000_000) * outRate;
    }

    async assertWithinBudgets(userId: number): Promise<void> {
        const monthlyMax = process.env.INSIGHTS_MONTHLY_USD_MAX;
        if (monthlyMax != null && monthlyMax !== '') {
            const cap = parseFloat(monthlyMax);
            if (!Number.isNaN(cap) && cap >= 0) {
                const start = AiUsageService.startOfUtcMonth();
                const sum = await this.monthlySpendSum(start);
                if (sum >= cap) {
                    throw new ServiceUnavailableException('AI usage monthly budget exceeded');
                }
            }
        }

        const perDay = process.env.INSIGHTS_PER_USER_PER_DAY;
        if (perDay != null && perDay !== '') {
            const max = parseInt(perDay, 10);
            if (!Number.isNaN(max) && max >= 0) {
                const start = AiUsageService.startOfUtcDay();
                const count = await this.usageRepo
                    .createQueryBuilder('e')
                    .where('e.userId = :userId', { userId })
                    .andWhere('e.createdAt >= :start', { start })
                    .andWhere('e.errorCode IS NULL')
                    .getCount();
                if (count >= max) {
                    throw new HttpException('Daily AI insight quota exceeded', HttpStatus.TOO_MANY_REQUESTS);
                }
            }
        }
    }

    async recordSuccess(params: {
        userId: number;
        externalIntegrationId?: number;
        fixtureId?: number;
        operation: AiUsageOperation;
        inputTokens?: number;
        outputTokens?: number;
        latencyMs: number;
        providerRequestId?: string;
        metadata?: Record<string, unknown>;
    }): Promise<void> {
        const est =
            params.inputTokens != null && params.outputTokens != null
                ? this.estimateUsd(params.inputTokens, params.outputTokens)
                : 0;
        const row = this.usageRepo.create({
            userId: params.userId,
            externalIntegrationId: params.externalIntegrationId,
            fixtureId: params.fixtureId,
            operation: params.operation,
            inputTokens: params.inputTokens,
            outputTokens: params.outputTokens,
            estimatedUsd: est > 0 ? est.toFixed(8) : undefined,
            latencyMs: params.latencyMs,
            providerRequestId: params.providerRequestId,
            metadata: params.metadata,
        });
        await this.usageRepo.save(row);
    }

    async recordFailure(params: {
        userId: number;
        externalIntegrationId?: number;
        fixtureId?: number;
        operation: AiUsageOperation;
        errorCode: string;
        latencyMs: number;
        metadata?: Record<string, unknown>;
    }): Promise<void> {
        const row = this.usageRepo.create({
            userId: params.userId,
            externalIntegrationId: params.externalIntegrationId,
            fixtureId: params.fixtureId,
            operation: params.operation,
            errorCode: params.errorCode,
            latencyMs: params.latencyMs,
            metadata: params.metadata,
        });
        await this.usageRepo.save(row);
    }

    private async monthlySpendSum(since: Date): Promise<number> {
        const rows = await this.usageRepo.query(
            `SELECT COALESCE(SUM("estimatedUsd"::numeric), 0) AS total
             FROM "aiUsageEvent"
             WHERE "createdAt" >= $1 AND "errorCode" IS NULL`,
            [since],
        );
        return parseFloat(String(rows[0]?.total ?? '0')) || 0;
    }

    private static startOfUtcMonth(): Date {
        const d = new Date();
        return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 1, 0, 0, 0, 0));
    }

    private static startOfUtcDay(): Date {
        const d = new Date();
        return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), 0, 0, 0, 0));
    }
}
