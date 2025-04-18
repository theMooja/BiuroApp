import { MigrationInterface, QueryRunner, Table, TableIndex, TableUnique } from "typeorm";

export class CreateMonthlyUpdates1744798028589 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(new Table({
            name: "monthlyupdates",
            columns: [
                {
                    name: "id",
                    type: "int",
                    isPrimary: true,
                    isGenerated: true,
                    generationStrategy: "increment"
                },
                {
                    name: "monthlyId",
                    type: "int",
                    isNullable: false
                },
                {
                    name: "operation",
                    type: "varchar",
                    isNullable: false
                },
                {
                    name: "createdAt",
                    type: "timestamp",
                    default: "now()"
                }
            ]
        }));

        await queryRunner.createUniqueConstraint("monthlyupdates", new TableUnique({
            columnNames: ["monthlyId", "operation"]
        }));

        await queryRunner.createIndex("monthlyupdates", new TableIndex({
            name: "IDX_monthlyupdates_monthlyId_operation",
            columnNames: ["monthlyId", "operation"]
        }));
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropIndex("monthlyupdates", "IDX_monthlyupdates_monthlyId_operation");
        await queryRunner.dropUniqueConstraint("monthlyupdates", "monthlyupdates_monthlyId_operation");
        await queryRunner.dropTable("monthlyupdates");
    }

}
