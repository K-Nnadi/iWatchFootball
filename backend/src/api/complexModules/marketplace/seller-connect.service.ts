import { BadRequestException, Injectable, ServiceUnavailableException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SellerProfile } from '../../modules/sellerProfile/sellerProfile.entity';
import { StripeCredentialsService } from '../../integrations/payments/services/stripe-credentials.service';
import {
    stripeCreateAccountLink,
    stripeCreateConnectAccount,
    stripeRetrieveConnectAccount,
} from '../../integrations/payments/stripe/stripe-http.client';
import { UserService } from '../../modules/user/user.module';

function publicWebBase(): string {
    return (
        process.env.PUBLIC_WEB_URL?.trim() ||
        process.env.FRONTEND_URL?.trim() ||
        process.env.CORS_ORIGIN?.trim() ||
        'http://localhost:5173'
    );
}

export type SellerConnectStatus = {
    configured: boolean;
    stripeConnectAccountId: string | null;
    onboardingComplete: boolean;
    payoutsEnabled: boolean;
    canList: boolean;
};

@Injectable()
export class SellerConnectService {
    constructor(
        @InjectRepository(SellerProfile)
        private readonly profileRepo: Repository<SellerProfile>,
        private readonly stripeCredentials: StripeCredentialsService,
        private readonly userService: UserService,
    ) {}

    async isStripeConfigured(): Promise<boolean> {
        try {
            await this.stripeCredentials.getSecretKey();
            return true;
        } catch {
            return false;
        }
    }

    async getOrCreateProfile(userId: number): Promise<SellerProfile> {
        const existing = await this.profileRepo.findOne({ where: { userId } });
        if (existing) return existing;
        const created = this.profileRepo.create({
            userId,
            stripeConnectOnboardingComplete: false,
            payoutsEnabled: false,
        });
        return this.profileRepo.save(created);
    }

    async getStatus(userId: number): Promise<SellerConnectStatus> {
        const configured = await this.isStripeConfigured();
        const profile = await this.getOrCreateProfile(userId);
        if (configured && profile.stripeConnectAccountId) {
            await this.refreshFromStripe(profile);
        }
        const latest = (await this.profileRepo.findOne({ where: { userId } })) ?? profile;
        return {
            configured,
            stripeConnectAccountId: latest.stripeConnectAccountId ?? null,
            onboardingComplete: latest.stripeConnectOnboardingComplete,
            payoutsEnabled: latest.payoutsEnabled,
            canList: configured ? latest.payoutsEnabled || latest.stripeConnectOnboardingComplete : true,
        };
    }

    async startOnboarding(userId: number): Promise<{ url: string }> {
        if (!(await this.isStripeConfigured())) {
            throw new ServiceUnavailableException('Stripe Connect is not configured');
        }
        const secretKey = await this.stripeCredentials.getSecretKey();
        const profile = await this.getOrCreateProfile(userId);

        if (!profile.stripeConnectAccountId) {
            const [user] = await this.userService.getQuery({ where: { id: userId } });
            const account = await stripeCreateConnectAccount(secretKey, {
                userId,
                email: user?.email,
                country: 'GB',
            });
            profile.stripeConnectAccountId = account.id;
            await this.profileRepo.save(profile);
        }

        const base = publicWebBase().replace(/\/$/, '');
        const link = await stripeCreateAccountLink(secretKey, {
            accountId: profile.stripeConnectAccountId,
            refreshUrl: `${base}/seller/onboarding?stripe=refresh`,
            returnUrl: `${base}/seller/onboarding?stripe=return`,
        });
        if (!link.url) {
            throw new ServiceUnavailableException('Stripe did not return an onboarding URL');
        }
        return { url: link.url };
    }

    async assertCanList(userId: number): Promise<void> {
        const status = await this.getStatus(userId);
        if (!status.configured) return;
        if (!status.canList) {
            throw new BadRequestException(
                'Complete Stripe Connect onboarding before listing tickets for sale',
            );
        }
    }

    private async refreshFromStripe(profile: SellerProfile): Promise<void> {
        if (!profile.stripeConnectAccountId) return;
        try {
            const secretKey = await this.stripeCredentials.getSecretKey();
            const account = await stripeRetrieveConnectAccount(secretKey, profile.stripeConnectAccountId);
            profile.stripeConnectOnboardingComplete = !!account.details_submitted;
            profile.payoutsEnabled = !!account.payouts_enabled;
            await this.profileRepo.save(profile);
        } catch {
            // Keep last known local flags if Stripe is unreachable.
        }
    }
}
