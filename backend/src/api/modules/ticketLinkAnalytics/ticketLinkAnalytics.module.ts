import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TicketLinkClick } from '../ticketLink/ticketLinkClick.entity';
import { TicketLink } from '../ticketLink/ticketLink.entity';
import { AffiliateConversion } from '../affiliateConversion/affiliateConversion.entity';
import { TicketLinkAnalyticsController } from './ticketLinkAnalytics.controller';
import { TicketLinkAnalyticsService } from './ticketLinkAnalytics.service';

@Module({
    imports: [TypeOrmModule.forFeature([TicketLinkClick, TicketLink, AffiliateConversion])],
    controllers: [TicketLinkAnalyticsController],
    providers: [TicketLinkAnalyticsService],
})
export class TicketLinkAnalyticsModule {}
