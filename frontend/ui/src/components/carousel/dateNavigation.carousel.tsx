import { ActionIcon, Group, Badge, useMantineTheme } from '@mantine/core';
import { IconChevronLeft, IconChevronRight } from '@tabler/icons-react';

interface DateNavProps {
    dates: Date[];
    selectedDateIndex: number;
    setSelectedDateIndex: (index: number) => void;
}

function getDateLabel(d: Date, today: Date): string {
    const startOfDay = (date: Date) => new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const diffInMs = startOfDay(d).getTime() - startOfDay(today).getTime();
    const diffInDays = diffInMs / (24 * 60 * 60 * 1000);

    if (diffInDays === 0) return 'Today';
    if (diffInDays === -1) return 'Yesterday';
    if (diffInDays === 1) return 'Tomorrow';

    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

export function DateNavigation({ dates, selectedDateIndex, setSelectedDateIndex }: DateNavProps) {
    const theme = useMantineTheme();
    const today = new Date();

    const handlePrevDay = () => {
        if (selectedDateIndex > 0) setSelectedDateIndex(selectedDateIndex - 1);
    };

    const handleNextDay = () => {
        if (selectedDateIndex < dates.length - 1) setSelectedDateIndex(selectedDateIndex + 1);
    };

    return (
        <Group align="center" position="center" mb="lg">
            <ActionIcon onClick={handlePrevDay} disabled={selectedDateIndex === 0}>
                <IconChevronLeft size={18} />
            </ActionIcon>
            <Group spacing="xs">
                {dates.map((d, i) => {
                    const isSelected = i === selectedDateIndex;
                    const label = getDateLabel(d, today);
                    return (
                        <Badge
                            key={d.toDateString()}
                            onClick={() => setSelectedDateIndex(i)}
                            style={{
                                cursor: 'pointer',
                                backgroundColor: isSelected ? theme.colors.blue[6] : theme.colors.gray[3],
                                color: isSelected ? 'white' : 'black'
                            }}
                        >
                            {label}
                        </Badge>
                    );
                })}
            </Group>
            <ActionIcon onClick={handleNextDay} disabled={selectedDateIndex === dates.length - 1}>
                <IconChevronRight size={18} />
            </ActionIcon>
        </Group>
    );
}
