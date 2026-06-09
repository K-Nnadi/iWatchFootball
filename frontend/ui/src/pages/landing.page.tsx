import React, { useMemo } from 'react';
import { Group, Image, rem, Stack } from '@mantine/core';
import { usePageTransition } from '../hooks/usePageTransition';
import { usePlatformFeaturesStore } from '../shared/stores/platformFeatures.store';
import { useTranslation } from '../i18n/useTranslation';
import { UiBody, UiButton, UiCard, UiH1, UiH2, UiH3, UiPageContainer } from '../components/ui';

export function LandingPage() {
    const { t } = useTranslation();
    const { navigateWithTransition } = usePageTransition();
    const { marketplaceEnabled } = usePlatformFeaturesStore();

    const pillars = useMemo(
        () => [
            {
                title: t('landing.pillarHistoryTitle'),
                body: t('landing.pillarHistoryBody'),
            },
            {
                title: t('landing.pillarInsightsTitle'),
                body: t('landing.pillarInsightsBody'),
            },
            marketplaceEnabled
                ? {
                      title: t('landing.pillarTicketsTitle'),
                      body: t('landing.pillarTicketsBody'),
                  }
                : {
                      title: t('landing.pillarAttendanceTitle'),
                      body: t('landing.pillarAttendanceBody'),
                  },
        ],
        [t, marketplaceEnabled],
    );

    return (
        <UiPageContainer>
            <UiCard density="spacious" mb="xl">
                <Group justify="space-between" align="center" wrap="wrap" gap="xl">
                    <Stack gap="md" style={{ flex: '1 1 280px', maxWidth: rem(520) }}>
                        <UiH1>{t('landing.heroTitle')}</UiH1>
                        <UiBody>{t('landing.heroBody')}</UiBody>
                        <div>
                            <UiButton onClick={() => navigateWithTransition('/home')}>
                                {t('landing.exploreApp')}
                            </UiButton>
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
                <UiH2 style={{ marginBottom: rem(12) }}>{t('landing.whyWeBuilt')}</UiH2>
                <Stack gap="md">
                    <UiBody>{t('landing.whyWeBuiltBody')}</UiBody>
                    <UiCard density="compact" style={{ borderLeft: '3px solid var(--ui-accent)' }}>
                        <UiBody style={{ fontStyle: 'italic' }}>{t('landing.founderQuote')}</UiBody>
                        <UiBody style={{ marginTop: rem(8), fontSize: rem(13) }}>
                            {t('landing.founderAttribution')}
                        </UiBody>
                    </UiCard>
                </Stack>
            </UiCard>

            <UiCard density="spacious" style={{ textAlign: 'center' }}>
                <UiH2 style={{ marginBottom: rem(12) }}>{t('landing.startHistory')}</UiH2>
                <UiBody style={{ marginBottom: rem(16) }}>
                    {marketplaceEnabled
                        ? t('landing.startHistoryBodyMarketplace')
                        : t('landing.startHistoryBody')}
                </UiBody>
                <Group justify="center" gap="sm">
                    <UiButton variant="primary" onClick={() => navigateWithTransition('/join')}>
                        {t('nav.join')}
                    </UiButton>
                    <UiButton variant="outline" onClick={() => navigateWithTransition('/signIn')}>
                        {t('nav.signIn')}
                    </UiButton>
                </Group>
            </UiCard>
        </UiPageContainer>
    );
}
