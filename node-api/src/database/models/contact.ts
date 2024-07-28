import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from "typeorm";

@Entity()
export class Contact {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column()
    email: string;

    @Column()
    message: string;

    @CreateDateColumn()
    createdAt: Date;

    constructor(id: number, name: string, email: string, message: string, createdAt: Date) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.message = message;
        this.createdAt = createdAt;
    }
}
