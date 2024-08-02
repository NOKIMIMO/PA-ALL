import * as Joi from "joi";

export const listItemValidation = Joi.object({
    limit: Joi.number().optional(),
    page: Joi.number().optional()
})

export interface ListItemRequest{
    limit?: number
    page?: number
}

export const selectItemValidation = Joi.object({
    itemId: Joi.number().required()
})

export interface SelectItemRequest{
    itemId: number
}