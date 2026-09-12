import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Manager } from './manager.entity';
import { ManagerEmployment } from '../managerEmployment/managerEmployment.entity';
import { Team } from '../team/team.entity';
import { Fixture } from '../fixture/fixture.entity';
import type { ManagerCareerRow, ManagerMatchRow, ManagerProfileResponse } from './manager-profile.types';

@Injectable()
export class ManagerProfileService {
    constructor(
        @InjectRepository(Manager) private readonly managerRepo: Repository<Manager>,
        @InjectRepository(ManagerEmployment)
        private readonly employmentRepo: Repository<ManagerEmployment>,
        @InjectRepository(Team) private readonly teamRepo: Repository<Team>,
        @InjectRepository(Fixture) private readonly fixtureRepo: Repository<Fixture>,
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

        const recentMatches =
            currentTeamId != null ? await this.loadRecentMatches(currentTeamId, teamById) : [];

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
            recentMatches,
        };
    }

    private async loadRecentMatches(
        currentTeamId: number,
        knownTeams: Map<number, Team>,
    ): Promise<ManagerMatchRow[]> {
        const fixtures = await this.fixtureRepo
            .createQueryBuilder('f')
            .where('(f."homeTeamId" = :teamId OR f."awayTeamId" = :teamId)', { teamId: currentTeamId })
            .andWhere('f."deletedAt" IS NULL')
            .andWhere('f.date <= :now', { now: new Date() })
            .orderBy('f.date', 'DESC')
            .addOrderBy('f.id', 'DESC')
            .take(40)
            .getMany();

        const scored = fixtures.filter((f) => {
            const scores = scoresFromFixture(f);
            return f.homeTeamId != null && f.awayTeamId != null && scores.homeScore != null && scores.awayScore != null;
        });

        const neededIds = new Set<number>();
        for (const f of scored) {
            if (f.homeTeamId != null) neededIds.add(f.homeTeamId);
            if (f.awayTeamId != null) neededIds.add(f.awayTeamId);
        }

        const missingIds = [...neededIds].filter((id) => !knownTeams.has(id));
        const extraTeams =
            missingIds.length > 0
                ? await this.teamRepo.find({ where: { id: In(missingIds) } })
                : [];
        const teamById = new Map(knownTeams);
        for (const t of extraTeams) teamById.set(t.id, t);

        return scored.slice(0, 12).map((f) => {
            const homeTeamId = f.homeTeamId!;
            const awayTeamId = f.awayTeamId!;
            const scores = scoresFromFixture(f);
            return {
                id: f.id,
                date: f.date.toISOString(),
                homeTeamId,
                awayTeamId,
                homeTeamName: teamById.get(homeTeamId)?.name ?? `Team #${homeTeamId}`,
                awayTeamName: teamById.get(awayTeamId)?.name ?? `Team #${awayTeamId}`,
                ...(scores.homeScore != null ? { homeScore: scores.homeScore } : {}),
                ...(scores.awayScore != null ? { awayScore: scores.awayScore } : {}),
                metadata: f.metadata as unknown,
            };
        });
    }
}

function scoresFromFixture(f: {
    homeScore?: number | null;
    awayScore?: number | null;
    metadata?: unknown;
}): { homeScore?: number; awayScore?: number } {
    const fromCol = (v: unknown): number | undefined => {
        if (typeof v === 'number' && Number.isFinite(v)) return v;
        if (typeof v === 'string' && v.trim() !== '') {
            const n = Number(v);
            return Number.isFinite(n) ? n : undefined;
        }
        return undefined;
    };

    let homeScore = fromCol(f.homeScore);
    let awayScore = fromCol(f.awayScore);
    const meta =
        f.metadata && typeof f.metadata === 'object' && f.metadata !== null
            ? (f.metadata as Record<string, unknown>)
            : undefined;
    if (meta) {
        if (homeScore === undefined) homeScore = fromCol(meta.homeScore ?? meta.home_score);
        if (awayScore === undefined) awayScore = fromCol(meta.awayScore ?? meta.away_score);
    }
    return { ...(homeScore != null ? { homeScore } : {}), ...(awayScore != null ? { awayScore } : {}) };
}
