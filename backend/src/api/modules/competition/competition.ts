import {ApiProperty, ApiPropertyOptional, PickType} from "@nestjs/swagger";
import {Entity, OneToMany} from 'typeorm';
import {BaseDbEntity} from "@iWatchFootball/base-tools/entity/baseDb.entity";
import {CompetitionType} from "../../enums/competition.enum";
import {TeamCompetitionSeason} from "../teamCompetitionSeason/teamCompetitionSeason";
import {Trophy} from "../trophy/trophy";
import {
    EntityColumn,
    EntityEnumColumn,
    OptionalEntityColumn
} from "@iWatchFootball/base-tools/decorators/entity.decorator";


@Entity('competition')
export class Competition extends BaseDbEntity {

    @EntityColumn({
        db: {type: "varchar"}
    })
    name!: string;

    @OptionalEntityColumn({
        db: {type: "varchar"}
    })
    code?: string;

    @EntityEnumColumn({
        db: {enum: CompetitionType, default: CompetitionType.LEAGUE}
    })
    type!: CompetitionType; // e.g., league, knockout

    @EntityColumn({db: {type: "varchar"}})
    country!: string;

    @ApiProperty()
    @OneToMany(() => TeamCompetitionSeason, teamCompSeason => teamCompSeason.competition, {lazy: true})
    teamCompetitionSeasons!: Promise<TeamCompetitionSeason[]>;

    @ApiProperty()
    @OneToMany(() => Trophy, trophy => trophy.competition, {lazy: true})
    trophies!: Promise<Trophy[]>;
}

export class CreateCompetitionDTO extends PickType(Competition, ["name", "type", "country"] as const) {
}

