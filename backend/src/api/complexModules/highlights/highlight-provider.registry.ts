import { Injectable, Logger } from '@nestjs/common';
import { HighlightProvider } from '../../enums/fixture-highlight.enum';
import { IHighlightProvider } from './highlight-provider.interface';

@Injectable()
export class HighlightProviderRegistry {
    private readonly logger = new Logger(HighlightProviderRegistry.name);
    private readonly providers = new Map<HighlightProvider, IHighlightProvider>();

    register(provider: IHighlightProvider): void {
        this.providers.set(provider.providerKey, provider);
        this.logger.log(`Registered highlight provider: ${provider.providerKey}`);
    }

    get(providerKey: HighlightProvider): IHighlightProvider | undefined {
        return this.providers.get(providerKey);
    }

    getAll(): IHighlightProvider[] {
        return Array.from(this.providers.values());
    }
}
