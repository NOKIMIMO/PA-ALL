import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { Vote } from './vote';
import { UserVote } from './userVote';

@Entity()
export class Option {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column({ default: 0 })
    voteCount: number;

    @Column({ name: "voteId" })
    voteId: number; // Storing only the vote id
    @ManyToOne(() => Vote, vote => vote.options, { nullable: false })
    @JoinColumn({ name: "voteId" }) // Joining on voteId
    vote: Vote;
    @OneToMany(() => UserVote, (userVote: { option: any; }) => userVote.option)
    userVotes: UserVote[];

    constructor(id: number, name: string, voteCount: number, voteId: number, vote: Vote, userVotes: UserVote[]) {
        this.id = id;
        this.name = name;
        this.voteCount = voteCount;
        this.voteId = voteId;
        this.vote = vote;
        this.userVotes=userVotes;
    }
}
