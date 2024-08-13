import * as Joi from "joi";
import { user_access_type } from "../common/enum/access-type";

export const createBanTicketValidation = Joi.object({
    user_id: Joi.number().required(),
    message: Joi.string().required(),
    reason: Joi.string().required(),
    end_date: Joi.date().required()
}).options({ abortEarly: false });

export const listBanTicketValidation = Joi.object({
    user_id: Joi.number().required()
}).options({ abortEarly: false });

export interface CreateBanTicketRequest {
    user_id: number;
    message: string;
    reason: string;
    end_date: Date;
}

export interface ListBanTicketRequest {
    user_id: number;
}

export interface banTicketListReponse {
    id: number;
    Message: string;
    reason: string;
    active: boolean;
    end_date: Date;
    user_id: number;
    moderator_id: number;
    user: {
        id: number;
        email: string;
        role: string;
        active: boolean;
        createdAt: Date;
    };
    moderator: {
        id: number;
        email: string;
        role: string;
        active: boolean;
        createdAt: Date;
    };
}