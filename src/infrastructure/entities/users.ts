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

@Entity("users")
export class User {
    @PrimaryGeneratedColumn("uuid")
    id!: string;

    @Column()
    name!: string;

    @Column({ unique: true })
    email!: string;

    @Column({ name: "password_hash" })
    passwordHash!: string;

    @Column({ name: "password_reset_token_hash", type: "varchar", nullable: true, select: false })
    passwordResetTokenHash!: string | null;

    @Column({ name: "password_reset_expires_at", type: "timestamp", nullable: true, select: false })
    passwordResetExpiresAt!: Date | null;

    @Column({ name: "household_id" })
    householdId!: string;

    @ManyToOne(() => Household, (household) => household.users, {
        onDelete: "CASCADE",
    })
    @JoinColumn({ name: "household_id" })
    household!: Household;

    @CreateDateColumn({ name: "created_at" })
    createdAt!: Date;

    @UpdateDateColumn({ name: "updated_at" })
    updatedAt!: Date;
}