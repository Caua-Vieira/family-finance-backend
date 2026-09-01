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

@Entity("recurring_transactions")
export class RecurringTransaction {
    @PrimaryGeneratedColumn("uuid")
    id!: string;

    @Column({ name: "household_id" })
    householdId!: string;

    @ManyToOne(() => Household, { onDelete: "CASCADE" })
    @JoinColumn({ name: "household_id" })
    household!: Household;

    @Column({ type: "enum", enum: ["income", "expense"] })
    type!: "income" | "expense";

    @Column("decimal", { precision: 10, scale: 2 })
    amount!: number;

    @Column()
    description!: string;

    @Column({ name: "category_id", type: "int", nullable: true })
    categoryId!: string | null;

    @ManyToOne(() => Category, { onDelete: "SET NULL", nullable: true })
    @JoinColumn({ name: "category_id" })
    category!: Category | null;

    @Column({ name: "card_id", type: "int", nullable: true })
    cardId!: string | null;

    @ManyToOne(() => Card, { onDelete: "SET NULL", nullable: true })
    @JoinColumn({ name: "card_id" })
    card!: Card | null;

    @Column({ name: "user_id", type: "uuid", nullable: true })
    userId!: string | null;

    @ManyToOne(() => User, { onDelete: "SET NULL", nullable: true })
    @JoinColumn({ name: "user_id" })
    user!: User | null;

    @Column({ name: "day_of_month", type: "int" })
    dayOfMonth!: number;

    @Column({ name: "start_date", type: "date" })
    startDate!: Date;

    @Column({ name: "end_date", type: "date", nullable: true })
    endDate!: Date | null;

    @Column({ default: true })
    active!: boolean;

    @CreateDateColumn({ name: "created_at" })
    createdAt!: Date;

    @UpdateDateColumn({ name: "updated_at" })
    updatedAt!: Date;
}
