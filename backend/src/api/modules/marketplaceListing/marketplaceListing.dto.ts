import { ApiProperty } from '@nestjs/swagger';

export class CreateListingDto {
    @ApiProperty({ description: 'ID of the ticket to list for resale' })
    ticketId!: number;

    @ApiProperty({ description: 'Asking price set by the seller', minimum: 0.01 })
    askPrice!: number;
}
