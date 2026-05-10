import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AcquireTicketHoldDto {
    @ApiProperty()
    fixtureId!: number;

    @ApiProperty({ maxLength: 512 })
    offerKey!: string;

    @ApiProperty({ description: 'Client-generated UUID for this browser session' })
    holderId!: string;

    @ApiProperty({ minimum: 1 })
    quantity!: number;

    @ApiPropertyOptional({ minimum: 1, maximum: 60 })
    holdMinutes?: number;
}

export class ReleaseTicketHoldDto {
    @ApiProperty()
    holderId!: string;
}
