import {
    Body,
    Delete,
    Get,
    Param,
    ParseIntPipe,
    Post,
    Query,
    Req,
    UnauthorizedException,
    BadRequestException,
    NotFoundException,
} from '@nestjs/common';
import { ApiBody, ApiOkResponse, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { AuthedController } from '@iWatchFootball/base-tools/decorators/controller.decorator';
import { IsInt, IsOptional, IsString, MinLength } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { SocialService, FriendsListResponse, PublicUserSummary } from './social.service';
import type { Request } from 'express';

type AuthedRequest = Request & { user?: { id: number } };

export class SendFriendRequestDto {
    @ApiPropertyOptional()
    @IsOptional()
    @IsInt()
    userId?: number;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    @MinLength(2)
    userName?: string;
}

@AuthedController('social')
@ApiTags('social')
export class SocialController {
    constructor(private readonly socialService: SocialService) {}

    @Get('friends')
    @ApiOperation({ summary: 'List accepted friends and pending requests' })
    async listFriends(@Req() req: AuthedRequest): Promise<FriendsListResponse> {
        const userId = req.user?.id;
        if (!userId) throw new UnauthorizedException('Not authenticated');
        return this.socialService.listFriends(userId);
    }

    @Get('users/search')
    @ApiOperation({ summary: 'Search users by username or name (for adding friends)' })
    @ApiQuery({ name: 'q', required: true, type: String })
    @ApiOkResponse({ description: 'Public user summaries (no email)' })
    async searchUsers(
        @Req() req: AuthedRequest,
        @Query('q') q: string,
    ): Promise<PublicUserSummary[]> {
        const userId = req.user?.id;
        if (!userId) throw new UnauthorizedException('Not authenticated');
        return this.socialService.searchUsers(q ?? '', userId);
    }

    @Post('friends/request')
    @ApiOperation({ summary: 'Send a friend request' })
    @ApiBody({ type: SendFriendRequestDto })
    async sendRequest(@Req() req: AuthedRequest, @Body() body: SendFriendRequestDto) {
        const userId = req.user?.id;
        if (!userId) throw new UnauthorizedException('Not authenticated');

        let targetUserId = body.userId;
        if (!targetUserId && body.userName) {
            const matches = await this.socialService.searchUsers(body.userName, userId, 5);
            const exact = matches.find(
                (u) => u.userName.toLowerCase() === body.userName!.toLowerCase(),
            );
            if (!exact) {
                throw new NotFoundException('User not found');
            }
            targetUserId = exact.id;
        }
        if (!targetUserId) {
            throw new BadRequestException('userId or userName is required');
        }

        const connection = await this.socialService.sendFriendRequest(userId, targetUserId);
        return { connectionId: connection.id, status: connection.status };
    }

    @Post('friends/:connectionId/accept')
    @ApiOperation({ summary: 'Accept an incoming friend request' })
    async accept(@Req() req: AuthedRequest, @Param('connectionId', ParseIntPipe) connectionId: number) {
        const userId = req.user?.id;
        if (!userId) throw new UnauthorizedException('Not authenticated');
        const connection = await this.socialService.acceptFriendRequest(userId, connectionId);
        return { connectionId: connection.id, status: connection.status };
    }

    @Post('friends/:connectionId/decline')
    @ApiOperation({ summary: 'Decline an incoming friend request' })
    async decline(@Req() req: AuthedRequest, @Param('connectionId', ParseIntPipe) connectionId: number) {
        const userId = req.user?.id;
        if (!userId) throw new UnauthorizedException('Not authenticated');
        await this.socialService.declineFriendRequest(userId, connectionId);
        return { ok: true };
    }

    @Delete('friends/:connectionId')
    @ApiOperation({ summary: 'Remove an accepted friend' })
    async remove(@Req() req: AuthedRequest, @Param('connectionId', ParseIntPipe) connectionId: number) {
        const userId = req.user?.id;
        if (!userId) throw new UnauthorizedException('Not authenticated');
        await this.socialService.removeFriend(userId, connectionId);
        return { ok: true };
    }
}
