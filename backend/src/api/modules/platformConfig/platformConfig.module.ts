import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PlatformConfig } from './platformConfig.entity';
import { PlatformConfigService } from './platformConfig.service';

@Module({
    imports: [TypeOrmModule.forFeature([PlatformConfig])],
    providers: [PlatformConfigService],
    exports: [PlatformConfigService],
})
export class PlatformConfigModule {}
