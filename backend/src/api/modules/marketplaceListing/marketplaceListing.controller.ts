import {
    Body,
    Delete,
    Get,
    Param,
    ParseIntPipe,
    Post,
    Query,
    Req,
    Res,
    UnauthorizedException,
    UploadedFile,
    UseGuards,
    UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBody, ApiConsumes, ApiOkResponse, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import type { Response } from 'express';

type UploadedMulterFile = { originalname: string; buffer: Buffer; size: number; mimetype: string };
import { AuthedController } from '@iWatchFootball/base-tools/decorators/controller.decorator';
import { Roles } from '../../../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../../auth/guards/roles.guard';
import { UserRole } from '../../../auth/types/security.types';
import { MarketplaceListingService } from './marketplaceListing.service';
import { CreateListingDto } from './marketplaceListing.dto';
import { MarketplaceEnabledGuard } from '../../complexModules/marketplace/marketplace-enabled.guard';
import type { Request } from 'express';

type AuthedRequest = Request & { user?: { id: number } };

@AuthedController('marketplace')
@ApiTags('marketplace')
@UseGuards(MarketplaceEnabledGuard)
export class MarketplaceListingController {
    constructor(private readonly service: MarketplaceListingService) {}

    @Get('listings')
    @ApiOperation({ summary: 'Browse active marketplace listings' })
    @ApiQuery({ name: 'fixtureId', required: false, type: Number })
    @ApiQuery({ name: 'maxPrice', required: false, type: Number })
    @ApiQuery({
        name: 'team',
        required: false,
        type: String,
        description: 'Filter listings whose fixture involves a team matching this substring (home or away, case-insensitive)',
    })
    @ApiQuery({ name: 'page', required: false, type: Number })
    @ApiOkResponse({
        schema: {
            type: 'object',
            properties: {
                listings: { type: 'array' },
                total: { type: 'number' },
            },
        },
    })
    async getListings(
        @Query('fixtureId') fixtureId?: string,
        @Query('maxPrice') maxPrice?: string,
        @Query('team') team?: string,
        @Query('page') page?: string,
    ) {
        return this.service.getActiveListings({
            fixtureId: fixtureId != null ? parseInt(fixtureId, 10) : undefined,
            maxPrice: maxPrice != null ? parseFloat(maxPrice) : undefined,
            team: team?.trim() || undefined,
            page: page != null ? parseInt(page, 10) : 1,
        });
    }

    @Get('listings/my')
    @ApiOperation({ summary: "Get the authenticated user's own listings" })
    async getMyListings(@Req() req: AuthedRequest) {
        const userId = req.user?.id;
        if (!userId) throw new UnauthorizedException('Not authenticated');
        return this.service.getSellerListings(userId);
    }

    @Get('listings/my-purchases')
    @ApiOperation({ summary: "Get the authenticated user's purchases" })
    async getMyPurchases(@Req() req: AuthedRequest) {
        const userId = req.user?.id;
        if (!userId) throw new UnauthorizedException('Not authenticated');
        return this.service.getBuyerPurchases(userId);
    }

    @Get('listings/pending-review')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    @ApiOperation({ summary: '(Admin) Get all listings pending review' })
    async getPendingReview() {
        return this.service.getPendingReviewListings();
    }

    @Get('listings/:id')
    @ApiOperation({ summary: 'Get a single marketplace listing by id' })
    async getListing(@Param('id', ParseIntPipe) id: number) {
        return this.service.getListing(id);
    }

    @Post('listings')
    @ApiOperation({ summary: 'List an owned ticket for resale' })
    @ApiBody({ type: CreateListingDto })
    async createListing(@Body() dto: CreateListingDto, @Req() req: AuthedRequest) {
        const userId = req.user?.id;
        if (!userId) throw new UnauthorizedException('Not authenticated');
        return this.service.createListing({
            sellerId: userId,
            ticketId: dto.ticketId,
            askPrice: dto.askPrice,
        });
    }

    @Delete('listings/:id')
    @ApiOperation({ summary: 'Cancel an active listing (seller only). Ticket returned to seller.' })
    @ApiOkResponse({ schema: { type: 'object', properties: { ok: { type: 'boolean' } } } })
    async cancelListing(@Param('id', ParseIntPipe) id: number, @Req() req: AuthedRequest) {
        const userId = req.user?.id;
        if (!userId) throw new UnauthorizedException('Not authenticated');
        await this.service.cancelListing(id, userId);
        return { ok: true };
    }

    // ─── Phase 4 state machine endpoints ──────────────────────────────────────

    @Post('listings/:id/submit')
    @ApiOperation({ summary: 'Submit listing for admin review (DRAFT → PENDING_REVIEW)' })
    async submitForReview(@Param('id', ParseIntPipe) id: number, @Req() req: AuthedRequest) {
        const userId = req.user?.id;
        if (!userId) throw new UnauthorizedException();
        return this.service.submitForReview(id, userId);
    }

    @Post('listings/:id/approve')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    @ApiOperation({ summary: '(Admin) Approve a pending listing (PENDING_REVIEW → ACTIVE)' })
    async approveListing(@Param('id', ParseIntPipe) id: number) {
        return this.service.adminApproveListing(id);
    }

    @Post('listings/:id/reject')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    @ApiOperation({ summary: '(Admin) Reject a pending listing with a reason' })
    @ApiBody({ schema: { type: 'object', properties: { reason: { type: 'string' } }, required: ['reason'] } })
    async rejectListing(@Param('id', ParseIntPipe) id: number, @Body('reason') reason: string) {
        return this.service.adminRejectListing(id, reason);
    }

    @Post('listings/:id/upload-proof')
    @UseInterceptors(FileInterceptor('file'))
    @ApiConsumes('multipart/form-data')
    @ApiBody({ schema: { type: 'object', properties: { file: { type: 'string', format: 'binary' } } } })
    @ApiOperation({ summary: 'Upload proof of ticket ownership (seller only, admin-reviewable)' })
    async uploadProof(
        @Param('id', ParseIntPipe) id: number,
        @Req() req: AuthedRequest,
        @UploadedFile() file: UploadedMulterFile,
    ) {
        const userId = req.user?.id;
        if (!userId) throw new UnauthorizedException();
        await this.service.uploadProofDocument(id, userId, {
            originalname: file.originalname,
            buffer: file.buffer,
            size: file.size,
        });
        return { ok: true };
    }

    @Get('listings/:id/proof')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    @ApiOperation({ summary: '(Admin) Stream the proof document for a listing' })
    async getProof(@Param('id', ParseIntPipe) id: number, @Res() res: Response) {
        const { buffer, ext } = await this.service.getAdminProofDocument(id);
        const typeMap: Record<string, string> = {
            '.pdf': 'application/pdf',
            '.jpg': 'image/jpeg',
            '.jpeg': 'image/jpeg',
            '.png': 'image/png',
        };
        res.setHeader('Content-Type', typeMap[ext] ?? 'application/octet-stream');
        res.setHeader('Cache-Control', 'private, no-store');
        res.send(buffer);
    }

    @Post('listings/:id/request-purchase')
    @ApiOperation({ summary: 'Request to purchase an active listing (buyer)' })
    async requestPurchase(@Param('id', ParseIntPipe) id: number, @Req() req: AuthedRequest) {
        const userId = req.user?.id;
        if (!userId) throw new UnauthorizedException();
        return this.service.requestPurchase(id, userId);
    }

    @Post('listings/:id/confirm-transfer')
    @ApiOperation({ summary: 'Seller confirms they have sent the ticket' })
    async confirmTransfer(@Param('id', ParseIntPipe) id: number, @Req() req: AuthedRequest) {
        const userId = req.user?.id;
        if (!userId) throw new UnauthorizedException();
        return this.service.confirmTransfer(id, userId);
    }

    @Post('listings/:id/confirm-receipt')
    @ApiOperation({ summary: 'Buyer confirms they received the ticket' })
    async confirmReceipt(@Param('id', ParseIntPipe) id: number, @Req() req: AuthedRequest) {
        const userId = req.user?.id;
        if (!userId) throw new UnauthorizedException();
        return this.service.confirmReceipt(id, userId);
    }

    @Post('listings/:id/dispute')
    @ApiOperation({ summary: 'Raise a dispute on a listing (buyer or seller)' })
    @ApiBody({
        schema: {
            type: 'object',
            properties: { reason: { type: 'string' }, details: { type: 'string' } },
            required: ['reason', 'details'],
        },
    })
    async raiseDispute(
        @Param('id', ParseIntPipe) id: number,
        @Req() req: AuthedRequest,
        @Body('reason') reason: string,
        @Body('details') details: string,
    ) {
        const userId = req.user?.id;
        if (!userId) throw new UnauthorizedException();
        return this.service.raiseDispute(id, userId, reason, details);
    }
}
