import type { AppLocale } from './config';
import { DEFAULT_LOCALE } from './config';
import { messages } from './messages';

export type TranslationParams = Record<string, string | number>;

function resolvePath(tree: unknown, key: string): string | undefined {
    const parts = key.split('.');
    let node: unknown = tree;
    for (const part of parts) {
        if (node == null || typeof node !== 'object') {
            return undefined;
        }
        node = (node as Record<string, unknown>)[part];
    }
    return typeof node === 'string' ? node : undefined;
}

function interpolate(template: string, params?: TranslationParams): string {
    if (!params) return template;
    return template.replace(/\{\{(\w+)\}\}/g, (_, token: string) => String(params[token] ?? ''));
}

export function translate(locale: AppLocale, key: string, params?: TranslationParams): string {
    const primary = resolvePath(messages[locale], key);
    if (primary) return interpolate(primary, params);

    const fallback = resolvePath(messages[DEFAULT_LOCALE], key);
    if (fallback) return interpolate(fallback, params);

    return key;
}
