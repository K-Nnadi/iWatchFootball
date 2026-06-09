import { useRef, useState } from 'react';
import { ActionIcon, Container, Stack, Popover } from '@mantine/core';
import { IconChevronLeft, IconChevronRight, IconChevronDown } from '@tabler/icons-react';
import { Carousel } from '@mantine/carousel';
import { useMediaQuery } from '@mantine/hooks';
import { MatchDatePicker, matchDatePickerClasses, UiButton } from '../ui';
import classes from './dateNavigation.carousel.module.css';

interface DateNavProps {
    dates: Date[];
    selectedDateIndex: number;
    setSelectedDateIndex: (index: number) => void;
    onPrevClick: () => void;
    onNextClick: () => void;
    onReturnToToday: () => void;
    onDateSelect: (date: Date) => void;
    getDateLabel: (d: Date) => string;
}

function formatSelectedDate(date: Date): string {
    const weekday = date.toLocaleDateString(undefined, { weekday: 'long' });
    const day = date.toLocaleDateString(undefined, { day: 'numeric' });
    const month = date.toLocaleDateString(undefined, { month: 'long' });
    return `${weekday}, ${day} ${month}`;
}

export function DateNavigation({
    dates,
    selectedDateIndex,
    setSelectedDateIndex,
    onPrevClick,
    onNextClick,
    onReturnToToday,
    onDateSelect,
    getDateLabel,
}: DateNavProps) {
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const isMobile = useMediaQuery('(max-width: 768px)');
    const [datePickerOpened, setDatePickerOpened] = useState(false);

    const selectedDate = dates[selectedDateIndex];

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayIndex = dates.findIndex((d) => {
        const dayDate = new Date(d.getFullYear(), d.getMonth(), d.getDate());
        return dayDate.getTime() === today.getTime();
    });
    const canReturnToToday = todayIndex === -1;

    if (isMobile) {
        return (
            <Container size="xs" className={classes.root}>
                <Stack gap="xs">
                    <div className={classes.mobileRow}>
                        <ActionIcon onClick={onPrevClick} variant="default" size="md" className={classes.navIcon}>
                            <IconChevronLeft size={18} />
                        </ActionIcon>

                        <Popover
                            opened={datePickerOpened}
                            onChange={setDatePickerOpened}
                            position="bottom"
                            withArrow
                            shadow="md"
                        >
                            <Popover.Target>
                                <UiButton
                                    variant="secondary"
                                    size="sm"
                                    className={classes.mobileDateButton}
                                    rightSection={<IconChevronDown size={16} />}
                                    onClick={() => setDatePickerOpened((o) => !o)}
                                >
                                    {getDateLabel(selectedDate)}
                                </UiButton>
                            </Popover.Target>
                            <Popover.Dropdown className={matchDatePickerClasses.popoverDropdown}>
                                <MatchDatePicker
                                    value={selectedDate}
                                    onChange={(date) => {
                                        onDateSelect(date);
                                        setDatePickerOpened(false);
                                    }}
                                    onToday={() => {
                                        onReturnToToday();
                                        setDatePickerOpened(false);
                                    }}
                                />
                            </Popover.Dropdown>
                        </Popover>

                        <ActionIcon onClick={onNextClick} variant="default" size="md" className={classes.navIcon}>
                            <IconChevronRight size={18} />
                        </ActionIcon>
                    </div>
                </Stack>
            </Container>
        );
    }

    return (
        <Container size="xs" className={classes.root}>
            <Stack gap="xs">
                <p className={classes.dateLabel}>
                    {formatSelectedDate(selectedDate)}
                    {canReturnToToday && (
                        <>
                            {'  –  '}
                            <a
                                href="#"
                                className={classes.returnLink}
                                onClick={(e) => {
                                    e.preventDefault();
                                    onReturnToToday();
                                }}
                            >
                                Return to today
                            </a>
                        </>
                    )}
                </p>

                <div className={classes.carouselRow}>
                    <ActionIcon onClick={onPrevClick} variant="default" size="lg" className={classes.navIcon}>
                        <IconChevronLeft size={18} />
                    </ActionIcon>

                    <Carousel
                        slideSize="14.2857%"
                        slideGap="md"
                        align="start"
                        slidesToScroll={1}
                        withControls={false}
                        ref={scrollContainerRef as React.RefObject<HTMLDivElement>}
                        style={{ flex: 1, maxWidth: '100%' }}
                    >
                        {dates.map((date, i) => {
                            const isSelected = i === selectedDateIndex;
                            return (
                                <Carousel.Slide key={date.toDateString()}>
                                    <UiButton
                                        variant={isSelected ? 'primary' : 'outline'}
                                        size="xs"
                                        className={classes.dateButton}
                                        onClick={() => setSelectedDateIndex(i)}
                                    >
                                        {getDateLabel(date)}
                                    </UiButton>
                                </Carousel.Slide>
                            );
                        })}
                    </Carousel>

                    <ActionIcon onClick={onNextClick} variant="default" size="lg" className={classes.navIcon}>
                        <IconChevronRight size={18} />
                    </ActionIcon>
                </div>
            </Stack>
        </Container>
    );
}
