import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
    JoinColumn,
    Unique,
} from "typeorm";
import { Category } from "./categories";
import { Household } from "./household";

@Entity("budgets")
@Unique(["categoryId", "month", "year"])
export class Budget {
    @PrimaryGeneratedColumn("uuid")
    id!: string;

    @Column({ name: "category_id" })
    categoryId!: string;

    @ManyToOne(() => Category, { onDelete: "CASCADE" })
    @JoinColumn({ name: "category_id" })
    category!: Category;

    @Column({ name: "household_id" })
    householdId!: string;

    @ManyToOne(() => Household, { onDelete: "CASCADE" })
    @JoinColumn({ name: "household_id" })
    household!: Household;

    @Column()
    month!: number;

    @Column()
    year!: number;

    @Column("decimal", { precision: 10, scale: 2, name: "estimated_amount" })
    estimatedAmount!: number;

    @CreateDateColumn({ name: "created_at" })
    createdAt!: Date;

    @UpdateDateColumn({ name: "updated_at" })
    updatedAt!: Date;
}