import { Injectable, Logger } from '@nestjs/common';
import type { FastifyReply } from 'fastify';
import { FixtureBriefBuilder } from './fixture-brief.builder';
import { IntegrationResolverService } from './integration-resolver.service';
import { LlmClientService } from './llm-client.service';
import { AiUsageService } from './ai-usage.service';
import { AiUsageOperation } from '../../enums/integration.enum';

export type StreamInsightBody = {
    integrationSlug?: string;
    integrationId?: number;
    question?: string;
    locale?: string;
};

@Injectable()
export class InsightsService {
    private readonly logger = new Logger(InsightsService.name);

    constructor(
        private readonly briefBuilder: FixtureBriefBuilder,
        private readonly resolver: IntegrationResolverService,
        private readonly llm: LlmClientService,
        private readonly usage: AiUsageService,
    ) {}

    async streamFixtureInsightToSse(params: {
        fixtureId: number;
        userId: number;
        body: StreamInsightBody;
        reply: FastifyReply;
    }): Promise<void> {
        const { fixtureId, userId, body, reply } = params;
        const started = Date.now();

        reply.raw.writeHead(200, {
            'Content-Type': 'text/event-stream; charset=utf-8',
            'Cache-Control': 'no-cache, no-transform',
            Connection: 'keep-alive',
            'X-Accel-Buffering': 'no',
        });

        const send = (obj: Record<string, unknown>) => {
            reply.raw.write(`data: ${JSON.stringify(obj)}\n\n`);
        };

        let resolved;
        try {
            await this.usage.assertWithinBudgets(userId);
            resolved = await this.resolver.resolveLlm({
                slug: body.integrationSlug,
                id: body.integrationId,
            });
        } catch (e) {
            const msg = e instanceof Error ? e.message : String(e);
            send({ type: 'error', message: msg });
            reply.raw.end();
            return;
        }

        let briefJson: string;
        try {
            const brief = await this.briefBuilder.build(fixtureId);
            briefJson = JSON.stringify(brief);
        } catch (e) {
            const msg = e instanceof Error ? e.message : String(e);
            send({ type: 'error', message: msg });
            await this.usage.recordFailure({
                userId,
                integrationId: resolved.integrationId,
                fixtureId,
                operation: AiUsageOperation.FIXTURE_INSIGHT_STREAM,
                errorCode: 'brief_failed',
                latencyMs: Date.now() - started,
                metadata: { message: msg },
            });
            reply.raw.end();
            return;
        }

        let inputTokens = 0;
        let outputTokens = 0;

        try {
            for await (const chunk of this.llm.streamFixtureInsight(resolved, {
                briefJson,
                question: body.question,
                locale: body.locale,
            })) {
                if (chunk.kind === 'text') {
                    send({ type: 'delta', text: chunk.text });
                } else if (chunk.kind === 'usage') {
                    inputTokens = chunk.inputTokens;
                    outputTokens = chunk.outputTokens;
                }
            }

            send({ type: 'done' });
            await this.usage.recordSuccess({
                userId,
                integrationId: resolved.integrationId,
                fixtureId,
                operation: AiUsageOperation.FIXTURE_INSIGHT_STREAM,
                inputTokens,
                outputTokens,
                latencyMs: Date.now() - started,
                metadata: { model: resolved.model },
            });
        } catch (e) {
            this.logger.warn(`Stream error: ${e}`);
            const msg = e instanceof Error ? e.message : String(e);
            send({ type: 'error', message: msg });
            await this.usage.recordFailure({
                userId,
                integrationId: resolved.integrationId,
                fixtureId,
                operation: AiUsageOperation.FIXTURE_INSIGHT_STREAM,
                errorCode: 'llm_error',
                latencyMs: Date.now() - started,
                metadata: { message: msg },
            });
        } finally {
            reply.raw.end();
        }
    }
}
