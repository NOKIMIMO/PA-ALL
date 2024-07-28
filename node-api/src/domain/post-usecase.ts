import { DataSource } from "typeorm";
import { JwtPayload } from "jsonwebtoken";
import { ListItemRequest } from "../Validators/commonValidator";
import { Post } from "../database/models/post";
import { CreatePostValidationRequest, SelectPostRequest, UpdatePostRequest } from "../Validators/postValidator";
import { User } from "../database/models/user";
import { user_access_type } from "../common/enum/access-type";
import { UserUseCase } from "./user-usecase";
import {CustomError} from "../common/error/customError";


export class PostUseCase {
    constructor(private readonly db:DataSource) {}

    async listPosts(filter:ListItemRequest): Promise<{ posts: (Post & {commentCount:number})[]; totalCount: number; }>{
        const query = this.db.createQueryBuilder(Post, 'post')
        .leftJoinAndSelect('post.comments','comment')
        .select([
            'post.id as id',
            'post.title as title',
            'post.content as content',
            'post.createdAt as createdAt',
            'post.updatedAt as updatedAt',
            'post.data_access_type as data_access_type',
            'COUNT(comment.id) as commentCount'
        ])
        .groupBy('post.id');
        if(filter.limit){
            query.limit(filter.limit)
            if(filter.page){
                query.offset((filter.page-1) * filter.limit)
            }
        }
        const posts = await query.getRawMany()
        const totalCount = await query.getCount()
        //get comment for each post
        return {posts,totalCount}
    }
    async createPost(data: CreatePostValidationRequest,userid:number): Promise<Post> {
        const postRepository = this.db.getRepository(Post);
        const newPost = postRepository.create({...data,user :{id:userid}});
        return await postRepository.save(newPost);
    }

    async getPostById(data:SelectPostRequest): Promise<Post|null>{
        const repo = this.db.getRepository(Post)
        return await repo.findOneBy({ id : data.postId})
    }

    async updatePost(data:UpdatePostRequest, userid:number): Promise<Post | null>{
        const repo = this.db.getRepository(Post)
        const PostFind = await repo.findOneBy({id:data.postId})
        if (!PostFind) {
            return null
        }
        /*if (PostFind.userId !== userid){
            const userUseCase = new UserUseCase(this.db)
            if (!userUseCase.isUserSuperAdmin(userid) || !userUseCase.isUserAdmin(userid)) {
                throw new CustomError( 401,'Unauthorized',)
            }
        }*/
        if (data.title){
            PostFind.title = data.title
        }
        if (data.content){
            PostFind.content = data.content
        }
        if (data.data_access_type){
            PostFind.data_access_type = data.data_access_type
        }
        const updatedPost = await repo.save(PostFind)
        return updatedPost
    }
    async deletePost(id:number,userid:number): Promise<void>{
        const repo = this.db.getRepository(Post)
        const post = await repo.findOneBy({id})
        if (!post) {
            throw new Error('Post not found')
        }
        /*
        if (post.userId !== userid){
            const userUseCase = new UserUseCase(this.db)
            if (!userUseCase.isUserSuperAdmin(userid) || !userUseCase.isUserAdmin(userid)) {
                throw new CustomError( 401,'Unauthorized',)
            }
        }*/
        //delete post
        await repo.delete({id})
    }
}