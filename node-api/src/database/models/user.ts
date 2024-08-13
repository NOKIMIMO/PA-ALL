import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToMany, UpdateDateColumn, ManyToMany } from "typeorm";
import { Token } from "./token";
import { Vote } from "./vote"
import { Event } from "./event"
import { Post } from "./post"
import  {Comment} from "./comment"
import {File} from "./file"
import { UserVote } from "./userVote";
import { BanTicket } from "./banTicket";
import { EventManager } from "./eventMannager";
import { Ag } from "./ag";
@Entity()
export class User {
    @PrimaryGeneratedColumn()
    id: number

    @Column({
        unique: true
    })
    email: string

    @Column()
    password: string

    @Column({
        default: 'user'
    })
    role: string
    @Column({
        default: true
    })
    @Column()
    lastname: string

    @Column()
    firstname: string

    @Column({default: true})
    active: boolean

    @OneToMany(() => BanTicket, banTicket => banTicket.user)
    banTickets: BanTicket[];

    @OneToMany(() => BanTicket, banTicket => banTicket.moderator)
    banTicketsIssued: BanTicket[];

    @CreateDateColumn({name: 'created_at', type: 'timestamp with time zone' })
    createdAt: Date

    @UpdateDateColumn({ name: 'updated_at', type: 'timestamp with time zone' })
    updatedAt: Date

    @OneToMany(() => Token, token => token.user, { onDelete: 'CASCADE'})
    tokens: Token[];

    @OneToMany(() => Event, events => events.user)
    events: Event[];
    @OneToMany(() => Post, posts => posts.user)
    posts: Post[];
    @OneToMany(() => Comment, comments => comments.user)
    comments: Comment[];
    @OneToMany(() => File, files => files.user)
    files: File[];

    @OneToMany(() => UserVote, userVote => userVote.user)
    userVotes: UserVote[];

    @OneToMany(()=> Ag , ag => ag.user)
    agMannager: Ag[];

    @OneToMany(()=> EventManager, eventManager => eventManager.event)
    eventManager: EventManager[];
    
    constructor(id: number, email: string, password: string, createdAt: Date,updatedAt: Date,
         tokens: Token[],role: string,events: Event[],
         active: boolean,posts: Post[],comments: Comment[],
         files: File[], userVotes: UserVote[],
         lastname: string, firstname: string, banTickets: BanTicket[], banTicketsIssued: BanTicket[],
         eventManager: EventManager[], agMannager: Ag[]
        ) {
        this.id = id;
        this.email = email; 
        this.password = password;
        this.createdAt = createdAt;
        this.tokens = tokens;
        this.updatedAt=updatedAt;
        this.role=role;
        this.events=events;
        this.active=active;
        this.posts=posts;
        this.comments=comments;
        this.files=files;
        this.userVotes=userVotes;
        this.lastname=lastname;
        this.firstname=firstname;
        this.banTickets=banTickets;
        this.banTicketsIssued=banTicketsIssued;
        this.eventManager=eventManager;
        this.agMannager=agMannager;
    }
};