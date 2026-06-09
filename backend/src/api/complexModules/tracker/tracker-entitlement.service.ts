import { Injectable } from '@nestjs/common';
import { PlatformConfigService } from '../../modules/platformConfig/platformConfig.service';
import { UserSubscriptionService } from '../../modules/userSubscription/userSubscription.service';
import {
    SubscriptionPlanSlug,
    SubscriptionStatus,
} from '../../enums/subscription.enum';
import {
    TRACKER_CONFIG,
    TRACKER_DEFAULTS,
} from './tracker.constants';

export interface TrackerEntitlements {
    plan: 'free' | 'premium';
    isPremium: boolean;
    freeVerifiedLimit: number;
    verifiedTotal: number;
    verifiedVisible: number;
    verifiedHidden: number;
    upgradeRequired: boolean;
    currentPeriodEnd?: string;
    cancelAtPeriodEnd?: boolean;
}

const PREMIUM_STATUSES = new Set<SubscriptionStatus>([
    SubscriptionStatus.ACTIVE,
    SubscriptionStatus.TRIALING,
]);

@Injectable()
export class TrackerEntitlementService {
    constructor(
        private readonly platformConfig: PlatformConfigService,
        private readonly userSubscription: UserSubscriptionService,
    ) {}

    async getFreeVerifiedLimit(): Promise<number> {
        return this.platformConfig.getNumber(
            TRACKER_CONFIG.FREE_VERIFIED_LIMIT,
            TRACKER_DEFAULTS.FREE_VERIFIED_LIMIT,
        );
    }

    async hasPremium(userId: number): Promise<boolean> {
        const sub = await this.userSubscription.findByUserId(userId);
        if (!sub) return false;
        if (sub.planSlug !== SubscriptionPlanSlug.PREMIUM_MONTHLY) return false;
        if (!PREMIUM_STATUSES.has(sub.status)) return false;
        if (sub.currentPeriodEnd && sub.currentPeriodEnd.getTime() < Date.now()) {
            return false;
        }
        return true;
    }

    async buildEntitlements(
        userId: number,
        verifiedTotal: number,
        verifiedReturned: number,
    ): Promise<TrackerEntitlements> {
        const isPremium = await this.hasPremium(userId);
        const freeVerifiedLimit = await this.getFreeVerifiedLimit();
        const sub = await this.userSubscription.findByUserId(userId);

        if (isPremium) {
            return {
                plan: 'premium',
                isPremium: true,
                freeVerifiedLimit,
                verifiedTotal,
                verifiedVisible: verifiedReturned,
                verifiedHidden: 0,
                upgradeRequired: false,
                currentPeriodEnd: sub?.currentPeriodEnd?.toISOString(),
                cancelAtPeriodEnd: sub?.cancelAtPeriodEnd,
            };
        }

        const verifiedHidden = Math.max(0, verifiedTotal - verifiedReturned);
        return {
            plan: 'free',
            isPremium: false,
            freeVerifiedLimit,
            verifiedTotal,
            verifiedVisible: verifiedReturned,
            verifiedHidden,
            upgradeRequired: verifiedHidden > 0,
            currentPeriodEnd: undefined,
            cancelAtPeriodEnd: false,
        };
    }
}
