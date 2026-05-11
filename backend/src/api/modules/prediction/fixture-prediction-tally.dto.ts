import { ApiProperty } from '@nestjs/swagger';

/** Aggregate counts for the match poll (no per-user data). */
export class FixturePredictionTallyDto {
    @ApiProperty({ description: 'Votes for home win' })
    home!: number;

    @ApiProperty({ description: 'Votes for draw' })
    draw!: number;

    @ApiProperty({ description: 'Votes for away win' })
    away!: number;

    @ApiProperty({ description: 'Total predictions with a result set' })
    total!: number;
}
