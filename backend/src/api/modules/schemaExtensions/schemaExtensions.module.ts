import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SellerProfile } from '../sellerProfile/sellerProfile.entity';
import { EscrowHold } from '../escrowHold/escrowHold.entity';
import { UserTrustScore } from '../userTrustScore/userTrustScore.entity';
import { MarketplaceTransferDetails } from '../marketplaceTransferDetails/marketplaceTransferDetails.entity';
import { ClubTransferGuide } from '../clubTransferGuide/clubTransferGuide.entity';
import { OfficialInventorySnapshot } from '../officialInventorySnapshot/officialInventorySnapshot.entity';
import { ClubTicketRule } from '../clubTicketRule/clubTicketRule.entity';
import { EntityExternalId } from '../entityExternalId/entityExternalId.entity';
import { EmailDispatchLog } from '../emailDispatchLog/emailDispatchLog.entity';
import { TicketLinkClickDaily } from '../ticketLinkClickDaily/ticketLinkClickDaily.entity';
import { TicketInterestDaily } from '../ticketInterestDaily/ticketInterestDaily.entity';
import { UserDeletionRequest } from '../userDeletionRequest/userDeletionRequest.entity';

/** Registers P4 schema entities with TypeORM (no controllers — wired when product phases activate). */
@Module({
    imports: [
        TypeOrmModule.forFeature([
            SellerProfile,
            EscrowHold,
            UserTrustScore,
            MarketplaceTransferDetails,
            ClubTransferGuide,
            OfficialInventorySnapshot,
            ClubTicketRule,
            EntityExternalId,
            EmailDispatchLog,
            TicketLinkClickDaily,
            TicketInterestDaily,
            UserDeletionRequest,
        ]),
    ],
    exports: [TypeOrmModule],
})
export class SchemaExtensionsModule {}
