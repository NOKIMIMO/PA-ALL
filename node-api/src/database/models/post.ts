import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, UpdateDateColumn, OneToMany, JoinColumn } from "typeorm";
import { User } from './user';
import { Comment } from "./comment";
@Entity()
export class Post {
    @PrimaryGeneratedColumn()
    id: number;
    
    @Column()
    title: string;
    
    @Column()
    content: string;

    @Column({default: 'GLOBAL'})
    data_access_type: string
    
    @CreateDateColumn()
    createdAt: Date;
    
    @UpdateDateColumn()
    updatedAt: Date;

    @Column({ name: "userId" })
    userId: number; // Storing only the user id
    @ManyToOne(() => User, user => user.posts, { nullable: false })
    @JoinColumn({ name: "userId" }) // Joining on userId
    user: User;

    @OneToMany(() => Comment, comment => comment.post)
    comments: Comment[];

    constructor(id: number, title: string, content: string, createdAt: Date,updatedAt: Date,userId: number,user: User,data_acess_type : string ,comments: Comment[]) {
        this.id = id;
        this.title = title;
        this.content = content;
        this.createdAt = createdAt;
        this.updatedAt=updatedAt;
        this.userId=userId;
        this.user=user;
        this.comments=comments;
        this.data_access_type = data_acess_type;
    }


}