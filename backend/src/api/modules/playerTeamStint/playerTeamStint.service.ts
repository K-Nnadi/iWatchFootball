import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { CrudRepoAdapter } from '@iWatchFootball/base-tools/crud/crud.repo.adapter';
import { CreatePlayerTeamStintDTO, PlayerTeamStint } from './playerTeamStint.entity';
import { PlayerTeamStintSource } from '../../enums/playerTeamStint.enum';
import { Player } from '../player/player.entity';
import { Transfer } from '../transfer/transfer.entity';
import { Season } from '../season/season.entity';

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
    ): Promise<{ opened: number; closed: number }> {
        const uniquePlayerIds = [...new Set(playerIds.filter((id) => Number.isFinite(id) && id > 0))];
        const importDate = new Date();

        let opened = 0;
        for (const playerId of uniquePlayerIds) {
            await this.openStint({
                playerId,
                teamId,
                startDate: importDate,
                source: PlayerTeamStintSource.IMPORT,
                seasonId,
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
        const stints = await this.stintRepo.find({
            where: {
                teamId,
                isCurrent: true,
                ...(includeLoans ? {} : { isLoan: false }),
            },
            order: { kitNumber: 'ASC', id: 'ASC' },
        });

        if (stints.length === 0) return [];

        const playerIds = stints.map((s) => s.playerId);
        const players = await this.playerRepo.find({
            where: { id: In(playerIds) },
        });
        const byId = new Map(players.map((p) => [p.id, p]));
        return playerIds.map((id) => byId.get(id)).filter((p): p is Player => p != null);
    }

    async getSquadForSeason(teamId: number, seasonId: number, includeLoans = false): Promise<Player[]> {
        const season = await this.seasonRepo.findOne({ where: { id: seasonId } });
        if (!season) return [];

        const seasonStart = season.yearStart
            ? new Date(Date.UTC(season.yearStart, 6, 1))
            : undefined;
        const seasonEnd = season.yearEnd
            ? new Date(Date.UTC(season.yearEnd, 5, 30, 23, 59, 59))
            : undefined;

        const bySeasonId = await this.stintRepo.find({
            where: {
                teamId,
                seasonId,
                ...(includeLoans ? {} : { isLoan: false }),
            },
        });

        if (bySeasonId.length > 0) {
            const playerIds = [...new Set(bySeasonId.map((s) => s.playerId))];
            const players = await this.playerRepo.find({ where: { id: In(playerIds) } });
            return players.sort((a, b) => a.name.localeCompare(b.name));
        }

        if (!seasonStart || !seasonEnd) {
            return this.getCurrentSquad(teamId, includeLoans);
        }

        const overlapping = await this.stintRepo
            .createQueryBuilder('s')
            .where('s.teamId = :teamId', { teamId })
            .andWhere(includeLoans ? '1=1' : 's.isLoan = false')
            .andWhere('(s.startDate IS NULL OR s.startDate <= :seasonEnd)', { seasonEnd })
            .andWhere('(s.endDate IS NULL OR s.endDate >= :seasonStart)', { seasonStart })
            .getMany();

        const playerIds = [...new Set(overlapping.map((s) => s.playerId))];
        if (playerIds.length === 0) return [];

        const players = await this.playerRepo.find({ where: { id: In(playerIds) } });
        return players.sort((a, b) => a.name.localeCompare(b.name));
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
