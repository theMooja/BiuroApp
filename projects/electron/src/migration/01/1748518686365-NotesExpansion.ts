import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class NotesExpansion1748518686365 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.addColumn("notes", new TableColumn({
            name: "dueDate",
            type: "timestamp",
            isNullable: true,
        }));
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropColumn("notes", "dueDate");
    }

}
