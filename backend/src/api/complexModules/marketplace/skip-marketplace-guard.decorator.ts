import { SetMetadata } from '@nestjs/common';
import { SKIP_MARKETPLACE_GUARD } from './marketplace-enabled.guard';

export const SkipMarketplaceGuard = () => SetMetadata(SKIP_MARKETPLACE_GUARD, true);
