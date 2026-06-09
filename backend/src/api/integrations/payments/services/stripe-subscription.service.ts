import {
    BadRequestException,
    Injectable,
    ServiceUnavailableException,
} from '@nestjs/common';
import { PlatformConfigService } from '../../../modules/platformConfig/platformConfig.service';
import { UserSubscriptionService } from '../../../modules/userSubscription/userSubscription.service';
import { UserService } from '../../../modules/user/user.module';
import { IntegrationService } from '../../../modules/integration/integration.service';
import {
    SubscriptionPlanSlug,
    SubscriptionStatus,
} from '../../../enums/subscription.enum';
import { TRACKER_CONFIG } from '../../../complexModules/tracker/tracker.constants';
import {
    stripeConstructEvent,
    stripeCreateSubscriptionCheckoutSession,
    stripeCreateCustomer,
    stripeCreatePortalSession,
    stripeRetrieveSubscription,
    StripeEvent,
    StripeSubscriptionObject,
    StripeApiError,
} from '../stripe/stripe-http.client';

@Injectable()
export class StripeSubscriptionService {
    constructor(
        private readonly platformConfig: PlatformConfigService,
        private readonly userSubscription: UserSubscriptionService,
        private readonly userService: UserService,
        private readonly integrationService: IntegrationService,
    ) {}

    /** Load Stripe creds from integration.config, falling back to env vars. */
    private async getStripeConfig(): Promise<Record<string, unknown>> {
        const row = await this.integrationService.findDefaultPaymentIntegration();
        return row?.config ?? {};
    }

    async getCheckoutAvailability(): Promise<{ available: boolean; reason?: string }> {
        try {
            await this.getSecretKey();
            await this.getPremiumPriceId();
            return { available: true };
        } catch (e) {
            const reason =
                e instanceof Error
                    ? e.message
                    : 'Premium checkout is not configured';
            return { available: false, reason };
        }
    }

    private async getSecretKey(): Promise<string> {
        const config = await this.getStripeConfig();
        const key =
            this.integrationService.getConfigString(config, 'secretKey') ??
            process.env.STRIPE_SECRET_KEY?.trim();
        if (!key) {
            throw new ServiceUnavailableException(
                'Stripe is not configured. Add STRIPE_SECRET_KEY and STRIPE_PREMIUM_MONTHLY_PRICE_ID to backend/.env (Stripe Dashboard → test mode).',
            );
        }
        return key;
    }

    private async getWebhookSecret(): Promise<string> {
        const config = await this.getStripeConfig();
        const secret =
            this.integrationService.getConfigString(config, 'webhookSecret') ??
            process.env.STRIPE_WEBHOOK_SECRET;
        if (!secret) {
            throw new ServiceUnavailableException(
                'Stripe webhookSecret not configured (integration.config or STRIPE_WEBHOOK_SECRET)',
            );
        }
        return secret;
    }

    private mapStripeStatus(status: string): SubscriptionStatus {
        switch (status) {
            case 'active':
                return SubscriptionStatus.ACTIVE;
            case 'trialing':
                return SubscriptionStatus.TRIALING;
            case 'past_due':
                return SubscriptionStatus.PAST_DUE;
            case 'canceled':
                return SubscriptionStatus.CANCELED;
            case 'incomplete':
            case 'incomplete_expired':
                return SubscriptionStatus.INCOMPLETE;
            default:
                return SubscriptionStatus.NONE;
        }
    }

    private async getPremiumPriceId(): Promise<string> {
        const config = await this.getStripeConfig();
        const fromIntegration = this.integrationService.getConfigString(
            config,
            'premiumMonthlyPriceId',
        );
        const fromPlatform = await this.platformConfig.getString(
            TRACKER_CONFIG.STRIPE_PREMIUM_MONTHLY_PRICE_ID,
            '',
        );
        const priceId =
            fromIntegration ||
            fromPlatform ||
            process.env.STRIPE_PREMIUM_MONTHLY_PRICE_ID?.trim();
        if (!priceId) {
            throw new BadRequestException(
                'Premium price id not configured. Set premiumMonthlyPriceId in integration.config (Stripe Dashboard → Products → recurring price, starts with price_).',
            );
        }
        if (!priceId.startsWith('price_')) {
            throw new BadRequestException(
                `Invalid premiumMonthlyPriceId "${priceId}" — must be a Stripe Price ID (price_...), not a Product ID (prod_...). Create a recurring monthly price in Stripe Dashboard.`,
            );
        }
        return priceId;
    }

    private isMissingStripeCustomer(err: StripeApiError): boolean {
        return (
            err.code === 'resource_missing' &&
            (err.param === 'customer' || err.message.toLowerCase().includes('no such customer'))
        );
    }

    private toStripeBadRequest(err: unknown): BadRequestException {
        if (err instanceof StripeApiError) {
            return new BadRequestException(`Stripe: ${err.message}`);
        }
        if (err instanceof Error) {
            return new BadRequestException(err.message);
        }
        return new BadRequestException('Stripe checkout failed');
    }

    async createCheckoutSession(userId: number, successUrl: string, cancelUrl: string): Promise<{ url: string }> {
        const secretKey = await this.getSecretKey();
        const priceId = await this.getPremiumPriceId();
        const sub = await this.userSubscription.getOrCreateFree(userId);

        let customerId = sub.stripeCustomerId;
        if (!customerId) {
            const user = await this.userService.getOne(userId);
            const customer = await stripeCreateCustomer(secretKey, user?.email, userId);
            customerId = customer.id;
            await this.userSubscription.setStripeCustomerId(userId, customerId);
        }

        try {
            const session = await stripeCreateSubscriptionCheckoutSession(secretKey, {
                customerId,
                priceId,
                successUrl,
                cancelUrl,
                userId,
            });

            if (!session.url) {
                throw new BadRequestException('Stripe did not return a checkout URL');
            }
            return { url: session.url };
        } catch (err) {
            if (err instanceof StripeApiError && this.isMissingStripeCustomer(err)) {
                const user = await this.userService.getOne(userId);
                const customer = await stripeCreateCustomer(secretKey, user?.email, userId);
                await this.userSubscription.setStripeCustomerId(userId, customer.id);
                try {
                    const session = await stripeCreateSubscriptionCheckoutSession(secretKey, {
                        customerId: customer.id,
                        priceId,
                        successUrl,
                        cancelUrl,
                        userId,
                    });
                    if (!session.url) {
                        throw new BadRequestException('Stripe did not return a checkout URL');
                    }
                    return { url: session.url };
                } catch (retryErr) {
                    throw this.toStripeBadRequest(retryErr);
                }
            }
            throw this.toStripeBadRequest(err);
        }
    }

    async createPortalSession(userId: number, returnUrl: string): Promise<{ url: string }> {
        const secretKey = await this.getSecretKey();
        const sub = await this.userSubscription.findByUserId(userId);
        if (!sub?.stripeCustomerId) {
            throw new BadRequestException('No billing account found for this user');
        }
        try {
            return await stripeCreatePortalSession(secretKey, sub.stripeCustomerId, returnUrl);
        } catch (err) {
            throw this.toStripeBadRequest(err);
        }
    }

    async syncSubscriptionFromStripe(stripeSubscription: StripeSubscriptionObject, userId: number): Promise<void> {
        const status = this.mapStripeStatus(stripeSubscription.status);
        const isPremium =
            status === SubscriptionStatus.ACTIVE || status === SubscriptionStatus.TRIALING;

        await this.userSubscription.upsertFromStripe({
            userId,
            stripeCustomerId:
                typeof stripeSubscription.customer === 'string'
                    ? stripeSubscription.customer
                    : stripeSubscription.customer.id,
            stripeSubscriptionId: stripeSubscription.id,
            status,
            planSlug: isPremium ? SubscriptionPlanSlug.PREMIUM_MONTHLY : SubscriptionPlanSlug.FREE,
            currentPeriodStart: new Date(stripeSubscription.current_period_start * 1000),
            currentPeriodEnd: new Date(stripeSubscription.current_period_end * 1000),
            cancelAtPeriodEnd: stripeSubscription.cancel_at_period_end,
        });
    }

    async handleWebhookEvent(event: StripeEvent): Promise<void> {
        switch (event.type) {
            case 'checkout.session.completed': {
                const session = event.data.object as {
                    mode?: string;
                    subscription?: string;
                    metadata?: { userId?: string };
                };
                if (session.mode !== 'subscription' || !session.subscription) return;
                const userId = Number(session.metadata?.userId);
                if (!userId) return;
                const stripeSub = await stripeRetrieveSubscription(
                    await this.getSecretKey(),
                    session.subscription,
                );
                await this.syncSubscriptionFromStripe(stripeSub, userId);
                break;
            }
            case 'customer.subscription.updated':
            case 'customer.subscription.deleted': {
                const stripeSub = event.data.object as unknown as StripeSubscriptionObject;
                const userId = Number(stripeSub.metadata?.userId);
                if (!userId) {
                    const local = await this.userSubscription.findByStripeSubscriptionId(stripeSub.id);
                    if (!local) return;
                    if (event.type === 'customer.subscription.deleted') {
                        await this.userSubscription.markCanceled(local.userId);
                    } else {
                        await this.syncSubscriptionFromStripe(stripeSub, local.userId);
                    }
                    return;
                }
                if (event.type === 'customer.subscription.deleted') {
                    await this.userSubscription.markCanceled(userId);
                } else {
                    await this.syncSubscriptionFromStripe(stripeSub, userId);
                }
                break;
            }
            default:
                break;
        }
    }

    async constructEvent(payload: Buffer | string, signature: string): Promise<StripeEvent> {
        const secret = await this.getWebhookSecret();
        try {
            return stripeConstructEvent(payload, signature, secret);
        } catch (err) {
            throw new BadRequestException(
                err instanceof Error ? err.message : 'Invalid webhook signature',
            );
        }
    }
}
