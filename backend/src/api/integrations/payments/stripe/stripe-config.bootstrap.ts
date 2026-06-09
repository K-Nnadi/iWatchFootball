import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Integration } from '../../../modules/integration/integration.entity';
import { IntegrationKind } from '../../../enums/integration.enum';
import { PlatformConfigService } from '../../../modules/platformConfig/platformConfig.service';
import { ConfigValueType } from '../../../modules/platformConfig/platformConfig.entity';
import { TRACKER_CONFIG } from '../../../complexModules/tracker/tracker.constants';

/**
 * Syncs Stripe env vars into integration + platformConfig on boot so checkout works
 * when STRIPE_SECRET_KEY is set in backend/.env.
 */
@Injectable()
export class StripeConfigBootstrap implements OnModuleInit {
    private readonly logger = new Logger(StripeConfigBootstrap.name);

    constructor(
        @InjectRepository(Integration)
        private readonly integrationRepo: Repository<Integration>,
        private readonly platformConfig: PlatformConfigService,
    ) {}

    async onModuleInit(): Promise<void> {
        const secretKey = process.env.STRIPE_SECRET_KEY?.trim();
        if (!secretKey) {
            this.logger.warn(
                'STRIPE_SECRET_KEY not set — Premium checkout disabled. Add test keys to backend/.env',
            );
            return;
        }

        const row = await this.integrationRepo.findOne({
            where: { slug: 'stripe-primary', kind: IntegrationKind.PAYMENT },
        });
        if (row) {
            const config = { ...(row.config ?? {}) } as Record<string, unknown>;
            config.secretKey = secretKey;
            if (process.env.STRIPE_PUBLISHABLE_KEY?.trim()) {
                config.publishableKey = process.env.STRIPE_PUBLISHABLE_KEY.trim();
            }
            if (process.env.STRIPE_WEBHOOK_SECRET?.trim()) {
                config.webhookSecret = process.env.STRIPE_WEBHOOK_SECRET.trim();
            }
            const priceId =
                process.env.STRIPE_PREMIUM_MONTHLY_PRICE_ID?.trim() ??
                (typeof config.premiumMonthlyPriceId === 'string' ? config.premiumMonthlyPriceId : '');
            if (priceId) {
                config.premiumMonthlyPriceId = priceId;
            }
            row.config = config;
            row.enabled = true;
            await this.integrationRepo.save(row);
            this.logger.log('Stripe integration enabled from environment variables');
        }

        const envPriceId = process.env.STRIPE_PREMIUM_MONTHLY_PRICE_ID?.trim();
        if (envPriceId) {
            const existing = await this.platformConfig.getString(
                TRACKER_CONFIG.STRIPE_PREMIUM_MONTHLY_PRICE_ID,
                '',
            );
            if (!existing) {
                await this.platformConfig.set(TRACKER_CONFIG.STRIPE_PREMIUM_MONTHLY_PRICE_ID, {
                    valueType: ConfigValueType.STRING,
                    stringValue: envPriceId,
                    description: 'Stripe Price id for Premium monthly subscription',
                });
            }
        }
    }
}
