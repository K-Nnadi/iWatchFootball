/**
 * IWF UI Component Library
 *
 * Standardised building blocks for the entire app.
 * Always import from here instead of raw Mantine for buttons, cards, typography, etc.
 *
 * @example
 * import { UiButton, UiCard, UiH2, UiMatchList } from '@/components/ui';
 */

export { UiButton } from './Button';
export type { UiButtonProps, UiButtonVariant } from './Button';

export { UiCard } from './Card';
export type { UiCardProps, UiCardDensity } from './Card';

export { UiH1, UiH2, UiH3, UiBody, UiCaption, UiAccent } from './Typography';

export { UiBadge, UiLiveBadge } from './Badge';

export { UiSectionHeader } from './SectionHeader';

export { UiPageContainer } from './PageContainer';

export { UiMatchList, UiMatchRow } from './MatchList';
export type { MatchRowData } from './MatchList';

export { MatchDatePicker, matchDatePickerClasses } from './MatchDatePicker';

export { uiSelectStyles, uiSegmentedControlStyles } from './formStyles';
