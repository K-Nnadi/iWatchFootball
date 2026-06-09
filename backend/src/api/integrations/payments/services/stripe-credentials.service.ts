import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { IntegrationService } from '../../../modules/integration/integration.service';
import { IntegrationKind } from '../../../enums/integration.enum';
import { PaymentProcessorService } from '../../../modules/paymentProcessor/paymentProcessor.module';

export interface StripeCredentials {
    secretKey: string;
    publishableKey: string;
    webhookSecret: string;
}

@Injectable()
export class StripeCredentialsService {
    constructor(
        private readonly integrationService: IntegrationService,
        private readonly paymentProcessorService: PaymentProcessorService,
    ) {}

    async getSecretKey(): Promise<string> {
        const config = await this.getConfig();
        const key =
            this.integrationService.getConfigString(config, 'secretKey') ??
            process.env.STRIPE_SECRET_KEY?.trim();
        if (!key) {
            throw new ServiceUnavailableException(
                'Stripe secretKey not configured (integration.config or STRIPE_SECRET_KEY)',
            );
        }
        return key;
    }

    async getPublishableKey(): Promise<string> {
        const config = await this.getConfig();
        const fromConfig = this.integrationService.getConfigString(config, 'publishableKey');
        if (fromConfig) return fromConfig;

        const processor = await this.paymentProcessorService.findBySlug('stripe');
        const fromMeta =
            processor?.metadata && typeof processor.metadata.publishableKey === 'string'
                ? processor.metadata.publishableKey
                : undefined;
        if (fromMeta) return fromMeta;

        const fromEnv = process.env.STRIPE_PUBLISHABLE_KEY?.trim();
        if (fromEnv) return fromEnv;

        throw new ServiceUnavailableException(
            'Stripe publishableKey not configured (integration.config, processor metadata, or STRIPE_PUBLISHABLE_KEY)',
        );
    }

    async getWebhookSecret(): Promise<string> {
        const config = await this.getConfig();
        const secret =
            this.integrationService.getConfigString(config, 'webhookSecret') ??
            process.env.STRIPE_WEBHOOK_SECRET?.trim();
        if (!secret) {
            throw new ServiceUnavailableException(
                'Stripe webhookSecret not configured (integration.config or STRIPE_WEBHOOK_SECRET)',
            );
        }
        return secret;
    }

    async getCredentials(): Promise<StripeCredentials> {
        return {
            secretKey: await this.getSecretKey(),
            publishableKey: await this.getPublishableKey(),
            webhookSecret: await this.getWebhookSecret(),
        };
    }

    private async getConfig(): Promise<Record<string, unknown>> {
        const row = await this.integrationService.findDefaultPaymentIntegration();
        return row?.config ?? {};
    }
}
