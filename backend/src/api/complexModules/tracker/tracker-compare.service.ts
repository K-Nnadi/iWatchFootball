import { ForbiddenException, Injectable } from '@nestjs/common';
import { TrackerEntitlementService } from './tracker-entitlement.service';
import { TrackerStatsService, TrackerSummary, OverlapFixture } from './tracker-stats.service';
import { SocialService, PublicUserSummary } from '../../modules/social/social.service';
import { User } from '../../modules/user/user.entity';

export type CompareMetricKey =
    | 'totalMatches'
    | 'verifiedMatches'
    | 'uniqueStadiums'
    | 'uniqueTeams'
    | 'uniqueCompetitions';

export type CompareWinners = Partial<Record<CompareMetricKey, 'me' | 'friend' | 'tie'>>;

export type CompareResult = {
    me: PublicUserSummary & { stats: TrackerSummary };
    friend: PublicUserSummary & { stats: TrackerSummary };
    winners: CompareWinners;
    overlap: {
        count: number;
        fixtures: OverlapFixture[];
    };
    requiresPremium: boolean;
};

@Injectable()
export class TrackerCompareService {
    constructor(
        private readonly trackerEntitlement: TrackerEntitlementService,
        private readonly trackerStats: TrackerStatsService,
        private readonly social: SocialService,
    ) {}

    async compare(viewerId: number, friendUserId: number): Promise<CompareResult> {
        const isPremium = await this.trackerEntitlement.hasPremium(viewerId);
        if (!isPremium) {
            throw new ForbiddenException('Premium subscription required to compare with friends');
        }

        const { me, friend } = await this.social.assertCanCompare(viewerId, friendUserId);

        const meVerifiedOnly = me.shareVerifiedOnly ?? true;
        const friendVerifiedOnly = friend.shareVerifiedOnly ?? true;

        const [myStats, friendStats, overlapFixtures] = await Promise.all([
            this.trackerStats.getSummary(me.id, meVerifiedOnly),
            this.trackerStats.getSummary(friend.id, friendVerifiedOnly),
            this.trackerStats.getOverlapFixtures(
                me.id,
                friend.id,
                meVerifiedOnly && friendVerifiedOnly,
            ),
        ]);

        return {
            me: { ...this.toPublicSummary(me), stats: myStats },
            friend: { ...this.toPublicSummary(friend), stats: friendStats },
            winners: this.computeWinners(myStats, friendStats),
            overlap: {
                count: overlapFixtures.length,
                fixtures: overlapFixtures,
            },
            requiresPremium: false,
        };
    }

    async getStatsForUser(viewerId: number, targetUserId: number): Promise<{
        user: PublicUserSummary;
        stats: TrackerSummary;
    }> {
        const target = await this.social.assertCanViewTrackerStats(viewerId, targetUserId);
        const verifiedOnly = target.shareVerifiedOnly ?? true;
        const stats = await this.trackerStats.getSummary(target.id, verifiedOnly);
        return {
            user: this.toPublicSummary(target),
            stats,
        };
    }

    private computeWinners(me: TrackerSummary, friend: TrackerSummary): CompareWinners {
        const keys: CompareMetricKey[] = [
            'totalMatches',
            'verifiedMatches',
            'uniqueStadiums',
            'uniqueTeams',
            'uniqueCompetitions',
        ];
        const winners: CompareWinners = {};
        for (const key of keys) {
            const a = me[key];
            const b = friend[key];
            if (a > b) winners[key] = 'me';
            else if (b > a) winners[key] = 'friend';
            else winners[key] = 'tie';
        }
        return winners;
    }

    private toPublicSummary(user: User): PublicUserSummary {
        return {
            id: user.id,
            userName: user.userName,
            firstName: user.firstName,
            lastName: user.lastName,
            favouriteTeamIds: user.favouriteTeamIds ?? [],
        };
    }
}
