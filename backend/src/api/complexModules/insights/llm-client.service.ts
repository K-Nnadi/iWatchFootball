import { Injectable, Logger } from '@nestjs/common';
import type { ResolvedLlmIntegration } from './integration-resolver.service';
import { IntegrationProvider } from '../../enums/integration.enum';

export type LlmStreamChunk =
    | { kind: 'text'; text: string }
    | {
          kind: 'usage';
          inputTokens: number;
          outputTokens: number;
      };

/**
 * Streams Anthropic Messages API or OpenAI Chat Completions (SSE) via fetch — no SDK.
 */
@Injectable()
export class LlmClientService {
    private readonly logger = new Logger(LlmClientService.name);

    async *streamFixtureInsight(
        resolved: ResolvedLlmIntegration,
        userPayload: { briefJson: string; question?: string; locale?: string },
    ): AsyncGenerator<LlmStreamChunk> {
        if (resolved.provider === IntegrationProvider.OPENAI || resolved.provider === 'openai') {
            yield* this.streamOpenAiChat(resolved, userPayload);
            return;
        }
        yield* this.streamAnthropicMessages(resolved, userPayload);
    }

    private buildPrompts(userPayload: {
        briefJson: string;
        question?: string;
        locale?: string;
    }): { system: string; userText: string } {
        const system = [
            'You are a football match assistant. Answer ONLY using the JSON facts in the user message.',
            'If information is missing, say you do not have it in the data. Do not invent scores, players, or stats.',
            userPayload.locale ? `Respond in locale/language hint: ${userPayload.locale}.` : '',
        ]
            .filter(Boolean)
            .join('\n');

        const userText = [
            'Fixture data (JSON):',
            userPayload.briefJson,
            userPayload.question ? `\nQuestion: ${userPayload.question}` : '',
        ].join('\n');

        return { system, userText };
    }

    private async *streamAnthropicMessages(
        resolved: ResolvedLlmIntegration,
        userPayload: { briefJson: string; question?: string; locale?: string },
    ): AsyncGenerator<LlmStreamChunk> {
        const { system, userText } = this.buildPrompts(userPayload);
        const base =
            resolved.baseUrl?.replace(/\/$/, '') || 'https://api.anthropic.com';
        const url = `${base}/v1/messages`;

        const ac = new AbortController();
        const timeout = setTimeout(() => ac.abort(), resolved.timeoutMs);
        try {
            const res = await fetch(url, {
                method: 'POST',
                headers: {
                    'x-api-key': resolved.apiKey,
                    'anthropic-version': '2023-06-01',
                    'content-type': 'application/json',
                },
                body: JSON.stringify({
                    model: resolved.model,
                    max_tokens: 2048,
                    stream: true,
                    system,
                    messages: [{ role: 'user', content: userText }],
                }),
                signal: ac.signal,
            });

            if (!res.ok) {
                const errText = await res.text();
                this.logger.warn(`Anthropic HTTP ${res.status}: ${errText.slice(0, 500)}`);
                throw new Error(`Anthropic error ${res.status}`);
            }

            if (!res.body) {
                throw new Error('Empty response body');
            }

            const reader = res.body.getReader();
            const decoder = new TextDecoder();
            let buffer = '';
            let inputTokens = 0;
            let outputTokens = 0;

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                buffer += decoder.decode(value, { stream: true });
                const lines = buffer.split('\n');
                buffer = lines.pop() || '';
                for (const line of lines) {
                    const trimmed = line.trim();
                    if (!trimmed.startsWith('data:')) continue;
                    const data = trimmed.slice(5).trim();
                    if (data === '[DONE]') continue;
                    let ev: Record<string, unknown>;
                    try {
                        ev = JSON.parse(data) as Record<string, unknown>;
                    } catch {
                        continue;
                    }
                    const type = ev.type as string;
                    if (type === 'content_block_delta') {
                        const delta = ev.delta as Record<string, unknown> | undefined;
                        if (delta?.type === 'text_delta' && typeof delta.text === 'string') {
                            yield { kind: 'text', text: delta.text };
                        }
                    }
                    if (type === 'message_delta') {
                        const usage = ev.usage as Record<string, unknown> | undefined;
                        if (usage) {
                            if (typeof usage.input_tokens === 'number') {
                                inputTokens = usage.input_tokens;
                            }
                            if (typeof usage.output_tokens === 'number') {
                                outputTokens = usage.output_tokens;
                            }
                        }
                    }
                    if (type === 'message_start') {
                        const message = ev.message as Record<string, unknown> | undefined;
                        const usage = message?.usage as Record<string, unknown> | undefined;
                        if (usage && typeof usage.input_tokens === 'number') {
                            inputTokens = usage.input_tokens;
                        }
                    }
                }
            }

            yield { kind: 'usage', inputTokens, outputTokens };
        } finally {
            clearTimeout(timeout);
        }
    }

    /** OpenAI Chat Completions streaming (same UX as Anthropic path). */
    private async *streamOpenAiChat(
        resolved: ResolvedLlmIntegration,
        userPayload: { briefJson: string; question?: string; locale?: string },
    ): AsyncGenerator<LlmStreamChunk> {
        const { system, userText } = this.buildPrompts(userPayload);
        const base =
            resolved.baseUrl?.replace(/\/$/, '') || 'https://api.openai.com';
        const url = `${base}/v1/chat/completions`;

        const ac = new AbortController();
        const timeout = setTimeout(() => ac.abort(), resolved.timeoutMs);
        try {
            const res = await fetch(url, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${resolved.apiKey}`,
                    'content-type': 'application/json',
                },
                body: JSON.stringify({
                    model: resolved.model,
                    max_tokens: 2048,
                    stream: true,
                    stream_options: { include_usage: true },
                    messages: [
                        { role: 'system', content: system },
                        { role: 'user', content: userText },
                    ],
                }),
                signal: ac.signal,
            });

            if (!res.ok) {
                const errText = await res.text();
                this.logger.warn(`OpenAI HTTP ${res.status}: ${errText.slice(0, 500)}`);
                throw new Error(`OpenAI error ${res.status}`);
            }

            if (!res.body) {
                throw new Error('Empty response body');
            }

            const reader = res.body.getReader();
            const decoder = new TextDecoder();
            let buffer = '';
            let inputTokens = 0;
            let outputTokens = 0;

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                buffer += decoder.decode(value, { stream: true });
                const lines = buffer.split('\n');
                buffer = lines.pop() || '';
                for (const line of lines) {
                    const trimmed = line.trim();
                    if (!trimmed.startsWith('data:')) continue;
                    const data = trimmed.slice(5).trim();
                    if (data === '[DONE]') continue;
                    let ev: Record<string, unknown>;
                    try {
                        ev = JSON.parse(data) as Record<string, unknown>;
                    } catch {
                        continue;
                    }
                    const choices = ev.choices as Array<Record<string, unknown>> | undefined;
                    const delta = choices?.[0]?.delta as Record<string, unknown> | undefined;
                    if (typeof delta?.content === 'string' && delta.content.length > 0) {
                        yield { kind: 'text', text: delta.content };
                    }
                    const usage = ev.usage as Record<string, unknown> | undefined;
                    if (usage) {
                        if (typeof usage.prompt_tokens === 'number') {
                            inputTokens = usage.prompt_tokens;
                        }
                        if (typeof usage.completion_tokens === 'number') {
                            outputTokens = usage.completion_tokens;
                        }
                    }
                }
            }

            yield { kind: 'usage', inputTokens, outputTokens };
        } finally {
            clearTimeout(timeout);
        }
    }
}
