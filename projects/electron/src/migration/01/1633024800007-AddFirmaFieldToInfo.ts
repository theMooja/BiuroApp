import { MigrationInterface, QueryRunner } from "typeorm";

export class AddFirmaFieldToInfo1633024800007 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            UPDATE monthlies
                SET info = jsonb_set(
                    info,
                    '{firma}',
                    CASE
                        WHEN info->>'firma' IS NOT NULL THEN info->'firma' 
                        ELSE '""'::jsonb
                    END,
                    true
            )
            WHERE info IS NOT NULL;
                    `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            UPDATE monthlies
            SET info = info::jsonb - 'firma'
            WHERE info IS NOT NULL;
        `);
    }
}
