import { MigrationInterface, QueryRunner } from "typeorm";

export class AddValueColumnToListValues1633024800006 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE listvalues
            ADD COLUMN value text;
        `);

        await queryRunner.query(`
            ALTER TABLE listvalues
            ALTER COLUMN text DROP NOT NULL;
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE listvalues
            DROP COLUMN value;
        `);

        await queryRunner.query(`
            ALTER TABLE listvalues
            ALTER COLUMN text SET NOT NULL;
        `);
    }
}
