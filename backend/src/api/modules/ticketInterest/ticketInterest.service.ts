import {
    ForbiddenException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { TicketInterest } from './ticketInterest.entity';
import { TicketInterestStatus } from '../../enums/ticketInterest.enum';
import {
    AdminDemandStatsDto,
    CreateTicketInterestDto,
    DemandStatsDto,
    TicketInterestResponseDto,
} from './ticketInterest.dto';
import { NotificationService } from '../notification/notification.service';
import { NotificationType } from '../../enums/notification.enum';

@Injectable()
export class TicketInterestService {
    constructor(
        @InjectRepository(TicketInterest)
        private readonly repo: Repository<TicketInterest>,
        private readonly notificationService: NotificationService,
    ) {}

    /** One active interest per user per fixture — upsert on re-submit. */
    async upsert(userId: number, dto: CreateTicketInterestDto): Promise<TicketInterestResponseDto> {
        let interest = await this.repo.findOne({
            where: { userId, fixtureId: dto.fixtureId, status: TicketInterestStatus.ACTIVE },
        });

        if (interest) {
            Object.assign(interest, {
                quantity: dto.quantity,
                maxPriceGbp: dto.maxPriceGbp,
                preferredStand: dto.preferredStand,
                wantsNotification: dto.wantsNotification,
            });
            interest = await this.repo.save(interest);
        } else {
            interest = await this.repo.save(
                this.repo.create({
                    userId,
                    fixtureId: dto.fixtureId,
                    quantity: dto.quantity,
                    maxPriceGbp: dto.maxPriceGbp,
                    preferredStand: dto.preferredStand,
                    wantsNotification: dto.wantsNotification,
                    status: TicketInterestStatus.ACTIVE,
                }),
            );
        }

        return this.toDto(interest);
    }

    async getMyInterests(userId: number): Promise<TicketInterestResponseDto[]> {
        const interests = await this.repo.find({
            where: { userId },
            order: { createdAt: 'DESC' },
        });
        return interests.map((i) => this.toDto(i));
    }

    async cancel(id: number, userId: number): Promise<void> {
        const interest = await this.repo.findOne({ where: { id } });
        if (!interest) throw new NotFoundException('Ticket interest not found');
        if (interest.userId !== userId) throw new ForbiddenException('Not your interest record');
        interest.status = TicketInterestStatus.CANCELLED;
        await this.repo.save(interest);
    }

    /** Cancel all open interest for a postponed/cancelled/suspended fixture. */
    async cancelAllForFixture(fixtureId: number): Promise<{ userIds: number[]; cancelled: number }> {
        const interests = await this.repo.find({
            where: {
                fixtureId,
                status: In([TicketInterestStatus.ACTIVE, TicketInterestStatus.NOTIFIED]),
            },
        });
        const userIds = [...new Set(interests.map((i) => i.userId))];
        for (const interest of interests) {
            interest.status = TicketInterestStatus.CANCELLED;
            await this.repo.save(interest);
        }
        return { userIds, cancelled: interests.length };
    }

    /** Auto-cancel a user's active interest when they mark attendance for the same fixture. */
    async autoCancelForFixture(userId: number, fixtureId: number): Promise<void> {
        const interest = await this.repo.findOne({
            where: { userId, fixtureId, status: TicketInterestStatus.ACTIVE },
        });
        if (!interest) return;
        interest.status = TicketInterestStatus.CANCELLED;
        await this.repo.save(interest);
    }

    async getDemand(fixtureId: number): Promise<DemandStatsDto> {
        const results = await this.repo
            .createQueryBuilder('ti')
            .select('SUM(ti.quantity)', 'totalTicketsWanted')
            .addSelect('COUNT(ti.id)', 'interestedCount')
            .where('ti.fixtureId = :fixtureId', { fixtureId })
            .andWhere('ti.status = :status', { status: TicketInterestStatus.ACTIVE })
            .getRawOne<{ totalTicketsWanted: string; interestedCount: string }>();

        return {
            fixtureId,
            interestedCount: parseInt(results?.interestedCount ?? '0', 10),
            totalTicketsWanted: parseInt(results?.totalTicketsWanted ?? '0', 10),
        };
    }

    async getAdminDemand(fixtureId: number): Promise<AdminDemandStatsDto> {
        const results = await this.repo
            .createQueryBuilder('ti')
            .select('SUM(ti.quantity)', 'totalTicketsWanted')
            .addSelect('COUNT(ti.id)', 'interestedCount')
            .addSelect('AVG(ti.maxPriceGbp)', 'avgMaxPriceGbp')
            .where('ti.fixtureId = :fixtureId', { fixtureId })
            .andWhere('ti.status = :status', { status: TicketInterestStatus.ACTIVE })
            .getRawOne<{ totalTicketsWanted: string; interestedCount: string; avgMaxPriceGbp: string | null }>();

        const avg = results?.avgMaxPriceGbp != null ? parseFloat(results.avgMaxPriceGbp) : undefined;

        return {
            fixtureId,
            interestedCount: parseInt(results?.interestedCount ?? '0', 10),
            totalTicketsWanted: parseInt(results?.totalTicketsWanted ?? '0', 10),
            avgMaxPriceGbp: avg != null && !isNaN(avg) ? Math.round(avg * 100) / 100 : undefined,
        };
    }

    /**
     * Admin: notify all users with ACTIVE interest for a fixture.
     * Marks them as NOTIFIED and queues in-app notifications.
     */
    async notifyInterested(fixtureId: number): Promise<{ notified: number }> {
        const interested = await this.repo.find({
            where: { fixtureId, status: TicketInterestStatus.ACTIVE, wantsNotification: true },
        });

        let notified = 0;
        for (const interest of interested) {
            interest.status = TicketInterestStatus.NOTIFIED;
            await this.repo.save(interest);

            await this.notificationService.createIfAllowed({
                userId: interest.userId,
                type: NotificationType.TICKET_RESALE_AVAILABLE,
                title: 'Tickets available for resale',
                message: 'Resale tickets are now listed for a match you were interested in. Check the marketplace.',
                metadata: { fixtureId },
            });

            notified++;
        }

        return { notified };
    }

    private toDto(interest: TicketInterest): TicketInterestResponseDto {
        return {
            id: interest.id,
            fixtureId: interest.fixtureId,
            quantity: interest.quantity,
            maxPriceGbp: interest.maxPriceGbp,
            preferredStand: interest.preferredStand,
            wantsNotification: interest.wantsNotification,
            status: interest.status,
            createdAt: interest.createdAt,
        };
    }
}
