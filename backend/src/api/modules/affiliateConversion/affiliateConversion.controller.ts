import { Body, Get, HttpCode, HttpStatus, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBody, ApiOkResponse, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { IsInt, IsNumber, IsOptional, IsString, MaxLength, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AuthedController } from '@iWatchFootball/base-tools/decorators/controller.decorator';
import { Public } from '../../../auth/decorators/public.decorator';
import { JwtAuthGuard } from '../../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../../auth/guards/roles.guard';
import { Roles } from '../../../auth/decorators/roles.decorator';
import { UserRole } from '../../../auth/types/security.types';
import { AffiliateConversionService } from './affiliateConversion.service';

/** Body accepted by the public postback endpoint. */
class AffiliatePostbackDto {
    @IsInt()
    @Type(() => Number)
    @ApiProperty({ description: 'ID of the ticket link that generated this conversion' })
    ticketLinkId!: number;

    @IsString()
    @MaxLength(100)
    @ApiProperty({ description: 'Affiliate network identifier, e.g. "Awin"' })
    network!: string;

    @IsOptional()
    @IsString()
    @MaxLength(255)
    @ApiPropertyOptional()
    orderId?: string;

    @IsOptional()
    @IsNumber()
    @Min(0)
    @Type(() => Number)
    @ApiPropertyOptional()
    commissionAmount?: number;

    @IsOptional()
    @IsString()
    @MaxLength(10)
    @ApiPropertyOptional()
    currency?: string;
}

@AuthedController('affiliate')
@ApiTags('affiliate')
export class AffiliateConversionController {
    constructor(private readonly service: AffiliateConversionService) {}

    /**
     * Postback endpoint called by affiliate networks to notify us of a conversion.
     * Accept both GET (query-string based networks like Awin) and POST (JSON body).
     */
    @Post('postback')
    @Public()
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Affiliate network postback — record a conversion' })
    @ApiBody({ type: AffiliatePostbackDto })
    @ApiOkResponse({ schema: { type: 'object', properties: { ok: { type: 'boolean' } } } })
    async postback(@Body() dto: AffiliatePostbackDto) {
        await this.service.record({
            ticketLinkId: dto.ticketLinkId,
            network: dto.network,
            orderId: dto.orderId,
            commissionAmount: dto.commissionAmount,
            currency: dto.currency,
            raw: dto as unknown as Record<string, unknown>,
        });
        return { ok: true };
    }

    @Get('postback')
    @Public()
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Affiliate network postback (GET variant for networks that use query strings)' })
    @ApiQuery({ name: 'ticketLinkId', required: true, type: Number })
    @ApiQuery({ name: 'network', required: true })
    @ApiQuery({ name: 'orderId', required: false })
    @ApiQuery({ name: 'commissionAmount', required: false, type: Number })
    @ApiQuery({ name: 'currency', required: false })
    @ApiOkResponse({ schema: { type: 'object', properties: { ok: { type: 'boolean' } } } })
    async postbackGet(
        @Query('ticketLinkId') ticketLinkId: string,
        @Query('network') network: string,
        @Query('orderId') orderId?: string,
        @Query('commissionAmount') commissionAmount?: string,
        @Query('currency') currency?: string,
    ) {
        await this.service.record({
            ticketLinkId: parseInt(ticketLinkId, 10),
            network,
            orderId,
            commissionAmount: commissionAmount ? parseFloat(commissionAmount) : undefined,
            currency,
            raw: { ticketLinkId, network, orderId, commissionAmount, currency },
        });
        return { ok: true };
    }

    @Get('conversions')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    @ApiOperation({ summary: '(Admin) List recent affiliate conversions' })
    async listRecent() {
        return this.service.listRecent();
    }
}
