import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TicketLink } from './ticketLink.entity';
import { TicketLinkClick } from './ticketLinkClick.entity';
import { TicketLinkService } from './ticketLink.service';
import { TicketLinkController } from './ticketLink.controller';
import { TicketLinksFeatureModule } from '../../complexModules/ticketLinks/ticket-links-feature.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([TicketLink, TicketLinkClick]),
        TicketLinksFeatureModule,
    ],
    controllers: [TicketLinkController],
    providers: [TicketLinkService],
    exports: [TicketLinkService],
})
export class TicketLinkModule {}
