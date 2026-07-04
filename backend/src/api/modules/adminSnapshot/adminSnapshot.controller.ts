import { Get } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthedController } from '@iWatchFootball/base-tools/decorators/controller.decorator';
import { Roles } from '../../../auth/decorators/roles.decorator';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../../auth/guards/roles.guard';
import { UserRole } from '../../../auth/types/security.types';
import { AdminSnapshotService, type AdminSnapshotDto } from './adminSnapshot.service';

@AuthedController('admin/snapshot')
@ApiTags('admin-snapshot')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class AdminSnapshotController {
    constructor(private readonly service: AdminSnapshotService) {}

    @Get()
    @ApiOperation({ summary: 'Admin dashboard — extended DB snapshot across all feature areas' })
    @ApiOkResponse({ description: 'Snapshot counts grouped by domain' })
    async getSnapshot(): Promise<AdminSnapshotDto> {
        return this.service.getSnapshot();
    }
}
