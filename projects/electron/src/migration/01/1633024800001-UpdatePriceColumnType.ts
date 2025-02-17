import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdatePriceColumnType1633024800001 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE invoicelines
            ALTER COLUMN price TYPE decimal(12, 2) USING price::numeric;
            ALTER TABLE invoicelines
            ALTER COLUMN price DROP NOT NULL;
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE invoicelines
            ALTER COLUMN price TYPE integer USING price::integer;
            ALTER TABLE invoicelines
            ALTER COLUMN price SET NOT NULL;
        `);
    }
}
