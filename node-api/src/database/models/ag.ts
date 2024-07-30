import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";


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

    constructor(id: number, title: string, description: string, ag_date: Date, location: string, minimum_participants: number) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.ag_date = ag_date;
        this.location = location;
        this.minimum_participants = minimum_participants;
    }

}