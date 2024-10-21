import { BaseEntity, Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { InvoiceEntity } from "./Invoice";

@Entity({ name: 'invoicelines' })
export class InvoiceLineEntity extends BaseEntity {

    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => InvoiceEntity, invoice => invoice.lines, {
        onDelete: 'CASCADE'
    })
    invoice: InvoiceEntity;

    @Column()
    description: string;

    @Column()
    qtty: number;

    @Column()
    price: number;
}



