import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Manager } from './manager.entity';
import { ManagerEmployment } from '../managerEmployment/managerEmployment.entity';
import { Team } from '../team/team.entity';
import type { ManagerCareerRow, ManagerProfileResponse } from './manager-profile.types';

@Injectable()
export class ManagerProfileService {
    constructor(
        @InjectRepository(Manager) private readonly managerRepo: Repository<Manager>,
        @InjectRepository(ManagerEmployment)
        private readonly employmentRepo: Repository<ManagerEmployment>,
        @InjectRepository(Team) private readonly teamRepo: Repository<Team>,
    ) {}

    async getProfile(managerId: number): Promise<ManagerProfileResponse> {
        const manager = await this.managerRepo.findOne({ where: { id: managerId } });
        if (!manager) {
            throw new NotFoundException(`Manager ${managerId} not found`);
        }

        const employments = await this.employmentRepo.find({
            where: { managerId },
            order: { startDate: 'DESC', id: 'DESC' },
        });

        const teamsAsManager = await this.teamRepo.find({ where: { managerId } });

        const teamIdSet = new Set<number>();
        for (const e of employments) teamIdSet.add(e.teamId);
        for (const tid of manager.teamIds ?? []) {
            if (Number.isFinite(tid)) teamIdSet.add(tid);
        }
        for (const t of teamsAsManager) teamIdSet.add(t.id);

        const teams =
            teamIdSet.size > 0
                ? await this.teamRepo.find({ where: { id: In([...teamIdSet]) } })
                : [];
        const teamById = new Map(teams.map((t) => [t.id, t]));

        let career: ManagerCareerRow[];

        if (employments.length > 0) {
            career = employments.map((e) => {
                const team = teamById.get(e.teamId);
                return {
                    teamId: e.teamId,
                    teamName: team?.name ?? `Team #${e.teamId}`,
                    crest: team?.logoUrl ?? null,
                    from: e.startDate?.toISOString(),
                    to: e.endDate?.toISOString(),
                    isCurrent: e.isCurrent,
                    source: 'employment' as const,
                };
            });
        } else {
            career = [...teamIdSet].map((teamId) => {
                const team = teamById.get(teamId);
                const isCurrentFromTeam = team?.managerId === managerId;
                const isCurrentFromList = teamsAsManager.some((t) => t.id === teamId);
                return {
                    teamId,
                    teamName: team?.name ?? `Team #${teamId}`,
                    crest: team?.logoUrl ?? null,
                    isCurrent: isCurrentFromTeam || isCurrentFromList,
                    source: isCurrentFromTeam ? ('teamManagerId' as const) : ('teamIds' as const),
                };
            });

            career.sort((a, b) => {
                if (a.isCurrent !== b.isCurrent) return a.isCurrent ? -1 : 1;
                return a.teamName.localeCompare(b.teamName);
            });
        }

        const currentTeamId =
            employments.find((e) => e.isCurrent)?.teamId ??
            teamsAsManager[0]?.id ??
            career.find((c) => c.isCurrent)?.teamId ??
            (manager.teamIds?.length ? manager.teamIds[manager.teamIds.length - 1] : undefined);

        return {
            manager: {
                id: manager.id,
                name: manager.name,
                nickname: manager.nickname,
                nationality: manager.nationality,
                teamIds: manager.teamIds,
                metadata: manager.metadata,
            },
            career,
            ...(currentTeamId != null ? { currentTeamId } : {}),
            clubsManagedCount: teamIdSet.size,
        };
    }
}
