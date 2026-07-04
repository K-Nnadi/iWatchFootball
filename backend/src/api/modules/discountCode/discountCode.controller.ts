import {
    Body,
    Get,
    Param,
    ParseIntPipe,
    ParseFloatPipe,
    Post,
    Patch,
    Query,
    Req,
    UnauthorizedException,
} from '@nestjs/common';
import { ApiBody, ApiOkResponse, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { AuthedController } from '@iWatchFootball/base-tools/decorators/controller.decorator';
import { DiscountCodeService, CreateDiscountCodeDto } from './discountCode.service';
import { DiscountType } from './discountCode.entity';
import type { Request } from 'express';

type AuthedRequest = Request & { user?: { id: number; type?: string } };

@AuthedController('discount-code')
@ApiTags('discount-code')
export class DiscountCodeController {
    constructor(private readonly service: DiscountCodeService) {}

    @Get('validate/:code')
    @ApiOperation({ summary: 'Validate a discount code for current user & order total' })
    @ApiQuery({ name: 'orderTotal', required: true, type: Number })
    async validate(
        @Param('code') code: string,
        @Query('orderTotal', ParseFloatPipe) orderTotal: number,
        @Req() req: AuthedRequest,
    ) {
        const userId = req.user?.id;
        if (!userId) throw new UnauthorizedException();
        return this.service.validate(code, orderTotal, userId);
    }

    @Get()
    @ApiOperation({ summary: 'Admin: list all discount codes' })
    async findAll(@Req() req: AuthedRequest) {
        if (req.user?.type !== 'ADMIN') throw new UnauthorizedException('Admin only');
        return this.service.findAll();
    }

    @Post()
    @ApiOperation({ summary: 'Admin: create a discount code' })
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                code: { type: 'string' },
                type: { type: 'string', enum: Object.values(DiscountType) },
                value: { type: 'number' },
                maxUsesPerUser: { type: 'number' },
                expiresAt: { type: 'string', format: 'date-time' },
            },
            required: ['code', 'type', 'value'],
        },
    })
    async create(@Body() dto: CreateDiscountCodeDto, @Req() req: AuthedRequest) {
        if (req.user?.type !== 'ADMIN') throw new UnauthorizedException('Admin only');
        return this.service.create(dto);
    }

    @Patch(':id/toggle')
    @ApiOperation({ summary: 'Admin: toggle a discount code active/inactive' })
    async toggle(@Param('id', ParseIntPipe) id: number, @Req() req: AuthedRequest) {
        if (req.user?.type !== 'ADMIN') throw new UnauthorizedException('Admin only');
        return this.service.toggleActive(id);
    }
}
