import * as Joi from "joi";
import { Post } from "../database/models/post";

export interface ListPostResponse{
    post: Post[]
    total: number
}

export interface SelectPostRequest {
    postId: number
}

export const selectPostValidation = Joi.object<SelectPostRequest>({
    postId: Joi.number().required()
})

export interface CreatePostValidationRequest {
    title: string
    content: string
    data_access_type?: string
}

export const createPostValidation = Joi.object<CreatePostValidationRequest>({
    title: Joi.string().required(),
    content: Joi.string().required(),
    data_access_type: Joi.string().optional(),
}).options({ abortEarly: false });

export interface UpdatePostRequest{
    postId: number
    title?: string
    content?: string
    data_access_type?: string
}

export const updatePostValidation = Joi.object<UpdatePostRequest>({
    postId: Joi.number().required(),
    title: Joi.string().optional(),
    content: Joi.string().optional(),
    data_access_type: Joi.string().optional()
})

export interface DeletePostRequest{
    postId: number
}

export const deletePostValidation = Joi.object<DeletePostRequest>({
    postId: Joi.number().required()
})

