import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";


@Entity({ name: 'user_tasks' })
export class UserTask {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    userId: number;

    @Column()
    taskId: number;

    constructor(id:number,userId: number, taskId: number) {
        this.id = id;
        this.userId = userId;
        this.taskId = taskId;
    }
}
