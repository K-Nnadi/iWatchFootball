import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Throwaway seed migration — inserts mock marketplace listings for user 2.
 * Creates 6 tickets (userId NULL = platform custody) and 6 active listings.
 * Safe to revert; down() removes exactly what up() inserted.
 */
export class SeedMarketplaceMockData1765600000000 implements MigrationInterface {
    name = 'SeedMarketplaceMockData1765600000000';

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Use the lowest fixture id that exists, falling back to 1
        const fixtureRows: Array<{ id: number }> = await queryRunner.query(
            `SELECT id FROM fixture ORDER BY id ASC LIMIT 1`,
        );
        const fixtureId: number = fixtureRows.length ? fixtureRows[0].id : 1;

        // listings expire 30 days from now so they stay visible for testing
        const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

        const mockListings: Array<{ category: string; price: number; askPrice: number }> = [
            { category: 'Category 1 – VIP Box',        price: 480.00, askPrice: 550.00 },
            { category: 'Category 2 – Lower Tier West', price: 280.00, askPrice: 310.00 },
            { category: 'Category 3 – Lower Tier East', price: 195.00, askPrice: 220.00 },
            { category: 'Category 3 – Upper Tier',      price: 165.00, askPrice: 180.00 },
            { category: 'Category 4 – Away Section',    price: 85.00,  askPrice: 95.00  },
            { category: 'Category 4 – Standing',        price: 55.00,  askPrice: 60.00  },
        ];

        const insertedTicketIds: number[] = [];

        for (const m of mockListings) {
            // Create ticket in platform custody (userId NULL)
            const ticketResult: Array<{ id: number }> = await queryRunner.query(
                `INSERT INTO ticket ("category", "price", "fixtureId", "userId", "metadata")
                 VALUES ($1, $2, $3, NULL, $4)
                 RETURNING id`,
                [
                    m.category,
                    m.price,
                    fixtureId,
                    JSON.stringify({ source: 'mock_seed', sellerId: 2 }),
                ],
            );
            const ticketId: number = ticketResult[0].id;
            insertedTicketIds.push(ticketId);

            // Create active listing for user 2
            await queryRunner.query(
                `INSERT INTO marketplace_listing
                    ("ticketId", "sellerId", "askPrice", "status", "expiresAt", "metadata")
                 VALUES ($1, 2, $2, 'ACTIVE', $3, $4)`,
                [
                    ticketId,
                    m.askPrice,
                    expiresAt,
                    JSON.stringify({ source: 'mock_seed' }),
                ],
            );

            // Ownership history: platform took custody from user 2
            await queryRunner.query(
                `INSERT INTO ticket_ownership_history
                    ("ticketId", "fromUserId", "toUserId", "reason", "metadata")
                 VALUES ($1, 2, NULL, 'MARKETPLACE_LISTED', $2)`,
                [ticketId, JSON.stringify({ source: 'mock_seed' })],
            );
        }

        console.log(
            `[SeedMarketplaceMockData] Inserted ${mockListings.length} listings for user 2` +
            ` using fixture ${fixtureId}. Ticket ids: ${insertedTicketIds.join(', ')}`,
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `DELETE FROM ticket_ownership_history WHERE metadata->>'source' = 'mock_seed'`,
        );
        await queryRunner.query(
            `DELETE FROM marketplace_listing WHERE metadata->>'source' = 'mock_seed'`,
        );
        await queryRunner.query(
            `DELETE FROM ticket WHERE metadata->>'source' = 'mock_seed'`,
        );
    }
}
