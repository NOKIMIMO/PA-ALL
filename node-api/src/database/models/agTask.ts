import { Column, CreateDateColumn, Entity, JoinColumn, ManyToMany, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Event } from "./event";
import { Ag } from "./ag";

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

    @Column({ name: 'priorityId' ,nullable: true})
    priorityId: number | null;

    @ManyToOne(() => AgTask, task => task.id ,{nullable: true})
    @JoinColumn({ name: 'priorityId'  })
    priority: AgTask | null;

    @Column({ name: 'agId' })
    agId: number; 

    @ManyToOne(() => Ag, ag => ag.id)
    @JoinColumn({ name: 'agId' })
    ag: Ag

    @CreateDateColumn({ name: 'created_at', type: 'timestamp with time zone' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at', type: 'timestamp with time zone' })
    updatedAt: Date;
    
    constructor(id: number, description: string, completed: boolean,
         max_end_date: Date, createdAt: Date, updatedAt: Date,
         ag: Ag , agId: number, title: string, priorityId: number, priority: AgTask | null) {
        this.id = id;
        this.description = description;
        this.completed = completed;
        this.max_end_date = max_end_date;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.ag = ag;
        this.agId = agId;
        this.title = title;
        this.priorityId = priorityId;
        this.priority = priority;

    }
    
    
}