import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { User } from "./user";
import { Event } from "./event";

@Entity()
export class EventManager {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ name: 'eventId' })
    eventId: number;

    @ManyToOne(() => Event, event => event.eventManager)
    event: Event;

    @Column({ name: 'userId' })
    userId: number;

    @ManyToOne(() => User, user => user.eventManager)
    user: User;

    constructor(id: number, eventId: number, userId: number, event: Event, user: User) {
        this.id = id;
        this.eventId = eventId;
        this.userId = userId;
        this.event = event;
        this.user = user;
    }


}