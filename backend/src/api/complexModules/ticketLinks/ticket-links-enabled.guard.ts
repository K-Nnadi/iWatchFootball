import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { TicketLinksFeatureService } from './ticket-links-feature.service';

export const SKIP_TICKET_LINKS_GUARD = 'skipTicketLinksGuard';

@Injectable()
export class TicketLinksEnabledGuard implements CanActivate {
    constructor(
        private readonly reflector: Reflector,
        private readonly ticketLinksFeature: TicketLinksFeatureService,
    ) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const skip = this.reflector.getAllAndOverride<boolean>(SKIP_TICKET_LINKS_GUARD, [
            context.getHandler(),
            context.getClass(),
        ]);
        if (skip) return true;

        await this.ticketLinksFeature.assertEnabled();
        return true;
    }
}
