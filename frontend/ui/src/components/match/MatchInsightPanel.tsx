import { useCallback, useEffect, useRef, useState } from 'react';
import {
    Accordion,
    Alert,
    Box,
    Button,
    Group,
    Loader,
    Select,
    Stack,
    Text,
    Textarea,
} from '@mantine/core';
import { useAuthStore } from '../../shared/stores/auth.store';
import { UserType } from '@iWatchFootball/clients/controllers/iWatchFootballAPI.schemas';

type LlmOption = { id: number; slug: string; description?: string | null; isDefault: boolean };

function getApiBase(): string {
    return import.meta.env.VITE_API_URL || 'http://localhost:8080';
}

async function fetchLlmList(): Promise<LlmOption[]> {
    const base = getApiBase().replace(/\/$/, '');
    const token = localStorage.getItem('authToken');
    const res = await fetch(`${base}/insights/integrations/llm`, {
        headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
    });
    if (!res.ok) {
        throw new Error(`LLM list ${res.status}`);
    }
    return res.json() as Promise<LlmOption[]>;
}

/**
 * POST stream SSE; invokes onDelta for text chunks, resolves on done or throws on error event.
 */
async function streamFixtureInsight(
    fixtureId: number,
    opts: {
        integrationSlug?: string;
        integrationId?: number;
        question?: string;
        locale?: string;
    },
    onDelta: (t: string) => void,
    signal?: AbortSignal,
): Promise<void> {
    const base = getApiBase().replace(/\/$/, '');
    const token = localStorage.getItem('authToken');
    const res = await fetch(`${base}/insights/fixtures/${fixtureId}/stream`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(opts),
        signal,
    });

    if (!res.ok) {
        const msg = await res.text();
        throw new Error(msg || `HTTP ${res.status}`);
    }

    const reader = res.body?.getReader();
    if (!reader) throw new Error('No response body');

    const decoder = new TextDecoder();
    let buf = '';

    while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buf += decoder.decode(value, { stream: true });
        const parts = buf.split('\n\n');
        buf = parts.pop() || '';
        for (const block of parts) {
            for (const line of block.split('\n')) {
                const t = line.trim();
                if (!t.startsWith('data:')) continue;
                const json = t.slice(5).trim();
                let ev: { type?: string; text?: string; message?: string };
                try {
                    ev = JSON.parse(json) as { type?: string; text?: string; message?: string };
                } catch {
                    continue;
                }
                if (ev.type === 'delta' && typeof ev.text === 'string') {
                    onDelta(ev.text);
                }
                if (ev.type === 'error') {
                    throw new Error(ev.message || 'Stream error');
                }
            }
        }
    }
}

export type MatchInsightPanelProps = {
    fixtureId: number;
};

export function MatchInsightPanel({ fixtureId }: MatchInsightPanelProps) {
    const user = useAuthStore((s) => s.user);
    const isStaff =
        user?.type === UserType.ADMIN || user?.type === UserType.MODERATOR;

    const [llmOptions, setLlmOptions] = useState<LlmOption[]>([]);
    const [selectedSlug, setSelectedSlug] = useState<string | null>(null);
    const [question, setQuestion] = useState('');
    const [output, setOutput] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const abortRef = useRef<AbortController | null>(null);

    useEffect(() => {
        if (!isStaff) return;
        let cancelled = false;
        fetchLlmList()
            .then((rows) => {
                if (!cancelled) {
                    setLlmOptions(rows);
                    const def = rows.find((r) => r.isDefault);
                    if (def) setSelectedSlug(def.slug);
                }
            })
            .catch(() => {
                if (!cancelled) setLlmOptions([]);
            });
        return () => {
            cancelled = true;
        };
    }, [isStaff]);

    const runStream = useCallback(async () => {
        abortRef.current?.abort();
        abortRef.current = new AbortController();
        setError(null);
        setOutput('');
        setLoading(true);
        try {
            await streamFixtureInsight(
                fixtureId,
                {
                    ...(selectedSlug ? { integrationSlug: selectedSlug } : {}),
                    question: question.trim() || undefined,
                },
                (t) => setOutput((prev) => prev + t),
                abortRef.current.signal,
            );
        } catch (e) {
            setError(e instanceof Error ? e.message : String(e));
        } finally {
            setLoading(false);
        }
    }, [fixtureId, selectedSlug, question, llmOptions]);

    const onAccordionChange = (value: string | null) => {
        if (value === 'ai-insight') {
            void runStream();
        }
    };

    if (!isStaff) {
        return null;
    }

    const selectData = llmOptions.map((o) => ({
        value: o.slug,
        label: `${o.slug}${o.isDefault ? ' (default)' : ''}`,
    }));

    return (
        <Accordion variant="separated" radius="md" onChange={onAccordionChange}>
            <Accordion.Item value="ai-insight">
                <Accordion.Control>
                    <Text fw={600}>AI match insight</Text>
                    <Text size="sm" c="dimmed">
                        Staff only. Grounded on fixture data from the database. Answers may be incomplete if data is missing.
                    </Text>
                </Accordion.Control>
                <Accordion.Panel>
                    <Stack gap="md">
                        <Group justify="flex-end">
                            <Button
                                variant="light"
                                size="xs"
                                loading={loading}
                                onClick={() => void runStream()}
                            >
                                Regenerate
                            </Button>
                        </Group>
                        <Alert color="yellow" title="Experimental">
                            This uses an external LLM. Verifies facts against the JSON brief only when the model follows
                            instructions. Do not rely on it for betting or compliance.
                        </Alert>
                        {selectData.length > 0 && (
                            <Select
                                label="LLM integration"
                                description="From integration rows (or env default if list is empty)"
                                data={selectData}
                                value={selectedSlug}
                                onChange={setSelectedSlug}
                                clearable
                            />
                        )}
                        <Textarea
                            label="Optional question"
                            placeholder="e.g. Who is likely starting in midfield?"
                            minRows={2}
                            value={question}
                            onChange={(e) => setQuestion(e.currentTarget.value)}
                        />
                        {loading && (
                            <Box>
                                <Loader size="sm" />
                            </Box>
                        )}
                        {error && (
                            <Alert color="red" title="Error">
                                {error}
                            </Alert>
                        )}
                        {output && (
                            <Text style={{ whiteSpace: 'pre-wrap' }} size="sm">
                                {output}
                            </Text>
                        )}
                    </Stack>
                </Accordion.Panel>
            </Accordion.Item>
        </Accordion>
    );
}
