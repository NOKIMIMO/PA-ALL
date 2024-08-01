import { Message } from './../../../../react-app/src/services/MessageService';
import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { User } from './user';

@Entity()
export class BanTicket {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    Message: string;

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

    constructor(id: number, Message: string, reason: string, active: boolean, end_date: Date, user_id: number, moderator_id: number, user: User, moderator: User) {
        this.id = id;
        this.Message = Message;
        this.reason = reason;
        this.active = active;
        this.end_date = end_date;
        this.user_id = user_id;
        this.moderator_id = moderator_id;
        this.user = user;
        this.moderator = moderator;
    }

}