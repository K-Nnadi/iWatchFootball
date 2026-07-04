import { useState } from 'react';
import { Badge, Box, Group, Stack, Text, UnstyledButton } from '@mantine/core';
import {
    IconArrowUpRight,
    IconShield,
    IconStar,
    IconLink,
    IconTicket,
    IconTrain,
    IconParking,
    IconBed,
    IconShirt,
    IconBuilding,
    IconUsers,
    IconRefresh,
} from '@tabler/icons-react';
import type { TicketLinkType } from '../../shared/api/ticketLink.api';

type IconComponent = typeof IconShield;

export const TYPE_META: Record<TicketLinkType, { icon: IconComponent; accent: string }> = {
    OFFICIAL_CLUB:      { icon: IconShield,   accent: '#00c853' },
    COMPETITION:        { icon: IconStar,     accent: '#4dabf7' },
    AWAY_FANS:          { icon: IconUsers,    accent: '#a9e34b' },
    TICKET_EXCHANGE:    { icon: IconRefresh,  accent: '#ffa94d' },
    HOSPITALITY:        { icon: IconStar,     accent: '#cc5de8' },
    HOSPITALITY_PARTNER:{ icon: IconStar,     accent: '#be4bdb' },
    MEMBERSHIP:         { icon: IconShield,   accent: '#74c0fc' },
    TRAVEL:             { icon: IconTrain,    accent: '#66d9e8' },
    PARKING:            { icon: IconParking,  accent: '#ffd43b' },
    HOTEL:              { icon: IconBed,      accent: '#da77f2' },
    MERCHANDISE:        { icon: IconShirt,    accent: '#ff8787' },
    STADIUM_TOUR:       { icon: IconBuilding, accent: '#63e6be' },
    APPROVED_PARTNER:   { icon: IconStar,     accent: '#38d9a9' },
    AFFILIATE:          { icon: IconLink,     accent: '#868e96' },
};

interface TicketCardProps {
    label: string;
    badgeText?: string;
    linkType: TicketLinkType;
    isSponsored?: boolean;
    onClick: () => void;
}

export function TicketCard({ label, badgeText, linkType, isSponsored, onClick }: TicketCardProps) {
    const [hovered, setHovered] = useState(false);
    const meta = TYPE_META[linkType] ?? TYPE_META.AFFILIATE;
    const Icon = meta.icon;
    const accent = meta.accent;

    return (
        <UnstyledButton
            onClick={onClick}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.75rem 1rem',
                background: hovered ? 'var(--ui-bg-hover)' : 'var(--ui-bg-elevated)',
                border: `1px solid ${hovered ? accent : 'var(--ui-border-strong)'}`,
                borderRadius: 'var(--ui-radius-md)',
                transition: 'all 0.18s ease',
                cursor: 'pointer',
                boxShadow: hovered
                    ? `0 0 0 1px ${accent}22, 0 4px 16px rgba(0,0,0,0.3)`
                    : '0 2px 8px rgba(0,0,0,0.2)',
                minWidth: 0,
            }}
        >
            <Box
                style={{
                    width: 36,
                    height: 36,
                    borderRadius: 'var(--ui-radius-sm)',
                    background: `${accent}18`,
                    border: `1px solid ${accent}33`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                }}
            >
                <IconTicket size={17} style={{ color: accent }} />
            </Box>

            <Stack gap={1} style={{ flex: 1, minWidth: 0 }}>
                <Text
                    size="sm"
                    fw={600}
                    style={{
                        color: 'var(--ui-text-primary)',
                        lineHeight: 1.3,
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                    }}
                >
                    {label}
                </Text>
                <Group gap={4} align="center" wrap="nowrap">
                    {badgeText && (
                        <>
                            <Icon size={10} style={{ color: accent, flexShrink: 0 }} />
                            <Text size="xs" style={{ color: accent, fontWeight: 500, lineHeight: 1 }}>
                                {badgeText}
                            </Text>
                        </>
                    )}
                    {isSponsored && (
                        <Badge size="xs" color="yellow" variant="light" style={{ fontSize: '0.6rem' }}>
                            Sponsored
                        </Badge>
                    )}
                </Group>
            </Stack>

            <Box
                style={{
                    flexShrink: 0,
                    opacity: hovered ? 1 : 0.4,
                    transition: 'opacity 0.18s ease, transform 0.18s ease',
                    transform: hovered ? 'translate(1px, -1px)' : 'none',
                }}
            >
                <IconArrowUpRight size={16} style={{ color: 'var(--ui-text-secondary)' }} />
            </Box>
        </UnstyledButton>
    );
}
