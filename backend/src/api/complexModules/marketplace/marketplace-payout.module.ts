import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SellerProfile } from '../../modules/sellerProfile/sellerProfile.entity';
import { EscrowHold } from '../../modules/escrowHold/escrowHold.entity';
import { MarketplaceTransaction } from '../../modules/marketplaceListing/marketplaceTransaction.entity';
import { MarketplaceListing } from '../../modules/marketplaceListing/marketplaceListing.entity';
import { UserModule } from '../../modules/user/user.module';
import { PlatformConfigModule } from '../../modules/platformConfig/platformConfig.module';
import { PaymentsIntegrationModule } from '../../integrations/payments/payments-integration.module';
import { MarketplaceFeatureModule } from './marketplace-feature.module';
import { FeeService } from './fee.service';
import { SellerConnectService } from './seller-connect.service';
import { SellerConnectController } from './seller-connect.controller';
import { EscrowService } from './escrow.service';

@Module({
    imports: [
        MarketplaceFeatureModule,
        PlatformConfigModule,
        PaymentsIntegrationModule,
        UserModule,
        TypeOrmModule.forFeature([
            SellerProfile,
            EscrowHold,
            MarketplaceTransaction,
            MarketplaceListing,
        ]),
    ],
    controllers: [SellerConnectController],
    providers: [FeeService, SellerConnectService, EscrowService],
    exports: [FeeService, SellerConnectService, EscrowService],
})
export class MarketplacePayoutModule {}
