import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Public } from '../../../auth/decorators/public.decorator';
import { StadiumProfileService } from './stadium-profile.service';
import type { StadiumProfileResponse } from './stadium-profile.types';

@ApiTags('stadium')
@Controller('stadium')
export class StadiumProfileController {
    constructor(private readonly stadiumProfileService: StadiumProfileService) {}

    @Get(':stadiumId/profile')
    @Public()
    @ApiOperation({ summary: 'Stadium profile with home clubs, fixtures, and Wikipedia lore' })
    @ApiOkResponse({ description: 'Aggregated stadium profile' })
    async getStadiumProfile(
        @Param('stadiumId', ParseIntPipe) stadiumId: number,
    ): Promise<StadiumProfileResponse> {
        return this.stadiumProfileService.getProfile(stadiumId);
    }
}
