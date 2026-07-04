import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsInt, IsOptional, IsString, Max, MaxLength, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { RatingRole } from '../../enums/rating.enum';

export class CreateRatingDto {
    @IsInt()
    @Type(() => Number)
    @ApiProperty({ description: 'Listing ID this rating is for' })
    listingId!: number;

    @IsInt()
    @Type(() => Number)
    @ApiProperty({ description: 'User being rated' })
    targetUserId!: number;

    @IsEnum(RatingRole)
    @ApiProperty({ enum: RatingRole })
    raterRole!: RatingRole;

    @IsInt()
    @Min(1)
    @Max(5)
    @Type(() => Number)
    @ApiProperty({ minimum: 1, maximum: 5 })
    score!: number;

    @IsOptional()
    @IsString()
    @MaxLength(300)
    @ApiPropertyOptional()
    comment?: string;
}

export class UserTrustSummaryDto {
    @ApiProperty()
    userId!: number;

    @ApiProperty({ description: 'Average rating across all transactions (1–5)' })
    averageRating!: number;

    @ApiProperty({ description: 'Number of completed transactions' })
    totalTransactions!: number;

    @ApiProperty({ description: 'Trust score (0–100) based on ratings and history' })
    trustScore!: number;
}
