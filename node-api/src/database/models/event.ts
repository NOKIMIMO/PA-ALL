import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn, OneToMany } from "typeorm";
import { User } from "./user";
import { Task } from "./task";

@Entity()
export class Event {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    title: string;

    @Column({ name: "userId" })
    userId: number; // Storing only the user id

    @ManyToOne(() => User, user => user.events)
    @JoinColumn({ name: "userId" }) // Joining on userId
    user: User;

    @OneToMany(() => Task, task => task.event)
    tasks: Task[];

    @Column()
    description: string;

    @Column({ default: 'GLOBAL' })
    data_access_type: string;

    @Column({ type: 'timestamp with time zone' })
    event_date: Date;

    @Column()
    location: string;

    @Column({ default: true })
    active: boolean;

    @CreateDateColumn({ name: 'created_at', type: 'timestamp with time zone' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at', type: 'timestamp with time zone' })
    updatedAt: Date;

    constructor(id: number, title: string, userId: number,
         user: User, description: string, data_access_type: string,
          event_date: Date, location: string, createdAt: Date, updatedAt: Date,
           active: boolean, tasks: Task[]) {
        this.id = id;
        this.title = title;
        this.user = user;
        this.description = description;
        this.data_access_type = data_access_type;
        this.event_date = event_date;
        this.location = location;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.userId = userId;
        this.active = active;
        this.tasks = tasks;
    }
}
