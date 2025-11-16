import { useRef, useState } from 'react';
import {
    ActionIcon,
    Button,
    useMantineTheme,
    Container,
    Stack,
    Text,
    Anchor,
    Popover,
    Group
} from '@mantine/core';
import { IconChevronLeft, IconChevronRight, IconChevronDown } from '@tabler/icons-react';
import { Carousel } from '@mantine/carousel';
import { DatePicker } from '@mantine/dates';
import { useMediaQuery } from '@mantine/hooks';

interface DateNavProps {
    dates: Date[];
    selectedDateIndex: number;
    setSelectedDateIndex: (index: number) => void;
    onPrevClick: () => void;          // shifts the 7-day window left (daily)
    onNextClick: () => void;          // shifts the 7-day window right (daily)
    onReturnToToday: () => void;      // re-center so "today" is in the 7-day window
    onDateSelect: (date: Date) => void; // handles date selection from picker (may be outside current window)
    getDateLabel: (d: Date) => string;
}

/**
 * Returns a string like "Friday, 20 December"
 * (omitting the year).
 */
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
                                   getDateLabel
                               }: DateNavProps) {
    const theme = useMantineTheme();
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    // Use explicit 768px breakpoint for mobile (standard tablet/mobile breakpoint)
    const isMobile = useMediaQuery('(max-width: 768px)');
    const [datePickerOpened, setDatePickerOpened] = useState(false);

    // Build 7 slides for the current window
    const slides = dates.map((date, i) => {
        const isSelected = i === selectedDateIndex;
        const label = getDateLabel(date);

        return (
            <Carousel.Slide key={date.toDateString()}>
                <Button
                    variant={isSelected ? 'filled' : 'outline'}
                    color={isSelected ? 'blue' : 'gray'}
                    size="xs"
                    style={{ width: '100%' }}
                    onClick={() => setSelectedDateIndex(i)}
                >
                    {label}
                </Button>
            </Carousel.Slide>
        );
    });

    // The selected date within the 7-day window
    const selectedDate = dates[selectedDateIndex];

    // Check if “today” is in the current window
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayIndex = dates.findIndex(d => {
        const dayDate = new Date(d.getFullYear(), d.getMonth(), d.getDate());
        return dayDate.getTime() === today.getTime();
    });

    // Show "Return to Today" only if "today" is NOT in this window
    const canReturnToToday = todayIndex === -1;

    // Mobile view: Show only current date with date picker and navigation arrows
    if (isMobile) {
        return (
            <Container size="xs" mb={20}>
                <Stack gap="xs">
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: theme.spacing.xs }}>
                        <ActionIcon 
                            onClick={onPrevClick} 
                            variant="subtle"
                            style={{ 
                                color: 'var(--modern-white)',
                            }}
                        >
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
                                <Button
                                    variant="filled"
                                    rightSection={<IconChevronDown size={16} />}
                                    onClick={() => setDatePickerOpened((o) => !o)}
                                    style={{
                                        backgroundColor: 'var(--modern-dark-gray)',
                                        color: 'var(--modern-white)',
                                        border: '1px solid rgba(255, 255, 255, 0.2)',
                                        minWidth: '150px',
                                    }}
                                >
                                    {getDateLabel(selectedDate)}
                                </Button>
                            </Popover.Target>
                            <Popover.Dropdown
                                style={{
                                    backgroundColor: 'var(--modern-dark-gray)',
                                    border: '1px solid rgba(255, 255, 255, 0.2)',
                                }}
                            >
                                <DatePicker
                                    value={selectedDate}
                                    onChange={(date) => {
                                        if (date) {
                                            onDateSelect(date);
                                            setDatePickerOpened(false);
                                        }
                                    }}
                                    styles={{
                                        calendar: {
                                            backgroundColor: 'var(--modern-dark-gray)',
                                        },
                                        day: {
                                            color: 'var(--modern-white)',
                                            '&[data-selected]': {
                                                backgroundColor: 'var(--modern-lime)',
                                                color: 'var(--modern-black)',
                                            },
                                            '&:hover': {
                                                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                                            },
                                        },
                                        weekday: {
                                            color: 'var(--modern-light-gray)',
                                        },
                                        monthCell: {
                                            color: 'var(--modern-white)',
                                        },
                                        yearCell: {
                                            color: 'var(--modern-white)',
                                        },
                                    }}
                                />
                            </Popover.Dropdown>
                        </Popover>

                        <ActionIcon 
                            onClick={onNextClick}
                            variant="subtle"
                            style={{ 
                                color: 'var(--modern-white)',
                            }}
                        >
                            <IconChevronRight size={18} />
                        </ActionIcon>
                    </div>
                </Stack>
            </Container>
        );
    }

    // Desktop view: Show carousel
    return (
        <Container size="xs" mb={20}>
            <Stack gap="xs">
                <Text size="md" fw={500}>
                    {formatSelectedDate(selectedDate)}
                    {canReturnToToday && (
                        <>
                            {'  –  '}
                            <Anchor
                                onClick={(e) => {
                                    e.preventDefault();
                                    onReturnToToday();
                                }}
                                style={{ cursor: 'pointer' }}
                            >
                                Return to Today
                            </Anchor>
                        </>
                    )}
                </Text>


                <div style={{ display: 'flex', justifyContent: 'center' }}>
                    <ActionIcon onClick={onPrevClick} style={{ marginRight: theme.spacing.xs }}>
                        <IconChevronLeft size={18} />
                    </ActionIcon>

                    <Carousel
                        slideSize="14.2857%"
                        slideGap="md"
                        align="start"
                        slidesToScroll={1}
                        withControls={false}
                        ref={scrollContainerRef as any}
                    >
                        {slides}
                    </Carousel>

                    <ActionIcon onClick={onNextClick}>
                        <IconChevronRight size={18} />
                    </ActionIcon>
                </div>
            </Stack>
        </Container>
    );
}
