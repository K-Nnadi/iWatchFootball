import { ExecutionContext, Injectable } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';
import type { FastifyRequest } from 'fastify';

type RequestWithUser = FastifyRequest & { user?: { id?: number } };

const SKIP_PATH_PREFIXES = ['/health', '/webhooks/'];

@Injectable()
export class AppThrottlerGuard extends ThrottlerGuard {
    protected async shouldSkip(context: ExecutionContext): Promise<boolean> {
        if (await super.shouldSkip(context)) {
            return true;
        }

        const request = context.switchToHttp().getRequest<RequestWithUser>();
        const path = String(request.routerPath ?? request.url ?? '').split('?')[0];
        return SKIP_PATH_PREFIXES.some((prefix) => path.startsWith(prefix));
    }

    protected async getTracker(req: RequestWithUser): Promise<string> {
        const userId = req.user?.id;
        if (userId != null) {
            return `user:${userId}`;
        }

        const forwarded = req.headers['x-forwarded-for'];
        if (forwarded) {
            const first = Array.isArray(forwarded) ? forwarded[0] : forwarded.split(',')[0];
            const ip = first?.trim();
            if (ip) return `ip:${ip}`;
        }

        if (req.ip) {
            return `ip:${req.ip}`;
        }

        return 'ip:unknown';
    }
}
