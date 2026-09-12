import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import type { SquadPositionGroup } from './squad-position-group';

export class SquadMemberDto {
    @ApiProperty()
    id!: number;

    @ApiProperty()
    name!: string;

    @ApiProperty()
    nationality!: string;

    @ApiPropertyOptional({ nullable: true })
    dateOfBirth?: string | null;

    @ApiPropertyOptional({ nullable: true })
    photoUrl?: string | null;

    @ApiProperty({ description: 'Specific position name, e.g. Right Back' })
    position!: string;

    @ApiProperty({ enum: ['Goalkeeper', 'Defender', 'Midfielder', 'Forward'] })
    positionGroup!: SquadPositionGroup;

    @ApiPropertyOptional()
    kitNumber?: number;

    @ApiProperty()
    isLoan!: boolean;
}

export class TeamSquadResponse {
    @ApiProperty({ type: [SquadMemberDto] })
    players!: SquadMemberDto[];

    @ApiProperty({ enum: ['current', 'season'] })
    scope!: 'current' | 'season';

    @ApiPropertyOptional()
    seasonId?: number;
}

export class TeamSeasonOptionDto {
    @ApiProperty()
    id!: number;

    @ApiProperty()
    yearStart!: number;

    @ApiProperty()
    yearEnd!: number;

    @ApiProperty({ example: '2024/2025' })
    label!: string;
}

export class TeamSeasonsResponse {
    @ApiProperty({ type: [TeamSeasonOptionDto] })
    seasons!: TeamSeasonOptionDto[];
}

export class TeamCurrentManagerDto {
    @ApiProperty()
    id!: number;

    @ApiProperty()
    name!: string;

    @ApiProperty()
    nationality!: string;
}

export class TeamCurrentManagerResponse {
    @ApiPropertyOptional({ type: TeamCurrentManagerDto, nullable: true })
    manager!: TeamCurrentManagerDto | null;

    @ApiPropertyOptional({ enum: ['employment', 'teamManagerId'] })
    source?: 'employment' | 'teamManagerId';
}
