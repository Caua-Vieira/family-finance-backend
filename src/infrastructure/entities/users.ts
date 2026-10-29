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

    // Nulo em contas criadas pelo Google até o usuário definir uma senha
    @Column({ name: "password_hash", type: "varchar", nullable: true })
    passwordHash!: string | null;

    @Column({ name: "google_id", type: "varchar", unique: true, nullable: true })
    googleId!: string | null;

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