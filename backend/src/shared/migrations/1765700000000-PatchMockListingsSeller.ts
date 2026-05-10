import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Patch the mock seed listings so they belong to a different user than the one
 * used for testing (user 2). Assigns the first user that is NOT user 2 as the
 * seller, so user 2 can browse and purchase them freely.
 */
export class PatchMockListingsSeller1765700000000 implements MigrationInterface {
    name = 'PatchMockListingsSeller1765700000000';

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Find the first user that is not user 2
        const rows: Array<{ id: number }> = await queryRunner.query(
            `SELECT id FROM "user" WHERE id != 2 ORDER BY id ASC LIMIT 1`,
        );

        if (!rows.length) {
            console.warn('[PatchMockListingsSeller] No other user found — skipping patch');
            return;
        }

        const newSellerId = rows[0].id;

        await queryRunner.query(
            `UPDATE marketplace_listing
             SET "sellerId" = $1
             WHERE metadata->>'source' = 'mock_seed'`,
            [newSellerId],
        );

        await queryRunner.query(
            `UPDATE ticket_ownership_history
             SET "fromUserId" = $1
             WHERE metadata->>'source' = 'mock_seed'`,
            [newSellerId],
        );

        console.log(
            `[PatchMockListingsSeller] Reassigned mock listings seller from 2 → ${newSellerId}`,
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `UPDATE marketplace_listing
             SET "sellerId" = 2
             WHERE metadata->>'source' = 'mock_seed'`,
        );
        await queryRunner.query(
            `UPDATE ticket_ownership_history
             SET "fromUserId" = 2
             WHERE metadata->>'source' = 'mock_seed'`,
        );
    }
}
