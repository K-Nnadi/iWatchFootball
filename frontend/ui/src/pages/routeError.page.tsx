import { useState } from 'react';
import { Box, Group, Stack } from '@mantine/core';
import { IconAlertTriangle, IconHome, IconRefresh } from '@tabler/icons-react';
import { isRouteErrorResponse, useNavigate, useRouteError } from 'react-router-dom';
import { UiBody, UiButton, UiCaption, UiCard, UiH1, UiPageContainer } from '../components/ui';
import { useTranslation } from '../i18n';
import { useAuthStore } from '../shared/stores/auth.store';

function errorCopy(error: unknown): { message: string; stack?: string } {
    if (isRouteErrorResponse(error)) {
        const data = typeof error.data === 'string' ? error.data : '';
        return {
            message: data
                ? `${error.status} ${error.statusText}: ${data}`
                : `${error.status} ${error.statusText}`.trim(),
        };
    }
    if (error instanceof Error) {
        return { message: error.message, stack: error.stack };
    }
    return { message: String(error) };
}

function RouteErrorContent() {
    const error = useRouteError();
    const navigate = useNavigate();
    const { t } = useTranslation();
    const isLoggedIn = useAuthStore((s) => s.isLoggedIn);
    const [detailsOpen, setDetailsOpen] = useState(true);
    const { message, stack } = errorCopy(error);
    const showDetails = import.meta.env.DEV && Boolean(message);

    const goHome = () => {
        void navigate(isLoggedIn ? '/home' : '/', { replace: true });
    };

    return (
        <UiPageContainer size="sm" py="xl">
            <Stack gap="lg" align="center" ta="center">
                <Box
                    style={{
                        width: 72,
                        height: 72,
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: 'var(--ui-accent-muted)',
                        border: '1px solid rgba(0, 200, 83, 0.28)',
                    }}
                >
                    <IconAlertTriangle size={32} color="var(--ui-accent)" />
                </Box>

                <Stack gap="xs">
                    <UiH1>{t('routeError.title')}</UiH1>
                    <UiBody style={{ maxWidth: 440, margin: '0 auto' }}>
                        {t('routeError.body')}
                    </UiBody>
                </Stack>

                <Group justify="center" gap="sm">
                    <UiButton
                        variant="primary"
                        leftSection={<IconRefresh size={18} />}
                        onClick={() => window.location.reload()}
                    >
                        {t('routeError.tryAgain')}
                    </UiButton>
                    <UiButton
                        variant="secondary"
                        leftSection={<IconHome size={18} />}
                        onClick={goHome}
                    >
                        {t('routeError.goHome')}
                    </UiButton>
                </Group>

                {showDetails ? (
                    <UiCard density="default" style={{ width: '100%', textAlign: 'left' }}>
                        <Stack gap="sm">
                            <UiButton
                                variant="ghost"
                                size="compact-sm"
                                onClick={() => setDetailsOpen((open) => !open)}
                                style={{ alignSelf: 'flex-start', paddingLeft: 0 }}
                            >
                                {t('routeError.details')}
                            </UiButton>
                            {detailsOpen ? (
                                <Box
                                    component="pre"
                                    style={{
                                        margin: 0,
                                        padding: 'var(--ui-space-3)',
                                        borderRadius: 'var(--ui-radius-sm)',
                                        background: 'var(--ui-bg-base)',
                                        border: '1px solid var(--ui-border)',
                                        color: 'var(--ui-text-secondary)',
                                        fontFamily: 'var(--ui-font-mono)',
                                        fontSize: 12,
                                        lineHeight: 1.5,
                                        whiteSpace: 'pre-wrap',
                                        wordBreak: 'break-word',
                                        overflow: 'auto',
                                        maxHeight: 240,
                                    }}
                                >
                                    {message}
                                    {stack ? `\n\n${stack}` : ''}
                                </Box>
                            ) : (
                                <UiCaption>{message}</UiCaption>
                            )}
                        </Stack>
                    </UiCard>
                ) : null}
            </Stack>
        </UiPageContainer>
    );
}

/** Shown inside the app shell (header/nav stay) when a page crashes. */
export function RouteErrorPage() {
    return (
        <Box
            style={{
                minHeight: '60vh',
                display: 'flex',
                alignItems: 'center',
                color: 'var(--ui-text-primary)',
            }}
        >
            <RouteErrorContent />
        </Box>
    );
}

/** Shown when the shell itself cannot render — still uses app colors and type. */
export function RootRouteErrorPage() {
    const navigate = useNavigate();
    const isLoggedIn = useAuthStore((s) => s.isLoggedIn);

    return (
        <Box
            style={{
                minHeight: '100vh',
                background: 'var(--ui-bg-base)',
                color: 'var(--ui-text-primary)',
                fontFamily: 'var(--ui-font)',
            }}
        >
            <Box
                component="header"
                style={{
                    height: 'var(--ui-header-height)',
                    display: 'flex',
                    alignItems: 'center',
                    padding: '0 var(--ui-space-6)',
                    borderBottom: '1px solid var(--ui-divider)',
                    background: 'var(--ui-header-bg)',
                    backdropFilter: 'blur(var(--ui-header-blur))',
                }}
            >
                <Box
                    component="button"
                    type="button"
                    onClick={() => void navigate(isLoggedIn ? '/home' : '/', { replace: true })}
                    style={{
                        background: 'none',
                        border: 'none',
                        padding: 0,
                        cursor: 'pointer',
                        fontSize: '1.125rem',
                        fontWeight: 800,
                        color: 'var(--ui-text-primary)',
                        letterSpacing: '-0.02em',
                    }}
                >
                    I Watch <span style={{ color: 'var(--ui-accent)' }}>Football</span>
                </Box>
            </Box>
            <RouteErrorContent />
        </Box>
    );
}
