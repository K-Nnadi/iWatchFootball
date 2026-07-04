import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsEnum, IsNumber, IsOptional, IsString, Max, MaxLength, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { AffiliateUrlFormat } from '../../enums/ticketLink.enum';

export class CreateAffiliatePartnerDto {
    @IsString()
    @MaxLength(200)
    @ApiProperty()
    name!: string;

    @IsOptional()
    @IsString()
    @MaxLength(100)
    @ApiPropertyOptional({ description: 'Affiliate network, e.g. "Awin"' })
    network?: string;

    @IsOptional()
    @IsString()
    @MaxLength(255)
    @ApiPropertyOptional()
    defaultAffiliateTag?: string;

    @IsOptional()
    @IsEnum(AffiliateUrlFormat)
    @ApiPropertyOptional({ enum: AffiliateUrlFormat })
    affiliateUrlFormat?: AffiliateUrlFormat;

    @IsOptional()
    @IsNumber()
    @Min(0)
    @Max(100)
    @Type(() => Number)
    @ApiPropertyOptional()
    commissionRatePercent?: number;

    @IsBoolean()
    @ApiProperty({ default: true })
    isActive: boolean = true;

    @IsOptional()
    @IsString()
    @ApiPropertyOptional()
    notes?: string;
}

export class UpdateAffiliatePartnerDto {
    @IsOptional()
    @IsString()
    @MaxLength(200)
    @ApiPropertyOptional()
    name?: string;

    @IsOptional()
    @IsString()
    @MaxLength(100)
    @ApiPropertyOptional()
    network?: string;

    @IsOptional()
    @IsString()
    @MaxLength(255)
    @ApiPropertyOptional()
    defaultAffiliateTag?: string;

    @IsOptional()
    @IsEnum(AffiliateUrlFormat)
    @ApiPropertyOptional({ enum: AffiliateUrlFormat })
    affiliateUrlFormat?: AffiliateUrlFormat;

    @IsOptional()
    @IsNumber()
    @Min(0)
    @Max(100)
    @Type(() => Number)
    @ApiPropertyOptional()
    commissionRatePercent?: number;

    @IsOptional()
    @IsBoolean()
    @ApiPropertyOptional()
    isActive?: boolean;

    @IsOptional()
    @IsString()
    @ApiPropertyOptional()
    notes?: string;
}

export class AffiliatePartnerResponseDto {
    @ApiProperty()
    id!: number;

    @ApiProperty()
    name!: string;

    @ApiPropertyOptional()
    network?: string;

    @ApiPropertyOptional()
    defaultAffiliateTag?: string;

    @ApiPropertyOptional({ enum: AffiliateUrlFormat })
    affiliateUrlFormat?: AffiliateUrlFormat;

    @ApiPropertyOptional()
    commissionRatePercent?: number;

    @ApiProperty()
    isActive!: boolean;

    @ApiPropertyOptional()
    notes?: string;

    @ApiProperty()
    createdAt!: Date;

    @ApiProperty()
    updatedAt!: Date;
}
