import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
    OneToMany,
    JoinColumn,
} from "typeorm";
import { Household } from "./household";

@Entity("categories")
export class Category {
    @PrimaryGeneratedColumn("identity")
    id!: number;

    @Column()
    name!: string;

    @Column({ name: "household_id" })
    householdId!: string;

    @ManyToOne(() => Household, { onDelete: "CASCADE" })
    @JoinColumn({ name: "household_id" })
    household!: Household;

    @Column({ name: "parent_id", nullable: true })
    parentId!: number | null;

    @ManyToOne(() => Category, (category) => category.children, { onDelete: "SET NULL", nullable: true })
    @JoinColumn({ name: "parent_id" })
    parent!: Category | null;

    @OneToMany(() => Category, (category) => category.parent)
    children!: Category[];

    @CreateDateColumn({ name: "created_at" })
    createdAt!: Date;

    @UpdateDateColumn({ name: "updated_at" })
    updatedAt!: Date;
}