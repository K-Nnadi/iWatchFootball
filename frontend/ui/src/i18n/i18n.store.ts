import { create } from 'zustand';
import {
    DEFAULT_LOCALE,
    LOCALE_STORAGE_KEY,
    detectBrowserLocale,
    normalizeLocale,
    type AppLocale,
} from './config';

interface I18nStore {
    locale: AppLocale;
    initialized: boolean;
    setLocale: (locale: AppLocale) => void;
    initializeLocale: () => void;
}

export const useI18nStore = create<I18nStore>((set) => ({
    locale: DEFAULT_LOCALE,
    initialized: false,

    setLocale: (locale) => {
        const next = normalizeLocale(locale);
        set((state) => {
            if (state.locale === next) {
                return state;
            }
            localStorage.setItem(LOCALE_STORAGE_KEY, next);
            return { locale: next };
        });
    },

    initializeLocale: () => {
        const stored = localStorage.getItem(LOCALE_STORAGE_KEY);
        const locale = stored ? normalizeLocale(stored) : detectBrowserLocale();
        localStorage.setItem(LOCALE_STORAGE_KEY, locale);
        set({ locale, initialized: true });
    },
}));
