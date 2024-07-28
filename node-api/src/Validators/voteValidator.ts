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
