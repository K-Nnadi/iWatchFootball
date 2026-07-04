import { MigrationInterface, QueryRunner } from 'typeorm';

export class SeedNewTicketFlags1768700000004 implements MigrationInterface {
    name = 'SeedNewTicketFlags1768700000004';

    private readonly flags = [
        {
            key: 'hospitality_links_enabled',
            description: 'When true, hospitality and premium experience links are shown on match pages',
            defaultValue: false,
        },
        {
            key: 'sponsored_placements_enabled',
            description: 'When true, sponsored/paid placement links are rendered with a "Sponsored" badge',
            defaultValue: false,
        },
        {
            key: 'ticket_alerts_enabled',
            description: 'When true, users can register for ticket availability alerts',
            defaultValue: false,
        },
        {
            key: 'affiliate_disclosure_enabled',
            description: 'When true, the affiliate commission disclaimer is shown in the ticket section',
            defaultValue: true,
        },
    ];

    public async up(queryRunner: QueryRunner): Promise<void> {
        for (const flag of this.flags) {
            await queryRunner.query(
                `INSERT INTO "platformConfig" ("key", "valueType", "booleanValue", "description")
                 VALUES ($1, 'boolean', $2, $3)
                 ON CONFLICT ("key") DO NOTHING`,
                [flag.key, flag.defaultValue, flag.description],
            );
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        for (const flag of this.flags) {
            await queryRunner.query(`DELETE FROM "platformConfig" WHERE "key" = $1`, [flag.key]);
        }
    }
}
