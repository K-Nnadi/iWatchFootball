import { Badge } from '@mantine/core';
import { IconShield, IconStar, IconLink } from '@tabler/icons-react';
import type { TicketLinkType } from '../../shared/api/ticketLink.api';

interface TicketLinkBadgeProps {
    linkType: TicketLinkType;
    badgeText?: string;
}

const BADGE_CONFIG: Record<TicketLinkType, { color: string; icon: React.FC<{ size: number }> }> = {
    OFFICIAL_CLUB: { color: 'green', icon: IconShield },
    COMPETITION: { color: 'blue', icon: IconStar },
    APPROVED_PARTNER: { color: 'teal', icon: IconStar },
    AFFILIATE: { color: 'gray', icon: IconLink },
};

export function TicketLinkBadge({ linkType, badgeText }: TicketLinkBadgeProps) {
    if (!badgeText) return null;

    const config = BADGE_CONFIG[linkType] ?? BADGE_CONFIG.AFFILIATE;
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
