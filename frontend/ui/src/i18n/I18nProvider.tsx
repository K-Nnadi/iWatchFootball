import { useEffect } from 'react';
import type { ReactNode } from 'react';
import dayjs from 'dayjs';
import 'dayjs/locale/de';
import 'dayjs/locale/es';
import 'dayjs/locale/fr';
import 'dayjs/locale/it';
import 'dayjs/locale/pt';
import { useI18nStore } from './i18n.store';
import type { AppLocale } from './config';

const DAYJS_LOCALES: Record<AppLocale, string> = {
    en: 'en',
    es: 'es',
    fr: 'fr',
    de: 'de',
    it: 'it',
    pt: 'pt',
};

interface I18nProviderProps {
    children: ReactNode;
}

export function I18nProvider({ children }: I18nProviderProps) {
    const locale = useI18nStore((s) => s.locale);
    const initializeLocale = useI18nStore((s) => s.initializeLocale);

    useEffect(() => {
        initializeLocale();
    }, [initializeLocale]);

    useEffect(() => {
        document.documentElement.lang = locale;
        dayjs.locale(DAYJS_LOCALES[locale]);
    }, [locale]);

    return <>{children}</>;
}
