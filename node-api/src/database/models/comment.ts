import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany, JoinColumn } from "typeorm";
import { User } from './user';
import { Post } from "./post";

@Entity()
export class Comment {
    @PrimaryGeneratedColumn()
    id: number;
    
    comments?: Comment[];
    @Column()
    content: string;

    @CreateDateColumn()
    createdAt: Date;
    
    @UpdateDateColumn()
    updatedAt: Date;

    @Column()
    userId: number; // Storing only the user id

    @ManyToOne(() => User, user => user.comments, { nullable: false })
    @JoinColumn({ name: "userId" })
    user: User;

    @Column()
    postId: number; // Storing only the post id

    @ManyToOne(() => Post, post => post.comments, { nullable: false })
    @JoinColumn({ name: "postId" })
    post: Post;

    @Column({ nullable: true })
    parentId: number;

    @ManyToOne(() => Comment, comment => comment.replies)
    @JoinColumn({ name: "parentId" })
    parent: Comment;

    
    @OneToMany(() => Comment, comment => comment.parent)
    replies: Comment[];

    constructor(id: number, content: string, createdAt: Date, updatedAt: Date, userId: number, user: User, postId: number, post: Post, parent: Comment, replies: Comment[],parentId:number) {
        this.id = id;
        this.content = content;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.userId = userId;
        this.user = user;
        this.postId = postId;
        this.post = post;
        this.parent = parent;
        this.replies = replies;
        this.parentId = parentId;
    }
}