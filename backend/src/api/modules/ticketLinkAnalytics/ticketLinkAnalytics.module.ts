import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AnalyticsEvent } from '../analyticsEvent/analyticsEvent.entity';
import { TicketLinkClick } from '../ticketLink/ticketLinkClick.entity';
import { TicketLink } from '../ticketLink/ticketLink.entity';
import { AffiliateConversion } from '../affiliateConversion/affiliateConversion.entity';
import { TicketLinkAnalyticsController } from './ticketLinkAnalytics.controller';
import { TicketLinkAnalyticsService } from './ticketLinkAnalytics.service';

@Module({
    imports: [TypeOrmModule.forFeature([TicketLinkClick, TicketLink, AffiliateConversion, AnalyticsEvent])],
    controllers: [TicketLinkAnalyticsController],
    providers: [TicketLinkAnalyticsService],
})
export class TicketLinkAnalyticsModule {}
