import { MigrationInterface, QueryRunner } from "typeorm";

export class AddUniqueUserNameConstraint1760406123456 implements MigrationInterface {
    name = 'AddUniqueUserNameConstraint1760406123456'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // First, check if the user table exists
        const userTableExists = await queryRunner.hasTable('user');
        
        if (userTableExists) {
            // Check if there are any duplicate usernames
            const duplicateUsernames = await queryRunner.query(`
                SELECT "userName", COUNT(*) as count 
                FROM "user" 
                GROUP BY "userName" 
                HAVING COUNT(*) > 1
            `);

            if (duplicateUsernames.length > 0) {
                console.log('Found duplicate usernames:', duplicateUsernames);
                
                // For each duplicate username, keep the first one and update the rest
                for (const duplicate of duplicateUsernames) {
                    const username = duplicate.userName;
                    const count = parseInt(duplicate.count);
                    
                    if (count > 1) {
                        // Get all users with this username
                        const users = await queryRunner.query(`
                            SELECT id, "userName", email 
                            FROM "user" 
                            WHERE "userName" = $1 
                            ORDER BY id
                        `, [username]);
                        
                        // Keep the first user, update the rest with unique usernames
                        for (let i = 1; i < users.length; i++) {
                            const newUsername = `${username}_${users[i].id}`;
                            await queryRunner.query(`
                                UPDATE "user" 
                                SET "userName" = $1 
                                WHERE id = $2
                            `, [newUsername, users[i].id]);
                            console.log(`Updated user ${users[i].id} username from '${username}' to '${newUsername}'`);
                        }
                    }
                }
            }
            
            // Now add the unique constraint
            await queryRunner.query(`ALTER TABLE "user" ADD CONSTRAINT "UQ_da5934070b5f2726ebfd3122c80" UNIQUE ("userName")`);
            console.log('Successfully added unique constraint to userName');
        } else {
            console.log('User table does not exist, skipping unique constraint addition');
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Remove the unique constraint
        await queryRunner.query(`ALTER TABLE "user" DROP CONSTRAINT "UQ_da5934070b5f2726ebfd3122c80"`);
    }
}


