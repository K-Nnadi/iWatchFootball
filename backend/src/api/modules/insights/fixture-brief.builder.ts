import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Fixture } from '../fixture/fixture.entity';
import { Competition } from '../competition/competition.entity';
import { LineUp } from '../lineUp/lineUp.entity';
import { PlayerLineUp } from '../playerLineUp/playerLineUp.entity';
import { Goal } from '../goal/goal.entity';
import { Team } from '../team/team.entity';
import { Stadium } from '../stadium/stadium.entity';

/** JSON-safe brief for LLM grounding */
export type FixtureBriefJson = {
    fixtureId: number;
    kickoff: string;
    status: string;
    stage: string;
    competitionId: number;
    competitionName?: string;
    seasonId: number;
    home?: { id: number; name: string };
    away?: { id: number; name: string };
    stadium?: { id: number; name: string; country?: string };
    lineups?: Array<{
        teamId: number;
        teamName?: string;
        formation?: string;
        starters: Array<{ name: string; number?: number; position?: string }>;
    }>;
    goals?: Array<{
        minute: number;
        scorerName?: string;
        teamId: number;
        penalty?: boolean;
        ownGoal?: boolean;
    }>;
};

@Injectable()
export class FixtureBriefBuilder {
    constructor(
        @InjectRepository(Fixture) private readonly fixtureRepo: Repository<Fixture>,
        @InjectRepository(Competition) private readonly competitionRepo: Repository<Competition>,
        @InjectRepository(LineUp) private readonly lineUpRepo: Repository<LineUp>,
        @InjectRepository(Goal) private readonly goalRepo: Repository<Goal>,
    ) {}

    async build(fixtureId: number): Promise<FixtureBriefJson> {
        const fixture = await this.fixtureRepo.findOneBy({ id: fixtureId });
        if (!fixture) {
            throw new NotFoundException(`Fixture ${fixtureId} not found`);
        }

        const [homeTeam, awayTeam, stadium, competition, lineUps, goalsEnt] = await Promise.all([
            fixture.homeTeamId
                ? this.fixtureRepo.manager.getRepository(Team).findOneBy({ id: fixture.homeTeamId })
                : null,
            fixture.awayTeamId
                ? this.fixtureRepo.manager.getRepository(Team).findOneBy({ id: fixture.awayTeamId })
                : null,
            fixture.stadiumId
                ? this.fixtureRepo.manager.getRepository(Stadium).findOneBy({ id: fixture.stadiumId })
                : null,
            this.competitionRepo.findOneBy({ id: fixture.competitionId }),
            this.lineUpRepo.find({
                where: { fixtureId },
                relations: { playerLineups: { player: true }, team: true },
            }),
            this.goalRepo.find({
                where: { fixtureId },
                relations: { scorer: true },
            }),
        ]);

        const briefLineups = await Promise.all(
            lineUps.map(async (lu) => {
                const pls = (await lu.playerLineups) ?? [];
                const starters = pls.filter((p: PlayerLineUp) => p.isStarting);
                const teamRel = await lu.team;
                const names = await Promise.all(
                    starters.map(async (pl: PlayerLineUp) => {
                        const player = await pl.player;
                        return {
                            name: player?.name ?? `player-${pl.playerId}`,
                            number: player?.kitNumber,
                            position: player?.metadata?.position as string | undefined,
                        };
                    }),
                );
                return {
                    teamId: lu.teamId,
                    teamName: teamRel?.name,
                    formation: lu.formation,
                    starters: names,
                };
            }),
        );

        const goalBrief = await Promise.all(
            goalsEnt.map(async (g) => {
                const scorer = await g.scorer;
                return {
                    minute: g.minute,
                    scorerName: scorer?.name,
                    teamId: g.teamId,
                    penalty: g.penalty ?? undefined,
                    ownGoal: g.ownGoal ?? undefined,
                };
            }),
        );

        return {
            fixtureId: fixture.id,
            kickoff: fixture.date?.toISOString?.() ?? String(fixture.date),
            status: String(fixture.status),
            stage: String(fixture.stage),
            competitionId: fixture.competitionId,
            competitionName: competition?.name,
            seasonId: fixture.seasonId,
            home: homeTeam ? { id: homeTeam.id, name: homeTeam.name } : undefined,
            away: awayTeam ? { id: awayTeam.id, name: awayTeam.name } : undefined,
            stadium: stadium
                ? { id: stadium.id, name: stadium.name, country: stadium.country ?? undefined }
                : undefined,
            lineups: briefLineups.filter((l) => l.starters.length > 0 || !!l.formation),
            goals: goalBrief.length > 0 ? goalBrief : undefined,
        };
    }
}
