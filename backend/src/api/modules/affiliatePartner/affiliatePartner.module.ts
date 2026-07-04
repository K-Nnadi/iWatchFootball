import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AffiliatePartner } from './affiliatePartner.entity';
import { AffiliatePartnerController } from './affiliatePartner.controller';
import { AffiliatePartnerService } from './affiliatePartner.service';

@Module({
    imports: [TypeOrmModule.forFeature([AffiliatePartner])],
    controllers: [AffiliatePartnerController],
    providers: [AffiliatePartnerService],
    exports: [AffiliatePartnerService],
})
export class AffiliatePartnerModule {}
