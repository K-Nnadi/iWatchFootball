import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DiscountCode } from './discountCode.entity';
import { DiscountCodeUsage } from './discountCodeUsage.entity';
import { DiscountCodeService } from './discountCode.service';
import { DiscountCodeController } from './discountCode.controller';

@Module({
    imports: [TypeOrmModule.forFeature([DiscountCode, DiscountCodeUsage])],
    providers: [DiscountCodeService],
    controllers: [DiscountCodeController],
    exports: [DiscountCodeService],
})
export class DiscountCodeModule {}
