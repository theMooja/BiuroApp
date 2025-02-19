import { MigrationInterface, QueryRunner } from "typeorm";

export class AddOwnerColumnToMarches1633024800002 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE marches
            ADD COLUMN "ownerId" integer;
        `);

        await queryRunner.query(`
            ALTER TABLE marches
            ADD CONSTRAINT FK_owner FOREIGN KEY ("ownerId") REFERENCES users(id) ON DELETE SET NULL;
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE marches
            DROP CONSTRAINT FK_owner;
        `);

        await queryRunner.query(`
            ALTER TABLE marches
            DROP COLUMN "ownerId";
        `);
    }
}
