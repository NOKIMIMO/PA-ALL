import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, JoinColumn, ManyToOne } from "typeorm";
import { User } from "./user"

@Entity()
export class File {
    @PrimaryGeneratedColumn()
    id: number

    @Column()
    name: string;

    @Column({
        nullable: true
    })
    path: string;

    @Column()
    userId: number; // Storing only the user id
    @ManyToOne(() => User, user => user.files)
    @JoinColumn({ name: "userId" }) // Joining on userId
    user: User;

    @Column({
        default: "file" // or "folder"
    })
    type: string;

    @Column({
        nullable: true
    })
    size: number;

    @Column({
        nullable: true
    })
    extension: string;

    @Column({
        default: false
    })
    readOnly: boolean;

    @Column({
        default: false
    })
    isEncrypted: boolean;

    @Column({
        nullable: true
    })
    iv:string;

    @Column({
        nullable: true
    })
    salt:string;

    @Column({
        nullable: true
    })
    parentId: number;

    @CreateDateColumn({ name: 'created_at', type: 'timestamp with time zone' })
    createdAt: Date

    @UpdateDateColumn({ name: 'updated_at', type: 'timestamp with time zone' })
    updatedAt: Date

    constructor(id: number, name: string, path: string,
        user: User, createdAt: Date, userId: number,
        type: string, size: number, extension: string,
        readOnly: boolean, parentId: number, updatedAt: Date,
        isEncrypted: boolean,iv:string,salt:string) {
        this.id = id
        this.name = name
        this.path = path
        this.user = user
        this.createdAt = createdAt
        this.userId = userId
        this.type = type
        this.size = size
        this.extension = extension
        this.readOnly = readOnly
        this.parentId = parentId
        this.updatedAt = updatedAt
        this.isEncrypted = isEncrypted
        this.iv = iv
        this.salt = salt
    }
}