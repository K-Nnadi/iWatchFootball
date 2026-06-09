import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { MarketplaceFeatureService } from './marketplace-feature.service';

export const SKIP_MARKETPLACE_GUARD = 'skipMarketplaceGuard';

@Injectable()
export class MarketplaceEnabledGuard implements CanActivate {
    constructor(
        private readonly reflector: Reflector,
        private readonly marketplaceFeature: MarketplaceFeatureService,
    ) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const skip = this.reflector.getAllAndOverride<boolean>(SKIP_MARKETPLACE_GUARD, [
            context.getHandler(),
            context.getClass(),
        ]);
        if (skip) return true;

        await this.marketplaceFeature.assertEnabled();
        return true;
    }
}
