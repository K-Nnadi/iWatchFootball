import { Box, Paper, Text, Group, SimpleGrid, Stack } from '@mantine/core';

export type TeamFormResult = 'W' | 'D' | 'L';

export interface TeamFormSectionProps {
    homeForm: TeamFormResult[];
    awayForm: TeamFormResult[];
}

export function TeamFormSection({ homeForm, awayForm }: TeamFormSectionProps) {
    return (
        <Paper
            p={{ base: 'md', sm: 'xl' }}
            radius="lg"
            withBorder
            style={{ backgroundColor: 'var(--modern-card-bg)', border: '1px solid var(--modern-border-color)' }}
        >
            <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="lg">
                {/* Home Team Form */}
                <Stack gap="md" align="center">
                    <Group gap={6} justify="center" wrap="nowrap">
                        {homeForm.map((result, i) => (
                            <Box
                                key={i}
                                style={{
                                    width: 'clamp(32px, 6vw, 40px)',
                                    height: 'clamp(32px, 6vw, 40px)',
                                    borderRadius: '50%',
                                    backgroundColor:
                                        result === 'W'
                                            ? '#00ff88'
                                            : result === 'D'
                                                ? '#ffaa00'
                                                : '#ff4444',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    border: '2px solid var(--modern-border-color)',
                                    boxShadow: '0 2px 8px var(--modern-shadow-color)',
                                    transition: 'all 0.2s ease',
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.transform = 'scale(1.1)';
                                    e.currentTarget.style.boxShadow = '0 4px 12px var(--modern-shadow-color)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.transform = 'scale(1)';
                                    e.currentTarget.style.boxShadow = '0 2px 8px var(--modern-shadow-color)';
                                }}
                            >
                                <Text
                                    fw={900}
                                    style={{
                                        color: 'var(--modern-bg-primary)',
                                        fontSize: 'clamp(0.75rem, 2vw, 0.875rem)',
                                        lineHeight: 1,
                                    }}
                                >
                                    {result}
                                </Text>
                            </Box>
                        ))}
                    </Group>
                </Stack>

                {/* Away Team Form */}
                <Stack gap="md" align="center">
                    <Group gap={6} justify="center" wrap="nowrap">
                        {awayForm.map((result, i) => (
                            <Box
                                key={i}
                                style={{
                                    width: 'clamp(32px, 6vw, 40px)',
                                    height: 'clamp(32px, 6vw, 40px)',
                                    borderRadius: '50%',
                                    backgroundColor:
                                        result === 'W'
                                            ? '#00ff88'
                                            : result === 'D'
                                                ? '#ffaa00'
                                                : '#ff4444',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    border: '2px solid var(--modern-border-color)',
                                    boxShadow: '0 2px 8px var(--modern-shadow-color)',
                                    transition: 'all 0.2s ease',
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.transform = 'scale(1.1)';
                                    e.currentTarget.style.boxShadow = '0 4px 12px var(--modern-shadow-color)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.transform = 'scale(1)';
                                    e.currentTarget.style.boxShadow = '0 2px 8px var(--modern-shadow-color)';
                                }}
                            >
                                <Text
                                    fw={900}
                                    style={{
                                        color: 'var(--modern-bg-primary)',
                                        fontSize: 'clamp(0.75rem, 2vw, 0.875rem)',
                                        lineHeight: 1,
                                    }}
                                >
                                    {result}
                                </Text>
                            </Box>
                        ))}
                    </Group>
                </Stack>
            </SimpleGrid>
        </Paper>
    );
}

