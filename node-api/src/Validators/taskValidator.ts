import * as Joi from "joi";

export const taskCreateValidation = Joi.object({
    title: Joi.string().required(),
    description: Joi.string().required(),
    dueDate: Joi.date().required(),
    priority: Joi.number().optional(),
    eventId: Joi.number().required(),
    userId: Joi.number().optional()
}).options({ abortEarly: false });

export interface TaskCreateRequest {
    title: string
    description: string
    dueDate: Date
    priority: number
    eventId: number
    userId?: number
}

export const taskUpdateValidation = Joi.object({
    title: Joi.string().optional(),
    description: Joi.string().optional(),
    dueDate: Joi.date().optional(),
    priority: Joi.number().optional(),
    userId: Joi.number().optional()
}).options({ abortEarly: false });

export  interface TaskUpdateRequest {
    title?: string
    description?: string
    dueDate?: Date
    priority?: number
    userId?: number
}

export const taskSelectOneValidation = Joi.object({
    taskId: Joi.number().required()
})

export interface TaskSelectOneRequest {
    taskId: number
}

export const taskSelectMultipleValidation = Joi.object({
    tasksId : Joi.array().items(Joi.number()).required()
})

export interface TaskSelectMultipleRequest {
    tasksId: number[]
}

export const taskAssignValidation = Joi.object({
    taskId: Joi.number().required(),
    userId: Joi.number().required()
})

export const taskAssignMultipleValidation = Joi.object({
    //taskid in param and userid in body
    userIds: Joi.array().items(Joi.number()).required()
})

export interface TaskAssignRequest {
    taskId: number
    userId: number
}
