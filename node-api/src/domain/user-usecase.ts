import { BanTicket } from './../database/models/banTicket';
import { ListUserValidationRequest, SelectUserRequest, UpdateUserRequest, UserResponse } from '../Validators/userValidator';
import { User } from './../database/models/user';
import { DataSource } from "typeorm";
import { db } from './../database/db';
import { compare } from 'bcrypt';
import { Token } from '../database/models/token';
import { CustomError } from '../common/error/customError';
import { License } from '../database/models/license';

export class UserUseCase {
    constructor(private readonly db: DataSource) { }

    async isUserAdmin(userid: number): Promise<boolean> {
        const user = await this.getUserById(userid)
        if (!user) {
            return false
        }
        return user.role === 'ADMIN'
    }
    async getBanMessage(userid: number): Promise<BanTicket | CustomError> {
        const UserRepo = this.db.getRepository(User)
        const BanTicketRepo = this.db.getRepository(BanTicket)
        const user = await UserRepo.findOneBy({ id: userid })
        if (!user) {
            return new CustomError(404, 'User not found')
        }
        const banTicket = await BanTicketRepo.findOneBy({ user_id: userid, active: true })
        if (!banTicket) {
            return new CustomError(400, 'User was manually deactivated, contact support at mail@mail.com')
        }
        return banTicket
    }

    async isUserSuperAdmin(userid: number): Promise<boolean> {
        const user = await this.getUserById(userid)
        if (!user) {
            return false
        }
        return user.role === 'SUPER_ADMIN'
    }

    async listUsers(filter: ListUserValidationRequest): Promise<{ users: UserResponse[]; totalCount: number; }> {
        const query = this.db.createQueryBuilder(User, 'user')
            .where("user.active = :active", { active: true }); // Ajoutez cette condition pour filtrer les utilisateurs inactifs

        if (filter.role) {
            query.andWhere("user.role = :role", { role: filter.role });
        }
        if (filter.limit) {
            query.limit(filter.limit);
            if (filter.page) {
                query.offset((filter.page - 1) * filter.limit);
            }
        }
        const totalCount = await query.getCount();
        const users = (await query.getMany()).map(user => ({
            id: user.id,
            email: user.email,
            role: user.role,
            lastname: user.lastname,
            firstname: user.firstname,
            active: user.active,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt
        })
        );

        return { users, totalCount };
    }

    async createUser(email: string, hashedPassword: string, firstname: string, lastname: string): Promise<User> {
        const userRepository = db.getRepository(User)
        return await userRepository.save({
            email: email,
            password: hashedPassword,
            lastname: firstname,
            firstname: lastname,
        });
    }
    async validateToken(token: string): Promise<UserResponse | null> {
        const tokenRepository = db.getRepository(Token);
        const tokenEntity = await tokenRepository.findOne({
            where: {
                token: token
            },
            relations: ["user"]
        });
        if (!tokenEntity) {
            return null;
        }
        const user = tokenEntity.user;
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

    async logUser(email: string, password: string): Promise<UserResponse | null> {
        const userRepository = db.getRepository(User)
        const user = await userRepository.findOneBy({ email: email });
        if (!user) {
            return null;
        }
        const isValid = await compare(password, user.password);
        if (!isValid) {
            return null
        }
        //check with ban tickets
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

    async getUserById(id: number): Promise<UserResponse &{license?:any} | null> {
        const repo = this.db.getRepository(User)
        const user = await repo.findOneBy({ id })
        if (!user) {
            throw new CustomError(404, 'User not found')
        }
        const licenseRepo = this.db.getRepository(License)
        const license = await licenseRepo.findOneBy({ userId: user.id, active: true })
        const userResponse = {
            id: user.id,
            email: user.email,
            role: user.role,
            lastname: user.lastname,
            firstname: user.firstname,
            active: user.active,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
            license: license ? license : {}
        }
        return userResponse
    }
    async getrUserByToken(token: string): Promise<UserResponse | null> {
        const tokenRepo = this.db.getRepository(Token)
        const tokenFound = await tokenRepo.findOneBy({ token })
        if (!tokenFound) {
            return null
        }
        const repo = this.db.getRepository(User)
        const user = await repo.findOneBy({ id: tokenFound.user.id })
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
    async updateUser({ email, password, role }: UpdateUserRequest, userid: number): Promise<UserResponse | null> {
        const repo = this.db.getRepository(User)
        const userFound = await repo.findOneBy({ id: userid })
        if (!userFound) {
            return null
        }
        if (email) {
            userFound.email = email
        }
        if (password) {
            userFound.password = password
        }
        if (role) {
            userFound.role = role
        }
        const user = await repo.save(userFound)
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

    async deleteUser(data: SelectUserRequest): Promise<void> {
        const repo = this.db.getRepository(User);
        const user = await repo.findOneBy({ id: data.id }); // Utilisez l'ID de l'utilisateur passé dans data
        if (!user) {
            throw new Error('User not found');
        }
        const tokenRepo = this.db.getRepository(Token);
        const tokens = await tokenRepo.findBy({ userId: user.id });
        user.active = false;
        user.email = `${user.id}@jo.com`;
        user.password = '';
        await tokenRepo.remove(tokens);
        await repo.save(user);
    }


}
