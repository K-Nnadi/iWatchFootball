import React from 'react';
import { Group, Image, rem, Stack } from '@mantine/core';
import { usePageTransition } from '../hooks/usePageTransition';
import { usePlatformFeaturesStore } from '../shared/stores/platformFeatures.store';
import { UiBody, UiButton, UiCard, UiH1, UiH2, UiH3, UiPageContainer } from '../components/ui';

export function LandingPage() {
    const { navigateWithTransition } = usePageTransition();
    const { marketplaceEnabled } = usePlatformFeaturesStore();

    const pillars = [
        {
            title: 'A verified match history',
            body: "Build a record of the matches you've attended—grounded in real attendance—automatically enriched with context so it becomes more than a list of fixtures.",
        },
        {
            title: 'Insights from your journey',
            body: "Discover stats tied to your stands: which player you've seen score the most, the club you've watched most often, or which stadium has hosted the most goals in your history.",
        },
        ...(marketplaceEnabled
            ? [{
                title: 'Tickets that feed your story',
                body: 'Our ticket marketplace connects getting in the door with your match history—turning one-off transactions into long-term engagement with your own data.',
            }]
            : [{
                title: 'Your attendance, connected',
                body: 'Log the matches you attend and build a personal record that grows richer over time—grounded in real attendance, not generic stats.',
            }]),
    ];

    return (
        <UiPageContainer>
            <UiCard density="spacious" mb="xl">
                <Group justify="space-between" align="center" wrap="wrap" gap="xl">
                    <Stack gap="md" style={{ flex: '1 1 280px', maxWidth: rem(520) }}>
                        <UiH1>For fans who go to matches—not only from the sofa</UiH1>
                        <UiBody>
                            I Watch Football is for supporters who actually attend games. Ticketing sites help you buy a seat;
                            stats apps show generic match data—none of them build your personal football history.
                        </UiBody>
                        <div>
                            <UiButton onClick={() => navigateWithTransition('/home')}>Explore the app</UiButton>
                        </div>
                    </Stack>
                    <Image
                        src="https://images.unsplash.com/photo-1618247674062-3bf7d57ea5b5?auto=format&w=700&q=80"
                        alt="Football fans in stadium"
                        radius="md"
                        fit="cover"
                        w={300}
                        h={200}
                        style={{ flexShrink: 0 }}
                    />
                </Group>
            </UiCard>

            <Group justify="center" gap="lg" align="stretch" mb="xl">
                {pillars.map((pillar) => (
                    <UiCard key={pillar.title} density="default" style={{ maxWidth: rem(300), flex: '1 1 240px' }}>
                        <UiH3 style={{ marginBottom: rem(8) }}>{pillar.title}</UiH3>
                        <UiBody>{pillar.body}</UiBody>
                    </UiCard>
                ))}
            </Group>

            <UiCard density="spacious" mb="xl">
                <UiH2 style={{ marginBottom: rem(12) }}>Why we built this</UiH2>
                <Stack gap="md">
                    <UiBody>
                        The idea came from travelling across Europe with family to watch football—loving the ritual of
                        being there, but missing a product that answered one simple question: across every match
                        I&apos;ve attended, what&apos;s my football story?
                    </UiBody>
                    <UiCard density="compact" style={{ borderLeft: '3px solid var(--ui-accent)' }}>
                        <UiBody style={{ fontStyle: 'italic' }}>
                            &ldquo;I&apos;m naturally data-driven; nothing out there connected tickets, attendance, and personal
                            narratives in one place. I Watch Football is our answer.&rdquo;
                        </UiBody>
                        <UiBody style={{ marginTop: rem(8), fontSize: rem(13) }}>— founder</UiBody>
                    </UiCard>
                </Stack>
            </UiCard>

            <UiCard density="spacious" style={{ textAlign: 'center' }}>
                <UiH2 style={{ marginBottom: rem(12) }}>Start your history</UiH2>
                <UiBody style={{ marginBottom: rem(16) }}>
                    Create an account to log matches and explore your stats
                    {marketplaceEnabled ? ', and find tickets for your next game in the stands' : ''}.
                </UiBody>
                <Group justify="center" gap="sm">
                    <UiButton variant="primary" onClick={() => navigateWithTransition('/join')}>
                        Join
                    </UiButton>
                    <UiButton variant="outline" onClick={() => navigateWithTransition('/signIn')}>
                        Sign In
                    </UiButton>
                </Group>
            </UiCard>
        </UiPageContainer>
    );
}
