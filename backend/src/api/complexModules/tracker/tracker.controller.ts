import {
    Body,
    Get,
    Param,
    ParseIntPipe,
    Patch,
    Post,
    Req,
    UnauthorizedException,
} from '@nestjs/common';
import { ApiBody, ApiOperation, ApiProperty, ApiTags } from '@nestjs/swagger';
import { AuthedController } from '@iWatchFootball/base-tools/decorators/controller.decorator';
import { ArrayMaxSize, ArrayMinSize, IsArray, IsBoolean, IsEnum, IsInt, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { SocialService } from '../../modules/social/social.service';
import { TrackerCompareService, MAX_MULTI_COMPARE_USERS } from './tracker-compare.service';
import { AdvancedStatsFeatureService } from '../../modules/platformConfig/advanced-stats-feature.service';
import { TrackerVisibility } from '../../enums/social.enum';
import type { Request } from 'express';

type AuthedRequest = Request & { user?: { id: number } };

export class UpdateTrackerPrivacyDto {
    @ApiPropertyOptional({ enum: TrackerVisibility })
    @IsOptional()
    @IsEnum(TrackerVisibility)
    trackerVisibility?: TrackerVisibility;

    @ApiPropertyOptional()
    @IsOptional()
    @IsBoolean()
    shareVerifiedOnly?: boolean;
}

export class MultiCompareDto {
    @ApiProperty({ type: [Number], description: 'Array of friend user IDs to compare with' })
    @IsArray()
    @ArrayMinSize(1)
    @ArrayMaxSize(MAX_MULTI_COMPARE_USERS - 1)
    @IsInt({ each: true })
    friendUserIds!: number[];
}

@AuthedController('tracker')
@ApiTags('tracker')
export class TrackerController {
    constructor(
        private readonly socialService: SocialService,
        private readonly compareService: TrackerCompareService,
        private readonly advancedStatsFeature: AdvancedStatsFeatureService,
    ) {}

    @Get('privacy')
    @ApiOperation({ summary: 'Get tracker privacy settings for the current user' })
    async getPrivacy(@Req() req: AuthedRequest) {
        const userId = req.user?.id;
        if (!userId) throw new UnauthorizedException('Not authenticated');
        const user = await this.socialService.assertCanViewTrackerStats(userId, userId);
        return {
            trackerVisibility: user.trackerVisibility ?? TrackerVisibility.PRIVATE,
            shareVerifiedOnly: user.shareVerifiedOnly ?? true,
        };
    }

    @Patch('privacy')
    @ApiOperation({ summary: 'Update tracker privacy settings' })
    @ApiBody({ type: UpdateTrackerPrivacyDto })
    async updatePrivacy(@Req() req: AuthedRequest, @Body() body: UpdateTrackerPrivacyDto) {
        const userId = req.user?.id;
        if (!userId) throw new UnauthorizedException('Not authenticated');
        return this.socialService.updateTrackerPrivacy(userId, body);
    }

    @Get('stats/:userId')
    @ApiOperation({ summary: 'Get aggregate tracker stats for a user (privacy-gated)' })
    async getStats(
        @Req() req: AuthedRequest,
        @Param('userId', ParseIntPipe) targetUserId: number,
    ) {
        const viewerId = req.user?.id;
        if (!viewerId) throw new UnauthorizedException('Not authenticated');
        await this.advancedStatsFeature.assertAttendanceAdvancedStatsEnabled();
        return this.compareService.getStatsForUser(viewerId, targetUserId);
    }

    @Get('compare/:friendUserId')
    @ApiOperation({ summary: 'Compare tracker stats with a friend (premium)' })
    async compare(
        @Req() req: AuthedRequest,
        @Param('friendUserId', ParseIntPipe) friendUserId: number,
    ) {
        const viewerId = req.user?.id;
        if (!viewerId) throw new UnauthorizedException('Not authenticated');
        await this.advancedStatsFeature.assertAttendanceAdvancedStatsEnabled();
        return this.compareService.compare(viewerId, friendUserId);
    }

    @Post('compare-multi')
    @ApiOperation({ summary: 'Compare tracker stats with multiple friends (premium)' })
    @ApiBody({ type: MultiCompareDto })
    async compareMulti(
        @Req() req: AuthedRequest,
        @Body() body: MultiCompareDto,
    ) {
        const viewerId = req.user?.id;
        if (!viewerId) throw new UnauthorizedException('Not authenticated');
        await this.advancedStatsFeature.assertAttendanceAdvancedStatsEnabled();
        return this.compareService.compareMulti(viewerId, body.friendUserIds);
    }
}
