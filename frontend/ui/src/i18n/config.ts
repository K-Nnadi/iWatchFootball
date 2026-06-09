import { CommsPreferenceLanguage } from '@iWatchFootball/clients/controllers/iWatchFootballAPI.schemas';

export type AppLocale = 'en' | 'es' | 'fr' | 'de' | 'it' | 'pt';

export const LOCALE_STORAGE_KEY = 'app-locale';
export const DEFAULT_LOCALE: AppLocale = 'en';

export const SUPPORTED_LOCALES: AppLocale[] = ['en', 'es', 'fr', 'de', 'it', 'pt'];

const COMMS_TO_LOCALE: Record<CommsPreferenceLanguage, AppLocale> = {
    EN: 'en',
    ES: 'es',
    FR: 'fr',
    DE: 'de',
    IT: 'it',
    PT: 'pt',
};

const LOCALE_TO_COMMS: Record<AppLocale, CommsPreferenceLanguage> = {
    en: CommsPreferenceLanguage.EN,
    es: CommsPreferenceLanguage.ES,
    fr: CommsPreferenceLanguage.FR,
    de: CommsPreferenceLanguage.DE,
    it: CommsPreferenceLanguage.IT,
    pt: CommsPreferenceLanguage.PT,
};

export function commsLanguageToLocale(language: CommsPreferenceLanguage): AppLocale {
    return COMMS_TO_LOCALE[language] ?? DEFAULT_LOCALE;
}

export function localeToCommsLanguage(locale: AppLocale): CommsPreferenceLanguage {
    return LOCALE_TO_COMMS[locale] ?? CommsPreferenceLanguage.EN;
}

export function normalizeLocale(value: string | null | undefined): AppLocale {
    if (!value) return DEFAULT_LOCALE;
    const lower = value.toLowerCase() as AppLocale;
    return SUPPORTED_LOCALES.includes(lower) ? lower : DEFAULT_LOCALE;
}

export function detectBrowserLocale(): AppLocale {
    const lang = navigator.language?.split('-')[0]?.toLowerCase();
    return normalizeLocale(lang);
}
