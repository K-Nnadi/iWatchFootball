import {
    IconChartBar,
    IconHistory,
    IconMapPin,
    IconTicket,
    IconUsers,
    IconBell,
    IconBuildingStadium,
    IconRoute,
    IconArchive,
} from '@tabler/icons-react';
import { usePageTransition } from '../hooks/usePageTransition';
import { useScrollAnimation } from '../hooks/useScrollAnimation';
import { usePlatformFeaturesStore } from '../shared/stores/platformFeatures.store';
import { useTranslation } from '../i18n/useTranslation';
import { UiButton } from '../components/ui';
import classes from './landing.module.css';

const HERO_IMAGE =
    'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&w=900&q=80';

export function LandingPage() {
    const { t } = useTranslation();
    const { navigateWithTransition } = usePageTransition();
    const { marketplaceEnabled } = usePlatformFeaturesStore();
    const pillarsAnim = useScrollAnimation({ animationType: 'fadeUp', threshold: 0.15 });
    const storyAnim = useScrollAnimation({ animationType: 'fadeUp', delay: 100, threshold: 0.15 });
    const ctaAnim = useScrollAnimation({ animationType: 'scale', delay: 80, threshold: 0.2 });

    const pillars = [
        { icon: IconHistory,         title: t('landing.pillarHistoryTitle'),     body: t('landing.pillarHistoryBody') },
        { icon: IconChartBar,        title: t('landing.pillarInsightsTitle'),     body: t('landing.pillarInsightsBody') },
        { icon: IconMapPin,          title: t('landing.pillarAttendanceTitle'),   body: t('landing.pillarAttendanceBody') },
        { icon: IconTicket,          title: t('landing.pillarTicketsTitle'),       body: t('landing.pillarTicketsBody') },
        { icon: IconUsers,           title: t('landing.pillarFriendsTitle'),       body: t('landing.pillarFriendsBody') },
        { icon: IconBell,            title: t('landing.pillarFollowTitle'),        body: t('landing.pillarFollowBody') },
        { icon: IconBuildingStadium, title: t('landing.pillarStadiumsTitle'),      body: t('landing.pillarStadiumsBody') },
        { icon: IconRoute,           title: t('landing.pillarAwayTitle'),          body: t('landing.pillarAwayBody') },
        { icon: IconArchive,         title: t('landing.pillarTicketHistoryTitle'), body: t('landing.pillarTicketHistoryBody') },
    ];

    const tickerItems = [...pillars, ...pillars];

    return (
        <div className={classes.page}>
            <section className={classes.hero}>
                <div className={classes.heroGlow} aria-hidden />
                <div className={classes.heroGrid}>
                    <div className={classes.heroCopy}>
                        <span className={classes.heroEyebrow}>{t('landing.heroEyebrow')}</span>
                        <h1 className={classes.heroTitle}>
                            {t('landing.heroTitlePrefix')}{' '}
                            <span className={classes.heroTitleAccent}>{t('landing.heroTitleAccent')}</span>
                        </h1>
                        <p className={classes.heroBody}>{t('landing.heroBody')}</p>
                        <div className={classes.heroActions}>
                            <UiButton size="md" onClick={() => navigateWithTransition('/welcome')}>
                                {t('nav.join')}
                            </UiButton>
                            <UiButton variant="outline" size="md" onClick={() => navigateWithTransition('/signIn')}>
                                {t('nav.signIn')}
                            </UiButton>
                        </div>
                    </div>

                    <div className={classes.heroVisual}>
                        <div className={classes.heroImageWrap}>
                            <img src={HERO_IMAGE} alt="" className={classes.heroImage} />
                            <div className={classes.heroImageOverlay} aria-hidden />
                        </div>
                        <div className={`${classes.heroStat} ${classes.heroStatTop}`}>
                            <span className={classes.heroStatValue}>{t('landing.heroStatMatches')}</span>
                            <span className={classes.heroStatLabel}>{t('landing.heroStatMatchesLabel')}</span>
                        </div>
                        <div className={`${classes.heroStat} ${classes.heroStatBottom}`}>
                            <span className={classes.heroStatValue}>{t('landing.heroStatInsights')}</span>
                            <span className={classes.heroStatLabel}>{t('landing.heroStatInsightsLabel')}</span>
                        </div>
                    </div>
                </div>
            </section>

            <section className={classes.pillars}>
                <div
                    ref={pillarsAnim.ref}
                    className={`${classes.pillarsInner} ${pillarsAnim.className}`}
                >
                    <div className={classes.sectionHeader}>
                        <h2 className={classes.sectionTitle}>{t('landing.pillarsTitle')}</h2>
                        <p className={classes.sectionSubtitle}>{t('landing.pillarsSubtitle')}</p>
                    </div>
                </div>
                <div className={classes.tickerWrapper}>
                    <div className={classes.tickerTrack}>
                        {tickerItems.map((pillar, i) => (
                            <article key={i} className={classes.tickerCard}>
                                <span className={classes.pillarIcon} aria-hidden>
                                    <pillar.icon size={22} stroke={2.2} />
                                </span>
                                <h3 className={classes.pillarTitle}>{pillar.title}</h3>
                                <p className={classes.pillarBody}>{pillar.body}</p>
                            </article>
                        ))}
                    </div>
                </div>
            </section>

            <section className={classes.story}>
                <div
                    ref={storyAnim.ref}
                    className={`${classes.storyInner} ${storyAnim.className}`}
                >
                    <div className={classes.storyCopy}>
                        <h2 className={classes.storyTitle}>{t('landing.whyWeBuilt')}</h2>
                        <p className={classes.storyBody}>{t('landing.whyWeBuiltBody')}</p>
                    </div>
                    <blockquote className={classes.quoteCard}>
                        <p className={classes.quoteText}>{t('landing.founderQuote')}</p>
                        <footer className={classes.quoteFooter}>
                            <span className={classes.quoteAvatar} aria-hidden>
                                {t('landing.founderInitials')}
                            </span>
                            <cite className={classes.quoteAttribution}>
                                <span className={classes.quoteName}>{t('landing.founderName')}</span>
                                <span className={classes.quoteRole}>{t('landing.founderRole')}</span>
                            </cite>
                        </footer>
                    </blockquote>
                </div>
            </section>

            <section className={classes.cta}>
                <div
                    ref={ctaAnim.ref}
                    className={`${classes.ctaCard} ${ctaAnim.className}`}
                >
                    <h2 className={classes.ctaTitle}>{t('landing.startHistory')}</h2>
                    <p className={classes.ctaBody}>
                        {marketplaceEnabled
                            ? t('landing.startHistoryBodyMarketplace')
                            : t('landing.startHistoryBody')}
                    </p>
                    <div className={classes.ctaActions}>
                        <UiButton size="md" onClick={() => navigateWithTransition('/welcome')}>
                            {t('nav.join')}
                        </UiButton>
                        <UiButton variant="outline" size="md" onClick={() => navigateWithTransition('/signIn')}>
                            {t('nav.signIn')}
                        </UiButton>
                    </div>
                </div>
            </section>
        </div>
    );
}
