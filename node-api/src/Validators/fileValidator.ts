import * as Joi from "joi";

export const createFileValidation = Joi.object({
    name: Joi.string().required(),
    type: Joi.string().required(),
    readOnly: Joi.boolean().optional(),
    parentId: Joi.number().optional(),
    encrypted: Joi.boolean().optional(),
    masterPassword: Joi.string().optional(),
})

export interface CreateFileRequest {
    name: string
    type: string
    readOnly?: boolean
    parentId?: number
    size: number
    mimetype: string
    path: string
    filename: string
    encrypted?: boolean
    masterPassword?: string
}

export const updateFileValidation = Joi.object({
    name: Joi.string().optional(),
    type: Joi.string().optional(),
    readOnly: Joi.boolean().optional(),
    parentId: Joi.number().optional()
})

export interface UpdateFileRequest {
    name?: string
    type?: string
    readOnly?: boolean
    parentId?: number
    size?: number
    mimetype?: string
    path?: string
    filename?: string
}

export const downloadFileValidation = Joi.object({
    masterPassword: Joi.string().optional()
})

export interface DownloadFileRequest {
    masterPassword?: string
}