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
import { RecurringTransaction } from "./recurring-transactions";

@Entity("recurring_transaction_overrides")
@Unique("UQ_recurring_override_month", ["recurringTransactionId", "year", "month"])
export class RecurringTransactionOverride {
    @PrimaryGeneratedColumn("uuid")
    id!: string;

    @Column({ name: "recurring_transaction_id", type: "uuid" })
    recurringTransactionId!: string;

    @ManyToOne(() => RecurringTransaction, { onDelete: "CASCADE" })
    @JoinColumn({ name: "recurring_transaction_id" })
    recurringTransaction!: RecurringTransaction;

    @Column({ type: "int" })
    month!: number;

    @Column({ type: "int" })
    year!: number;

    @Column("decimal", { precision: 10, scale: 2 })
    amount!: number;

    @CreateDateColumn({ name: "created_at" })
    createdAt!: Date;

    @UpdateDateColumn({ name: "updated_at" })
    updatedAt!: Date;
}
