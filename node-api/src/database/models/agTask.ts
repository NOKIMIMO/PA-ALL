import { Column, CreateDateColumn, Entity, JoinColumn, ManyToMany, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Event } from "./event";

@Entity()
export class AgTask{
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    title: string;

    @Column()
    description: string;

    @Column({default: false})
    completed: boolean;

    @Column()
    max_end_date: Date;

    @ManyToMany(() => AgTask, task => task.id)
    task: AgTask[]

    @Column({ name: 'eventId' })
    eventId: number; 

    @ManyToOne(() => Event, event => event.id)
    @JoinColumn({ name: 'eventId' })
    event: Event

    @CreateDateColumn({ name: 'created_at', type: 'timestamp with time zone' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at', type: 'timestamp with time zone' })
    updatedAt: Date;
    
    constructor(id: number, description: string, completed: boolean,
         max_end_date: Date, createdAt: Date, updatedAt: Date,
          event: Event , task: AgTask[], eventId: number, title: string) {
        this.id = id;
        this.description = description;
        this.completed = completed;
        this.max_end_date = max_end_date;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.event = event;
        this.task = task;
        this.eventId = eventId;
        this.title = title;
    }
    
    
}