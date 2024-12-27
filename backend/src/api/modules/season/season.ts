import {ApiProperty, PickType} from '@nestjs/swagger';
import {Entity, OneToMany} from 'typeorm';
import {BaseDbEntity} from '@iWatchFootball/base-tools/entity/baseDb.entity';
import {TeamCompetitionSeason} from "../teamCompetitionSeason/teamCompetitionSeason";
import {EntityColumn} from "@iWatchFootball/base-tools/decorators/entity.decorator";

@Entity('season')
export class Season extends BaseDbEntity {
    @EntityColumn({db: {type: "int"}})
    yearStart!: number; // e.g., 2023 for 2023/2024 season

    @EntityColumn({db: {type: "int"}})
    yearEnd!: number;   // e.g., 2024

    @ApiProperty()
    @OneToMany(() => TeamCompetitionSeason, teamCompSeason => teamCompSeason.season)
    teamCompetitionSeasons!: TeamCompetitionSeason[];
}

export class CreateSeasonDTO extends PickType(Season, ['yearStart', 'yearEnd'] as const) {}