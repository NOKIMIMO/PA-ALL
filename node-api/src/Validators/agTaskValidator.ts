import * as Joi from "joi";

export const agTaskCreateValidation = Joi.object({
    title: Joi.string().required(),
    description: Joi.string().required(),
    dueDate: Joi.date().required(),
    priority: Joi.number().optional(),
    agId: Joi.number().required(),
    userId: Joi.number().optional()
}).options({ abortEarly: false });

export interface AgTaskCreateRequest {
    title: string
    description: string
    dueDate: Date
    priority?: number
    agId: number
    userId?: number
}

export const agTaskUpdateValidation = Joi.object({
    title: Joi.string().optional(),
    description: Joi.string().optional(),
    dueDate: Joi.date().optional(),
    priority: Joi.number().optional(),
    userId: Joi.number().optional()
}).options({ abortEarly: false });

export  interface AgTaskUpdateRequest {
    title?: string
    description?: string
    dueDate?: Date
    priority?: number
    userId?: number
}

export const agTaskSelectOneValidation = Joi.object({
    taskId: Joi.number().required()
})

export interface agTaskSelectOneRequest {
    taskId: number
}

export const agTaskSelectMultipleValidation = Joi.object({
    tasksId : Joi.array().items(Joi.number()).required()
})

export interface AgTaskSelectMultipleRequest {
    tasksId: number[]
}

export const agTaskAssignValidation = Joi.object({
    taskId: Joi.number().required(),
    userId: Joi.number().required()
})

export const agTaskAssignMultipleValidation = Joi.object({
    //taskid in param and userid in body
    userIds: Joi.array().items(Joi.number()).required()
})

export interface AgTaskAssignRequest {
    taskId: number
    userId: number
}
