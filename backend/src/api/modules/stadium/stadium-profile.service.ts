import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, IsNull, LessThanOrEqual, Not, Repository } from 'typeorm';
import { Stadium } from './stadium.entity';
import { TeamStadium } from '../teamStadium/teamStadium.entity';
import { Team } from '../team/team.entity';
import { Fixture } from '../fixture/fixture.entity';
import { StadiumWikipediaService } from './stadium-wikipedia.service';
import type {
    StadiumFixtureRow,
    StadiumHomeClubRow,
    StadiumProfileResponse,
} from './stadium-profile.types';

@Injectable()
export class StadiumProfileService {
    constructor(
        @InjectRepository(Stadium) private readonly stadiumRepo: Repository<Stadium>,
        @InjectRepository(TeamStadium) private readonly teamStadiumRepo: Repository<TeamStadium>,
        @InjectRepository(Team) private readonly teamRepo: Repository<Team>,
        @InjectRepository(Fixture) private readonly fixtureRepo: Repository<Fixture>,
        private readonly wikipediaService: StadiumWikipediaService,
    ) {}

    async getProfile(stadiumId: number): Promise<StadiumProfileResponse> {
        const stadium = await this.stadiumRepo.findOne({ where: { id: stadiumId } });
        if (!stadium) {
            throw new NotFoundException(`Stadium ${stadiumId} not found`);
        }

        const links = await this.teamStadiumRepo.find({ where: { stadiumId } });
        const teamIds = links.map((l) => l.teamId);
        const teams =
            teamIds.length > 0
                ? await this.teamRepo.find({ where: { id: In(teamIds) } })
                : [];
        const teamById = new Map(teams.map((t) => [t.id, t]));

        const homeClubs: StadiumHomeClubRow[] = links
            .map((link) => {
                const team = teamById.get(link.teamId);
                const rel = (link.metadata as Record<string, unknown> | undefined)?.relationship;
                return {
                    teamId: link.teamId,
                    name: team?.name ?? `Team #${link.teamId}`,
                    logoUrl: team?.logoUrl ?? null,
                    ...(typeof rel === 'string' ? { relationship: rel } : {}),
                };
            })
            .sort((a, b) => {
                const aPrimary = a.relationship === 'primary_home' ? 0 : 1;
                const bPrimary = b.relationship === 'primary_home' ? 0 : 1;
                if (aPrimary !== bPrimary) return aPrimary - bPrimary;
                return a.name.localeCompare(b.name);
            });

        const now = new Date();
        const fixtures = await this.fixtureRepo.find({
            where: {
                stadiumId,
                date: LessThanOrEqual(now),
                homeScore: Not(IsNull()),
                awayScore: Not(IsNull()),
            },
            order: { date: 'DESC', id: 'DESC' },
            take: 12,
        });

        const recentFixtures: StadiumFixtureRow[] = fixtures
            .filter((f) => f.homeTeamId != null && f.awayTeamId != null)
            .map((f) => ({
                id: f.id,
                date: f.date.toISOString(),
                homeTeamId: f.homeTeamId!,
                awayTeamId: f.awayTeamId!,
                ...(f.homeScore != null ? { homeScore: f.homeScore } : {}),
                ...(f.awayScore != null ? { awayScore: f.awayScore } : {}),
                metadata: f.metadata as unknown,
            }));

        const homeClubNames = homeClubs.map((c) => c.name);
        const lore = await this.wikipediaService.resolveLore(stadium, homeClubNames);

        return {
            stadium: {
                id: stadium.id,
                name: stadium.name,
                country: stadium.country,
                opened: stadium.opened,
                capacity: stadium.capacity,
                metadata: stadium.metadata,
            },
            homeClubs,
            recentFixtures,
            lore,
        };
    }
}
