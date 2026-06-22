import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Badge, Box, Center, Group, Loader, SimpleGrid, Stack, Text, ThemeIcon } from '@mantine/core';
import { showNotification } from '@mantine/notifications';
import {
    IconAdOff,
    IconChartBar,
    IconCheck,
    IconCrown,
    IconHistory,
    IconUsers,
} from '@tabler/icons-react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
    UiBody,
    UiButton,
    UiCaption,
    UiCard,
    UiH2,
    UiPageContainer,
} from '../components/ui';
import { useTranslation } from '../i18n';
import { usePlatformFeaturesStore } from '../shared/stores/platformFeatures.store';
import {
    createPremiumCheckout,
    extractApiErrorMessage,
    getSubscriptionEntitlements,
    openSubscriptionPortal,
} from '../shared/api/tracker.api';

function formatRenewalDate(iso?: string): string | null {
    if (!iso) return null;
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) return null;
    return date.toLocaleDateString(undefined, {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    });
}

export function PremiumPage() {
    const { t } = useTranslation();
    const { attendanceAdvancedStatsEnabled } = usePlatformFeaturesStore();
    const queryClient = useQueryClient();
    const [searchParams, setSearchParams] = useSearchParams();
    const [actionLoading, setActionLoading] = useState(false);

    const { data: entitlements, isLoading } = useQuery({
        queryKey: ['subscription-entitlements'],
        queryFn: getSubscriptionEntitlements,
        staleTime: 60_000,
    });

    useEffect(() => {
        if (searchParams.get('subscribed') !== '1') return;

        showNotification({
            title: t('premium.subscribedSuccessTitle'),
            message: t('premium.subscribedSuccessMessage'),
            color: 'teal',
        });
        void queryClient.invalidateQueries({ queryKey: ['subscription-entitlements'] });
        searchParams.delete('subscribed');
        setSearchParams(searchParams, { replace: true });
    }, [queryClient, searchParams, setSearchParams, t]);

    const features = useMemo(
        () =>
            [
                { icon: IconAdOff, label: t('premium.featureAdFree') },
                { icon: IconHistory, label: t('premium.featureManualLogs') },
                { icon: IconChartBar, label: t('premium.featureFullHistory') },
                attendanceAdvancedStatsEnabled
                    ? { icon: IconUsers, label: t('premium.featureCompare') }
                    : null,
            ].filter(Boolean) as { icon: typeof IconAdOff; label: string }[],
        [attendanceAdvancedStatsEnabled, t],
    );

    const renewalLabel = formatRenewalDate(entitlements?.currentPeriodEnd);
    const checkoutBlocked =
        entitlements?.checkoutAvailable === false
            ? entitlements.checkoutUnavailableReason ?? t('premium.checkoutUnavailable')
            : null;

    const handleUpgrade = async () => {
        setActionLoading(true);
        try {
            const origin = window.location.origin;
            const { url } = await createPremiumCheckout(
                `${origin}/premium?subscribed=1`,
                `${origin}/premium`,
            );
            window.location.href = url;
        } catch (e) {
            showNotification({
                title: t('logs.upgradeUnavailable'),
                message: extractApiErrorMessage(e),
                color: 'red',
            });
        } finally {
            setActionLoading(false);
        }
    };

    const handleManageSubscription = async () => {
        setActionLoading(true);
        try {
            const { url } = await openSubscriptionPortal(`${window.location.origin}/premium`);
            window.location.href = url;
        } catch {
            showNotification({
                title: t('logs.billingUnavailable'),
                message: t('logs.billingUnavailableMessage'),
                color: 'orange',
            });
        } finally {
            setActionLoading(false);
        }
    };

    if (isLoading) {
        return (
            <UiPageContainer py="xl">
                <Center py="xl">
                    <Loader />
                </Center>
            </UiPageContainer>
        );
    }

    const isPremium = entitlements?.isPremium ?? false;

    return (
        <UiPageContainer py="xl" size="md">
            <Stack gap="xl">
                <Stack gap="xs" align="center" ta="center">
                    <ThemeIcon size={56} radius="xl" variant="light" color="lime">
                        <IconCrown size={28} />
                    </ThemeIcon>
                    <UiH2>{t('premium.title')}</UiH2>
                    <Box maw={520}>
                        <UiBody>{t('premium.subtitle')}</UiBody>
                    </Box>
                </Stack>

                {isPremium ? (
                    <UiCard accent>
                        <Stack gap="md" align="center" ta="center">
                            <Badge size="lg" variant="light" color="lime">
                                {t('premium.activeBadge')}
                            </Badge>
                            <UiBody>{t('premium.activeBody')}</UiBody>
                            {renewalLabel && (
                                <UiCaption>
                                    {entitlements?.cancelAtPeriodEnd
                                        ? t('premium.accessUntil', { date: renewalLabel })
                                        : t('premium.renewsOn', { date: renewalLabel })}
                                </UiCaption>
                            )}
                            <UiButton
                                variant="ghost"
                                loading={actionLoading}
                                onClick={() => void handleManageSubscription()}
                            >
                                {t('logs.manageSubscription')}
                            </UiButton>
                        </Stack>
                    </UiCard>
                ) : (
                    <Stack gap="lg">
                        <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
                            {features.map(({ icon: Icon, label }) => (
                                <UiCard key={label} density="compact">
                                    <Group wrap="nowrap" align="flex-start" gap="sm">
                                        <ThemeIcon size={36} radius="md" variant="light" color="lime">
                                            <Icon size={18} />
                                        </ThemeIcon>
                                        <Group gap="xs" wrap="nowrap" align="flex-start">
                                            <IconCheck size={16} color="var(--ui-accent)" style={{ flexShrink: 0, marginTop: 2 }} />
                                            <UiBody style={{ margin: 0 }}>{label}</UiBody>
                                        </Group>
                                    </Group>
                                </UiCard>
                            ))}
                        </SimpleGrid>

                        {checkoutBlocked && (
                            <Text size="sm" ta="center" c="orange">
                                {checkoutBlocked}
                            </Text>
                        )}

                        <Center>
                            <UiButton
                                size="lg"
                                loading={actionLoading}
                                disabled={!!checkoutBlocked}
                                onClick={() => void handleUpgrade()}
                            >
                                {t('logs.upgradePremium')}
                            </UiButton>
                        </Center>
                    </Stack>
                )}
            </Stack>
        </UiPageContainer>
    );
}
