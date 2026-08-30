import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
    IsBoolean,
    IsDate,
    IsInt,
    IsOptional,
    IsString,
    MaxLength,
} from 'class-validator';
import { Type } from 'class-transformer';
import { FixtureInvalidationReason } from '../../enums/fixture.enum';

export class UpsertAttendanceDto {
    @IsInt()
    @Type(() => Number)
    @ApiProperty({ description: 'Fixture ID' })
    fixtureId!: number;

    @IsBoolean()
    @ApiProperty({ description: 'True if the user has/had a ticket' })
    hasTicket!: boolean;

    @IsOptional()
    @IsString()
    @MaxLength(100)
    @ApiPropertyOptional()
    seatSection?: string;

    @IsOptional()
    @IsString()
    @MaxLength(50)
    @ApiPropertyOptional()
    seatBlock?: string;

    @IsOptional()
    @IsString()
    @MaxLength(20)
    @ApiPropertyOptional()
    seatRow?: string;

    @IsOptional()
    @IsString()
    @MaxLength(20)
    @ApiPropertyOptional()
    seatNumber?: string;

    @IsOptional()
    @IsString()
    @MaxLength(100)
    @ApiPropertyOptional()
    ticketProvider?: string;

    @IsOptional()
    @IsDate()
    @Type(() => Date)
    @ApiPropertyOptional()
    purchaseDate?: Date;

    @IsOptional()
    @IsString()
    @MaxLength(500)
    @ApiPropertyOptional()
    notes?: string;
}

export class AttendanceResponseDto {
    @ApiProperty()
    id!: number;

    @ApiProperty()
    fixtureId!: number;

    @ApiProperty()
    userId!: number;

    @ApiProperty()
    hasTicket!: boolean;

    @ApiPropertyOptional()
    seatSection?: string;

    @ApiPropertyOptional()
    seatBlock?: string;

    @ApiPropertyOptional()
    seatRow?: string;

    @ApiPropertyOptional()
    seatNumber?: string;

    @ApiPropertyOptional()
    ticketProvider?: string;

    @ApiPropertyOptional()
    purchaseDate?: Date;

    @ApiPropertyOptional()
    notes?: string;

    @ApiProperty({ description: 'True if a private ticket document has been uploaded' })
    hasDocument!: boolean;

    @ApiPropertyOptional({ description: 'When the fixture was postponed, cancelled, or suspended' })
    fixtureInvalidatedAt?: Date;

    @ApiPropertyOptional({ enum: FixtureInvalidationReason })
    fixtureInvalidationReason?: FixtureInvalidationReason;

    @ApiProperty()
    createdAt!: Date;

    @ApiProperty()
    updatedAt!: Date;
}

export class AttendanceCountResponseDto {
    @ApiProperty()
    fixtureId!: number;

    @ApiProperty({ description: 'Total users who have marked themselves as going' })
    goingCount!: number;

    @ApiProperty({ description: 'Of those, how many have marked they have a ticket' })
    hasTicketCount!: number;
}
