import { Body, Get, HttpCode, HttpStatus, Param, ParseIntPipe, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBody, ApiOkResponse, ApiOperation, ApiProperty, ApiTags } from '@nestjs/swagger';
import { IsBoolean, IsOptional } from 'class-validator';
import { AuthedController } from '@iWatchFootball/base-tools/decorators/controller.decorator';
import { JwtAuthGuard } from '../../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../../auth/guards/roles.guard';
import { Roles } from '../../../auth/decorators/roles.decorator';
import { UserRole } from '../../../auth/types/security.types';
import { UserAdPreferenceService } from './userAdPreference.service';
import type { Request } from 'express';

type AuthedRequest = Request & { user: { id: number } };

class PatchAdPreferenceDto {
    @IsOptional()
    @IsBoolean()
    @ApiProperty({ description: 'Opt in or out of gambling/betting ad content' })
    showGamblingContent?: boolean;
}

@AuthedController('user/ad-preferences')
@ApiTags('user/ad-preferences')
@UseGuards(JwtAuthGuard)
export class UserAdPreferenceController {
    constructor(private readonly service: UserAdPreferenceService) {}

    @Get()
    @ApiOperation({ summary: 'Get current user ad preferences' })
    async get(@Req() req: AuthedRequest) {
        return this.service.get(req.user.id);
    }

    @Patch()
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Update current user ad preferences' })
    @ApiBody({ type: PatchAdPreferenceDto })
    async update(@Req() req: AuthedRequest, @Body() dto: PatchAdPreferenceDto) {
        return this.service.update(req.user.id, dto);
    }

    @Post(':userId/self-exclude')
    @UseGuards(RolesGuard)
    @Roles(UserRole.ADMIN)
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: '(Admin) Apply self-exclusion for a user' })
    @ApiOkResponse({ schema: { type: 'object', properties: { ok: { type: 'boolean' } } } })
    async selfExclude(@Param('userId', ParseIntPipe) userId: number) {
        await this.service.selfExclude(userId);
        return { ok: true };
    }
}
