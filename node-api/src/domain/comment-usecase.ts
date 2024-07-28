import { Comment } from './../database/models/comment';
import { DataSource } from "typeorm";
import { JwtPayload } from "jsonwebtoken";
import { User } from "../database/models/user";
import { user_access_type } from "../common/enum/access-type";
import { CreateCommentRequest, deleteCommentRequest, ListCommentRequest, updateCommentRequest } from '../Validators/commentValidator';
import { CustomError } from '../common/error/customError';

export class CommentUseCase {
    constructor(private readonly db:DataSource) {}

    async fetchCommentsRecursively(parentId: number): Promise<Comment[]> {
        const query = this.db.createQueryBuilder(Comment, 'comment')
            .where('comment.parentId = :parentId', { parentId });
    
        const comments = await query.getMany();
    
        for (const comment of comments) {
            comment.replies = await this.fetchCommentsRecursively(comment.id);
        }
    
        return comments;
    }
    
    async listCommentsOfPost(filter: ListCommentRequest): Promise<{ comments: Comment[]; totalCount: number; }> {
        // Fetch top-level comments
        const query = this.db.createQueryBuilder(Comment, 'comment')
            .where('comment.postId = :postId', { postId: filter.postId })
            .andWhere('comment.parentId is NULL');
    
        if (filter.limit) {
            query.limit(filter.limit);
            if (filter.page) {
                query.offset((filter.page - 1) * filter.limit);
            }
        }
    
        const [comments, totalCount] = await query.getManyAndCount();
    
        for (const comment of comments) {
            comment.replies = await this.fetchCommentsRecursively(comment.id);
        }
    
        return { comments, totalCount };
    }
    async listCommentsOfComment(filter:ListCommentRequest): Promise<{ comments: Comment & {comments: Comment[]}; totalCount: number; } | CustomError>{
        //uniquement les comment de deuxieme niveau
        const queryParentComment = this.db.createQueryBuilder(Comment, 'comment').where('comment.id = :parentId', {parentId: filter.parentId})

        const parentComment = await queryParentComment.getOne()
        console.log(parentComment)
        if (!parentComment) {
            return new CustomError(404, 'Comment not found');
        }

        const query = this.db.createQueryBuilder(Comment, 'comment').where('comment.parentId = :parentId', {parentId: filter.parentId})
        if(filter.limit){
            query.limit(filter.limit)
            if(filter.page){
                query.offset((filter.page-1) * filter.limit)
            }
        }
        const totalCount = await query.getCount();
        const subComments = await query.getMany();
        // (parentComment as any ).comments = subComments;
        const comments = {...parentComment, comments: subComments}

        return {comments,totalCount}
    }

    async createComment(data: CreateCommentRequest, userid: number): Promise<Comment> {
        const commentRepository = this.db.getRepository(Comment);
        if(data.parentId){
            let parentComment = await commentRepository.findOneBy({id:data.parentId});
            if (!parentComment) {
                throw new Error('Parent comment not found');
            }
            //uniquement une depth de comment
            /*if (parentComment.parentId !== null) {
                throw new Error('Parent comment is not a first level comment');
            }*/ 
            const newComment = commentRepository.create({...data,parent:parentComment, user:{id:userid}});
            return await commentRepository.save(newComment);
        }
        const newComment = commentRepository.create({...data, user:{id:userid}});
        return await commentRepository.save(newComment);
    }


    async updateComment(data: updateCommentRequest, userid:number): Promise<Comment | null>{
        const repo = this.db.getRepository(Comment)
        const commentFind = await repo.findOneBy({id: data.parentId})
        if (!commentFind) {
            return null
        }
        const userRepo = this.db.getRepository(User)
        const user = await userRepo.findOneBy({id: userid})
        if (!user) {
            return null
        }
        if ((commentFind.user.id !== userid) && (user.role !== user_access_type.ADMIN && user.role !== user_access_type.SUPER_ADMIN)) {
            return null
        }
        if (data.content){
            commentFind.content = data.content
        }
        const updatedComment = await repo.save(commentFind)
        return updatedComment
    }
    async deleteComment(data: deleteCommentRequest): Promise<boolean> {
        const repo = this.db.getRepository(Comment);
        const commentFind = await repo.findOne({
            where: { id: data.parentId },
            relations: ['replies']
        });
    
        if (!commentFind) {
            return false;
        }
    
        // Supprimer récursivement tous les sous-commentaires
        await this.deleteReplies(commentFind.replies);
    
        await repo.remove(commentFind);
        return true;
    }
    
    private async deleteReplies(replies: Comment[]): Promise<void> {
        const repo = this.db.getRepository(Comment);
        for (const reply of replies) {
            if (reply.replies && reply.replies.length > 0) {
                await this.deleteReplies(reply.replies);
            }
            await repo.remove(reply);
        }
    }
    
}