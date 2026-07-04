import {
    Body,
    Delete,
    Get,
    HttpCode,
    HttpStatus,
    Param,
    ParseIntPipe,
    Post,
    Req,
    Res,
    UnauthorizedException,
    UploadedFile,
    UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBody, ApiConsumes, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { Response } from 'express';

type UploadedMulterFile = { originalname: string; buffer: Buffer; mimetype: string; size: number };
import { AuthedController } from '@iWatchFootball/base-tools/decorators/controller.decorator';
import { Public } from '../../../auth/decorators/public.decorator';
import { AttendanceService } from './attendanceRecord.service';
import {
    AttendanceCountResponseDto,
    AttendanceResponseDto,
    UpsertAttendanceDto,
} from './attendanceRecord.dto';
import { AttendanceTrackingFeatureService } from '../../complexModules/attendanceTracking/attendance-tracking-feature.service';
import type { Request } from 'express';

const MIME_TO_CONTENT_TYPE: Record<string, string> = {
    '.pdf': 'application/pdf',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.heic': 'image/heic',
    '.heif': 'image/heic',
};

type AuthedRequest = Request & { user?: { id: number } };

@AuthedController('attendance')
@ApiTags('attendance')
export class AttendanceController {
    constructor(
        private readonly service: AttendanceService,
        private readonly featureService: AttendanceTrackingFeatureService,
    ) {}

    @Post()
    @ApiOperation({ summary: 'Create or update an attendance declaration for a fixture' })
    @ApiBody({ type: UpsertAttendanceDto })
    @ApiOkResponse({ type: AttendanceResponseDto })
    async upsert(@Body() dto: UpsertAttendanceDto, @Req() req: AuthedRequest): Promise<AttendanceResponseDto> {
        await this.featureService.assertEnabled();
        const userId = req.user?.id;
        if (!userId) throw new UnauthorizedException();
        return this.service.upsert(userId, dto);
    }

    @Get('my')
    @ApiOperation({ summary: "Get the authenticated user's attendance records" })
    @ApiOkResponse({ type: [AttendanceResponseDto] })
    async getMyAttendance(@Req() req: AuthedRequest): Promise<AttendanceResponseDto[]> {
        const userId = req.user?.id;
        if (!userId) throw new UnauthorizedException();
        return this.service.getMyAttendance(userId);
    }

    @Get(':fixtureId/count')
    @Public()
    @ApiOperation({ summary: 'Get aggregate attendance count for a fixture (public, no user data)' })
    @ApiOkResponse({ type: AttendanceCountResponseDto })
    async getCount(@Param('fixtureId', ParseIntPipe) fixtureId: number): Promise<AttendanceCountResponseDto> {
        return this.service.getCount(fixtureId);
    }

    @Delete(':id')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Cancel attendance for a fixture' })
    @ApiOkResponse({ schema: { type: 'object', properties: { ok: { type: 'boolean' } } } })
    async cancel(@Param('id', ParseIntPipe) id: number, @Req() req: AuthedRequest) {
        await this.featureService.assertEnabled();
        const userId = req.user?.id;
        if (!userId) throw new UnauthorizedException();
        await this.service.cancel(id, userId);
        return { ok: true };
    }

    @Post(':id/upload')
    @UseInterceptors(FileInterceptor('file'))
    @ApiConsumes('multipart/form-data')
    @ApiBody({
        schema: {
            type: 'object',
            properties: { file: { type: 'string', format: 'binary' } },
        },
    })
    @ApiOperation({ summary: 'Upload a private ticket document (PDF or image, max 10 MB, owner only)' })
    @ApiOkResponse({ type: AttendanceResponseDto })
    async uploadDocument(
        @Param('id', ParseIntPipe) id: number,
        @Req() req: AuthedRequest,
        @UploadedFile() file: UploadedMulterFile,
    ): Promise<AttendanceResponseDto> {
        await this.featureService.assertEnabled();
        await this.featureService.assertDocumentUploadEnabled();
        const userId = req.user?.id;
        if (!userId) throw new UnauthorizedException();
        return this.service.uploadDocument(id, userId, {
            originalname: file.originalname,
            buffer: file.buffer,
            mimetype: file.mimetype,
            size: file.size,
        });
    }

    @Get(':id/document')
    @ApiOperation({ summary: 'Stream the private ticket document for own attendance record (owner only)' })
    async getDocument(
        @Param('id', ParseIntPipe) id: number,
        @Req() req: AuthedRequest,
        @Res() res: Response,
    ): Promise<void> {
        const userId = req.user?.id;
        if (!userId) throw new UnauthorizedException();
        const { buffer, ext } = await this.service.getDocumentBuffer(id, userId);
        const contentType = MIME_TO_CONTENT_TYPE[ext] ?? 'application/octet-stream';
        res.setHeader('Content-Type', contentType);
        res.setHeader('Content-Disposition', `inline; filename="ticket${ext}"`);
        res.setHeader('Cache-Control', 'private, no-store');
        res.send(buffer);
    }
}
