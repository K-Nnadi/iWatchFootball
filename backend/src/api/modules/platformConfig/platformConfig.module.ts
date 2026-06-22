import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PlatformConfig } from './platformConfig.entity';
import { PlatformConfigService } from './platformConfig.service';
import { PlatformConfigController } from './platformConfig.controller';
import { AdvancedStatsFeatureService } from './advanced-stats-feature.service';

@Module({
    imports: [TypeOrmModule.forFeature([PlatformConfig])],
    controllers: [PlatformConfigController],
    providers: [PlatformConfigService, AdvancedStatsFeatureService],
    exports: [PlatformConfigService, AdvancedStatsFeatureService],
})
export class PlatformConfigModule {}
