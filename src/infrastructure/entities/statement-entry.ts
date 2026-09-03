import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
    JoinColumn,
} from "typeorm";
import { Category } from "./categories";
import { Card } from "./card";
import { Household } from "./household";

/**
 * Item de detalhamento da fatura de um cartão. É puramente informativo:
 * NÃO entra em nenhum cálculo de dashboard/orçamento — o valor da fatura
 * já é representado por uma Transaction resumo. Entidade separada de
 * Transaction de propósito, sem relação com ela.
 */
@Entity("statement_entries")
export class StatementEntry {
    @PrimaryGeneratedColumn("uuid")
    id!: string;

    @Column({ name: "household_id" })
    householdId!: string;

    @ManyToOne(() => Household, { onDelete: "CASCADE" })
    @JoinColumn({ name: "household_id" })
    household!: Household;

    @Column({ name: "card_id", type: "int" })
    cardId!: number;

    @ManyToOne(() => Card, { onDelete: "CASCADE" })
    @JoinColumn({ name: "card_id" })
    card!: Card;

    @Column({ name: "category_id", type: "int", nullable: true })
    categoryId!: number | null;

    @ManyToOne(() => Category, { onDelete: "SET NULL", nullable: true })
    @JoinColumn({ name: "category_id" })
    category!: Category | null;

    @Column()
    description!: string;

    @Column("decimal", { precision: 10, scale: 2 })
    amount!: number;

    @Column({ type: "date" })
    date!: Date;

    @CreateDateColumn({ name: "created_at" })
    createdAt!: Date;

    @UpdateDateColumn({ name: "updated_at" })
    updatedAt!: Date;
}
