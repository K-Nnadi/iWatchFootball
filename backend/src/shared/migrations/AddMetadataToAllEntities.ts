import { MigrationInterface, QueryRunner } from "typeorm";

export class AddMetadataToAllEntities1234567890123 implements MigrationInterface {
    name = 'AddMetadataToAllEntities1234567890123'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Dynamically discover all tables in the database
        const tables = await this.getAllTables(queryRunner);

        // Add metadata column to each table
        for (const table of tables) {
            try {
                await queryRunner.query(`
                    ALTER TABLE "${table}" 
                    ADD COLUMN "metadata" jsonb
                `);
                console.log(`Added metadata column to table: ${table}`);
            } catch (error) {
                console.warn(`Failed to add metadata column to table ${table}:`, error instanceof Error ? error.message : String(error));
            }
        }
    }

    private async getAllTables(queryRunner: QueryRunner): Promise<string[]> {
        // Query to get all table names that have an 'id' column (indicating they're entity tables)
        const result = await queryRunner.query(`
            SELECT DISTINCT t.table_name 
            FROM information_schema.tables t
            INNER JOIN information_schema.columns c ON t.table_name = c.table_name
            WHERE t.table_schema = 'public' 
            AND t.table_type = 'BASE TABLE'
            AND t.table_name NOT LIKE 'migrations%'
            AND c.column_name = 'id'
            AND c.data_type = 'integer'
            ORDER BY t.table_name
        `);
        
        return result.map((row: any) => row.table_name);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Dynamically discover all tables in the database
        const tables = await this.getAllTables(queryRunner);

        // Remove metadata column from each table
        for (const table of tables) {
            try {
                await queryRunner.query(`
                    ALTER TABLE "${table}" 
                    DROP COLUMN "metadata"
                `);
                console.log(`Removed metadata column from table: ${table}`);
            } catch (error) {
                console.warn(`Failed to remove metadata column from table ${table}:`, error instanceof Error ? error.message : String(error));
            }
        }
    }
}
