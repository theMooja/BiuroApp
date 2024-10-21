import { BaseEntity, Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { MarchEntity } from "./March";
import { UserEntity } from "./User";

@Entity({ name: 'stoppers' })
export class StopperEntity extends BaseEntity {

    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => MarchEntity, monthly => monthly.stoppers, {
        onDelete: 'CASCADE'
    })
    march: MarchEntity;

    @ManyToOne(() => UserEntity, user => user.stoppers)
    user: UserEntity;

    @CreateDateColumn()
    createdAt: Date;

    @Column({ nullable: false })
    seconds: number;

    @Column()
    from: Date;
}



