import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";


@Entity({ name: 'user_agTasks' })
export class UserAgTask {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    userId: number;

    @Column()
    agTaskId: number;

    constructor(id:number,userId: number, agTaskId: number) {
        this.id = id;
        this.userId = userId;
        this.agTaskId = agTaskId;
    }
}
