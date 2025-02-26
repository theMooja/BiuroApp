import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateReportEntityDefaults1633024800004 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE reports
            ALTER COLUMN input SET DEFAULT '{}'
            ALTER TABLE reports
            ALTER COLUMN input TYPE json USING input::json;
        `);

        await queryRunner.query(`
            ALTER TABLE reports
            ALTER COLUMN output SET DEFAULT '{}';
            ALTER TABLE reports
            ALTER COLUMN output TYPE json USING output::json;
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE reports
            ALTER COLUMN input DROP DEFAULT;
            ALTER TABLE reports
            ALTER COLUMN input TYPE text USING input::text;
        `);

        await queryRunner.query(`
            ALTER TABLE reports
            ALTER COLUMN output DROP DEFAULT;
            ALTER TABLE reports
            ALTER COLUMN output TYPE text USING output::text;
        `);
    }
}
