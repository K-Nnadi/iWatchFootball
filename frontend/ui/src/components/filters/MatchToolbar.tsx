import { useRef, useState } from 'react';
import { ActionIcon, Chip, Group, Popover, Text, TextInput, UnstyledButton } from '@mantine/core';
import { Carousel } from '@mantine/carousel';
import { useMediaQuery } from '@mantine/hooks';
import {
    IconCalendar,
    IconChevronLeft,
    IconChevronRight,
    IconSearch,
} from '@tabler/icons-react';
import { UiButton, MatchDatePicker, matchDatePickerClasses } from '../ui';
import classes from './MatchToolbar.module.css';

function formatHeadingDate(date: Date): string {
    return date.toLocaleDateString(undefined, {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    });
}

interface MatchToolbarProps {
    dates: Date[];
    selectedDateIndex: number;
    setSelectedDateIndex: (index: number) => void;
    onPrevClick: () => void;
    onNextClick: () => void;
    onDateSelect: (date: Date) => void;
    onReturnToToday?: () => void;
    getDateLabel: (d: Date) => string;
    showLive: boolean;
    setShowLive: (checked: boolean) => void;
    showAvailableTickets: boolean;
    setShowAvailableTickets: (checked: boolean) => void;
    teamSearch: string;
    onTeamSearchChange: (value: string) => void;
}

export function MatchToolbar({
    dates,
    selectedDateIndex,
    setSelectedDateIndex,
    onPrevClick,
    onNextClick,
    onDateSelect,
    onReturnToToday,
    getDateLabel,
    showLive,
    setShowLive,
    showAvailableTickets,
    setShowAvailableTickets,
    teamSearch,
    onTeamSearchChange,
}: MatchToolbarProps) {
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const isCompact = useMediaQuery('(max-width: 640px)');
    const [datePickerOpened, setDatePickerOpened] = useState(false);

    const selectedDate = dates[selectedDateIndex];
    const hasActiveFilters = showLive || showAvailableTickets || teamSearch.trim().length > 0;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const showTodayLink =
        onReturnToToday &&
        selectedDate &&
        new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate()).getTime() !==
            today.getTime();

    const handleClear = () => {
        setShowLive(false);
        setShowAvailableTickets(false);
        onTeamSearchChange('');
    };

    const chipStyles = {
        label: {
            fontWeight: 600,
            borderColor: 'var(--ui-accent)',
            backgroundColor: 'transparent',
            color: 'var(--ui-text-secondary)',
            '&[data-checked]': {
                backgroundColor: 'var(--ui-accent)',
                color: 'var(--ui-accent-text)',
                borderColor: 'var(--ui-accent)',
            },
        },
    };

    return (
        <div className={classes.toolbar}>
            <div className={classes.dateSection}>
                <div className={classes.dateHeadingRow}>
                    <Text className={classes.dateHeading}>
                        {selectedDate ? formatHeadingDate(selectedDate) : 'Select a date'}
                    </Text>
                    {showTodayLink && (
                        <UnstyledButton className={classes.todayLink} onClick={onReturnToToday}>
                            Jump to today
                        </UnstyledButton>
                    )}
                </div>

                <div className={classes.carouselRow}>
                    <ActionIcon
                        onClick={onPrevClick}
                        variant="default"
                        size="lg"
                        className={classes.navIcon}
                        aria-label="Previous days"
                    >
                        <IconChevronLeft size={18} />
                    </ActionIcon>

                    <Carousel
                        slideSize={isCompact ? '33.3333%' : '14.2857%'}
                        slideGap="sm"
                        align="start"
                        slidesToScroll={1}
                        withControls={false}
                        ref={scrollContainerRef as React.RefObject<HTMLDivElement>}
                        className={classes.carousel}
                    >
                        {dates.map((date, i) => {
                            const isSelected = i === selectedDateIndex;
                            return (
                                <Carousel.Slide key={date.toDateString()}>
                                    <UiButton
                                        variant={isSelected ? 'primary' : 'outline'}
                                        size="xs"
                                        fullWidth
                                        className={classes.dateChip}
                                        onClick={() => setSelectedDateIndex(i)}
                                    >
                                        {getDateLabel(date)}
                                    </UiButton>
                                </Carousel.Slide>
                            );
                        })}
                    </Carousel>

                    <ActionIcon
                        onClick={onNextClick}
                        variant="default"
                        size="lg"
                        className={classes.navIcon}
                        aria-label="Next days"
                    >
                        <IconChevronRight size={18} />
                    </ActionIcon>
                </div>

                <Popover
                    opened={datePickerOpened}
                    onChange={setDatePickerOpened}
                    position="bottom-start"
                    shadow="md"
                    offset={8}
                >
                    <Popover.Target>
                        <UnstyledButton
                            className={classes.calendarLink}
                            onClick={() => setDatePickerOpened((open) => !open)}
                        >
                            <IconCalendar size={15} />
                            Pick a date
                        </UnstyledButton>
                    </Popover.Target>
                    <Popover.Dropdown className={matchDatePickerClasses.popoverDropdown}>
                        <MatchDatePicker
                            value={selectedDate}
                            onChange={(date) => {
                                onDateSelect(date);
                                setDatePickerOpened(false);
                            }}
                            onToday={() => {
                                onReturnToToday?.();
                                setDatePickerOpened(false);
                            }}
                        />
                    </Popover.Dropdown>
                </Popover>
            </div>

            <div className={classes.filterSection}>
                <Group gap="sm" wrap="wrap" className={classes.filterChips}>
                    <Chip
                        checked={showLive}
                        onChange={setShowLive}
                        variant="outline"
                        color="green"
                        styles={chipStyles}
                    >
                        Live now
                    </Chip>
                    <Chip
                        checked={showAvailableTickets}
                        onChange={setShowAvailableTickets}
                        variant="outline"
                        color="green"
                        styles={chipStyles}
                    >
                        Has tickets
                    </Chip>
                </Group>

                <TextInput
                    className={classes.searchInput}
                    placeholder="Search by team…"
                    value={teamSearch}
                    onChange={(e) => onTeamSearchChange(e.currentTarget.value)}
                    leftSection={<IconSearch size={16} stroke={1.75} />}
                    aria-label="Search by team name"
                />

                {hasActiveFilters && (
                    <UnstyledButton className={classes.clearLink} onClick={handleClear}>
                        Clear filters
                    </UnstyledButton>
                )}
            </div>
        </div>
    );
}
