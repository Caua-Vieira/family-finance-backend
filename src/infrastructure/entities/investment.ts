import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
    JoinColumn,
} from "typeorm";
import { Household } from "./household";

/**
 * Posição de investimento da família: quanto foi aplicado e quanto vale hoje.
 * É um controle patrimonial à parte — NÃO entra nos cálculos de dashboard nem
 * de orçamento.
 */
@Entity("investments")
export class Investment {
    @PrimaryGeneratedColumn("uuid")
    id!: string;

    @Column({ name: "household_id" })
    householdId!: string;

    @ManyToOne(() => Household, { onDelete: "CASCADE" })
    @JoinColumn({ name: "household_id" })
    household!: Household;

    @Column()
    name!: string;

    @Column()
    type!: string;

    @Column({ type: "varchar", nullable: true })
    institution!: string | null;

    @Column("decimal", { name: "invested_amount", precision: 14, scale: 2 })
    investedAmount!: number;

    @Column("decimal", { name: "current_value", precision: 14, scale: 2 })
    currentValue!: number;

    @CreateDateColumn({ name: "created_at" })
    createdAt!: Date;

    @UpdateDateColumn({ name: "updated_at" })
    updatedAt!: Date;
}
