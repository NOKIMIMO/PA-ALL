import { DataSource, In } from "typeorm";
import { Ag } from "../database/models/ag";
import { JwtPayload } from "jsonwebtoken";
import { ListItemRequest } from "../Validators/commonValidator";
import { createEventValidationRequest, selectEventRequest, updateEventRequest } from "../Validators/eventValidator";
import { User } from "../database/models/user";
import { user_access_type } from "../common/enum/access-type";
import { createAgValidationRequest, selectedAgRequest } from "../Validators/agValidator";
import { CustomError } from "../common/error/customError";
import { AgTask } from "../database/models/agTask";
import { UserAgTask } from "../database/models/user-agTask";
import { UserResponse } from "../Validators/userValidator";
import { UsersAgs } from "../database/models/users-ag";
import { Vote } from "../database/models/vote";
import { UserVote } from "../database/models/userVote";

interface VoteInAgResponse {
    vote : Vote;
    userVoted: boolean;
}

interface AgResponse {
    id: number;
    title: string;
    description: string;
    ag_date: Date;
    location: string;
    minimum_participants: number;
    mannager_id: number;
    vote_id: number | null;
    ban_appeal_id: number | null;
    ban_appeal_info?: any;
    vote_info?: VoteInAgResponse;
    createdAt: Date;
    updatedAt: Date;
}

export default class AgUseCase {

    constructor(private readonly db: DataSource) { }

    async listAgs(filter: ListItemRequest): Promise<{ ags: Ag[]; totalCount: number; }> {
        const query = this.db.createQueryBuilder(Ag, 'ag')
        if (filter.limit) {
            query.limit(filter.limit)
            if (filter.page) {
                query.offset((filter.page - 1) * filter.limit)
            }
        }
        const [ags, totalCount] = await query.getManyAndCount()
        return { ags, totalCount }
    }
    async listAgsWhereUserJoined(userId: number){
        const agRepo = this.db.getRepository(Ag)
        const agUserRepo = this.db.getRepository(UsersAgs)
        const userAg = await agUserRepo.find({ where: { userid: userId } })
        const ags = await agRepo.find({ where: { id: In(userAg.map(t => t.agId)) } })
        return { ags, totalCount: ags.length }
    }

    async listAgParticipants(agId: number): Promise<UserResponse[]> {
        const agUserRepo = this.db.getRepository(UsersAgs)
        const userRepo = this.db.getRepository(User)
        const userAg = await agUserRepo.find({ where: { agId } })
        const users = await userRepo.find({ where: { id: In(userAg.map(t => t.userid)) }})
        const userResponse = users.map(user => {
            return {
                id: user.id,
                email: user.email,
                role: user.role,
                lastname: user.lastname,
                firstname: user.firstname,
                active: user.active,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt
            }
        })
        return userResponse
    }

    async getAgMannager(agId: number): Promise<UserResponse> {
        const agRepo = this.db.getRepository(Ag)
        const ag = await agRepo.findOneBy({ id: agId })
        if (!ag) {
            throw new CustomError(404, 'Ag not found')
        }
        const userRepo = this.db.getRepository(User)
        const user = await userRepo.findOneBy({ id: ag.mannager_id })
        if (!user) {
            throw new CustomError(404, 'User not found')
        }
        const userResponse = {
            id: user.id,
            email: user.email,
            role: user.role,
            lastname: user.lastname,
            firstname: user.firstname,
            active: user.active,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt
        }
        return userResponse

    }

    async listAgsOfUser(filter: ListItemRequest, userId: number): Promise<{ ags: Ag[]; totalCount: number; }> {
        const query = this.db.createQueryBuilder(Ag, 'ag')
        query.where('ag.mannager_id = :userId', { userId })
        if (filter.limit) {
            query.limit(filter.limit)
            if (filter.page) {
                query.offset((filter.page - 1) * filter.limit)
            }
        }
        const [ags, totalCount] = await query.getManyAndCount()
        return { ags, totalCount }
    }
    async listAgsWhereTaskAssigned(userId: number): Promise<{ ags: Ag[]; totalCount: number; }> {
        const userRepository = this.db.getRepository(User)
        const user = await userRepository.findOneBy({ id: userId })
        if (!user) {
            throw new CustomError(404,'User not found')
        }
        const userTaskRepository = this.db.getRepository(UserAgTask);
        const UserTaks = await userTaskRepository.findBy({ userId: userId });

        const taskRepository = this.db.getRepository(AgTask);
        const tasksIds = UserTaks.map((userTask) => userTask.agTaskId);
        const tasks = await taskRepository.findBy({ id: In(tasksIds) });

        const agRepository = this.db.getRepository(Ag);
        const agIds = tasks.map((task) => task.agId);
        const ags = await agRepository.findBy({ id: In(agIds) });
    
        return { ags, totalCount: ags.length }

    }


    async answerAg(agId: number, userId: number): Promise<any> {
        return { message: 'TBD' }
    }


    async createAg(data: createAgValidationRequest, userid: number): Promise<Ag> {
        const agRepository = this.db.getRepository(Ag);
        if (data.vote_id) {
            const voteRepo = this.db.getRepository(Vote)
            const vote = await voteRepo.findOneBy({ id: data.vote_id })
            if (!vote) {
                throw new CustomError(404, 'Vote not found')
            }
        }
        const newAg = agRepository.create({ ...data, mannager_id: userid });
        return await agRepository.save(newAg);
    }
    async getAgById(id: number,userId : number): Promise<any | null> {
        const repo = this.db.getRepository(Ag)
        const ag = await repo.findOneBy({ id })
        if (!ag) {
            throw new CustomError(404, 'Ag not found')
        }
        const agResponse: AgResponse = {
            id: ag.id,
            title: ag.title,
            description: ag.description,
            ag_date: ag.ag_date,
            location: ag.location,
            minimum_participants: ag.minimum_participants,
            mannager_id: ag.mannager_id,
            vote_id: ag.vote_id,
            ban_appeal_id: ag.ban_appeal_id,
            createdAt: ag.createdAt,
            updatedAt: ag.updatedAt
        }
        if (ag.vote_id) {
            const voteRepo = this.db.getRepository(Vote)
            const vote = await voteRepo.findOne({ where: { id }, relations: ['options'] });
            if (!vote) {
                throw new CustomError(404, 'Vote not found')
            }
            const userVoteRepository = this.db.getRepository(UserVote);

            const userVote = await userVoteRepository.findOne({ where: { voteId: id, userId } });
            agResponse.vote_info = {
                vote,
                userVoted: !!userVote
            }
        }
        return agResponse
    }

    async updateAg(data: createAgValidationRequest, agId: number, userId: number): Promise<Ag | null> {
        const repo = this.db.getRepository(Ag)
        const agFind = await repo.findOneBy({ id: agId })
        if (!agFind) {
            throw new CustomError(404, 'Ag not found')
        }

        const userRepo = this.db.getRepository(User)
        const user = await userRepo.findOneBy({ id: userId })
        if (!user) {
            throw new CustomError(404, 'User not found')
        }

        if (user.role !== user_access_type.ADMIN && user.role !== user_access_type.ADMIN) {
            if (agFind.mannager_id !== userId) {
                throw new CustomError(403, 'Forbidden')
            }
        }
        if (data.title) {
            agFind.title = data.title
        }

        if (data.description) {
            agFind.description = data.description
        }

        if (data.ag_date) {
            agFind.ag_date = data.ag_date
        }

        if (data.location) {
            agFind.location = data.location
        }

        if (data.minimum_participants) {
            agFind.minimum_participants = data.minimum_participants
        }

        return await repo.save(agFind)
    }

    async deleteAg(agId: number, userId: number): Promise<boolean> {
        const repo = this.db.getRepository(Ag)
        const agFind = await repo.findOneBy({ id: agId })
        if (!agFind) {
            throw new CustomError(404, 'Ag not found')
        }

        const userRepo = this.db.getRepository(User)
        const user = await userRepo.findOneBy({ id: userId })
        if (!user) {
            throw new CustomError(404, 'User not found')
        }

        if (user.role !== user_access_type.ADMIN && user.role !== user_access_type.ADMIN) {
            if (agFind.mannager_id !== userId) {
                throw new CustomError(403, 'Forbidden')
            }
        }
        await repo.remove(agFind)
        return true
    }
    async removeUserToAg(agId: number, userIds: number[]): Promise<string[] | null> {
        const agUserRepo = this.db.getRepository(UsersAgs)
        const agUser = await agUserRepo.find({ where: { agId: agId, userid: In(userIds) } })
        if (!agUser) {
            throw new CustomError(404, 'Ag not found')
        }
        const agRepo = this.db.getRepository(Ag)
        const ag = await agRepo.findOneBy({ id: agId })
        if (!ag) {
            throw new CustomError(404, 'Ag not found')
        }
        const string = [];
        for (const userId of userIds) {
            const alreadyExists = await agUserRepo.findOneBy({ agId: agId, userid: userId })
            if (!alreadyExists) {
                string.push(`User ${userId} not found`)
                continue
            }
            await agUserRepo.remove(alreadyExists)
        }
        if (string.length === 0) {
            string.push('All users removed successfully')
        }
        return string;
    }
    async addUserToAg(agId: number, userIds: number[]): Promise<string[] | null> {
        const agUserRepo = this.db.getRepository(UsersAgs)
        const agRepo = this.db.getRepository(Ag)
        const ag = await agRepo.findOneBy({ id: agId })
        if (!ag) {
            throw new CustomError(404, 'Ag not found')
        }
        const string = [];
        for (const userId of userIds) {
            const alreadyExists = await agUserRepo.findOneBy({ agId: agId, userid: userId })
            if (alreadyExists) {
                string.push(`User ${userId} already added`)
                continue
            }
            const newUserAg = agUserRepo.create({ agId, userid: userId })
            await agUserRepo.save(newUserAg)
        }
        if (string.length === 0) {
            string.push('All users added successfully')
        }
        return string;
    }

}