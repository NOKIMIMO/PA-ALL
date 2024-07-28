import * as Joi from "joi";

export interface CreateUserFileRequest {
    pretty : boolean
}

export const createUserFileValidation = Joi.object({
    pretty: Joi.boolean().optional()
})