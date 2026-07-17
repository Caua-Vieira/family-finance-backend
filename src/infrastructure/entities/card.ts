import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
    JoinColumn,
} from "typeorm";
import { User } from "./users";
import { Household } from "./household";

@Entity("cards")
export class Card {
    @PrimaryGeneratedColumn("identity")
    id!: number;

    @Column()
    name!: string;

    @Column({ name: "household_id" })
    householdId!: string;

    @ManyToOne(() => Household, { onDelete: "CASCADE" })
    @JoinColumn({ name: "household_id" })
    household!: Household;

    @Column({ name: "owner_user_id" })
    ownerUserId!: string;

    @ManyToOne(() => User, { onDelete: "CASCADE" })
    @JoinColumn({ name: "owner_user_id" })
    ownerUser!: User;

    @CreateDateColumn({ name: "created_at" })
    createdAt!: Date;

    @UpdateDateColumn({ name: "updated_at" })
    updatedAt!: Date;
}