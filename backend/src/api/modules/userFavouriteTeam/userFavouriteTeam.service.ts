import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { UserFavouriteTeam } from './userFavouriteTeam.entity';

@Injectable()
export class UserFavouriteTeamService {
    constructor(
        @InjectRepository(UserFavouriteTeam)
        private readonly repo: Repository<UserFavouriteTeam>,
    ) {}

    async getTeamIdsByUserIds(userIds: number[]): Promise<Map<number, number[]>> {
        if (userIds.length === 0) {
            return new Map();
        }

        const rows = await this.repo.find({
            where: { userId: In(userIds) },
            select: ['userId', 'teamId'],
            order: { id: 'ASC' },
        });

        const map = new Map<number, number[]>();
        for (const row of rows) {
            const existing = map.get(row.userId) ?? [];
            existing.push(row.teamId);
            map.set(row.userId, existing);
        }
        return map;
    }

    async getTeamIdsForUser(userId: number): Promise<number[]> {
        const map = await this.getTeamIdsByUserIds([userId]);
        return map.get(userId) ?? [];
    }

    async setFavouriteTeams(userId: number, teamIds: number[]): Promise<number[]> {
        const unique = [...new Set(teamIds.filter((id) => Number.isFinite(id) && id > 0))];
        const existing = await this.repo.find({ where: { userId } });
        const existingIds = new Set(existing.map((row) => row.teamId));
        const targetIds = new Set(unique);

        const toRemove = existing.filter((row) => !targetIds.has(row.teamId));
        if (toRemove.length > 0) {
            await this.repo.remove(toRemove);
        }

        const toAdd = unique.filter((teamId) => !existingIds.has(teamId));
        if (toAdd.length > 0) {
            await this.repo.save(toAdd.map((teamId) => this.repo.create({ userId, teamId })));
        }

        return unique;
    }
}
