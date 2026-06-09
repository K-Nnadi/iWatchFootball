/** Shared Mantine input styles — use with Select, TextInput, etc. */
export const uiSelectStyles = {
    label: {
        color: 'var(--ui-text-primary)',
        fontWeight: 600,
        marginBottom: 8,
        fontSize: '0.875rem',
    },
    input: {
        backgroundColor: 'var(--ui-bg-surface)',
        borderColor: 'var(--ui-border)',
        color: 'var(--ui-text-primary)',
    },
};

export const uiSegmentedControlStyles = {
    root: { backgroundColor: 'var(--ui-bg-surface)' },
    label: {
        color: 'var(--ui-text-primary)',
        '&[data-active]': { color: 'var(--ui-accent-text)' },
    },
    control: {
        '&[data-active]': { backgroundColor: 'var(--ui-accent)' },
    },
};
