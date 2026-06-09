import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserSubscription } from './userSubscription.entity';
import {
    SubscriptionPlanSlug,
    SubscriptionStatus,
} from '../../enums/subscription.enum';

@Injectable()
export class UserSubscriptionService {
    constructor(
        @InjectRepository(UserSubscription)
        private readonly repo: Repository<UserSubscription>,
    ) {}

    async findByUserId(userId: number): Promise<UserSubscription | null> {
        return this.repo.findOne({ where: { userId } });
    }

    async findByStripeCustomerId(stripeCustomerId: string): Promise<UserSubscription | null> {
        return this.repo.findOne({ where: { stripeCustomerId } });
    }

    async findByStripeSubscriptionId(stripeSubscriptionId: string): Promise<UserSubscription | null> {
        return this.repo.findOne({ where: { stripeSubscriptionId } });
    }

    async getOrCreateFree(userId: number): Promise<UserSubscription> {
        const existing = await this.findByUserId(userId);
        if (existing) return existing;
        const row = this.repo.create({
            userId,
            planSlug: SubscriptionPlanSlug.FREE,
            status: SubscriptionStatus.NONE,
            cancelAtPeriodEnd: false,
        });
        return this.repo.save(row);
    }

    async upsertFromStripe(params: {
        userId: number;
        stripeCustomerId: string;
        stripeSubscriptionId: string;
        status: SubscriptionStatus;
        planSlug: SubscriptionPlanSlug;
        currentPeriodStart?: Date;
        currentPeriodEnd?: Date;
        cancelAtPeriodEnd: boolean;
    }): Promise<UserSubscription> {
        let row = await this.findByUserId(params.userId);
        if (!row) {
            row = this.repo.create({ userId: params.userId });
        }
        row.stripeCustomerId = params.stripeCustomerId;
        row.stripeSubscriptionId = params.stripeSubscriptionId;
        row.status = params.status;
        row.planSlug = params.planSlug;
        row.currentPeriodStart = params.currentPeriodStart;
        row.currentPeriodEnd = params.currentPeriodEnd;
        row.cancelAtPeriodEnd = params.cancelAtPeriodEnd;
        return this.repo.save(row);
    }

    async markCanceled(userId: number): Promise<UserSubscription> {
        const row = await this.getOrCreateFree(userId);
        row.status = SubscriptionStatus.CANCELED;
        row.planSlug = SubscriptionPlanSlug.FREE;
        row.stripeSubscriptionId = undefined;
        row.cancelAtPeriodEnd = false;
        return this.repo.save(row);
    }

    async setStripeCustomerId(userId: number, stripeCustomerId: string): Promise<UserSubscription> {
        const row = await this.getOrCreateFree(userId);
        row.stripeCustomerId = stripeCustomerId;
        return this.repo.save(row);
    }
}
