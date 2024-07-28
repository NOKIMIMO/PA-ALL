import * as Joi from "joi";

export interface CreateContactRequest {
    name: string;
    email: string;
    message: string;
}

export const createContactValidation = Joi.object<CreateContactRequest>({
    name: Joi.string().required(),
    email: Joi.string().email().required(),
    message: Joi.string().required(),
}).options({ abortEarly: false });
