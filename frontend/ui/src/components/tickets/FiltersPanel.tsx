import React, { useState, useEffect } from 'react';
import {
    Paper,
    Group,
    Text,
    RangeSlider,
    NumberInput,
    Select,
    Button,
    Grid,
    ActionIcon,
    Collapse,
    Stack,
    useMantineColorScheme,
} from '@mantine/core';
import { IconChevronDown, IconChevronUp } from '@tabler/icons-react';

export interface TicketFilters {
    priceRange: [number, number];
    ticketType: string | null;
    blockLocation: string | null;
    quantity: string | null;
    splitType: string | null;
    fanSide: string | null;
}

interface FiltersPanelProps {
    filters: TicketFilters;
    onFiltersChange: (filters: Partial<TicketFilters>) => void;
    onReset: () => void;
    availableBlocks: string[];
    minPrice: number;
    maxPrice: number;
    isOpen: boolean;
    onToggle: () => void;
}

const TICKET_TYPES = ['Single Seats', 'Up To 2 Seats Together', 'Up To 4 Seats Together'] as const;
const QUANTITIES = ['1', '2', '3', '4'] as const;
const SPLIT_TYPES = ['Together', 'Split'] as const;
const FAN_SIDES = ['Home', 'Away', 'Neutral'] as const;

export function FiltersPanel({
    filters,
    onFiltersChange,
    onReset,
    availableBlocks,
    minPrice,
    maxPrice,
    isOpen,
    onToggle,
}: FiltersPanelProps) {
    const { colorScheme } = useMantineColorScheme();
    const isDark = colorScheme === 'dark';
    const [localMinPrice, setLocalMinPrice] = useState<number>(filters.priceRange[0]);
    const [localMaxPrice, setLocalMaxPrice] = useState<number>(filters.priceRange[1]);

    // Sync local state with filters prop
    useEffect(() => {
        setLocalMinPrice(filters.priceRange[0]);
        setLocalMaxPrice(filters.priceRange[1]);
    }, [filters.priceRange]);

    const handleRangeChange = (value: [number, number]) => {
        setLocalMinPrice(value[0]);
        setLocalMaxPrice(value[1]);
        onFiltersChange({ priceRange: value });
    };

    const handleMinPriceChange = (value: number | string) => {
        const numValue = typeof value === 'string' ? parseFloat(value) || minPrice : value;
        const clampedValue = Math.max(minPrice, Math.min(numValue, localMaxPrice));
        setLocalMinPrice(clampedValue);
        onFiltersChange({ priceRange: [clampedValue, localMaxPrice] });
    };

    const handleMaxPriceChange = (value: number | string) => {
        const numValue = typeof value === 'string' ? parseFloat(value) || maxPrice : value;
        const clampedValue = Math.max(localMinPrice, Math.min(numValue, maxPrice));
        setLocalMaxPrice(clampedValue);
        onFiltersChange({ priceRange: [localMinPrice, clampedValue] });
    };

    return (
        <Paper
            p="md"
            mb="lg"
            style={{
                backgroundColor: isDark ? 'var(--modern-dark-gray)' : 'var(--modern-card-bg)',
                border: isDark 
                    ? '1px solid rgba(255, 255, 255, 0.1)' 
                    : '1px solid var(--modern-border-color)',
                transition: 'background-color 0.3s ease, border-color 0.3s ease',
            }}
        >
            <Group justify="space-between" mb="md">
                <Text size="md" fw={600} style={{ color: 'var(--modern-text-primary)' }}>
                    Filters
                </Text>
                <ActionIcon
                    variant="subtle"
                    onClick={onToggle}
                    style={{ color: 'var(--modern-text-primary)' }}
                    aria-label={isOpen ? 'Collapse filters' : 'Expand filters'}
                >
                    {isOpen ? <IconChevronUp size={20} /> : <IconChevronDown size={20} />}
                </ActionIcon>
            </Group>

            <Collapse in={isOpen}>
                <Grid gutter="md">
                    <Grid.Col span={{ base: 12, sm: 6, md: 2.4 }}>
                        <Stack gap="xs">
                            <Text size="sm" fw={600} style={{ color: 'var(--modern-text-primary)' }}>
                                Price range
                            </Text>
                            <Group gap="xs" align="flex-start">
                                <NumberInput
                                    value={localMinPrice}
                                    onChange={handleMinPriceChange}
                                    min={minPrice}
                                    max={localMaxPrice}
                                    prefix="£"
                                    decimalScale={0}
                                    thousandSeparator=","
                                    allowNegative={false}
                                    styles={{
                                        input: {
                                            backgroundColor: isDark ? 'var(--modern-dark-gray)' : '#ffffff',
                                            color: isDark ? 'var(--modern-white)' : '#000000',
                                            border: isDark 
                                                ? '1px solid rgba(255, 255, 255, 0.2)' 
                                                : '1px solid rgba(0, 0, 0, 0.15)',
                                            borderRadius: '8px',
                                            fontWeight: 500,
                                            fontSize: '14px',
                                            transition: 'all 0.2s ease',
                                            '&:focus': {
                                                borderColor: 'var(--modern-lime)',
                                                boxShadow: '0 0 0 2px rgba(0, 255, 136, 0.1)',
                                            },
                                            '&:hover': {
                                                borderColor: isDark 
                                                    ? 'rgba(255, 255, 255, 0.3)' 
                                                    : 'rgba(0, 0, 0, 0.25)',
                                            },
                                        },
                                    }}
                                    style={{ flex: 1 }}
                                />
                                <NumberInput
                                    value={localMaxPrice}
                                    onChange={handleMaxPriceChange}
                                    min={localMinPrice}
                                    max={maxPrice}
                                    prefix="£"
                                    decimalScale={0}
                                    thousandSeparator=","
                                    allowNegative={false}
                                    styles={{
                                        input: {
                                            backgroundColor: isDark ? 'var(--modern-dark-gray)' : '#ffffff',
                                            color: isDark ? 'var(--modern-white)' : '#000000',
                                            border: isDark 
                                                ? '1px solid rgba(255, 255, 255, 0.2)' 
                                                : '1px solid rgba(0, 0, 0, 0.15)',
                                            borderRadius: '8px',
                                            fontWeight: 500,
                                            fontSize: '14px',
                                            transition: 'all 0.2s ease',
                                            '&:focus': {
                                                borderColor: 'var(--modern-lime)',
                                                boxShadow: '0 0 0 2px rgba(0, 255, 136, 0.1)',
                                            },
                                            '&:hover': {
                                                borderColor: isDark 
                                                    ? 'rgba(255, 255, 255, 0.3)' 
                                                    : 'rgba(0, 0, 0, 0.25)',
                                            },
                                        },
                                    }}
                                    style={{ flex: 1 }}
                                />
                            </Group>
                            <RangeSlider
                                value={[localMinPrice, localMaxPrice]}
                                onChange={handleRangeChange}
                                min={minPrice}
                                max={maxPrice}
                                step={1}
                                label={null}
                                styles={{
                                    track: {
                                        backgroundColor: isDark 
                                            ? 'rgba(255, 255, 255, 0.2)' 
                                            : 'rgba(0, 0, 0, 0.1)',
                                    },
                                    bar: {
                                        backgroundColor: 'var(--modern-lime)',
                                    },
                                    thumb: {
                                        borderColor: 'var(--modern-lime)',
                                        backgroundColor: 'var(--modern-lime)',
                                        width: '16px',
                                        height: '16px',
                                        boxShadow: isDark 
                                            ? '0 2px 4px rgba(0, 0, 0, 0.3)' 
                                            : '0 2px 4px rgba(0, 0, 0, 0.2)',
                                    },
                                    label: {
                                        display: 'none',
                                    },
                                }}
                                aria-label="Price range filter"
                            />
                        </Stack>
                    </Grid.Col>

                    <Grid.Col span={{ base: 12, sm: 6, md: 1.9 }}>
                        <Select
                            label="Ticket Type"
                            placeholder="All"
                            data={TICKET_TYPES}
                            value={filters.ticketType}
                            onChange={(value) => onFiltersChange({ ticketType: value })}
                            clearable
                        />
                    </Grid.Col>

                    <Grid.Col span={{ base: 12, sm: 6, md: 1.9 }}>
                        <Select
                            label="Location"
                            placeholder="All"
                            data={availableBlocks.map((block) => ({ value: block, label: block }))}
                            value={filters.blockLocation}
                            onChange={(value) => onFiltersChange({ blockLocation: value || null })}
                            clearable
                        />
                    </Grid.Col>

                    <Grid.Col span={{ base: 12, sm: 6, md: 1.9 }}>
                        <Select
                            label="Quantity"
                            placeholder="All"
                            data={QUANTITIES}
                            value={filters.quantity}
                            onChange={(value) => onFiltersChange({ quantity: value })}
                            clearable
                        />
                    </Grid.Col>

                    <Grid.Col span={{ base: 12, sm: 6, md: 1.9 }}>
                        <Select
                            label="Split Type"
                            placeholder="All"
                            data={SPLIT_TYPES}
                            value={filters.splitType}
                            onChange={(value) => onFiltersChange({ splitType: value })}
                            clearable
                        />
                    </Grid.Col>

                    <Grid.Col span={{ base: 12, sm: 6, md: 1.9 }}>
                        <Select
                            label="Fan Side"
                            placeholder="All"
                            data={FAN_SIDES}
                            value={filters.fanSide}
                            onChange={(value) => onFiltersChange({ fanSide: value })}
                            clearable
                        />
                    </Grid.Col>

                    <Grid.Col span={{ base: 12, sm: 6, md: 0.5 }}>
                        <Button
                            variant="filled"
                            color="red"
                            fullWidth
                            mt="xl"
                            onClick={onReset}
                        >
                            Reset All
                        </Button>
                    </Grid.Col>
                </Grid>
            </Collapse>
        </Paper>
    );
}

