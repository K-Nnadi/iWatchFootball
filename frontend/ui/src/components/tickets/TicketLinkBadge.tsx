import type { ComponentType } from 'react';
import { Badge } from '@mantine/core';
import { IconShield, IconStar, IconLink, type IconProps } from '@tabler/icons-react';
import type { TicketLinkType } from '../../shared/api/ticketLink.api';

interface TicketLinkBadgeProps {
    linkType: TicketLinkType;
    badgeText?: string;
}

type TablerIcon = ComponentType<IconProps>;

const BADGE_CONFIG: Partial<Record<TicketLinkType, { color: string; icon: TablerIcon }>> = {
    OFFICIAL_CLUB:      { color: 'green', icon: IconShield as TablerIcon },
    COMPETITION:        { color: 'blue',  icon: IconStar as TablerIcon },
    APPROVED_PARTNER:   { color: 'teal',  icon: IconStar as TablerIcon },
    AFFILIATE:          { color: 'gray',  icon: IconLink as TablerIcon },
};

const FALLBACK = { color: 'gray', icon: IconLink as TablerIcon };

export function TicketLinkBadge({ linkType, badgeText }: TicketLinkBadgeProps) {
    if (!badgeText) return null;

    const config = BADGE_CONFIG[linkType] ?? FALLBACK;
    const Icon = config.icon;

    return (
        <Badge
            color={config.color}
            variant="light"
            size="xs"
            leftSection={<Icon size={10} />}
            styles={{ label: { display: 'flex', alignItems: 'center', gap: 2 } }}
        >
            {badgeText}
        </Badge>
    );
}
