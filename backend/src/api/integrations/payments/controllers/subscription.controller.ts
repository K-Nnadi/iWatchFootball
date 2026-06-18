import { Body, Get, Post, Req, UnauthorizedException } from '@nestjs/common';
import { ApiBody, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthedController } from '@iWatchFootball/base-tools/decorators/controller.decorator';
import { StripeSubscriptionService } from '../services/stripe-subscription.service';
import { TrackerEntitlementService } from '../../../complexModules/tracker/tracker-entitlement.service';
import { UserSubscriptionService } from '../../../modules/userSubscription/userSubscription.service';
import { LogService } from '../../../modules/log/log.service';
import { PlatformConfigService } from '../../../modules/platformConfig/platformConfig.service';
import { ADS_CONFIG, ADS_DEFAULTS } from '../../../modules/platformConfig/platform-features.constants';
import type { Request } from 'express';

type AuthedRequest = Request & { user?: { id: number } };

class SubscriptionCheckoutDto {
    successUrl!: string;
    cancelUrl!: string;
}

class SubscriptionPortalDto {
    returnUrl!: string;
}

@AuthedController('subscriptions')
@ApiTags('subscriptions')
export class SubscriptionController {
    constructor(
        private readonly stripeSubscription: StripeSubscriptionService,
        private readonly trackerEntitlement: TrackerEntitlementService,
        private readonly userSubscription: UserSubscriptionService,
        private readonly logService: LogService,
        private readonly platformConfig: PlatformConfigService,
    ) {}

    @Get('entitlements')
    @ApiOperation({ summary: 'Current tracker plan and limits for the logged-in user' })
    async getEntitlements(@Req() req: AuthedRequest) {
        const userId = req.user?.id;
        if (!userId) throw new UnauthorizedException('Not authenticated');

        const isPremium = await this.trackerEntitlement.hasPremium(userId);
        const isAdmin = await this.trackerEntitlement.isAdminUser(userId);
        const showAds = await this.trackerEntitlement.shouldShowAds(userId);
        const adsEnabled = await this.platformConfig.getBoolean(ADS_CONFIG.ENABLED, ADS_DEFAULTS.ENABLED);
        const freeVerifiedLimit = await this.trackerEntitlement.getFreeVerifiedLimit();
        const freeUnverifiedLimit = await this.trackerEntitlement.getFreeUnverifiedLimit();
        const unverifiedTotal = await this.logService.countUnverifiedForUser(userId);
        const sub = await this.userSubscription.findByUserId(userId);
        const checkout = await this.stripeSubscription.getCheckoutAvailability();

        return {
            plan: isPremium ? 'premium' : 'free',
            isPremium,
            isAdmin,
            limitsBypassed: isAdmin,
            showAds,
            adsEnabled,
            freeVerifiedLimit,
            freeUnverifiedLimit,
            unverifiedTotal,
            unverifiedUpgradeRequired: !isPremium && unverifiedTotal >= freeUnverifiedLimit,
            currentPeriodEnd: sub?.currentPeriodEnd?.toISOString(),
            cancelAtPeriodEnd: sub?.cancelAtPeriodEnd ?? false,
            status: sub?.status ?? 'none',
            checkoutAvailable: checkout.available,
            checkoutUnavailableReason: checkout.reason,
        };
    }

    @Post('checkout')
    @ApiOperation({ summary: 'Create Stripe Checkout session for Premium monthly subscription' })
    @ApiBody({ schema: { properties: { successUrl: { type: 'string' }, cancelUrl: { type: 'string' } } } })
    @ApiOkResponse({ schema: { properties: { url: { type: 'string' } } } })
    async createCheckout(@Body() body: SubscriptionCheckoutDto, @Req() req: AuthedRequest) {
        const userId = req.user?.id;
        if (!userId) throw new UnauthorizedException('Not authenticated');
        return this.stripeSubscription.createCheckoutSession(
            userId,
            body.successUrl,
            body.cancelUrl,
        );
    }

    @Post('portal')
    @ApiOperation({ summary: 'Stripe Customer Portal — manage or cancel subscription' })
    @ApiBody({ schema: { properties: { returnUrl: { type: 'string' } } } })
    async createPortal(@Body() body: SubscriptionPortalDto, @Req() req: AuthedRequest) {
        const userId = req.user?.id;
        if (!userId) throw new UnauthorizedException('Not authenticated');
        return this.stripeSubscription.createPortalSession(userId, body.returnUrl);
    }
}
