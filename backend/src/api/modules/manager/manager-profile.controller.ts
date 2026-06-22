import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Public } from '../../../auth/decorators/public.decorator';
import { ManagerProfileService } from './manager-profile.service';
import type { ManagerProfileResponse } from './manager-profile.types';

@ApiTags('manager')
@Controller('manager')
export class ManagerProfileController {
    constructor(private readonly managerProfileService: ManagerProfileService) {}

    @Get(':managerId/profile')
    @Public()
    @ApiOperation({ summary: 'Manager profile with career clubs and current team' })
    @ApiOkResponse({ description: 'Aggregated manager profile' })
    async getManagerProfile(
        @Param('managerId', ParseIntPipe) managerId: number,
    ): Promise<ManagerProfileResponse> {
        return this.managerProfileService.getProfile(managerId);
    }
}
