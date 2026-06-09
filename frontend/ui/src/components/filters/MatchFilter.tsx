import { Stack, Group, Chip, Grid, TextInput, Select } from '@mantine/core';
import { UseFormReturnType } from '@mantine/form';
import { UiButton, UiCard, UiH3 } from '../ui';

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
    showBadges?: boolean;
    showFormFilters?: boolean;
}

const chipStyles = {
    label: {
        fontWeight: 600,
        borderColor: 'var(--ui-accent)',
    },
};

export function MatchFilter({
    form,
    showLive,
    setShowLive,
    showAvailableTickets,
    setShowAvailableTickets,
    onSubmit,
    showBadges = true,
    showFormFilters = true,
}: MatchFilterProps) {
    const handleSubmit = (values: MatchFilterFormValues) => {
        if (onSubmit) {
            onSubmit(values);
        }
    };

    const handleReset = () => {
        form.reset();
        setShowLive(false);
        setShowAvailableTickets(false);
    };

    return (
        <UiCard density="default">
            <form onSubmit={form.onSubmit(handleSubmit)}>
                <Stack gap="md">
                    <UiH3>Filter matches</UiH3>

                    {showBadges && (
                        <Group gap="sm">
                            <Chip
                                checked={showLive}
                                onChange={setShowLive}
                                variant={showLive ? 'filled' : 'outline'}
                                color="green"
                                styles={{
                                    label: {
                                        ...chipStyles.label,
                                        backgroundColor: showLive ? 'var(--ui-accent)' : 'transparent',
                                        color: showLive ? 'var(--ui-accent-text)' : 'var(--ui-text-primary)',
                                    },
                                }}
                            >
                                Live
                            </Chip>
                            <Chip
                                checked={showAvailableTickets}
                                onChange={setShowAvailableTickets}
                                variant={showAvailableTickets ? 'filled' : 'outline'}
                                color="green"
                                styles={{
                                    label: {
                                        ...chipStyles.label,
                                        backgroundColor: showAvailableTickets ? 'var(--ui-accent)' : 'transparent',
                                        color: showAvailableTickets
                                            ? 'var(--ui-accent-text)'
                                            : 'var(--ui-text-primary)',
                                    },
                                }}
                            >
                                Tickets available
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
                                        data={[
                                            'Premier League',
                                            'Champions League',
                                            'FA Cup',
                                            'LaLiga',
                                            'Bundesliga',
                                            'Serie A',
                                            'Ligue 1',
                                        ]}
                                        clearable
                                        {...form.getInputProps('competition')}
                                    />
                                </Grid.Col>
                                <Grid.Col span={{ base: 12, sm: 6, md: 4 }}>
                                    <TextInput
                                        label="Team"
                                        placeholder="Search by team name"
                                        {...form.getInputProps('team')}
                                    />
                                </Grid.Col>
                                <Grid.Col span={{ base: 12, sm: 6, md: 4 }}>
                                    <TextInput
                                        label="Venue"
                                        placeholder="Search by stadium"
                                        {...form.getInputProps('venue')}
                                    />
                                </Grid.Col>
                            </Grid>

                            <Group justify="flex-end" mt="md">
                                <UiButton variant="outline" onClick={handleReset}>
                                    Reset
                                </UiButton>
                                <UiButton type="submit" variant="primary">
                                    Apply filters
                                </UiButton>
                            </Group>
                        </>
                    )}
                </Stack>
            </form>
        </UiCard>
    );
}
