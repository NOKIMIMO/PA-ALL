import { response } from 'express';
import { DataSource } from "typeorm";
import { JwtPayload } from "jsonwebtoken";
import { User } from "../database/models/user";
import { user_access_type } from "../common/enum/access-type";
import { CreateBanTicketRequest, ListBanTicketRequest, banTicketListReponse } from '../Validators/banTicketValidator';
import { BanTicket } from "../database/models/banTicket";
import { CustomError } from '../common/error/customError';
import { ListItemRequest } from "../Validators/commonValidator";




export default class BanTicketUseCase{
    constructor(private db: DataSource) {}

    async listBanTicketsWithUser(filter : ListItemRequest): Promise<any> {
        const query = this.db.createQueryBuilder(BanTicket, 'banTicket')
        query.leftJoinAndSelect('banTicket.user', 'user')
        query.leftJoinAndSelect('banTicket.moderator', 'moderator')
        // query.joinAndSelect('banTicket.user', 'user')
        // query.joinAndSelect('banTicket.moderator', 'user')
        console.log(query.getSql())
        if (filter.limit) {
            query.limit(filter.limit);
            if (filter.page) {
                query.offset((filter.page - 1) * filter.limit);
            }
        }
        const [banTickets, totalCount] = await query.getManyAndCount();
        const banTicketProcessed = banTickets.map((banTicket) => {
            return {
                id: banTicket.id,
                message: banTicket.message,
                reason: banTicket.reason,
                active: banTicket.active,
                end_date: banTicket.end_date,
                user_id: banTicket.user_id,
                moderator_id: banTicket.moderator_id,
                user: {
                    id: banTicket.user.id,
                    email: banTicket.user.email,
                    role: banTicket.user.role,
                    active: banTicket.user.active,
                    createdAt: banTicket.user.createdAt
                },
                moderator: {
                    id: banTicket.moderator.id,
                    email: banTicket.moderator.email,
                    role: banTicket.moderator.role,
                    active: banTicket.moderator.active,
                    createdAt: banTicket.moderator.createdAt
                }
            }
        })
        return { banTicketProcessed, totalCount };
    }

    async banUser(request :CreateBanTicketRequest, currentUserId : number): Promise<banTicketListReponse> {
        const banTicketRepo = this.db.getRepository(BanTicket);
        const userRepo = this.db.getRepository(User);
        const user = await userRepo.findOneBy({id: request.user_id})
        const alreadyBanned = await banTicketRepo.findOneBy({user_id: request.user_id, active: true})
        if (alreadyBanned) {
            throw new CustomError(400, 'User already banned')
        }
        const moderator = await userRepo.findOneBy({id: currentUserId})
        if (!user) {
            throw new CustomError(404, 'User not found')
        }
        const banTicket = banTicketRepo.create({
            reason: request.reason,
            message : request.message,
            end_date: request.end_date,
            moderator_id: currentUserId,
            user: user!,
            user_id: user!.id,
            moderator: moderator!
        })
        const ticket = await banTicketRepo.save(banTicket)
        const response = {
            id: ticket.id,
            Message: ticket.message,
            reason: ticket.reason,
            active: ticket.active,
            end_date: ticket.end_date,
            user_id: ticket.user_id,
            moderator_id: ticket.moderator_id,
            user: {
                id: user.id,
                email: user.email,
                role: user.role,
                active: user.active,
                createdAt: user.createdAt
            },
            moderator: {
                id: moderator!.id,
                email: moderator!.email,
                role: moderator!.role,
                active: moderator!.active,
                createdAt: moderator!.createdAt
            }
        }
        user.active = false
        await userRepo.save(user)

        return response
    }
    async unbanUser(userid:number): Promise<banTicketListReponse> {
        const banTicketRepo = this.db.getRepository(BanTicket);
        const banTicket = await banTicketRepo.findOneBy({user_id:userid, active: true})
        if (!banTicket) {
            throw new CustomError(404, 'User not banned')
        }
        const userRepo = this.db.getRepository(User);
        const user = await userRepo.findOneBy({id: banTicket.user_id})
        if (!user) {
            throw new CustomError(404, 'User not found')
        }
        const moderator = await userRepo.findOneBy({id: banTicket.moderator_id})
        user.active = true
        await userRepo.save(user)
        banTicket.active = false
        await banTicketRepo.save(banTicket)
        const response = {
            id: banTicket.id,
            Message: banTicket.message,
            reason: banTicket.reason,
            active: banTicket.active,
            end_date: banTicket.end_date,
            user_id: banTicket.user_id,
            moderator_id: banTicket.moderator_id,
            user: {
                id: user.id,
                email: user.email,
                role: user.role,
                active: user.active,
                createdAt: user.createdAt
            },
            moderator: {
                id: moderator!.id,
                email: moderator!.email,
                role: moderator!.role,
                active: moderator!.active,
                createdAt: moderator!.createdAt
            }
        }
        return response
    }
}