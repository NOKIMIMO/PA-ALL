import * as Joi from "joi";
import { User } from "../database/models/user";
import { token } from "morgan";


export interface ListUserResponse{
    user: User[]
    total: number
}

export interface SelectUserRequest  {
    id: number
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
