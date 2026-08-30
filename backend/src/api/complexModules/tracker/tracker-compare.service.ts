import { BadRequestException, ForbiddenException, Injectable } from '@nestjs/common';
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
    me: PublicUserSummary & { stats: TrackerSummary; shareVerifiedOnly: boolean };
    friend: PublicUserSummary & { stats: TrackerSummary; shareVerifiedOnly: boolean };
    winners: CompareWinners;
    overlap: {
        count: number;
        fixtures: OverlapFixture[];
    };
    requiresPremium: boolean;
};

export type CompareUserStats = PublicUserSummary & { stats: TrackerSummary; shareVerifiedOnly: boolean };

export type MultiCompareResult = {
    users: CompareUserStats[];
    winners: Record<CompareMetricKey, number | null>;
    requiresPremium: boolean;
};

export const MAX_MULTI_COMPARE_USERS = 5;

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
            me: { ...this.toPublicSummary(me), stats: myStats, shareVerifiedOnly: meVerifiedOnly },
            friend: { ...this.toPublicSummary(friend), stats: friendStats, shareVerifiedOnly: friendVerifiedOnly },
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

    async compareMulti(viewerId: number, friendUserIds: number[]): Promise<MultiCompareResult> {
        if (friendUserIds.length === 0) {
            throw new BadRequestException('At least one friend must be selected for comparison');
        }
        if (friendUserIds.length > MAX_MULTI_COMPARE_USERS - 1) {
            throw new BadRequestException(`Cannot compare with more than ${MAX_MULTI_COMPARE_USERS - 1} friends at once`);
        }

        const isPremium = await this.trackerEntitlement.hasPremium(viewerId);
        if (!isPremium) {
            throw new ForbiddenException('Premium subscription required to compare with friends');
        }

        const uniqueFriendIds = [...new Set(friendUserIds)];
        const usersWithStats: CompareUserStats[] = [];

        const viewerUser = await this.social.assertCanViewTrackerStats(viewerId, viewerId);
        const viewerVerifiedOnly = viewerUser.shareVerifiedOnly ?? true;
        const viewerStats = await this.trackerStats.getSummary(viewerId, viewerVerifiedOnly);
        usersWithStats.push({
            ...this.toPublicSummary(viewerUser),
            stats: viewerStats,
            shareVerifiedOnly: viewerVerifiedOnly,
        });

        for (const friendId of uniqueFriendIds) {
            const { friend } = await this.social.assertCanCompare(viewerId, friendId);
            const friendVerifiedOnly = friend.shareVerifiedOnly ?? true;
            const friendStats = await this.trackerStats.getSummary(friend.id, friendVerifiedOnly);
            usersWithStats.push({
                ...this.toPublicSummary(friend),
                stats: friendStats,
                shareVerifiedOnly: friendVerifiedOnly,
            });
        }

        const winners = this.computeMultiWinners(usersWithStats);

        return {
            users: usersWithStats,
            winners,
            requiresPremium: false,
        };
    }

    private computeMultiWinners(users: CompareUserStats[]): Record<CompareMetricKey, number | null> {
        const keys: CompareMetricKey[] = [
            'totalMatches',
            'verifiedMatches',
            'uniqueStadiums',
            'uniqueTeams',
            'uniqueCompetitions',
        ];
        const winners: Record<CompareMetricKey, number | null> = {
            totalMatches: null,
            verifiedMatches: null,
            uniqueStadiums: null,
            uniqueTeams: null,
            uniqueCompetitions: null,
        };

        for (const key of keys) {
            let maxValue = -1;
            let winnerId: number | null = null;
            let isTie = false;

            for (const user of users) {
                const value = user.stats[key];
                if (value > maxValue) {
                    maxValue = value;
                    winnerId = user.id;
                    isTie = false;
                } else if (value === maxValue && maxValue > 0) {
                    isTie = true;
                }
            }

            winners[key] = isTie ? null : winnerId;
        }

        return winners;
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
