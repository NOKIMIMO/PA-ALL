import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { User } from "./user";
import { AgTask } from "./agTask";
import { ag_category } from "../../common/enum/ag-category";


@Entity()
export class Ag {
    @PrimaryGeneratedColumn()
    id: number;
    
    @Column()
    title: string;

    @Column()
    description: string;

    @Column()
    ag_date: Date;

    @Column()
    location: string;

    @Column()
    minimum_participants: number;

    @Column()
    mannager_id: number;

    @Column({ default: ag_category.GENERAL })
    category: ag_category;

    @OneToMany(() => AgTask, agTask => agTask.ag, {cascade: true})
    agTask: AgTask[];

    @ManyToOne(() => User, user => user.agMannager)
    @JoinColumn({ name: 'mannager_id' })
    user: User;

    @CreateDateColumn({ name: 'created_at', type: 'timestamp with time zone' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at', type: 'timestamp with time zone' })
    updatedAt: Date;

    constructor(id: number, title: string, description: string, ag_date: Date, location: string, minimum_participants: number,
        createdAt : Date, updatedAt: Date, mannager_id: number, user: User, agTask: AgTask[], category: ag_category
    ) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.ag_date = ag_date;
        this.location = location;
        this.minimum_participants = minimum_participants;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.mannager_id = mannager_id;
        this.user = user;    
        this.agTask = agTask;
        this.category = category;
    }

}