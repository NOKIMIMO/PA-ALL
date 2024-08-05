import * as Joi from "joi";
import { Event } from "../database/models/event";

export interface ListEventResponse {
    event: Event[]
    total: number
}

export interface selectEventRequest  {
    eventId: number
}

export const selectEventValidation = Joi.object<selectEventRequest>({
    eventId: Joi.number().required()
})

export interface createEventValidationRequest  {
    title: string
    description: string
    data_access_type?: string
    event_date: Date // format date with time zone (%yyyy-%mm-%dd-T%HH:%MM:%SS.000Z%)
    location: string //format {rue}, {ville}, {code_postal}
    usersId?: number[]
}

export const createEventValidation = Joi.object<createEventValidationRequest>({
    title: Joi.string().required(),
    description: Joi.string().required(),
    data_access_type: Joi.string().optional(),
    event_date: Joi.date().required(),
    location: Joi.string().required(),
    usersId: Joi.array().items(Joi.number()).optional(),

}).options({ abortEarly: false });

export interface updateEventRequest{
    eventId: number
    title?: string
    description?: string
    data_access_type?: string
    event_date?: Date
    location?: string
}

export const updateEventValidation = Joi.object<updateEventRequest>({
    eventId: Joi.number().required(),
    title: Joi.string().optional(),
    description: Joi.string().optional(),
    data_access_type: Joi.string().optional(),
    event_date: Joi.date().optional(),
    location: Joi.string().optional()
})

export interface deleteEventRequest{
    eventId: number
}

export const deleteEventValidation = Joi.object<deleteEventRequest>({
    eventId: Joi.number().required()
})

export interface addUsersToEventRequest{
    usersId: number[]
}
export const addUsersToEventValidation = Joi.object<addUsersToEventRequest>({
    usersId: Joi.array().items(Joi.number()).required()
})


export interface selectEventByUserRequest  {
    userId: number
}

export const selectEventByUserValidation = Joi.object<selectEventByUserRequest>({
    userId: Joi.number().required()
})

export const addEventMannagerValidation = Joi.object<addEventMannagerRequest>({
    usersId: Joi.array().items(Joi.number()).required()
})

export interface addEventMannagerRequest{
    usersId: number[]
}

export const removeEventMannagerValidation = Joi.object<removeEventMannagerRequest>({
    usersId: Joi.array().items(Joi.number()).required()
})

export interface removeEventMannagerRequest{
    usersId: number[]
}