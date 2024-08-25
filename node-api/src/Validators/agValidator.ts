import * as Joi from "joi";
import { ag_category } from "../common/enum/ag-category";

export const createAgValidation = Joi.object({
    title: Joi.string().required(),
    description: Joi.string().required(),
    ag_date: Joi.date().required(),
    location: Joi.string().required(),
    minimum_participants: Joi.number().required(),
    category: Joi.string().valid(...Object.values(ag_category)).optional()
}).options({ abortEarly: false });

export const selectAgValidation = Joi.object({
    agId: Joi.number().required()
}).options({ abortEarly: false });

export const updateAgValidation = Joi.object({
    title: Joi.string(),
    description: Joi.string(),
    ag_date: Joi.date(),
    location: Joi.string(),
    minimum_participants: Joi.number(),
    category: Joi.string().valid(...Object.values(ag_category)).optional()
}).options({ abortEarly: false });

export interface createAgValidationRequest {
    title: string;
    description: string;
    ag_date: Date;
    location: string;
    minimum_participants: number;
    category? : ag_category;
}

export interface selectedAgRequest {
    agId: number;
}

export interface updateAgValidationRequest {
    title?: string;
    description?: string;
    ag_date?: Date;
    location?: string;
    minimum_participants?: number;
    category? : ag_category;
}

export interface addUsersToAgRequest{
    usersId: number[]
}
export const addUsersToAgValidation = Joi.object<addUsersToAgRequest>({
    usersId: Joi.array().items(Joi.number()).required()
})
