import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class AddNipToClient1678901234567 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.addColumn("client", new TableColumn({
            name: "nip",
            type: "varchar",
            length: "15",
            isNullable: true, // Allow null values initially
        }));
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropColumn("client", "nip");
    }
}
