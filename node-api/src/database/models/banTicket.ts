import { Message } from './../../../../react-app/src/services/MessageService';
import { Column, CreateDateColumn, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { User } from './user';

@Entity()
export class BanTicket {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    message: string;

    @Column()
    reason: string;

    @Column({
        default: true
    })
    active: boolean;

    @Column()
    end_date: Date;

    @Column({ name: "user_id" })
    user_id: number;

    @Column({ name: "moderator_id" })
    moderator_id: number;

    @ManyToOne(() => User, user => user.banTickets)
    user: User;

    @ManyToOne(() => User, user => user.banTicketsIssued)
    moderator: User;

    @CreateDateColumn({ name: 'created_at', type: 'timestamp with time zone' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at', type: 'timestamp with time zone' })
    updatedAt: Date;

    constructor(id: number, message: string, reason: string, active: boolean, end_date: Date, user_id: number, moderator_id: number, user: User, moderator: User,
        createdAt: Date, updatedAt: Date
    ) {
        this.id = id;
        this.message = message;
        this.reason = reason;
        this.active = active;
        this.end_date = end_date;
        this.user_id = user_id;
        this.moderator_id = moderator_id;
        this.user = user;
        this.moderator = moderator;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

}