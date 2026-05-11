import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Goal } from '../goal/goal.entity';
import { Card } from '../card/card.entity';
import { Substitution } from '../substitution/substitution.entity';
import { Player } from '../player/player.entity';

/** Resolved players referenced by timeline rows (public-safe subset). */
export interface FixtureTimelinePlayer {
  id: number;
  name: string;
}

/** Shape returned by {@link FixtureTimelineService.getEventsForFixture}; safe for public match pages. */
export interface FixtureTimelinePayload {
  goals: Goal[];
  cards: Card[];
  substitutions: Substitution[];
  /** Included so clients need not call authenticated `/player/query`. */
  players: FixtureTimelinePlayer[];
}

@Injectable()
export class FixtureTimelineService {
  constructor(
    @InjectRepository(Goal) private readonly goalRepo: Repository<Goal>,
    @InjectRepository(Card) private readonly cardRepo: Repository<Card>,
    @InjectRepository(Substitution) private readonly substitutionRepo: Repository<Substitution>,
    @InjectRepository(Player) private readonly playerRepo: Repository<Player>,
  ) {}

  async getEventsForFixture(fixtureId: number): Promise<FixtureTimelinePayload> {
    const [goals, cards, substitutions] = await Promise.all([
      this.goalRepo.find({
        where: { fixtureId },
        order: { minute: 'ASC', id: 'ASC' },
        take: 500,
      }),
      this.cardRepo.find({
        where: { fixtureId },
        order: { minute: 'ASC', id: 'ASC' },
        take: 500,
      }),
      this.substitutionRepo.find({
        where: { fixtureId },
        order: { minute: 'ASC', id: 'ASC' },
        take: 500,
      }),
    ]);

    const playerIds = new Set<number>();
    for (const g of goals) {
      playerIds.add(g.scorerId);
      if (g.assistantId != null) {
        playerIds.add(g.assistantId);
      }
    }
    for (const c of cards) {
      playerIds.add(c.playerId);
    }
    for (const s of substitutions) {
      if (typeof s.playerInId === 'number') {
        playerIds.add(s.playerInId);
      }
      if (typeof s.playerOutId === 'number') {
        playerIds.add(s.playerOutId);
      }
    }

    const ids = [...playerIds];
    const players =
      ids.length === 0
        ? []
        : (
            await this.playerRepo.find({
              where: { id: In(ids) },
              select: ['id', 'name'],
            })
          ).map((p) => ({ id: p.id, name: p.name }));

    return { goals, cards, substitutions, players };
  }
}
