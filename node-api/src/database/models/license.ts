import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { User } from "./user";

@Entity()
export class License {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    userId: number; // Storing only the user id
    @ManyToOne(() => User, user => user.license, { nullable: true })
    @JoinColumn({ name: "userId" }) // Joining on userId
    user: User;

    @Column()
    price: number

    @Column({default: true})
    active:boolean

    @Column({ type: 'timestamp with time zone' , default: () => 'CURRENT_TIMESTAMP'})
    expirationDate: Date

    @UpdateDateColumn({name: 'updated_at', type: 'timestamp with time zone' })
    updatedAt: Date

    @CreateDateColumn({name: 'created_at', type: 'timestamp with time zone' })
    createdAt: Date

    constructor(id: number, userId: number, user: User, price: number, active: boolean,
         updatedAt: Date, createdAt: Date, expirationDate: Date) {
        this.id = id
        this.userId = userId
        this.user = user
        this.price = price
        this.active = active
        this.updatedAt = updatedAt
        this.createdAt = createdAt
        this.expirationDate = expirationDate
    }
    
}
    