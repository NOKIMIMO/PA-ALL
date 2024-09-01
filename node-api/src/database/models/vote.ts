import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { Option } from './option';

@Entity()
export class Vote {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    title: string;

    @Column()
    description: string;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @Column()
    endDate: Date;

    @Column({ default: false })
    secondRoundEnabled: boolean;

    @OneToMany(() => Option, option => option.vote, { cascade: true })
    options: Option[];

    @Column({ default: true })
    active: boolean;

    constructor(id: number, title: string, description: string, createdAt: Date,
         updatedAt: Date, endDate: Date, secondRoundEnabled: boolean, options: Option[],
         active: boolean) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.endDate = endDate;
        this.secondRoundEnabled = secondRoundEnabled;
        this.options = options;
        this.active = active;
    }

}
