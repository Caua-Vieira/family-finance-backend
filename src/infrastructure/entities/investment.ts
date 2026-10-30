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
import { InvestmentIndexer } from "../../domain/types/investment-dto";

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

    @Column({ name: "reference_date", type: "date", nullable: true })
    referenceDate!: string | null;

    @Column({ type: "varchar", nullable: true })
    indexer!: InvestmentIndexer | null;

    @Column("decimal", { precision: 8, scale: 4, nullable: true })
    rate!: number | null;

    @Column("decimal", { name: "monthly_contribution", precision: 14, scale: 2, default: 0 })
    monthlyContribution!: number;

    @Column({ name: "contribution_day", type: "int", nullable: true })
    contributionDay!: number | null;

    @CreateDateColumn({ name: "created_at" })
    createdAt!: Date;

    @UpdateDateColumn({ name: "updated_at" })
    updatedAt!: Date;
}
