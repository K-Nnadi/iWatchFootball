import {
    ConflictException,
    ForbiddenException,
    Injectable,
    NotFoundException,
    PayloadTooLargeException,
    UnsupportedMediaTypeException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import * as path from 'path';
import * as fs from 'fs';
import * as crypto from 'crypto';
import { AttendanceRecord } from './attendanceRecord.entity';
import {
    AttendanceCountResponseDto,
    AttendanceResponseDto,
    UpsertAttendanceDto,
} from './attendanceRecord.dto';
import { TicketInterestService } from '../ticketInterest/ticketInterest.service';
import { FixtureInvalidationReason } from '../../enums/fixture.enum';

const ALLOWED_MIME_TYPES = new Set([
    'application/pdf',
    'image/jpeg',
    'image/png',
    'image/heic',
    'image/heif',
]);

const MAX_UPLOAD_BYTES = 10 * 1024 * 1024; // 10 MB
const MAX_UPLOADS_PER_RECORD = 3;

/** Abstracts document storage. In production this should delegate to GCS. */
@Injectable()
export class AttendanceStorageService {
    private readonly baseDir: string;

    constructor() {
        this.baseDir = process.env.ATTENDANCE_DOCS_DIR ?? path.join(process.cwd(), 'uploads', 'attendance-docs');
        if (!fs.existsSync(this.baseDir)) {
            fs.mkdirSync(this.baseDir, { recursive: true });
        }
    }

    /** Saves a buffer to disk; returns the relative storage path. */
    async store(userId: number, attendanceId: number, originalName: string, buffer: Buffer): Promise<string> {
        const ext = path.extname(originalName).toLowerCase() || '.bin';
        const filename = `${Date.now()}-${crypto.randomBytes(8).toString('hex')}${ext}`;
        const dir = path.join(this.baseDir, String(userId), String(attendanceId));
        fs.mkdirSync(dir, { recursive: true });
        const fullPath = path.join(dir, filename);
        await fs.promises.writeFile(fullPath, buffer);
        return path.join(String(userId), String(attendanceId), filename);
    }

    /** Reads the file buffer from the stored path. Returns null if not found. */
    async read(storagePath: string): Promise<{ buffer: Buffer; ext: string } | null> {
        const fullPath = path.join(this.baseDir, storagePath);
        if (!fs.existsSync(fullPath)) return null;
        const buffer = await fs.promises.readFile(fullPath);
        return { buffer, ext: path.extname(storagePath).toLowerCase() };
    }

    async delete(storagePath: string): Promise<void> {
        const fullPath = path.join(this.baseDir, storagePath);
        if (fs.existsSync(fullPath)) {
            await fs.promises.unlink(fullPath);
        }
    }
}

@Injectable()
export class AttendanceService {
    constructor(
        @InjectRepository(AttendanceRecord)
        private readonly repo: Repository<AttendanceRecord>,
        private readonly storage: AttendanceStorageService,
        private readonly ticketInterestService: TicketInterestService,
    ) {}

    async upsert(userId: number, dto: UpsertAttendanceDto): Promise<AttendanceResponseDto> {
        // withDeleted: true ensures we also find soft-deleted rows so we can
        // restore them instead of trying to INSERT (which would violate the
        // unique constraint on userId + fixtureId even for cancelled records).
        let record = await this.repo.findOne({
            where: { userId, fixtureId: dto.fixtureId },
            withDeleted: true,
        });

        if (record) {
            const isRestoring = record.deletedAt !== null;
            Object.assign(record, {
                deletedAt: null,
                hasTicket: dto.hasTicket,
                // When restoring a cancelled record treat it as a fresh start —
                // use submitted values only; don't carry over stale seat data.
                seatSection: dto.seatSection ?? (isRestoring ? undefined : record.seatSection),
                seatBlock: dto.seatBlock ?? (isRestoring ? undefined : record.seatBlock),
                seatRow: dto.seatRow ?? (isRestoring ? undefined : record.seatRow),
                seatNumber: dto.seatNumber ?? (isRestoring ? undefined : record.seatNumber),
                ticketProvider: dto.ticketProvider ?? (isRestoring ? undefined : record.ticketProvider),
                purchaseDate: dto.purchaseDate ?? (isRestoring ? undefined : record.purchaseDate),
                notes: dto.notes !== undefined ? dto.notes : (isRestoring ? undefined : record.notes),
                ...(isRestoring && { documentPath: undefined }),
            });
            record = await this.repo.save(record);
        } else {
            record = await this.repo.save(
                this.repo.create({
                    userId,
                    fixtureId: dto.fixtureId,
                    hasTicket: dto.hasTicket,
                    seatSection: dto.seatSection,
                    seatBlock: dto.seatBlock,
                    seatRow: dto.seatRow,
                    seatNumber: dto.seatNumber,
                    ticketProvider: dto.ticketProvider,
                    purchaseDate: dto.purchaseDate,
                    notes: dto.notes,
                }),
            );
        }

        await this.ticketInterestService.autoCancelForFixture(userId, dto.fixtureId);

        return this.toDto(record);
    }

    /**
     * Flag attendance for a postponed/cancelled/suspended fixture. Does not delete the row.
     * Returns user ids whose reason actually changed (for notifications).
     */
    async flagForFixtureLifecycle(
        fixtureId: number,
        reason: FixtureInvalidationReason,
    ): Promise<{ userIds: number[]; flagged: number }> {
        const records = await this.repo.find({ where: { fixtureId } });
        const now = new Date();
        const userIds: number[] = [];

        for (const record of records) {
            if (record.fixtureInvalidationReason === reason) {
                continue;
            }
            record.fixtureInvalidatedAt = now;
            record.fixtureInvalidationReason = reason;
            await this.repo.save(record);
            userIds.push(record.userId);
        }

        return { userIds, flagged: userIds.length };
    }

    async getMyAttendance(userId: number): Promise<AttendanceResponseDto[]> {
        const records = await this.repo.find({
            where: { userId },
            order: { createdAt: 'DESC' },
        });
        return records.map((r) => this.toDto(r));
    }

    async getCount(fixtureId: number): Promise<AttendanceCountResponseDto> {
        const [goingCount, hasTicketCount] = await Promise.all([
            this.repo.count({ where: { fixtureId, fixtureInvalidatedAt: IsNull() } }),
            this.repo.count({ where: { fixtureId, hasTicket: true, fixtureInvalidatedAt: IsNull() } }),
        ]);
        return { fixtureId, goingCount, hasTicketCount };
    }

    async cancel(id: number, userId: number): Promise<void> {
        const record = await this.repo.findOne({ where: { id } });
        if (!record) throw new NotFoundException('Attendance record not found');
        if (record.userId !== userId) throw new ForbiddenException('Not your attendance record');

        if (record.documentPath) {
            await this.storage.delete(record.documentPath);
        }
        await this.repo.softDelete(id);
    }

    async uploadDocument(
        id: number,
        userId: number,
        file: { originalname: string; buffer: Buffer; mimetype: string; size: number },
    ): Promise<AttendanceResponseDto> {
        const record = await this.repo.findOne({ where: { id } });
        if (!record) throw new NotFoundException('Attendance record not found');
        if (record.userId !== userId) throw new ForbiddenException('Not your attendance record');

        if (!ALLOWED_MIME_TYPES.has(file.mimetype)) {
            throw new UnsupportedMediaTypeException(
                'Allowed types: PDF, JPEG, PNG, HEIC',
            );
        }
        if (file.size > MAX_UPLOAD_BYTES) {
            throw new PayloadTooLargeException('File must be under 10 MB');
        }

        // Delete existing document before replacing
        if (record.documentPath) {
            await this.storage.delete(record.documentPath);
        }

        const storagePath = await this.storage.store(userId, id, file.originalname, file.buffer);
        record.documentPath = storagePath;
        await this.repo.save(record);

        return this.toDto(record);
    }

    async getDocumentBuffer(
        id: number,
        userId: number,
    ): Promise<{ buffer: Buffer; ext: string }> {
        const record = await this.repo.findOne({ where: { id } });
        if (!record) throw new NotFoundException('Attendance record not found');
        if (record.userId !== userId) throw new ForbiddenException('Not your attendance record');
        if (!record.documentPath) throw new NotFoundException('No document uploaded for this attendance record');

        const result = await this.storage.read(record.documentPath);
        if (!result) throw new NotFoundException('Document file not found');
        return result;
    }

    private toDto(record: AttendanceRecord): AttendanceResponseDto {
        return {
            id: record.id,
            fixtureId: record.fixtureId,
            userId: record.userId,
            hasTicket: record.hasTicket,
            seatSection: record.seatSection,
            seatBlock: record.seatBlock,
            seatRow: record.seatRow,
            seatNumber: record.seatNumber,
            ticketProvider: record.ticketProvider,
            purchaseDate: record.purchaseDate,
            notes: record.notes,
            hasDocument: !!record.documentPath,
            fixtureInvalidatedAt: record.fixtureInvalidatedAt,
            fixtureInvalidationReason: record.fixtureInvalidationReason,
            createdAt: record.createdAt,
            updatedAt: record.updatedAt,
        };
    }
}
