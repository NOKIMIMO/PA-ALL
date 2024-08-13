import * as Joi from "joi";
import { User } from "../database/models/user";
import { token } from "morgan";
import { user_access_type } from "../common/enum/access-type";


export interface ListUserResponse{
    user: User[]
    total: number
}

export interface SelectUserRequest  {
    id: number
}

export interface UserResponse {
    id: number
    email: string
    role: string
    lastname: string
    firstname: string
    active: boolean
    createdAt: Date
    updatedAt: Date
}

export const selectUserValidation = Joi.object({
    id: Joi.number().required()
})
export interface UpdateUserRequest {
    id: number
    email?: string
    password?: string
    role?: string
}

export interface GiveRoleToUserRequest {
    id: number
    role: string
}

export const updateUserValidation = Joi.object({
    id: Joi.number().required(),
    email: Joi.string().email().optional(),
    password: Joi.string().optional(),
    role: Joi.string().optional()
})

export const giveRoleToUserValidation = Joi.object({
    id: Joi.number().required(),
    role: Joi.string().required()
})

export const createUserValidation = Joi.object<CreateUserValidationRequest>({
    email: Joi.string().email().required(),
    password: Joi.string().min(8).required(),
    firstname: Joi.string().required(),
    lastname: Joi.string().required(),
}).options({ abortEarly: false });

export interface CreateUserValidationRequest  {
    email: string
    password: string
    firstname: string
    lastname: string
}

export const LoginUserValidation = Joi.object<LoginUserValidationRequest>({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
}).options({ abortEarly: false });

export interface LoginUserValidationRequest  {
    email: string
    password: string
}

export const ListUserValidation = Joi.object<ListUserValidationRequest>({
    limit: Joi.number().optional(),
    page: Joi.number().optional(),
    role: Joi.string().valid(...Object.values(user_access_type)).optional()
}).options({ abortEarly: false });

export interface ListUserValidationRequest {
    limit?: number
    page?: number
    role?: user_access_type
}