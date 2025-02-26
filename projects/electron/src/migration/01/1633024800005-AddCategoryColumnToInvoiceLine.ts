import { MigrationInterface, QueryRunner } from "typeorm";

export class AddCategoryColumnToInvoiceLine1633024800005 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE invoicelines
            ADD COLUMN category text;
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE invoicelines
            DROP COLUMN category;
        `);
    }
}
