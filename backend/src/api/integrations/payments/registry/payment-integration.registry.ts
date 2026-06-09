import { Injectable, NotFoundException } from '@nestjs/common';
import { PaymentProviderAdapter } from '../interfaces/payment-provider.adapter';

@Injectable()
export class PaymentIntegrationRegistry {
    private readonly adapters = new Map<string, PaymentProviderAdapter>();

    register(adapter: PaymentProviderAdapter): void {
        this.adapters.set(adapter.slug, adapter);
    }

    get(slug: string): PaymentProviderAdapter {
        const adapter = this.adapters.get(slug);
        if (!adapter) {
            throw new NotFoundException(`Payment integration "${slug}" is not registered`);
        }
        return adapter;
    }
}
