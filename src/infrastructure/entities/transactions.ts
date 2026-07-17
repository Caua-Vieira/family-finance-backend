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
import { Category } from "./categories";
import { Card } from "./card";
import { Household } from "./household";

@Entity("transactions")
export class Transaction {
    @PrimaryGeneratedColumn("uuid")
    id!: string;

    @Column({ type: "enum", enum: ["income", "expense"] })
    type!: "income" | "expense";

    @Column("decimal", { precision: 10, scale: 2 })
    amount!: number;

    @Column()
    description!: string;

    @Column({ type: "date" })
    date!: Date;

    @Column({ name: "category_id", nullable: true })
    categoryId!: string | null;

    @ManyToOne(() => Category, { onDelete: "SET NULL", nullable: true })
    @JoinColumn({ name: "category_id" })
    category!: Category | null;

    @Column({ name: "card_id", nullable: true })
    cardId!: string | null;

    @ManyToOne(() => Card, { onDelete: "SET NULL", nullable: true })
    @JoinColumn({ name: "card_id" })
    card!: Card | null;

    @Column({ name: "user_id", nullable: true })
    userId!: string | null;

    @ManyToOne(() => User, { onDelete: "SET NULL", nullable: true })
    @JoinColumn({ name: "user_id" })
    user!: User | null;

    @Column({ name: "household_id" })
    householdId!: string;

    @ManyToOne(() => Household, { onDelete: "CASCADE" })
    @JoinColumn({ name: "household_id" })
    household!: Household;

    @CreateDateColumn({ name: "created_at" })
    createdAt!: Date;

    @UpdateDateColumn({ name: "updated_at" })
    updatedAt!: Date;
}