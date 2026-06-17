import {
    BadRequestException,
    ForbiddenException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, In, Repository } from 'typeorm';
import { UserConnection } from './userConnection.entity';
import { User } from '../user/user.entity';
import { UserConnectionStatus, TrackerVisibility } from '../../enums/social.enum';
import { NotificationService } from '../notification/notification.service';
import { NotificationType } from '../../enums/notification.enum';
import { UserFavouriteTeamService } from '../userFavouriteTeam/userFavouriteTeam.service';

export type PublicUserSummary = {
    id: number;
    userName: string;
    firstName: string;
    lastName: string;
    favouriteTeamIds?: number[];
};

export type FriendListItem = PublicUserSummary & {
    connectionId: number;
    friendsSince: string;
};

export type PendingFriendRequest = {
    connectionId: number;
    user: PublicUserSummary;
    direction: 'incoming' | 'outgoing';
    requestedAt: string;
};

export type FriendsListResponse = {
    friends: FriendListItem[];
    pending: PendingFriendRequest[];
};

@Injectable()
export class SocialService {
    constructor(
        @InjectRepository(UserConnection)
        private readonly connectionRepo: Repository<UserConnection>,
        @InjectRepository(User)
        private readonly userRepo: Repository<User>,
        private readonly notificationService: NotificationService,
        private readonly favouriteTeamService: UserFavouriteTeamService,
    ) {}

    async searchUsers(query: string, excludeUserId: number, limit = 20): Promise<PublicUserSummary[]> {
        const q = query.trim();
        if (q.length < 2) {
            return [];
        }

        const rows = await this.userRepo
            .createQueryBuilder('u')
            .select([
                'u.id',
                'u.userName',
                'u.firstName',
                'u.lastName',
            ])
            .where('u.id != :excludeUserId', { excludeUserId })
            .andWhere(
                new Brackets((qb) => {
                    qb.where('u.userName ILIKE :like', { like: `%${q}%` })
                        .orWhere('u.firstName ILIKE :like')
                        .orWhere('u.lastName ILIKE :like');
                }),
            )
            .orderBy('u.userName', 'ASC')
            .take(limit)
            .getMany();

        return this.enrichPublicSummaries(rows);
    }

    async listFriends(userId: number): Promise<FriendsListResponse> {
        const connections = await this.connectionRepo.find({
            where: [
                { requesterId: userId, status: UserConnectionStatus.ACCEPTED },
                { addresseeId: userId, status: UserConnectionStatus.ACCEPTED },
            ],
            order: { updatedAt: 'DESC' },
        });

        const pendingRows = await this.connectionRepo.find({
            where: [
                { requesterId: userId, status: UserConnectionStatus.PENDING },
                { addresseeId: userId, status: UserConnectionStatus.PENDING },
            ],
            order: { createdAt: 'DESC' },
        });

        const friendUserIds = connections.map((c) =>
            c.requesterId === userId ? c.addresseeId : c.requesterId,
        );
        const pendingUserIds = pendingRows.map((c) =>
            c.requesterId === userId ? c.addresseeId : c.requesterId,
        );

        const allUserIds = [...new Set([...friendUserIds, ...pendingUserIds])];
        const usersById = await this.loadUsersByIds(allUserIds);
        const teamIdsByUser = await this.favouriteTeamService.getTeamIdsByUserIds(allUserIds);

        const friends: FriendListItem[] = connections
            .map((c) => {
                const friendId = c.requesterId === userId ? c.addresseeId : c.requesterId;
                const user = usersById.get(friendId);
                if (!user) return null;
                return {
                    ...this.toPublicSummary(user, teamIdsByUser.get(user.id) ?? []),
                    connectionId: c.id,
                    friendsSince: c.updatedAt.toISOString(),
                };
            })
            .filter((x): x is FriendListItem => x != null);

        const pending: PendingFriendRequest[] = pendingRows
            .map((c) => {
                const otherId = c.requesterId === userId ? c.addresseeId : c.requesterId;
                const user = usersById.get(otherId);
                if (!user) return null;
                return {
                    connectionId: c.id,
                    user: this.toPublicSummary(user, teamIdsByUser.get(user.id) ?? []),
                    direction: c.addresseeId === userId ? 'incoming' : 'outgoing',
                    requestedAt: c.createdAt.toISOString(),
                };
            })
            .filter((x): x is PendingFriendRequest => x != null);

        return { friends, pending };
    }

    async sendFriendRequest(requesterId: number, targetUserId: number): Promise<UserConnection> {
        if (requesterId === targetUserId) {
            throw new BadRequestException('You cannot add yourself as a friend');
        }

        const target = await this.userRepo.findOne({ where: { id: targetUserId } });
        if (!target) {
            throw new NotFoundException('User not found');
        }

        const existing = await this.findConnectionBetween(requesterId, targetUserId);
        if (existing) {
            if (existing.status === UserConnectionStatus.ACCEPTED) {
                throw new BadRequestException('You are already friends');
            }
            if (existing.status === UserConnectionStatus.BLOCKED) {
                throw new ForbiddenException('Unable to send friend request');
            }
            if (existing.status === UserConnectionStatus.PENDING) {
                if (existing.requesterId === targetUserId && existing.addresseeId === requesterId) {
                    existing.status = UserConnectionStatus.ACCEPTED;
                    const saved = await this.connectionRepo.save(existing);
                    const requester = await this.userRepo.findOne({ where: { id: requesterId } });
                    if (requester) {
                        await this.notifyFriendRequestAccepted(
                            existing.requesterId,
                            requester,
                            saved.id,
                        );
                    }
                    return saved;
                }
                throw new BadRequestException('Friend request already pending');
            }
        }

        const requester = await this.userRepo.findOne({ where: { id: requesterId } });
        const saved = await this.connectionRepo.save(
            this.connectionRepo.create({
                requesterId,
                addresseeId: targetUserId,
                status: UserConnectionStatus.PENDING,
            }),
        );
        if (requester) {
            await this.notifyFriendRequestReceived(targetUserId, requester, saved.id);
        }
        return saved;
    }

    async acceptFriendRequest(userId: number, connectionId: number): Promise<UserConnection> {
        const connection = await this.getConnectionOrThrow(connectionId);
        if (connection.addresseeId !== userId) {
            throw new ForbiddenException('Only the recipient can accept this request');
        }
        if (connection.status !== UserConnectionStatus.PENDING) {
            throw new BadRequestException('Request is not pending');
        }
        connection.status = UserConnectionStatus.ACCEPTED;
        const saved = await this.connectionRepo.save(connection);
        const accepter = await this.userRepo.findOne({ where: { id: userId } });
        if (accepter) {
            await this.notifyFriendRequestAccepted(connection.requesterId, accepter, saved.id);
        }
        return saved;
    }

    async declineFriendRequest(userId: number, connectionId: number): Promise<void> {
        const connection = await this.getConnectionOrThrow(connectionId);
        if (connection.addresseeId !== userId) {
            throw new ForbiddenException('Only the recipient can decline this request');
        }
        if (connection.status !== UserConnectionStatus.PENDING) {
            throw new BadRequestException('Request is not pending');
        }
        connection.status = UserConnectionStatus.DECLINED;
        await this.connectionRepo.save(connection);
    }

    async removeFriend(userId: number, connectionId: number): Promise<void> {
        const connection = await this.getConnectionOrThrow(connectionId);
        if (connection.requesterId !== userId && connection.addresseeId !== userId) {
            throw new ForbiddenException('Not part of this connection');
        }
        if (connection.status !== UserConnectionStatus.ACCEPTED) {
            throw new BadRequestException('Not an accepted friendship');
        }
        await this.connectionRepo.remove(connection);
    }

    async areFriends(userId: number, otherUserId: number): Promise<boolean> {
        const connection = await this.findConnectionBetween(userId, otherUserId);
        return connection?.status === UserConnectionStatus.ACCEPTED;
    }

    async assertCanViewTrackerStats(viewerId: number, targetUserId: number): Promise<User> {
        const target = await this.userRepo.findOne({ where: { id: targetUserId } });
        if (!target) {
            throw new NotFoundException('User not found');
        }
        if (viewerId === targetUserId) {
            return target;
        }

        const visibility = target.trackerVisibility ?? TrackerVisibility.PRIVATE;
        if (visibility === TrackerVisibility.PRIVATE) {
            throw new ForbiddenException('This user keeps their tracker stats private');
        }
        if (visibility === TrackerVisibility.FRIENDS) {
            const friends = await this.areFriends(viewerId, targetUserId);
            if (!friends) {
                throw new ForbiddenException('Tracker stats are visible to friends only');
            }
        }
        return target;
    }

    async assertCanCompare(viewerId: number, friendUserId: number): Promise<{ me: User; friend: User }> {
        if (viewerId === friendUserId) {
            throw new BadRequestException('Cannot compare with yourself');
        }
        const friend = await this.userRepo.findOne({ where: { id: friendUserId } });
        if (!friend) {
            throw new NotFoundException('User not found');
        }
        const friends = await this.areFriends(viewerId, friendUserId);
        if (!friends) {
            throw new ForbiddenException('Compare is available for accepted friends only');
        }
        await this.assertCanViewTrackerStats(viewerId, friendUserId);
        const me = await this.userRepo.findOne({ where: { id: viewerId } });
        if (!me) {
            throw new NotFoundException('User not found');
        }
        return { me, friend };
    }

    async updateTrackerPrivacy(
        userId: number,
        body: { trackerVisibility?: TrackerVisibility; shareVerifiedOnly?: boolean },
    ): Promise<{ trackerVisibility: TrackerVisibility; shareVerifiedOnly: boolean }> {
        const user = await this.userRepo.findOne({ where: { id: userId } });
        if (!user) {
            throw new NotFoundException('User not found');
        }
        if (body.trackerVisibility != null) {
            user.trackerVisibility = body.trackerVisibility;
        }
        if (body.shareVerifiedOnly != null) {
            user.shareVerifiedOnly = body.shareVerifiedOnly;
        }
        await this.userRepo.save(user);
        return {
            trackerVisibility: user.trackerVisibility ?? TrackerVisibility.PRIVATE,
            shareVerifiedOnly: user.shareVerifiedOnly ?? true,
        };
    }

    private async getConnectionOrThrow(connectionId: number): Promise<UserConnection> {
        const connection = await this.connectionRepo.findOne({ where: { id: connectionId } });
        if (!connection) {
            throw new NotFoundException('Connection not found');
        }
        return connection;
    }

    private async findConnectionBetween(
        userA: number,
        userB: number,
    ): Promise<UserConnection | null> {
        return this.connectionRepo.findOne({
            where: [
                { requesterId: userA, addresseeId: userB },
                { requesterId: userB, addresseeId: userA },
            ],
        });
    }

    private async loadUsersByIds(ids: number[]): Promise<Map<number, User>> {
        if (ids.length === 0) return new Map();
        const users = await this.userRepo.find({ where: { id: In(ids) } });
        return new Map(users.map((u) => [u.id, u]));
    }

    private async enrichPublicSummaries(users: User[]): Promise<PublicUserSummary[]> {
        if (users.length === 0) {
            return [];
        }
        const teamIdsByUser = await this.favouriteTeamService.getTeamIdsByUserIds(users.map((user) => user.id));
        return users.map((user) => this.toPublicSummary(user, teamIdsByUser.get(user.id) ?? []));
    }

    private toPublicSummary(user: User, favouriteTeamIds: number[] = []): PublicUserSummary {
        return {
            id: user.id,
            userName: user.userName,
            firstName: user.firstName,
            lastName: user.lastName,
            favouriteTeamIds,
        };
    }

    private displayName(user: User): string {
        const name = `${user.firstName} ${user.lastName}`.trim();
        return name || `@${user.userName}`;
    }

    private async notifyFriendRequestReceived(
        recipientUserId: number,
        sender: User,
        connectionId: number,
    ): Promise<void> {
        const label = this.displayName(sender);
        await this.notificationService.createIfAllowed({
            userId: recipientUserId,
            type: NotificationType.FRIEND_REQUEST_RECEIVED,
            title: 'New friend request',
            message: `${label} sent you a friend request`,
            metadata: {
                connectionId,
                actorUserId: sender.id,
                actorUserName: sender.userName,
            },
        });
    }

    private async notifyFriendRequestAccepted(
        recipientUserId: number,
        accepter: User,
        connectionId: number,
    ): Promise<void> {
        const label = this.displayName(accepter);
        await this.notificationService.createIfAllowed({
            userId: recipientUserId,
            type: NotificationType.FRIEND_REQUEST_ACCEPTED,
            title: 'Friend request accepted',
            message: `${label} accepted your friend request`,
            metadata: {
                connectionId,
                actorUserId: accepter.id,
                actorUserName: accepter.userName,
            },
        });
    }
}
