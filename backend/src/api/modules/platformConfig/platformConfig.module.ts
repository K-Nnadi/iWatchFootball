import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PlatformConfig } from './platformConfig.entity';
import { PlatformConfigService } from './platformConfig.service';
import { PlatformConfigController } from './platformConfig.controller';

@Module({
    imports: [TypeOrmModule.forFeature([PlatformConfig])],
    controllers: [PlatformConfigController],
    providers: [PlatformConfigService],
    exports: [PlatformConfigService],
})
export class PlatformConfigModule {}
