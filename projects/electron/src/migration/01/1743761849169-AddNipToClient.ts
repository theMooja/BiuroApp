import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class AddNipToClient1743761849169 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        const table = await queryRunner.getTable("client");
        const hasColumn = table?.findColumnByName("nip");
    
        if (!hasColumn) {
            await queryRunner.addColumn("client", new TableColumn({
                name: "nip",
                type: "varchar",
                length: "15",
                isNullable: true,
            }));
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropColumn("client", "nip");
    }

}
