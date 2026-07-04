import {
  Badge,
  Button,
  Card,
  Combobox,
  createTheme,
  Modal,
  Paper,
  Popover,
  Tabs,
  Text,
  Title,
} from '@mantine/core';

/** Central Mantine theme — all defaults flow from CSS tokens in tokens.css */
export const appTheme = createTheme({
  primaryColor: 'green',
  colors: {
    green: [
      '#e6f9ef',
      '#b3efd0',
      '#80e5b1',
      '#4ddb92',
      '#1ad173',
      '#00c853',
      '#00a844',
      '#008837',
      '#00682a',
      '#00481d',
    ],
  },
  fontFamily: 'var(--ui-font)',
  defaultRadius: 'md',
  radius: {
    xs: 'var(--ui-radius-xs)',
    sm: 'var(--ui-radius-sm)',
    md: 'var(--ui-radius-md)',
    lg: 'var(--ui-radius-lg)',
    xl: 'var(--ui-radius-xl)',
  },
  headings: {
    fontFamily: 'var(--ui-font)',
    fontWeight: '700',
  },
  components: {
    Modal: Modal.extend({
      defaultProps: { zIndex: 1200 },
    }),
    Popover: Popover.extend({
      defaultProps: { zIndex: 1300 },
    }),
    Combobox: Combobox.extend({
      defaultProps: { zIndex: 1300 },
    }),
    Button: Button.extend({
      defaultProps: {
        radius: 'md',
        color: 'green',
      },
      styles: {
        root: {
          fontWeight: 600,
          letterSpacing: '0.01em',
        },
      },
    }),
    Card: Card.extend({
      defaultProps: { radius: 'md', padding: 'md' },
      styles: {
        root: {
          backgroundColor: 'var(--ui-bg-elevated)',
          border: '1px solid var(--ui-border)',
        },
      },
    }),
    Paper: Paper.extend({
      defaultProps: { radius: 'md' },
      styles: {
        root: {
          backgroundColor: 'var(--ui-bg-elevated)',
          border: '1px solid var(--ui-border)',
        },
      },
    }),
    Badge: Badge.extend({
      defaultProps: { radius: 'sm' },
    }),
    Tabs: Tabs.extend({
      styles: {
        tab: {
          fontWeight: 600,
          fontSize: '0.875rem',
        },
      },
    }),
    Title: Title.extend({
      styles: {
        root: { color: 'var(--ui-text-primary)' },
      },
    }),
    Text: Text.extend({
      styles: {
        root: { color: 'var(--ui-text-primary)' },
      },
    }),
  },
});
