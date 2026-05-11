import {
    CanActivate,
    ExecutionContext,
    ForbiddenException,
    Injectable,
    UnauthorizedException,
} from '@nestjs/common';
import { UserType } from '../../enums/user.enum';

/**
 * When INSIGHTS_STAFF_ONLY is not `false`, only ADMIN and MODERATOR may access insights routes.
 */
@Injectable()
export class InsightsAccessGuard implements CanActivate {
    canActivate(context: ExecutionContext): boolean {
        const staffOnly = process.env.INSIGHTS_STAFF_ONLY !== 'false';
        const req = context.switchToHttp().getRequest<{ user?: { type: UserType } }>();
        if (!req.user) {
            throw new UnauthorizedException();
        }
        if (!staffOnly) {
            return true;
        }
        const t = req.user.type;
        if (t !== UserType.ADMIN && t !== UserType.MODERATOR) {
            throw new ForbiddenException('Match insights are limited to staff');
        }
        return true;
    }
}
