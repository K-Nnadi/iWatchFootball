import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { CrudRepoAdapter } from '@iWatchFootball/base-tools/crud/crud.repo.adapter';
import { CreatePlayerTeamStintDTO, PlayerTeamStint } from './playerTeamStint.entity';
import { PlayerTeamStintSource } from '../../enums/playerTeamStint.enum';
import { Player } from '../player/player.entity';
import { Transfer } from '../transfer/transfer.entity';
import { Season } from '../season/season.entity';
import { Position } from '../position/position.entity';
import { Manager } from '../manager/manager.entity';
import { ManagerEmployment } from '../managerEmployment/managerEmployment.entity';
import { Team } from '../team/team.entity';
import { TeamCompetitionSeason } from '../teamCompetitionSeason/teamCompetitionSeason.entity';
import { resolveSquadPositionGroup } from './squad-position-group';
import type {
    SquadMemberDto,
    TeamCurrentManagerResponse,
    TeamSeasonOptionDto,
} from './team-squad.types';

export type OpenStintParams = {
    playerId: number;
    teamId: number;
    startDate?: Date;
    source: PlayerTeamStintSource;
    isLoan?: boolean;
    seasonId?: number;
    kitNumber?: number;
};

@Injectable()
export class PlayerTeamStintService extends CrudRepoAdapter<PlayerTeamStint, CreatePlayerTeamStintDTO> {
    constructor(
        @InjectRepository(PlayerTeamStint) private readonly stintRepo: Repository<PlayerTeamStint>,
        @InjectRepository(Player) private readonly playerRepo: Repository<Player>,
        @InjectRepository(Transfer) private readonly transferRepo: Repository<Transfer>,
        @InjectRepository(Season) private readonly seasonRepo: Repository<Season>,
        @InjectRepository(Position) private readonly positionRepo: Repository<Position>,
        @InjectRepository(Manager) private readonly managerRepo: Repository<Manager>,
        @InjectRepository(ManagerEmployment)
        private readonly employmentRepo: Repository<ManagerEmployment>,
        @InjectRepository(Team) private readonly teamRepo: Repository<Team>,
        @InjectRepository(TeamCompetitionSeason)
        private readonly tcsRepo: Repository<TeamCompetitionSeason>,
    ) {
        super(stintRepo);
    }

    async openStint(params: OpenStintParams): Promise<PlayerTeamStint> {
        const startDate = params.startDate ?? new Date();
        const isLoan = params.isLoan ?? false;

        const [existingCurrentAtTeam] = await this.getQuery({
            where: {
                playerId: params.playerId,
                teamId: params.teamId,
                isCurrent: true,
            } as any,
        });

        if (existingCurrentAtTeam) {
            await this.update(existingCurrentAtTeam.id, {
                id: existingCurrentAtTeam.id,
                isLoan,
                seasonId: params.seasonId ?? existingCurrentAtTeam.seasonId,
                kitNumber: params.kitNumber ?? existingCurrentAtTeam.kitNumber,
                source: params.source,
                startDate: existingCurrentAtTeam.startDate ?? startDate,
            } as any);
            if (!isLoan) {
                await this.refreshPlayerCurrentTeamId(params.playerId);
            }
            return (await this.getOne(existingCurrentAtTeam.id)) as PlayerTeamStint;
        }

        if (!isLoan) {
            await this.closeAllCurrentPrimaryStints(params.playerId, startDate);
        } else {
            await this.closeCurrentLoanStintsAtTeam(params.playerId, params.teamId, startDate);
        }

        const created = await this.create({
            playerId: params.playerId,
            teamId: params.teamId,
            startDate,
            endDate: null,
            isCurrent: true,
            isLoan,
            seasonId: params.seasonId,
            kitNumber: params.kitNumber,
            source: params.source,
        } as CreatePlayerTeamStintDTO);

        if (!isLoan) {
            await this.refreshPlayerCurrentTeamId(params.playerId);
        }

        return created;
    }

    async closeStint(params: { playerId: number; teamId: number; endDate?: Date }): Promise<void> {
        const endDate = params.endDate ?? new Date();
        const openStints = await this.getQuery({
            where: {
                playerId: params.playerId,
                teamId: params.teamId,
                isCurrent: true,
            } as any,
        });

        for (const stint of openStints) {
            await this.update(stint.id, {
                id: stint.id,
                isCurrent: false,
                endDate,
            } as any);
        }

        await this.refreshPlayerCurrentTeamId(params.playerId);
    }

    async applyTransfer(transfer: {
        playerId: number;
        sourceTeamId: number;
        destinationTeamId: number;
        date?: Date;
        isLoan?: boolean;
    }): Promise<void> {
        const when = transfer.date ?? new Date();
        await this.closeStint({
            playerId: transfer.playerId,
            teamId: transfer.sourceTeamId,
            endDate: when,
        });
        await this.openStint({
            playerId: transfer.playerId,
            teamId: transfer.destinationTeamId,
            startDate: when,
            source: PlayerTeamStintSource.TRANSFER,
            isLoan: transfer.isLoan ?? false,
        });
    }

    async rebuildFromTransfers(playerId: number): Promise<number> {
        const transfers = await this.transferRepo.find({
            where: { playerId },
            order: { date: 'ASC', id: 'ASC' },
        });

        const existing = await this.getQuery({ where: { playerId } as any });
        for (const stint of existing) {
            await this.update(stint.id, {
                id: stint.id,
                isCurrent: false,
                endDate: stint.endDate ?? new Date(),
            } as any);
        }

        let applied = 0;
        for (const t of transfers) {
            await this.applyTransfer({
                playerId: t.playerId,
                sourceTeamId: t.sourceTeamId,
                destinationTeamId: t.destinationTeamId,
                date: t.date,
                isLoan: t.isLoan ?? false,
            });
            applied += 1;
        }

        await this.refreshPlayerCurrentTeamId(playerId);
        return applied;
    }

    async syncCurrentRosterFromImport(
        teamId: number,
        playerIds: number[],
        seasonId?: number,
        kitByPlayerId?: Record<number, number>,
    ): Promise<{ opened: number; closed: number }> {
        const uniquePlayerIds: number[] = [];
        const seen = new Set<number>();
        for (const id of playerIds) {
            if (!Number.isFinite(id) || id <= 0 || seen.has(id)) continue;
            seen.add(id);
            uniquePlayerIds.push(id);
        }
        const importDate = new Date();

        let opened = 0;
        for (const playerId of uniquePlayerIds) {
            const kit = kitByPlayerId?.[playerId];
            await this.openStint({
                playerId,
                teamId,
                startDate: importDate,
                source: PlayerTeamStintSource.IMPORT,
                seasonId,
                ...(kit != null ? { kitNumber: kit } : {}),
            });
            opened += 1;
        }

        const currentImportStints = await this.getQuery({
            where: {
                teamId,
                isCurrent: true,
                source: PlayerTeamStintSource.IMPORT,
            } as any,
        });

        let closed = 0;
        const rosterSet = new Set(uniquePlayerIds);
        for (const stint of currentImportStints) {
            if (!rosterSet.has(stint.playerId)) {
                await this.closeStint({
                    playerId: stint.playerId,
                    teamId,
                    endDate: importDate,
                });
                closed += 1;
            }
        }

        return { opened, closed };
    }

    async getCurrentSquad(teamId: number, includeLoans = false): Promise<Player[]> {
        const stints = await this.loadSquadStints(teamId, undefined, includeLoans);
        return this.playersFromStints(stints);
    }

    /** Season squad is stints tagged with that seasonId only — no date-overlap fallback. */
    async getSquadForSeason(teamId: number, seasonId: number, includeLoans = false): Promise<Player[]> {
        const stints = await this.loadSquadStints(teamId, seasonId, includeLoans);
        const players = await this.playersFromStints(stints);
        return players.sort((a, b) => a.name.localeCompare(b.name));
    }

    async getSquadMembers(
        teamId: number,
        seasonId?: number,
        includeLoans = false,
    ): Promise<SquadMemberDto[]> {
        const stints = await this.loadSquadStints(teamId, seasonId, includeLoans);
        const uniqueStints = dedupeStintsByPlayer(stints);
        const players = await this.playersFromStints(uniqueStints);
        const playerById = new Map(players.map((p) => [p.id, p]));

        const positionIds = new Set<number>();
        for (const player of players) {
            for (const pid of player.positionIds ?? []) {
                if (Number.isFinite(pid) && pid > 0) positionIds.add(pid);
            }
        }
        const positions =
            positionIds.size > 0
                ? await this.positionRepo.find({ where: { id: In([...positionIds]) } })
                : [];
        const positionById = new Map(positions.map((p) => [p.id, p]));

        const members: SquadMemberDto[] = [];
        for (const stint of uniqueStints) {
            const player = playerById.get(stint.playerId);
            if (!player) continue;
            const primaryPosId = (player.positionIds ?? []).find((id) => Number.isFinite(id) && id > 0);
            const pos = primaryPosId != null ? positionById.get(primaryPosId) : undefined;
            const positionName = pos?.name ?? 'Player';
            members.push({
                id: player.id,
                name: player.name,
                nationality: player.nationality,
                dateOfBirth: player.dateOfBirth ? new Date(player.dateOfBirth).toISOString() : null,
                photoUrl: player.photoUrl ?? null,
                position: positionName,
                positionGroup: resolveSquadPositionGroup(positionName, pos?.type),
                ...(stint.kitNumber != null ? { kitNumber: stint.kitNumber } : {}),
                isLoan: stint.isLoan ?? false,
            });
        }

        if (seasonId != null) {
            members.sort((a, b) => a.name.localeCompare(b.name));
        }
        return members;
    }

    async getTeamSeasons(teamId: number): Promise<TeamSeasonOptionDto[]> {
        const team = await this.teamRepo.findOne({ where: { id: teamId } });
        if (!team) {
            throw new NotFoundException(`Team ${teamId} not found`);
        }

        const [stintRows, tcsRows] = await Promise.all([
            this.stintRepo
                .createQueryBuilder('s')
                .select('DISTINCT s.seasonId', 'seasonId')
                .where('s.teamId = :teamId', { teamId })
                .andWhere('s.seasonId IS NOT NULL')
                .getRawMany<{ seasonId: number }>(),
            this.tcsRepo
                .createQueryBuilder('t')
                .select('DISTINCT t.seasonId', 'seasonId')
                .where('t.teamId = :teamId', { teamId })
                .getRawMany<{ seasonId: number }>(),
        ]);

        const ids = new Set<number>();
        for (const row of [...stintRows, ...tcsRows]) {
            const n = Number(row.seasonId);
            if (Number.isFinite(n) && n > 0) ids.add(n);
        }
        if (ids.size === 0) return [];

        const seasons = await this.seasonRepo.find({ where: { id: In([...ids]) } });
        return seasons
            .sort((a, b) => (b.yearStart ?? 0) - (a.yearStart ?? 0))
            .map((s) => ({
                id: s.id,
                yearStart: s.yearStart,
                yearEnd: s.yearEnd,
                label: `${s.yearStart}/${s.yearEnd}`,
            }));
    }

    async getCurrentManager(teamId: number): Promise<TeamCurrentManagerResponse> {
        const team = await this.teamRepo.findOne({ where: { id: teamId } });
        if (!team) {
            throw new NotFoundException(`Team ${teamId} not found`);
        }

        const employment = await this.employmentRepo.findOne({
            where: { teamId, isCurrent: true },
            order: { startDate: 'DESC', id: 'DESC' },
        });
        if (employment) {
            const manager = await this.managerRepo.findOne({ where: { id: employment.managerId } });
            if (manager) {
                return {
                    manager: {
                        id: manager.id,
                        name: manager.name,
                        nationality: manager.nationality,
                    },
                    source: 'employment',
                };
            }
        }

        if (team.managerId) {
            const manager = await this.managerRepo.findOne({ where: { id: team.managerId } });
            if (manager) {
                return {
                    manager: {
                        id: manager.id,
                        name: manager.name,
                        nationality: manager.nationality,
                    },
                    source: 'teamManagerId',
                };
            }
        }

        return { manager: null };
    }

    private async loadSquadStints(
        teamId: number,
        seasonId: number | undefined,
        includeLoans: boolean,
    ): Promise<PlayerTeamStint[]> {
        if (seasonId != null) {
            const season = await this.seasonRepo.findOne({ where: { id: seasonId } });
            if (!season) return [];
            return this.stintRepo.find({
                where: {
                    teamId,
                    seasonId,
                    ...(includeLoans ? {} : { isLoan: false }),
                },
                order: { kitNumber: 'ASC', id: 'ASC' },
            });
        }

        return this.stintRepo.find({
            where: {
                teamId,
                isCurrent: true,
                ...(includeLoans ? {} : { isLoan: false }),
            },
            order: { kitNumber: 'ASC', id: 'ASC' },
        });
    }

    private async playersFromStints(stints: PlayerTeamStint[]): Promise<Player[]> {
        if (stints.length === 0) return [];
        const playerIds = [...new Set(stints.map((s) => s.playerId))];
        const players = await this.playerRepo.find({ where: { id: In(playerIds) } });
        const byId = new Map(players.map((p) => [p.id, p]));
        return stints.map((s) => byId.get(s.playerId)).filter((p): p is Player => p != null);
    }

    async getCurrentStintsForTeam(teamId: number): Promise<PlayerTeamStint[]> {
        return this.stintRepo.find({
            where: { teamId, isCurrent: true },
            order: { kitNumber: 'ASC', id: 'ASC' },
        });
    }

    private async closeAllCurrentPrimaryStints(playerId: number, endDate: Date): Promise<void> {
        const open = await this.getQuery({
            where: { playerId, isCurrent: true, isLoan: false } as any,
        });
        for (const stint of open) {
            await this.update(stint.id, {
                id: stint.id,
                isCurrent: false,
                endDate,
            } as any);
        }
    }

    private async closeCurrentLoanStintsAtTeam(
        playerId: number,
        teamId: number,
        endDate: Date,
    ): Promise<void> {
        const open = await this.getQuery({
            where: { playerId, teamId, isCurrent: true, isLoan: true } as any,
        });
        for (const stint of open) {
            await this.update(stint.id, {
                id: stint.id,
                isCurrent: false,
                endDate,
            } as any);
        }
    }

    async refreshPlayerCurrentTeamId(playerId: number): Promise<void> {
        const [primary] = await this.stintRepo.find({
            where: { playerId, isCurrent: true, isLoan: false },
            order: { startDate: 'DESC', id: 'DESC' },
            take: 1,
        });

        await this.playerRepo.update(playerId, {
            currentTeamId: primary?.teamId ?? null,
        } as any);
    }

    async backfillAllFromLegacyData(): Promise<{
        fromTransfers: number;
        skipped: number;
    }> {
        let fromTransfers = 0;
        let skipped = 0;

        const playerIdsWithTransfers = await this.transferRepo
            .createQueryBuilder('t')
            .select('DISTINCT t.playerId', 'playerId')
            .getRawMany<{ playerId: number }>();

        const handled = new Set<number>();
        for (const row of playerIdsWithTransfers) {
            const playerId = Number(row.playerId);
            if (!Number.isFinite(playerId)) continue;
            await this.rebuildFromTransfers(playerId);
            handled.add(playerId);
            fromTransfers += 1;
        }

        const players = await this.playerRepo.find();
        for (const player of players) {
            if (handled.has(player.id)) continue;
            if (player.currentTeamId) {
                await this.openStint({
                    playerId: player.id,
                    teamId: player.currentTeamId,
                    source: PlayerTeamStintSource.MANUAL,
                });
            } else {
                skipped += 1;
            }
        }

        return { fromTransfers, skipped };
    }
}

function dedupeStintsByPlayer(stints: PlayerTeamStint[]): PlayerTeamStint[] {
    const seen = new Set<number>();
    const unique: PlayerTeamStint[] = [];
    for (const stint of stints) {
        if (seen.has(stint.playerId)) continue;
        seen.add(stint.playerId);
        unique.push(stint);
    }
    return unique;
}
