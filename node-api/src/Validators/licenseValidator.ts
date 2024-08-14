
import * as Joi from "joi";

export const createLicenseValidation = Joi.object({
    stripe_id: Joi.string().required()
})

export interface CreateLicenseRequest {
    stripe_id: string
}