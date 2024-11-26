import { BaseEntity, Column, Entity, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { ClientEntity } from "./Client";
import { MarchEntity } from "./March";
import { AppDataSource } from "../datasource";
import { InvoiceEntity } from "./Invoice";
import { NoteEntity } from "./Note";

@Entity({ name: 'monthlies' })
export class MonthlyEntity extends BaseEntity {

    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => ClientEntity, client => client.monthlies)
    client: ClientEntity;

    @Column({ nullable: false })
    year: number;

    @Column({ nullable: false })
    month: number;

    @OneToMany(() => NoteEntity,  note => note.monthly)
    notes: NoteEntity[];

    @Column({
        type: 'jsonb'
    })
    info: {
        email: string,
        podmiot: string,
        program: string,
        forma: string
    }

    @OneToMany(() => MarchEntity, march => march.monthly, {
        cascade: true
    })
    marches: MarchEntity[];

    @OneToMany(() => InvoiceEntity, invoice => invoice.monthly, {
    })
    invoices: InvoiceEntity[];
}


