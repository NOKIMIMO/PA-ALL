import { Comment } from './../database/models/comment';
import * as Joi from "joi";

export const createCommentValidation = Joi.object({
    content: Joi.string().required(),
    parentId: Joi.number().optional()
}).options({ abortEarly: false });

export interface CreateCommentRequest  {
    content: string
    postId?: number
    parentId?: number
}

export interface ListCommentResponse{
    comments: Comment[]
    total: number
}
export interface ListCommentRequest{
    postId?: number
    parentId?: number
    limit?: number
    page?: number
}

export interface SelectCommentRequest{
    postId: number
    parentId: number
}

export const selectCommentValidation = Joi.object({
    parentId: Joi.number().required(),
    postId: Joi.number().required()
})

export const ListCommentValidation = Joi.object({
    parentId: Joi.number().optional(),
    limit: Joi.number().optional(),
    page: Joi.number().optional()
})

export interface updateCommentRequest{
    parentId: number
    content: string
}

export const updateCommentValidation = Joi.object<updateCommentRequest>({
    parentId: Joi.number().required(),
    content: Joi.string().required()
})

export interface deleteCommentRequest{
    parentId: number
    postId: number
}

export const deleteCommentValidation = Joi.object<deleteCommentRequest>({
    parentId: Joi.number().required(),
    postId: Joi.number().required()
})
