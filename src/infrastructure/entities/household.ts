import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity("households")
export class Household {
    @PrimaryGeneratedColumn("uuid")
    id!: string;

    @Column()
    name!: string;
}