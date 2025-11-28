import { MigrationInterface, QueryRunner } from "typeorm";

export class AddFavouriteTeamIdToUser1764299887029 implements MigrationInterface {
    name = 'AddFavouriteTeamIdToUser1764299887029'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Check if the user table exists
        const userTableExists = await queryRunner.hasTable('user');
        
        if (userTableExists) {
            // Check if the column already exists
            const columnExists = await queryRunner.query(`
                SELECT 1 
                FROM information_schema.columns 
                WHERE table_schema = 'public' 
                AND table_name = 'user' 
                AND column_name = 'favouriteTeamId'
            `);

            if (columnExists.length === 0) {
                // Add the favouriteTeamId column
                await queryRunner.query(`
                    ALTER TABLE "user" 
                    ADD COLUMN "favouriteTeamId" integer
                `);

                // Add foreign key constraint if team table exists
                const teamTableExists = await queryRunner.hasTable('team');
                if (teamTableExists) {
                    await queryRunner.query(`
                        ALTER TABLE "user" 
                        ADD CONSTRAINT "FK_user_favouriteTeamId" 
                        FOREIGN KEY ("favouriteTeamId") 
                        REFERENCES "team"("id") 
                        ON DELETE SET NULL 
                        ON UPDATE CASCADE
                    `);
                }

                console.log('Successfully added favouriteTeamId column to user table');
            } else {
                console.log('favouriteTeamId column already exists in user table');
            }
        } else {
            console.log('User table does not exist, skipping favouriteTeamId column addition');
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        const userTableExists = await queryRunner.hasTable('user');
        
        if (userTableExists) {
            // Check if the column exists
            const columnExists = await queryRunner.query(`
                SELECT 1 
                FROM information_schema.columns 
                WHERE table_schema = 'public' 
                AND table_name = 'user' 
                AND column_name = 'favouriteTeamId'
            `);

            if (columnExists.length > 0) {
                // Drop foreign key constraint if it exists
                try {
                    await queryRunner.query(`
                        ALTER TABLE "user" 
                        DROP CONSTRAINT IF EXISTS "FK_user_favouriteTeamId"
                    `);
                } catch (error) {
                    console.warn('Failed to drop foreign key constraint:', error instanceof Error ? error.message : String(error));
                }

                // Drop the column
                await queryRunner.query(`
                    ALTER TABLE "user" 
                    DROP COLUMN IF EXISTS "favouriteTeamId"
                `);

                console.log('Successfully removed favouriteTeamId column from user table');
            }
        }
    }
}

