import { ForbiddenException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../modules/user/user.entity';
import { UserRole } from '../../../auth/types/security.types';
import { PlatformConfigService } from '../../modules/platformConfig/platformConfig.service';
import { ADS_CONFIG, ADS_DEFAULTS } from '../../modules/platformConfig/platform-features.constants';
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
    isAdmin?: boolean;
    freeVerifiedLimit: number;
    verifiedTotal: number;
    verifiedVisible: number;
    verifiedHidden: number;
    upgradeRequired: boolean;
    freeUnverifiedLimit: number;
    unverifiedTotal: number;
    unverifiedUpgradeRequired: boolean;
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
        @InjectRepository(User) private readonly userRepo: Repository<User>,
    ) {}

    async isAdminUser(userId: number): Promise<boolean> {
        const user = await this.userRepo.findOne({ where: { id: userId }, select: ['id', 'type'] });
        return user?.type === UserRole.ADMIN;
    }

    /** Whether the user should see ad placements (backend-driven; admins never see ads). */
    async shouldShowAds(userId: number): Promise<boolean> {
        const adsEnabled = await this.platformConfig.getBoolean(ADS_CONFIG.ENABLED, ADS_DEFAULTS.ENABLED);
        if (!adsEnabled) return false;
        if (await this.hasPremium(userId)) return false;
        return true;
    }

    async getFreeVerifiedLimit(): Promise<number> {
        return this.platformConfig.getNumber(
            TRACKER_CONFIG.FREE_VERIFIED_LIMIT,
            TRACKER_DEFAULTS.FREE_VERIFIED_LIMIT,
        );
    }

    async getFreeUnverifiedLimit(): Promise<number> {
        return this.platformConfig.getNumber(
            TRACKER_CONFIG.FREE_UNVERIFIED_LIMIT,
            TRACKER_DEFAULTS.FREE_UNVERIFIED_LIMIT,
        );
    }

    /** Throws when a free user has reached the manual (non-verified) log cap. */
    async assertCanAddUnverifiedLog(userId: number, currentUnverifiedCount: number): Promise<void> {
        if (await this.hasPremium(userId)) {
            return;
        }
        const limit = await this.getFreeUnverifiedLimit();
        if (currentUnverifiedCount >= limit) {
            throw new ForbiddenException({
                message: `Free plan allows up to ${limit} manual match logs. Upgrade to Premium for unlimited logs.`,
                code: 'UNVERIFIED_LOG_LIMIT_REACHED',
                freeUnverifiedLimit: limit,
                unverifiedTotal: currentUnverifiedCount,
            });
        }
    }

    async hasPremium(userId: number): Promise<boolean> {
        if (await this.isAdminUser(userId)) {
            return true;
        }
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
        unverifiedTotal: number,
    ): Promise<TrackerEntitlements> {
        const isPremium = await this.hasPremium(userId);
        const freeVerifiedLimit = await this.getFreeVerifiedLimit();
        const freeUnverifiedLimit = await this.getFreeUnverifiedLimit();
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
                freeUnverifiedLimit,
                unverifiedTotal,
                unverifiedUpgradeRequired: false,
                currentPeriodEnd: sub?.currentPeriodEnd?.toISOString(),
                cancelAtPeriodEnd: sub?.cancelAtPeriodEnd,
                isAdmin: await this.isAdminUser(userId),
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
            freeUnverifiedLimit,
            unverifiedTotal,
            unverifiedUpgradeRequired: unverifiedTotal >= freeUnverifiedLimit,
            currentPeriodEnd: undefined,
            cancelAtPeriodEnd: false,
            isAdmin: false,
        };
    }
}
