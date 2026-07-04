import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
    IsBoolean,
    IsInt,
    IsNumber,
    IsOptional,
    IsString,
    Max,
    MaxLength,
    Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { TicketInterestStatus } from '../../enums/ticketInterest.enum';

export class CreateTicketInterestDto {
    @IsInt()
    @Type(() => Number)
    @ApiProperty()
    fixtureId!: number;

    @IsInt()
    @Min(1)
    @Max(4)
    @Type(() => Number)
    @ApiProperty({ minimum: 1, maximum: 4, default: 1 })
    quantity!: number;

    @IsOptional()
    @IsNumber()
    @Min(0)
    @Type(() => Number)
    @ApiPropertyOptional({ description: 'Max price willing to pay (GBP)' })
    maxPriceGbp?: number;

    @IsOptional()
    @IsString()
    @MaxLength(100)
    @ApiPropertyOptional()
    preferredStand?: string;

    @IsBoolean()
    @ApiProperty({ default: true })
    wantsNotification!: boolean;
}

export class TicketInterestResponseDto {
    @ApiProperty()
    id!: number;

    @ApiProperty()
    fixtureId!: number;

    @ApiProperty()
    quantity!: number;

    @ApiPropertyOptional()
    maxPriceGbp?: number;

    @ApiPropertyOptional()
    preferredStand?: string;

    @ApiProperty()
    wantsNotification!: boolean;

    @ApiProperty({ enum: TicketInterestStatus })
    status!: TicketInterestStatus;

    @ApiProperty()
    createdAt!: Date;
}

/** Public demand stats — never exposes individual user data. */
export class DemandStatsDto {
    @ApiProperty()
    fixtureId!: number;

    @ApiProperty()
    interestedCount!: number;

    @ApiProperty()
    totalTicketsWanted!: number;
}

/** Admin-only demand stats including avg price. */
export class AdminDemandStatsDto extends DemandStatsDto {
    @ApiPropertyOptional({ description: 'Average max price across users who set one (admin only)' })
    avgMaxPriceGbp?: number;
}
