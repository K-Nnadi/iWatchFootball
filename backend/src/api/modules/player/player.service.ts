import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { CrudRepoAdapter } from '@iWatchFootball/base-tools/crud/crud.repo.adapter';
import { CreatePlayerDTO, Player } from './player.entity';

const PLAYER_LOOKUP_MAX = 500;

export type PlayerLookupRow = {
    id: number;
    name: string;
    photoUrl?: string | null;
};

@Injectable()
export class PlayerService extends CrudRepoAdapter<Player, CreatePlayerDTO> {
    constructor(@InjectRepository(Player) private entityRepo: Repository<Player>) {
        super(entityRepo);
    }

    /** Public-safe name lookup. Avoids GET `/player/query?where[id][$in]…` which 500s on large ID lists. */
    async lookupByIds(ids: number[]): Promise<PlayerLookupRow[]> {
        const unique = [...new Set(ids.filter((id) => Number.isInteger(id) && id > 0))].slice(0, PLAYER_LOOKUP_MAX);
        if (unique.length === 0) return [];
        return this.entityRepo.find({
            where: { id: In(unique) },
            select: ['id', 'name', 'photoUrl'],
        });
    }
}
