import { usePageTransition } from '../../hooks/usePageTransition';
import { useTranslation } from '../../i18n';
import classes from './authWelcome.module.css';

export function AuthWelcomePage() {
    const { navigateWithTransition } = usePageTransition();
    const { t } = useTranslation();

    return (
        <div className={classes.page}>
            <button
                type="button"
                className={classes.skipBtn}
                onClick={() => navigateWithTransition('/')}
            >
                {t('auth.skip')}
            </button>

            <div className={classes.body}>
                <img src="/green-football-transparent.png" alt="" className={classes.logo} />
                <h1 className={classes.title}>{t('auth.welcomeTitle')}</h1>
                <p className={classes.subtitle}>{t('auth.welcomeSubtitle')}</p>

                <div className={classes.actions}>
                    <button
                        type="button"
                        className={classes.emailBtn}
                        onClick={() => navigateWithTransition('/join')}
                    >
                        {t('auth.continueWithEmail')}
                    </button>
                </div>

                <button
                    type="button"
                    className={classes.signInLink}
                    onClick={() => navigateWithTransition('/signIn')}
                >
                    {t('auth.alreadyHaveAccount')}
                </button>
            </div>
        </div>
    );
}
