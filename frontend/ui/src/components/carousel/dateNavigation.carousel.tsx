import { useRef } from 'react';
import {
    ActionIcon,
    Button,
    useMantineTheme,
    Container,
    Stack,
    Text,
    Anchor
} from '@mantine/core';
import { IconChevronLeft, IconChevronRight } from '@tabler/icons-react';
import { Carousel } from '@mantine/carousel';

interface DateNavProps {
    dates: Date[];
    selectedDateIndex: number;
    setSelectedDateIndex: (index: number) => void;
    onPrevClick: () => void;          // shifts the 7-day window left (daily)
    onNextClick: () => void;          // shifts the 7-day window right (daily)
    onReturnToToday: () => void;      // re-center so "today" is in the 7-day window
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
                                   getDateLabel
                               }: DateNavProps) {
    const theme = useMantineTheme();
    const scrollContainerRef = useRef<HTMLDivElement>(null);

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

    return (
        <Container size="xs" mb={20}>
            <Stack spacing="xs">
                <Text size="md" weight={500}>
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
