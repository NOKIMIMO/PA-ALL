import * as Joi from 'joi';

export interface CreateVoteValidationRequest {
    title: string;
    description: string;
    options: {
        name: string;
    }[];
    endDate: Date;
    secondRoundEnabled: boolean;
}

export const createVoteValidation = Joi.object<CreateVoteValidationRequest>({
    title: Joi.string().required(),
    description: Joi.string().required(),
    endDate: Joi.date().required(),
    secondRoundEnabled: Joi.boolean().required(),
    options: Joi.array().items(Joi.object({
        name: Joi.string().required()
    })).min(2).required()
});

export interface ListVotesRequest {
    page?: number;
    limit?: number;
    start_date?: Date;
    end_date?: Date;
}

export const listVotesValidation = Joi.object<ListVotesRequest>({
    page: Joi.number().optional(),
    limit: Joi.number().optional(),
    start_date: Joi.date().iso().optional(),
    end_date: Joi.date().iso().optional()
});

export interface SelectVoteRequest {
    voteId: number;
}

export const selectVoteValidation = Joi.object<SelectVoteRequest>({
    voteId: Joi.number().required()
});

export interface VoteForOptionRequest {
    voteId: number;
    optionId: number;
}

export const voteForOptionValidation = Joi.object<VoteForOptionRequest>({
    voteId: Joi.number().required(),
    optionId: Joi.number().required()
});

export interface VoteResponse {
    id: number;
    title: string;
    description: string;
    endDate: Date;
    secondRoundEnabled: boolean;
    options: {
        id: number;
        name: string;
        voteCount: number;
    }[];
}