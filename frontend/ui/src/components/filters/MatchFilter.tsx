import { Box, Paper, Stack, Group, Chip, Grid, TextInput, Select } from '@mantine/core';
import { UseFormReturnType } from '@mantine/form';
import { ModernH3, ModernButton } from '../modern';

interface MatchFilterFormValues {
    competition: string;
    team: string;
    venue: string;
}

interface MatchFilterProps {
    form: UseFormReturnType<MatchFilterFormValues>;
    showLive: boolean;
    setShowLive: (checked: boolean) => void;
    showAvailableTickets: boolean;
    setShowAvailableTickets: (checked: boolean) => void;
    onSubmit?: (values: MatchFilterFormValues) => void;
    showBadges?: boolean; // Show LIVE and Available Tickets badges
    showFormFilters?: boolean; // Show Competition/Team/Venue inputs and Apply button
}

export function MatchFilter({
    form,
    showLive,
    setShowLive,
    showAvailableTickets,
    setShowAvailableTickets,
    onSubmit,
    showBadges = true,
    showFormFilters = true
}: MatchFilterProps) {
    const handleSubmit = (values: MatchFilterFormValues) => {
        if (onSubmit) {
            onSubmit(values);
        } else {
            console.log('Form submitted:', values);
        }
    };

    const handleReset = () => {
        form.reset();
        setShowLive(false);
        setShowAvailableTickets(false);
    };

    return (
        <Box 
            mb="xl"
            style={{
                marginBottom: '2rem'
            }}
        >
            <Paper 
                p="xl" 
                style={{ 
                    backgroundColor: 'var(--modern-card-bg)', 
                    border: '1px solid var(--modern-border-color)',
                    borderRadius: '8px',
                    boxShadow: '0 2px 4px var(--modern-shadow-color)'
                }}
            >
                <form onSubmit={form.onSubmit(handleSubmit)}>
                    <Stack gap="md">
                        <ModernH3 style={{ 
                            color: 'var(--modern-text-primary)', 
                            marginBottom: '0.5rem',
                            fontSize: '1.25rem'
                        }}>
                            Filter Matches
                        </ModernH3>
                        
                        {showBadges && (
                            <Group gap="md">
                                <Chip
                                    checked={showLive}
                                    onChange={setShowLive}
                                    variant={showLive ? 'filled' : 'outline'}
                                    styles={{
                                        label: {
                                            backgroundColor: showLive ? 'var(--modern-lime)' : 'transparent',
                                            color: showLive ? 'var(--modern-bg-primary)' : 'var(--modern-text-primary)',
                                            borderColor: 'var(--modern-lime)',
                                            fontWeight: 600,
                                        }
                                    }}
                                >
                                    LIVE
                                </Chip>
                                <Chip
                                    checked={showAvailableTickets}
                                    onChange={setShowAvailableTickets}
                                    variant={showAvailableTickets ? 'filled' : 'outline'}
                                    styles={{
                                        label: {
                                            backgroundColor: showAvailableTickets ? 'var(--modern-lime)' : 'transparent',
                                            color: showAvailableTickets ? 'var(--modern-bg-primary)' : 'var(--modern-text-primary)',
                                            borderColor: 'var(--modern-lime)',
                                            fontWeight: 600,
                                        }
                                    }}
                                >
                                    Available Tickets
                                </Chip>
                            </Group>
                        )}

                        {showFormFilters && (
                            <>
                                <Grid gutter="md">
                                    <Grid.Col span={{ base: 12, sm: 6, md: 4 }}>
                                        <Select
                                            label="Competition"
                                            placeholder="Select competition"
                                            data={['Premier League', 'Champions League', 'FA Cup', 'LaLiga', 'Bundesliga', 'Serie A', 'Ligue 1']}
                                            clearable
                                            {...form.getInputProps('competition')}
                                            styles={{
                                                label: {
                                                    color: 'var(--modern-text-primary)',
                                                    fontWeight: 600,
                                                    marginBottom: 8,
                                                    fontSize: '0.875rem',
                                                },
                                                input: {
                                                    backgroundColor: 'var(--modern-bg-secondary)',
                                                    borderColor: 'var(--modern-border-color)',
                                                    color: 'var(--modern-text-primary)',
                                                    '&:focus': {
                                                        borderColor: 'var(--modern-lime)',
                                                    },
                                                },
                                            }}
                                        />
                                    </Grid.Col>
                                    <Grid.Col span={{ base: 12, sm: 6, md: 4 }}>
                                        <TextInput
                                            label="Team"
                                            placeholder="Search by team name"
                                            {...form.getInputProps('team')}
                                            styles={{
                                                label: {
                                                    color: 'var(--modern-text-primary)',
                                                    fontWeight: 600,
                                                    marginBottom: 8,
                                                    fontSize: '0.875rem',
                                                },
                                                input: {
                                                    backgroundColor: 'var(--modern-bg-secondary)',
                                                    borderColor: 'var(--modern-border-color)',
                                                    color: 'var(--modern-text-primary)',
                                                    '&:focus': {
                                                        borderColor: 'var(--modern-lime)',
                                                    },
                                                },
                                            }}
                                        />
                                    </Grid.Col>
                                    <Grid.Col span={{ base: 12, sm: 6, md: 4 }}>
                                        <TextInput
                                            label="Venue"
                                            placeholder="Search by stadium"
                                            {...form.getInputProps('venue')}
                                            styles={{
                                                label: {
                                                    color: 'var(--modern-text-primary)',
                                                    fontWeight: 600,
                                                    marginBottom: 8,
                                                    fontSize: '0.875rem',
                                                },
                                                input: {
                                                    backgroundColor: 'var(--modern-bg-secondary)',
                                                    borderColor: 'var(--modern-border-color)',
                                                    color: 'var(--modern-text-primary)',
                                                    '&:focus': {
                                                        borderColor: 'var(--modern-lime)',
                                                    },
                                                },
                                            }}
                                        />
                                    </Grid.Col>
                                </Grid>

                                <Group justify="flex-end" mt="md">
                                    <ModernButton
                                        variant="outline"
                                        onClick={handleReset}
                                    >
                                        Reset
                                    </ModernButton>
                                    <ModernButton
                                        type="submit"
                                        variant="primary"
                                    >
                                        Apply Filters
                                    </ModernButton>
                                </Group>
                            </>
                        )}
                    </Stack>
                </form>
            </Paper>
        </Box>
    );
}

