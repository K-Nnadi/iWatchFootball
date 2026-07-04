import {
    Body,
    Delete,
    Get,
    Param,
    ParseIntPipe,
    Patch,
    Post,
    UseGuards,
} from '@nestjs/common';
import { ApiBody, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthedController } from '@iWatchFootball/base-tools/decorators/controller.decorator';
import { JwtAuthGuard } from '../../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../../auth/guards/roles.guard';
import { Roles } from '../../../auth/decorators/roles.decorator';
import { UserRole } from '../../../auth/types/security.types';
import { AffiliatePartnerService } from './affiliatePartner.service';
import {
    AffiliatePartnerResponseDto,
    CreateAffiliatePartnerDto,
    UpdateAffiliatePartnerDto,
} from './affiliatePartner.dto';

@AuthedController('admin/affiliate-partners')
@ApiTags('admin/affiliate-partners')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class AffiliatePartnerController {
    constructor(private readonly service: AffiliatePartnerService) {}

    @Get()
    @ApiOperation({ summary: '(Admin) List all affiliate partners' })
    @ApiOkResponse({ type: [AffiliatePartnerResponseDto] })
    async findAll(): Promise<AffiliatePartnerResponseDto[]> {
        return this.service.findAll();
    }

    @Get(':id')
    @ApiOperation({ summary: '(Admin) Get a single affiliate partner' })
    @ApiOkResponse({ type: AffiliatePartnerResponseDto })
    async findOne(@Param('id', ParseIntPipe) id: number): Promise<AffiliatePartnerResponseDto> {
        return this.service.findOne(id);
    }

    @Post()
    @ApiOperation({ summary: '(Admin) Create an affiliate partner' })
    @ApiBody({ type: CreateAffiliatePartnerDto })
    @ApiOkResponse({ type: AffiliatePartnerResponseDto })
    async create(@Body() dto: CreateAffiliatePartnerDto): Promise<AffiliatePartnerResponseDto> {
        return this.service.create(dto);
    }

    @Patch(':id')
    @ApiOperation({ summary: '(Admin) Update an affiliate partner' })
    @ApiBody({ type: UpdateAffiliatePartnerDto })
    @ApiOkResponse({ type: AffiliatePartnerResponseDto })
    async update(
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: UpdateAffiliatePartnerDto,
    ): Promise<AffiliatePartnerResponseDto> {
        return this.service.update(id, dto);
    }

    @Delete(':id')
    @ApiOperation({ summary: '(Admin) Delete an affiliate partner' })
    @ApiOkResponse({ schema: { type: 'object', properties: { ok: { type: 'boolean' } } } })
    async remove(@Param('id', ParseIntPipe) id: number): Promise<{ ok: boolean }> {
        await this.service.remove(id);
        return { ok: true };
    }
}
