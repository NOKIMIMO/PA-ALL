import { Column, Entity, ManyToOne, PrimaryGeneratedColumn, CreateDateColumn, JoinColumn } from "typeorm";
import {User} from "./user";

@Entity()
export class Token {

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    token: string;
    @Column()
    userId: number; // Storing only the user id
    @ManyToOne(() => User, user => user.tokens, { nullable: false })
    @JoinColumn({ name: "userId" }) // Joining on userId
    user: User;
    
    @CreateDateColumn({name: 'created_at', type: 'timestamp with time zone' })
    createdAt: Date

    constructor(id: number, token: string, user: User, createdAt: Date,userId: number) {
        this.id = id
        this.token = token
        this.user = user
        this.createdAt = createdAt
        this.userId = userId
    }
}