import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class AddVatToInvoiceLine1743761873730 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        const table = await queryRunner.getTable("InvoiceLine");
        const hasColumn = table?.findColumnByName("vat");

        if (!hasColumn) {
            await queryRunner.addColumn("InvoiceLine", new TableColumn({
                name: "vat",
                type: "varchar",
                length: "50",
                isNullable: true,
            }));
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropColumn("InvoiceLine", "vat");
    }

}
