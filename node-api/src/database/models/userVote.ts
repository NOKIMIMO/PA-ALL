import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './user';
import { Vote } from './vote';
import { Option } from './option';

@Entity({ name: 'user_votes' })
export class UserVote {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    userId: number;

    @Column()
    voteId: number;

    @Column()
    optionId: number;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'userId'})
    user: User | undefined;

    @ManyToOne(() => Vote)
    @JoinColumn({ name: 'voteId' })
    vote: Vote | undefined;

    @ManyToOne(() => Option)
    @JoinColumn({ name: 'optionId' })
    option: Option | undefined;

    constructor(id:number,userId: number, voteId: number, optionId: number) {
        this.id = id;
        this.userId = userId;
        this.voteId = voteId;
        this.optionId = optionId;
    }
}
