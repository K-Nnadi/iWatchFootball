import type { AppLocale } from './config';
import de from './locales/de.json';
import en from './locales/en.json';
import es from './locales/es.json';
import fr from './locales/fr.json';
import it from './locales/it.json';
import pt from './locales/pt.json';

export type TranslationMessages = typeof en;

export const messages: Record<AppLocale, TranslationMessages> = {
    en,
    es,
    fr,
    de,
    it,
    pt,
};
