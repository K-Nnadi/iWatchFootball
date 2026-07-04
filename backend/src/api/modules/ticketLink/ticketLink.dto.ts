import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
    IsBoolean,
    IsEnum,
    IsInt,
    IsObject,
    IsOptional,
    IsString,
    IsUrl,
    MaxLength,
    Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { AffiliateUrlFormat, TicketLinkCategory, TicketLinkType } from '../../enums/ticketLink.enum';
import type { SaleInfo } from './ticketLink.entity';

export class CreateTicketLinkDto {
    @IsOptional()
    @IsInt()
    @Type(() => Number)
    @ApiPropertyOptional({ description: 'Fixture this link applies to' })
    fixtureId?: number;

    @IsOptional()
    @IsInt()
    @Type(() => Number)
    @ApiPropertyOptional({ description: 'Team whose home matches this link applies to' })
    teamId?: number;

    @IsOptional()
    @IsInt()
    @Type(() => Number)
    @ApiPropertyOptional({ description: 'Competition this link applies to' })
    competitionId?: number;

    @IsUrl({ require_tls: true })
    @MaxLength(2048)
    @ApiProperty({ description: 'Target HTTPS URL' })
    url!: string;

    @IsString()
    @MaxLength(255)
    @ApiProperty({ description: 'Display label for the CTA button' })
    label!: string;

    @IsEnum(TicketLinkType)
    @ApiProperty({ enum: TicketLinkType })
    linkType!: TicketLinkType;

    @IsEnum(TicketLinkCategory)
    @ApiProperty({ enum: TicketLinkCategory, description: 'Display group this link belongs to' })
    linkCategory!: TicketLinkCategory;

    @IsBoolean()
    @ApiProperty()
    isAffiliate!: boolean;

    @IsOptional()
    @IsString()
    @MaxLength(255)
    @ApiPropertyOptional({ description: 'Affiliate tracking tag (server-side only, never returned to clients)' })
    affiliateTag?: string;

    @IsOptional()
    @IsEnum(AffiliateUrlFormat)
    @ApiPropertyOptional({ enum: AffiliateUrlFormat })
    affiliateUrlFormat?: AffiliateUrlFormat;

    @IsOptional()
    @IsInt()
    @Type(() => Number)
    @ApiPropertyOptional({ description: 'FK to AffiliatePartner for default tag/format inheritance' })
    partnerId?: number;

    @IsBoolean()
    @ApiProperty({ default: false })
    isSponsored: boolean = false;

    @IsOptional()
    @IsString()
    @MaxLength(200)
    @ApiPropertyOptional({ description: 'Sponsor attribution text' })
    sponsorLabel?: string;

    @IsOptional()
    @IsString()
    @MaxLength(50)
    @ApiPropertyOptional({ description: 'Badge text, e.g. "Official"' })
    badgeText?: string;

    @IsInt()
    @Min(0)
    @Type(() => Number)
    @ApiProperty({ description: 'Display priority (lower = shown first)', default: 0 })
    priority: number = 0;

    @IsOptional()
    @Type(() => Date)
    @ApiPropertyOptional({ description: 'Auto-hide after this timestamp' })
    expiresAt?: Date;

    @IsOptional()
    @IsObject()
    @ApiPropertyOptional({ description: 'On-sale dates and membership requirements' })
    saleInfo?: SaleInfo;
}

export class UpdateTicketLinkDto {
    @IsOptional()
    @IsInt()
    @Type(() => Number)
    @ApiPropertyOptional()
    fixtureId?: number;

    @IsOptional()
    @IsInt()
    @Type(() => Number)
    @ApiPropertyOptional()
    teamId?: number;

    @IsOptional()
    @IsInt()
    @Type(() => Number)
    @ApiPropertyOptional()
    competitionId?: number;

    @IsOptional()
    @IsUrl({ require_tls: true })
    @MaxLength(2048)
    @ApiPropertyOptional()
    url?: string;

    @IsOptional()
    @IsString()
    @MaxLength(255)
    @ApiPropertyOptional()
    label?: string;

    @IsOptional()
    @IsEnum(TicketLinkType)
    @ApiPropertyOptional({ enum: TicketLinkType })
    linkType?: TicketLinkType;

    @IsOptional()
    @IsEnum(TicketLinkCategory)
    @ApiPropertyOptional({ enum: TicketLinkCategory })
    linkCategory?: TicketLinkCategory;

    @IsOptional()
    @IsBoolean()
    @ApiPropertyOptional()
    isAffiliate?: boolean;

    @IsOptional()
    @IsString()
    @MaxLength(255)
    @ApiPropertyOptional()
    affiliateTag?: string;

    @IsOptional()
    @IsEnum(AffiliateUrlFormat)
    @ApiPropertyOptional({ enum: AffiliateUrlFormat })
    affiliateUrlFormat?: AffiliateUrlFormat;

    @IsOptional()
    @IsInt()
    @Type(() => Number)
    @ApiPropertyOptional()
    partnerId?: number;

    @IsOptional()
    @IsBoolean()
    @ApiPropertyOptional()
    isSponsored?: boolean;

    @IsOptional()
    @IsString()
    @MaxLength(200)
    @ApiPropertyOptional()
    sponsorLabel?: string;

    @IsOptional()
    @IsString()
    @MaxLength(50)
    @ApiPropertyOptional()
    badgeText?: string;

    @IsOptional()
    @IsInt()
    @Min(0)
    @Type(() => Number)
    @ApiPropertyOptional()
    priority?: number;

    @IsOptional()
    @Type(() => Date)
    @ApiPropertyOptional()
    expiresAt?: Date;

    @IsOptional()
    @IsObject()
    @ApiPropertyOptional()
    saleInfo?: SaleInfo;
}

export class TicketLinkQueryDto {
    @IsOptional()
    @IsInt()
    @Type(() => Number)
    @ApiPropertyOptional({ description: 'Filter by fixture ID' })
    fixtureId?: number;

    @IsOptional()
    @IsInt()
    @Type(() => Number)
    @ApiPropertyOptional({ description: 'Filter by team ID' })
    teamId?: number;

    @IsOptional()
    @IsInt()
    @Type(() => Number)
    @ApiPropertyOptional({ description: 'Filter by competition ID' })
    competitionId?: number;
}

/** Safe response shape — never includes affiliateTag or affiliateUrlFormat. */
export class TicketLinkResponseDto {
    @ApiProperty()
    id!: number;

    @ApiPropertyOptional()
    fixtureId?: number;

    @ApiPropertyOptional()
    teamId?: number;

    @ApiPropertyOptional()
    competitionId?: number;

    @ApiProperty()
    url!: string;

    @ApiProperty()
    label!: string;

    @ApiProperty({ enum: TicketLinkType })
    linkType!: TicketLinkType;

    @ApiProperty({ enum: TicketLinkCategory })
    linkCategory!: TicketLinkCategory;

    @ApiProperty()
    isAffiliate!: boolean;

    @ApiProperty()
    isSponsored!: boolean;

    @ApiPropertyOptional()
    sponsorLabel?: string;

    @ApiPropertyOptional()
    badgeText?: string;

    @ApiProperty()
    priority!: number;

    @ApiPropertyOptional()
    expiresAt?: Date;

    @ApiPropertyOptional({ description: 'On-sale dates and membership requirements' })
    saleInfo?: SaleInfo;

    @ApiProperty()
    createdAt!: Date;

    @ApiProperty()
    updatedAt!: Date;
}
