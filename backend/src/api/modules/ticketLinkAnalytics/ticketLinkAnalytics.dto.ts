import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class TicketLinkAnalyticsSummaryDto {
    @ApiProperty({ description: 'Total clicks across all ticket links' })
    totalClicks!: number;

    @ApiProperty({ description: 'Clicks in the last 7 days' })
    clicksLast7Days!: number;

    @ApiProperty({ description: 'Clicks in the last 30 days' })
    clicksLast30Days!: number;

    @ApiProperty({ description: 'Total affiliate conversions recorded' })
    totalConversions!: number;

    @ApiProperty({ description: 'Total active ticket links' })
    activeLinks!: number;

    @ApiProperty({ description: 'Total affiliate links (active)' })
    affiliateLinks!: number;
}

export class TicketLinkClicksByLinkDto {
    @ApiProperty()
    ticketLinkId!: number;

    @ApiPropertyOptional()
    label?: string;

    @ApiProperty()
    totalClicks!: number;

    @ApiProperty()
    clicksLast7Days!: number;

    @ApiProperty()
    clicksLast30Days!: number;
}

export class TicketLinkClicksByFixtureDto {
    @ApiPropertyOptional({ description: 'Fixture ID (null = team/competition-scoped links)' })
    fixtureId?: number;

    @ApiProperty({ description: 'Total clicks for this fixture' })
    totalClicks!: number;
}
