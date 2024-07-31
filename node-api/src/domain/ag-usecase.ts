import { DataSource, In } from "typeorm";
import { Ag } from "../database/models/ag";
import { JwtPayload } from "jsonwebtoken";
import { ListItemRequest } from "../Validators/commonValidator";
import { createEventValidationRequest, selectEventRequest, updateEventRequest } from "../Validators/eventValidator";
import { User } from "../database/models/user";
import { user_access_type } from "../common/enum/access-type";
import { createAgValidationRequest, selectedAgRequest } from "../Validators/agValidator";
import { CustomError } from "../common/error/customError";


export default class AgUseCase{
    
        constructor(private readonly db:DataSource) {}
    
        async listAgs(filter:ListItemRequest): Promise<{ ags: Ag[]; totalCount: number; }>{
            const query = this.db.createQueryBuilder(Ag, 'ag')
            if(filter.limit){
                query.limit(filter.limit)
                if(filter.page){
                    query.offset((filter.page-1) * filter.limit)
                }
            }
            const [ags, totalCount] = await query.getManyAndCount()
            return {ags,totalCount}
        }
        async answerAg(agId:number,userId:number): Promise<any>{
            return {message : 'TBD'}
        }
    
    
        async createAg(data: createAgValidationRequest,userid:number): Promise<Ag> {
            const agRepository = this.db.getRepository(Ag);
            const newAg = agRepository.create({...data})
            return await agRepository.save(newAg);

        }
        async getAgById(id:number): Promise<Ag|null>{
            const repo = this.db.getRepository(Ag)
            const ag = await repo.findOneBy({ id })
            if (!ag) {
                throw new CustomError(404, 'Ag not found')
            }
            return ag
        }

        async updateAg(data:createAgValidationRequest, agId:number): Promise<Ag | null>{
            const repo = this.db.getRepository(Ag)
            const agFind = await repo.findOneBy({id: agId})
            if (!agFind) {
                throw new CustomError(404, 'Ag not found')
            }
            if(data.title){
                agFind.title = data.title
            }

            if(data.description){
                agFind.description = data.description
            }

            if(data.ag_date){
                agFind.ag_date = data.ag_date
            }

            if(data.location){
                agFind.location = data.location
            }

            if(data.minimum_participants){
                agFind.minimum_participants = data.minimum_participants
            }

            return await repo.save(agFind)
        }

        async deleteAg(agId:number): Promise<boolean>{
            const repo = this.db.getRepository(Ag)
            const ag = await repo.findOneBy({id: agId})
            if (!ag) {
                throw new CustomError(404, 'Ag not found')
            }
            await repo.remove(ag)
            return true
        }
    
}