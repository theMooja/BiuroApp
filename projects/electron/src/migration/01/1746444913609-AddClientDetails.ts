import { MigrationInterface, QueryRunner } from "typeorm";

export class AddClientDetails1746444913609 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "clients"
            ADD COLUMN "details" jsonb NOT NULL DEFAULT '{}'::jsonb
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "clients"
            DROP COLUMN "details"
        `);
    }

}
