import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { UserNotification } from './userNotification.entity';
import { NotificationType } from '../../enums/notification.enum';
import { CommsPreference } from '../commsPreference/commsPreference.entity';
import { CommunicationFrequency } from '../../enums/commsPreference.enum';

export type CreateNotificationInput = {
    userId: number;
    type: NotificationType;
    title: string;
    message: string;
    metadata?: Record<string, unknown>;
};

@Injectable()
export class NotificationService {
    constructor(
        @InjectRepository(UserNotification)
        private readonly notificationRepo: Repository<UserNotification>,
        @InjectRepository(CommsPreference)
        private readonly commsRepo: Repository<CommsPreference>,
    ) {}

    async createIfAllowed(input: CreateNotificationInput): Promise<UserNotification | null> {
        const allowed = await this.isInAppEnabled(input.userId);
        if (!allowed) return null;

        const row = this.notificationRepo.create({
            userId: input.userId,
            type: input.type,
            title: input.title,
            message: input.message,
            metadata: input.metadata,
        });
        return this.notificationRepo.save(row);
    }

    async listForUser(userId: number, limit = 30): Promise<UserNotification[]> {
        return this.notificationRepo.find({
            where: { userId },
            order: { createdAt: 'DESC' },
            take: limit,
        });
    }

    async getUnreadCount(userId: number): Promise<number> {
        return this.notificationRepo.count({
            where: { userId, readAt: IsNull() },
        });
    }

    async markRead(userId: number, notificationId: number): Promise<void> {
        const row = await this.notificationRepo.findOne({
            where: { id: notificationId, userId },
        });
        if (!row || row.readAt) return;
        row.readAt = new Date();
        await this.notificationRepo.save(row);
    }

    async markAllRead(userId: number): Promise<void> {
        await this.notificationRepo.update(
            { userId, readAt: IsNull() },
            { readAt: new Date() },
        );
    }

    private async isInAppEnabled(userId: number): Promise<boolean> {
        const prefs = await this.commsRepo.findOne({ where: { userId } });
        if (!prefs) return true;
        return prefs.inAppNotifications !== CommunicationFrequency.NEVER;
    }
}
