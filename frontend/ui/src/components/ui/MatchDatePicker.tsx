import { useEffect, useState } from 'react';
import { DatePicker } from '@mantine/dates';
import dayjs from 'dayjs';
import { UiButton } from './Button';
import classes from './MatchDatePicker.module.css';

const pickerStyles = {
  calendarHeader: {
    marginBottom: 'var(--ui-space-2)',
    maxWidth: '100%',
  },
  calendarHeaderControl: {
    backgroundColor: 'var(--ui-bg-surface)',
    border: '1px solid var(--ui-border)',
    color: 'var(--ui-text-primary)',
    width: 32,
    height: 32,
    borderRadius: 'var(--ui-radius-sm)',
    '&:hover': {
      backgroundColor: 'var(--ui-bg-hover)',
      color: 'var(--ui-accent)',
    },
  },
  calendarHeaderLevel: {
    fontSize: '0.9375rem',
    fontWeight: 600,
    color: 'var(--ui-text-primary)',
    '&:hover': {
      backgroundColor: 'var(--ui-bg-hover)',
    },
  },
  calendarHeaderLevelIcon: {
    display: 'none',
  },
  weekday: {
    color: 'var(--ui-text-muted)',
    fontSize: '0.75rem',
    fontWeight: 600,
  },
  day: {
    color: 'var(--ui-text-primary)',
    fontSize: '0.8125rem',
    fontWeight: 500,
    borderRadius: 'var(--ui-radius-sm)',
    '&[data-outside]': {
      color: 'var(--ui-text-muted)',
      opacity: 0.35,
    },
    '&[data-weekend]': {
      color: 'var(--ui-text-secondary)',
    },
    '&[data-selected]': {
      backgroundColor: 'var(--ui-accent)',
      color: 'var(--ui-accent-text)',
      fontWeight: 700,
    },
    '&:hover:not([data-selected])': {
      backgroundColor: 'var(--ui-bg-hover)',
    },
  },
  monthsListControl: {
    color: 'var(--ui-text-primary)',
    borderRadius: 'var(--ui-radius-sm)',
    '&[data-selected]': {
      backgroundColor: 'var(--ui-accent)',
      color: 'var(--ui-accent-text)',
    },
    '&:hover:not([data-selected])': {
      backgroundColor: 'var(--ui-bg-hover)',
    },
  },
  yearsListControl: {
    color: 'var(--ui-text-primary)',
    borderRadius: 'var(--ui-radius-sm)',
    '&[data-selected]': {
      backgroundColor: 'var(--ui-accent)',
      color: 'var(--ui-accent-text)',
    },
    '&:hover:not([data-selected])': {
      backgroundColor: 'var(--ui-bg-hover)',
    },
  },
};

interface MatchDatePickerProps {
  value: Date | undefined;
  onChange: (date: Date) => void;
  onToday?: () => void;
  showTodayAction?: boolean;
}

export function MatchDatePicker({
  value,
  onChange,
  onToday,
  showTodayAction = true,
}: MatchDatePickerProps) {
  const [displayMonth, setDisplayMonth] = useState(value ?? new Date());

  useEffect(() => {
    if (value) {
      setDisplayMonth(value);
    }
  }, [value]);

  const handleToday = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    onChange(today);
    onToday?.();
  };

  return (
    <div className={classes.matchDatePicker}>
      <DatePicker
        value={value}
        date={displayMonth}
        onDateChange={setDisplayMonth}
        onChange={(date) => {
          if (date) {
            onChange(date);
          }
        }}
        firstDayOfWeek={1}
        hideOutsideDates
        withCellSpacing={false}
        size="sm"
        styles={pickerStyles}
        getDayProps={(date) => {
          const isToday = dayjs(date).isSame(dayjs(), 'day');
          const isSelected = value != null && dayjs(date).isSame(dayjs(value), 'day');
          return {
            className: isToday && !isSelected ? classes.todayDay : undefined,
          };
        }}
      />

      {showTodayAction && (
        <div className={classes.footer}>
          <UiButton size="xs" variant="subtle" onClick={handleToday}>
            Go to today
          </UiButton>
        </div>
      )}
    </div>
  );
}

export { classes as matchDatePickerClasses };
