import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Theme {
    @PrimaryGeneratedColumn()
    id: number;
    @Column()
    name: string;
    @Column()
    path: string;

    constructor(id: number, name: string, path: string) {
        this.id = id;
        this.name = name;
        this.path = path;
    }
}