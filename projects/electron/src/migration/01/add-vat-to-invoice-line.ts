import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class AddVatToInvoiceLine1678901234570 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.addColumn("InvoiceLine", new TableColumn({
            name: "vat",
            type: "int",
            isNullable: true, // Allow null values initially
        }));
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropColumn("InvoiceLine", "vat");
    }
}
