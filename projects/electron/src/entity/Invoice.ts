import { BaseEntity, Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { InvoiceLineEntity } from "./InvoiceLine";
import { MonthlyEntity } from "./Monthly";

@Entity({ name: 'invoices' })
export class InvoiceEntity extends BaseEntity {

    @PrimaryGeneratedColumn()
    id: number;

    @Column({ nullable: false })
    no: string;

    @OneToMany(() => InvoiceLineEntity, (item) => item.invoice, {
        cascade: true
    })
    lines: InvoiceLineEntity[]

    @ManyToOne(() => MonthlyEntity, (monthly) => monthly.invoices, {
        onDelete: 'CASCADE'
    })
    monthly: MonthlyEntity
}