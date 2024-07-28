import * as Joi from "joi";

export const listItemValidation = Joi.object({
    limit: Joi.number().optional(),
    page: Joi.number().optional()
})

export interface ListItemRequest{
    limit?: number
    page?: number
}
