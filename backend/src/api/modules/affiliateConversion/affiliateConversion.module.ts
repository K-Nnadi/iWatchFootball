import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AffiliateConversion } from './affiliateConversion.entity';
import { AffiliateConversionController } from './affiliateConversion.controller';
import { AffiliateConversionService } from './affiliateConversion.service';

@Module({
    imports: [TypeOrmModule.forFeature([AffiliateConversion])],
    controllers: [AffiliateConversionController],
    providers: [AffiliateConversionService],
    exports: [AffiliateConversionService],
})
export class AffiliateConversionModule {}
