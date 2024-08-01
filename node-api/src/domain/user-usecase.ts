import { SelectUserRequest, UpdateUserRequest } from '../Validators/userValidator';
import { User } from './../database/models/user';
import { DataSource } from "typeorm";
import { db } from './../database/db';
import { compare } from 'bcrypt';
import { Token } from '../database/models/token';
import { ListItemRequest } from '../Validators/commonValidator';

export class UserUseCase {
    constructor(private readonly db:DataSource) {}

    async isUserAdmin(userid:number): Promise<boolean>{
        const user = await this.getUserById(userid)
        if (!user) {
            return false
        }
        return user.role === 'ADMIN'
    }

    async isUserSuperAdmin(userid:number): Promise<boolean>{
        const user = await this.getUserById(userid)
        if (!user) {
            return false
        }
        return user.role === 'SUPER_ADMIN'
    }

    async listUsers(filter: ListItemRequest): Promise<{ users: User[]; totalCount: number; }> {
    const query = this.db.createQueryBuilder(User, 'user')
        .where("user.active = :active", { active: true }); // Ajoutez cette condition pour filtrer les utilisateurs inactifs
    if (filter.limit) {
        query.limit(filter.limit);
        if (filter.page) {
            query.offset((filter.page - 1) * filter.limit);
        }
    }
    const [users, totalCount] = await query.getManyAndCount();
    return { users, totalCount };
}

    async createUser(email:string,hashedPassword:string): Promise<User>{
        const userRepository = db.getRepository(User)
        return await userRepository.save({
            email: email,
            password: hashedPassword,
            lastname: "jo",
            firstname: "jo",
        });
    }
    async validateToken(token:string): Promise<User | null>{
        const tokenRepository = db.getRepository(Token);
        const tokenEntity = await tokenRepository.findOne({
            where: {
                token: token
            },
            relations: ["user"] 
        });
        return tokenEntity ? tokenEntity.user : null;

    }

    async logUser(email:string,password:string): Promise<User | null>{
        const userRepository = db.getRepository(User)
        const user = await userRepository.findOneBy({ email: email });
        if (!user) {
            return null;
        }
        const isValid = await compare(password, user.password);
        if (!isValid) {
            return null
        }
        return user;
    }

    async getUserById(id:number): Promise<User|null>{
        const repo = this.db.getRepository(User)
        return await repo.findOneBy({ id })
    }
    async getrUserByToken(token:string): Promise<User|null>{
        const tokenRepo = this.db.getRepository(Token)
        const tokenFound = await tokenRepo.findOneBy({ token })
        if (!tokenFound) {
            return null
        }
        return tokenFound.user
    }
    async updateUser({email,password,role}: UpdateUserRequest,userid:number): Promise<User| null>{
        const repo = this.db.getRepository(User)
        const userFound = await repo.findOneBy({ id:userid })
        if (!userFound) {
            return null
        }
        if (email){
            userFound.email = email
        }
        if (password){
            userFound.password = password
        }
        if (role){
            userFound.role = role
        }
        const updatedUser = await repo.save(userFound)
        return updatedUser
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
