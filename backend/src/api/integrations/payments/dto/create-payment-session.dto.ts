import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class CreatePaymentSessionDto {
    @ApiProperty()
    @IsInt()
    fixtureId!: number;

    @ApiProperty()
    @IsString()
    offerKey!: string;

    @ApiProperty()
    @IsString()
    holderId!: string;

    @ApiProperty({ minimum: 1 })
    @IsInt()
    @Min(1)
    quantity!: number;

    @ApiProperty()
    @IsNumber()
    unitPrice!: number;

    @ApiProperty()
    @IsString()
    category!: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsInt()
    discountCodeId?: number;

    @ApiPropertyOptional({ default: 'stripe' })
    @IsOptional()
    @IsString()
    providerSlug?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    idempotencyKey?: string;
}
