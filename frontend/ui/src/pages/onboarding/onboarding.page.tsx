import { Checkbox, Loader, TextInput } from '@mantine/core';
import { IconArrowLeft, IconSearch } from '@tabler/icons-react';
import { useMemo, useState } from 'react';
import type { Team } from '@iWatchFootball/clients/controllers/iWatchFootballAPI.schemas';
import { useGetQueryTeam } from '@iWatchFootball/clients/controllers/team';
import { useUpdateOneUser } from '@iWatchFootball/clients/controllers/user';
import { usePageTransition } from '../../hooks/usePageTransition';
import { useTranslation } from '../../i18n';
import { useAuthStore } from '../../shared/stores/auth.store';
import {
    markOnboardingComplete,
    ONBOARDING_INITIAL_TEAM_COUNT,
    SUGGESTED_TEAM_NAMES,
} from '../../shared/onboarding';
import { notify } from '../../shared/notify';
import classes from './onboarding.module.css';

type Step = 'team' | 'consent';

function teamInitials(name: string): string {
    const parts = name.trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) return '?';
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

function sortBySuggestedOrder(teams: Team[], suggestedNames: string[]): Team[] {
    const rank = (name: string): number => {
        const lower = name.toLowerCase();
        for (let i = 0; i < suggestedNames.length; i++) {
            const suggested = suggestedNames[i].toLowerCase();
            if (lower === suggested || lower.includes(suggested) || suggested.includes(lower)) {
                return i;
            }
        }
        return 999;
    };
    return [...teams].sort((a, b) => {
        const aRank = rank(a.name);
        const bRank = rank(b.name);
        if (aRank !== bRank) return aRank - bRank;
        return a.name.localeCompare(b.name);
    });
}

function filterTeamsBySearch(teams: Team[], query: string): Team[] {
    const q = query.trim().toLowerCase();
    if (!q) return teams;
    return teams.filter((t) => t.name.toLowerCase().includes(q));
}

function getVisibleTeams(allTeams: Team[], suggestedNames: string[], query: string): Team[] {
    if (query.trim()) {
        return filterTeamsBySearch(allTeams, query).sort((a, b) => a.name.localeCompare(b.name));
    }
    return sortBySuggestedOrder(allTeams, suggestedNames).slice(0, ONBOARDING_INITIAL_TEAM_COUNT);
}

function TeamGrid({
    teams,
    selectedIds,
    onToggle,
    loading,
    emptyLabel,
}: {
    teams: Team[];
    selectedIds: number[];
    onToggle: (team: Team) => void;
    loading: boolean;
    emptyLabel: string;
}) {
    if (loading) {
        return (
            <div className={classes.emptyNote}>
                <Loader size="sm" color="var(--ui-accent)" />
            </div>
        );
    }

    if (teams.length === 0) {
        return <p className={classes.emptyNote}>{emptyLabel}</p>;
    }

    return (
        <div className={classes.grid}>
            {teams.map((team) => {
                const selected = selectedIds.includes(team.id);
                return (
                    <button
                        key={team.id}
                        type="button"
                        className={`${classes.teamBtn} ${selected ? classes.teamBtnSelected : ''}`}
                        onClick={() => onToggle(team)}
                    >
                        <span className={classes.crestWrap}>
                            {team.logoUrl ? (
                                <img src={team.logoUrl} alt="" className={classes.crest} />
                            ) : (
                                <span className={classes.crestFallback}>{teamInitials(team.name)}</span>
                            )}
                        </span>
                        <span className={classes.teamName}>{team.name}</span>
                    </button>
                );
            })}
        </div>
    );
}

export function OnboardingPage() {
    const { t } = useTranslation();
    const { navigateWithTransition } = usePageTransition();
    const { user, login: setAuthState, token } = useAuthStore();

    const [step, setStep] = useState<Step>('team');
    const [search, setSearch] = useState('');
    const [favouriteTeamIds, setFavouriteTeamIds] = useState<number[]>(user?.favouriteTeamIds ?? []);
    const [acceptedTerms, setAcceptedTerms] = useState(false);
    const [marketingOptIn, setMarketingOptIn] = useState(false);
    const [saving, setSaving] = useState(false);

    const teamQuery = search.trim();

    const { data: allTeams = [], isLoading: loadingTeams } = useGetQueryTeam(
        { take: 500 } as never,
        { query: { enabled: step === 'team' } as never },
    );

    const visibleTeams = useMemo(
        () => getVisibleTeams(allTeams, SUGGESTED_TEAM_NAMES, teamQuery),
        [allTeams, teamQuery],
    );

    const updateUserMutation = useUpdateOneUser();

    const finishOnboarding = async () => {
        if (!user || !token) return;
        setSaving(true);
        try {
            const metadata = {
                ...(user.metadata ?? {}),
                onboardingCompleted: true,
                marketingOptIn,
            };

            const updated = await updateUserMutation.mutateAsync({
                id: user.id,
                data: {
                    ...user,
                    favouriteTeamIds: favouriteTeamIds.length > 0 ? favouriteTeamIds : user.favouriteTeamIds ?? [],
                    metadata,
                },
            });

            markOnboardingComplete(user.id);
            setAuthState(token, { ...user, ...updated });
            notify.success(t('onboarding.completeTitle'), t('onboarding.completeMessage'));
            navigateWithTransition('/home');
        } catch {
            notify.error(t('onboarding.saveFailedTitle'), t('onboarding.saveFailedMessage'));
        } finally {
            setSaving(false);
        }
    };

    const goBack = () => {
        setSearch('');
        if (step === 'consent') setStep('team');
    };

    const goNextFromTeam = () => {
        setSearch('');
        setStep('consent');
    };

    const stepTitle = step === 'team' ? t('onboarding.teamTitle') : t('onboarding.consentTitle');
    const stepSubtitle = step === 'team' ? t('onboarding.teamSubtitle') : t('onboarding.consentSubtitle');

    return (
        <div className={classes.page}>
            <div className={classes.topBar}>
                {step !== 'team' ? (
                    <button type="button" className={classes.backBtn} aria-label={t('onboarding.back')} onClick={goBack}>
                        <IconArrowLeft size={22} />
                    </button>
                ) : (
                    <span className={classes.topSpacer} />
                )}
                <span className={classes.topSpacer} />
            </div>

            <div className={classes.header}>
                <h1 className={classes.title}>{stepTitle}</h1>
                <p className={classes.subtitle}>{stepSubtitle}</p>
            </div>

            {step === 'team' && (
                <div className={classes.searchWrap}>
                    <TextInput
                        placeholder={t('onboarding.search')}
                        value={search}
                        onChange={(e) => setSearch(e.currentTarget.value)}
                        leftSection={<IconSearch size={16} />}
                        radius="xl"
                        size="md"
                    />
                </div>
            )}

            <div className={classes.content}>
                {step === 'team' && (
                    <>
                        <p className={classes.sectionLabel}>
                            {teamQuery ? t('onboarding.searchResults') : t('onboarding.popularTeams')}
                        </p>
                        <TeamGrid
                            teams={visibleTeams}
                            selectedIds={favouriteTeamIds}
                            onToggle={(team) =>
                                setFavouriteTeamIds((prev) =>
                                    prev.includes(team.id)
                                        ? prev.filter((id) => id !== team.id)
                                        : [...prev, team.id],
                                )
                            }
                            loading={loadingTeams}
                            emptyLabel={t('onboarding.noTeams')}
                        />
                    </>
                )}

                {step === 'consent' && (
                    <>
                        <img src="/green-football-transparent.png" alt="" className={classes.illustration} />
                        <div className={classes.consentStack}>
                            <label className={classes.consentItem}>
                                <Checkbox checked={marketingOptIn} onChange={(e) => setMarketingOptIn(e.currentTarget.checked)} />
                                <span>{t('onboarding.marketingConsent')}</span>
                            </label>
                            <label className={classes.consentItem}>
                                <Checkbox
                                    checked={acceptedTerms}
                                    onChange={(e) => setAcceptedTerms(e.currentTarget.checked)}
                                />
                                <span>{t('onboarding.termsConsent')}</span>
                            </label>
                        </div>
                    </>
                )}
            </div>

            {step === 'team' && (
                <div className={classes.footer}>
                    <button type="button" className={classes.skipFooterBtn} onClick={goNextFromTeam}>
                        {t('auth.skip')}
                    </button>
                    <button
                        type="button"
                        className={classes.confirmBtn}
                        disabled={favouriteTeamIds.length === 0 || saving}
                        onClick={goNextFromTeam}
                    >
                        {t('onboarding.confirm')}
                    </button>
                </div>
            )}

            {step === 'consent' && (
                <div className={classes.footerSingle}>
                    <button
                        type="button"
                        className={classes.confirmBtnAccent}
                        disabled={!acceptedTerms || saving}
                        onClick={() => void finishOnboarding()}
                    >
                        {saving ? t('common.loading') : t('onboarding.proceed')}
                    </button>
                </div>
            )}
        </div>
    );
}
