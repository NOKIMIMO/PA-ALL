import * as Joi from "joi";

export const createAgValidation = Joi.object({
    title: Joi.string().required(),
    description: Joi.string().required(),
    ag_date: Joi.date().required(),
    location: Joi.string().required(),
    minimum_participants: Joi.number().required()
}).options({ abortEarly: false });

export const selectAgValidation = Joi.object({
    agId: Joi.number().required()
}).options({ abortEarly: false });

export const updateAgValidation = Joi.object({
    agId: Joi.number().required(),
    title: Joi.string(),
    description: Joi.string(),
    ag_date: Joi.date(),
    location: Joi.string(),
    minimum_participants: Joi.number()
}).options({ abortEarly: false });

export interface createAgValidationRequest {
    title: string;
    description: string;
    ag_date: Date;
    location: string;
    minimum_participants: number;
}

export interface selectedAgRequest {
    agId: number;
}

export interface updateAgValidationRequest {
    agId: number;
    title?: string;
    description?: string;
    ag_date?: Date;
    location?: string;
    minimum_participants?: number;
}

