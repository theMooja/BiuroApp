import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class ClientDetals1745571908528 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.addColumn("clients", new TableColumn({
            name: "details",
            type: "jsonb",
            isNullable: false,
            default: "'{}'::jsonb"
        }));
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropColumn("clients", "details");
    }

}
