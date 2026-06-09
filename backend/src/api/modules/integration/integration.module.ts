import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CreateIntegrationDTO, Integration } from './integration.entity';
import { IntegrationService } from './integration.service';
import { CrudController } from '@iWatchFootball/base-tools/crud/crud.controller';
import { AuthedController } from '@iWatchFootball/base-tools/decorators/controller.decorator';

@AuthedController('integration')
export class IntegrationController extends CrudController<Integration, CreateIntegrationDTO>(
    Integration,
    CreateIntegrationDTO,
) {
    constructor(private readonly service: IntegrationService) {
        super(service);
    }
}

@Module({
    imports: [TypeOrmModule.forFeature([Integration])],
    controllers: [IntegrationController],
    providers: [IntegrationService],
    exports: [IntegrationService],
})
export class IntegrationModule {}
