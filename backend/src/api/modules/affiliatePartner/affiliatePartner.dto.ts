import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
    IsArray,
    IsBoolean,
    IsDateString,
    IsEnum,
    IsNumber,
    IsOptional,
    IsString,
    Max,
    MaxLength,
    Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { AffiliateUrlFormat } from '../../enums/ticketLink.enum';
import { PartnerType, PlacementType } from '../../enums/partner.enum';

export class CreateAffiliatePartnerDto {
    @IsString()
    @MaxLength(200)
    @ApiProperty()
    name!: string;

    @IsEnum(PartnerType)
    @ApiProperty({ enum: PartnerType, default: PartnerType.OTHER })
    partnerType: PartnerType = PartnerType.OTHER;

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
    @IsDateString()
    @ApiPropertyOptional()
    campaignStartDate?: string;

    @IsOptional()
    @IsDateString()
    @ApiPropertyOptional()
    campaignEndDate?: string;

    @IsOptional()
    @IsString()
    @ApiPropertyOptional()
    notes?: string;

    // ─── Gambling compliance ──────────────────────────────────────────────────

    @IsOptional()
    @IsNumber()
    @Min(0)
    @Max(100)
    @Type(() => Number)
    @ApiPropertyOptional({ description: 'Minimum user age (default 18 for gambling)' })
    minimumAge?: number;

    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    @ApiPropertyOptional({ description: 'ISO 3166-1 alpha-2 codes where allowed (empty = all)', type: [String] })
    allowedCountries?: string[];

    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    @ApiPropertyOptional({ description: 'ISO 3166-1 alpha-2 codes explicitly blocked', type: [String] })
    blockedCountries?: string[];

    @IsBoolean()
    @ApiProperty({ default: false })
    requiresUserConsent: boolean = false;

    @IsBoolean()
    @ApiProperty({ default: false })
    requiresRGMessage: boolean = false;

    @IsOptional()
    @IsString()
    @ApiPropertyOptional({ description: 'Responsible gambling / disclosure text' })
    disclosureText?: string;

    @IsOptional()
    @IsArray()
    @IsEnum(PlacementType, { each: true })
    @ApiPropertyOptional({ description: 'Allowed placement surfaces', type: [String], enum: PlacementType })
    allowedPlacements?: PlacementType[];
}

export class UpdateAffiliatePartnerDto {
    @IsOptional()
    @IsString()
    @MaxLength(200)
    @ApiPropertyOptional()
    name?: string;

    @IsOptional()
    @IsEnum(PartnerType)
    @ApiPropertyOptional({ enum: PartnerType })
    partnerType?: PartnerType;

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
    @IsDateString()
    @ApiPropertyOptional()
    campaignStartDate?: string;

    @IsOptional()
    @IsDateString()
    @ApiPropertyOptional()
    campaignEndDate?: string;

    @IsOptional()
    @IsString()
    @ApiPropertyOptional()
    notes?: string;

    @IsOptional()
    @IsNumber()
    @Min(0)
    @Max(100)
    @Type(() => Number)
    @ApiPropertyOptional()
    minimumAge?: number;

    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    @ApiPropertyOptional({ type: [String] })
    allowedCountries?: string[];

    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    @ApiPropertyOptional({ type: [String] })
    blockedCountries?: string[];

    @IsOptional()
    @IsBoolean()
    @ApiPropertyOptional()
    requiresUserConsent?: boolean;

    @IsOptional()
    @IsBoolean()
    @ApiPropertyOptional()
    requiresRGMessage?: boolean;

    @IsOptional()
    @IsString()
    @ApiPropertyOptional()
    disclosureText?: string;

    @IsOptional()
    @IsArray()
    @IsEnum(PlacementType, { each: true })
    @ApiPropertyOptional({ type: [String], enum: PlacementType })
    allowedPlacements?: PlacementType[];
}

export class AffiliatePartnerResponseDto {
    @ApiProperty()
    id!: number;

    @ApiProperty()
    name!: string;

    @ApiProperty({ enum: PartnerType })
    partnerType!: PartnerType;

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
    campaignStartDate?: Date;

    @ApiPropertyOptional()
    campaignEndDate?: Date;

    @ApiPropertyOptional()
    notes?: string;

    @ApiPropertyOptional()
    minimumAge?: number;

    @ApiPropertyOptional({ type: [String] })
    allowedCountries?: string[];

    @ApiPropertyOptional({ type: [String] })
    blockedCountries?: string[];

    @ApiProperty()
    requiresUserConsent!: boolean;

    @ApiProperty()
    requiresRGMessage!: boolean;

    @ApiPropertyOptional()
    disclosureText?: string;

    @ApiPropertyOptional({ type: [String], enum: PlacementType })
    allowedPlacements?: PlacementType[];

    @ApiProperty()
    createdAt!: Date;

    @ApiProperty()
    updatedAt!: Date;
}
