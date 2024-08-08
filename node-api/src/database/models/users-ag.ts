import { Column, CreateDateColumn, Entity, PrimaryColumn, UpdateDateColumn } from "typeorm";

@Entity()
export class UsersAgs{
    @PrimaryColumn()
    agId: number;
    @PrimaryColumn()
    userid: number;

    @CreateDateColumn({name: 'created_at', type: 'timestamp with time zone' })
    createdAt: Date

    @UpdateDateColumn({ name: 'updated_at', type: 'timestamp with time zone' })
    updatedAt: Date

    constructor(agId: number, userid: number, createdAt: Date, updatedAt: Date){
        this.agId = agId;
        this.userid = userid;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

}