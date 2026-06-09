import { useCallback } from 'react';
import { useI18nStore } from './i18n.store';
import { translate, type TranslationParams } from './translate';

export function useTranslation() {
    const locale = useI18nStore((s) => s.locale);

    const t = useCallback(
        (key: string, params?: TranslationParams) => translate(locale, key, params),
        [locale],
    );

    return { t, locale };
}
