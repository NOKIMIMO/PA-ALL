import { Router, Request, Response } from 'express';
import { db } from '../database/db';
import { VoteUseCase } from '../domain/vote-usecase';
import { validatorMiddleware } from '../common/middleware/validator-middleware';
import { createVoteValidation, selectVoteValidation, voteForOptionValidation } from '../Validators/voteValidator';
import { authMiddleware } from '../common/middleware/auth-middleware';
import { CustomError } from '../common/error/customError';

const router = Router();

router.get('/',
    async (req: Request, res: Response) => {
        const voteUseCase = new VoteUseCase(db);
        try {
            const votes = await voteUseCase.listVotes();
            res.status(200).json(votes);
        } catch (error) {
            console.log(error);
            res.status(500).json({ error: 'Internal error' });
        }
    }
);

router.post('/',
    validatorMiddleware(createVoteValidation, 'body'),
    authMiddleware,
    async (req: Request, res: Response) => {
        const voteUseCase = new VoteUseCase(db);
        const createVoteRequest = req.body;
        try {
            const vote = await voteUseCase.createVote(createVoteRequest);
            res.status(201).json(vote);
        } catch (error) {
            console.log(error);
            res.status(500).json({ error: 'Internal error' });
        }
    }
);

router.get('/:voteId',
    authMiddleware,
    validatorMiddleware(selectVoteValidation, 'params'),
    async (req: any, res: Response) => {
        const { voteId } = req.params;
        const userId = req.user.id; // Suppose que l'ID utilisateur est ajouté à req par authMiddleware
        const voteUseCase = new VoteUseCase(db);
        try {
            const vote = await voteUseCase.getVoteById(parseInt(voteId), userId);
            if (!vote) {
                res.status(404).json({ error: 'Vote not found' });
                return;
            }
            res.status(200).json(vote);
        } catch (error) {
            console.log(error);
            res.status(500).json({ error: 'Internal error' });
        }
    }
);

router.post('/:voteId/option/:optionId',
    authMiddleware,
    validatorMiddleware(voteForOptionValidation, 'params'),
    async (req: any, res: Response) => {
        const { voteId, optionId } = req.params;
        console.log(req.user)
        const userId = req.user.userId; // Suppose que l'ID utilisateur est ajouté à req par authMiddleware
        const voteUseCase = new VoteUseCase(db);
        try {
            await voteUseCase.voteForOption(parseInt(voteId), parseInt(optionId), userId);
            res.status(200).json({ message: 'Vote recorded' });
        } catch (error) {
            if (error instanceof CustomError) {
                res.status(error.code).json({ error: error.message });
            } else {
                res.status(500).json({ error: 'Internal error' });
            }
        }
    }
);

router.get('/:voteId/statistics',
    validatorMiddleware(selectVoteValidation, 'params'),
    async (req: Request, res: Response) => {
        const { voteId } = req.params;
        const voteUseCase = new VoteUseCase(db);
        try {
            const statistics = await voteUseCase.getVoteStatistics(parseInt(voteId));
            res.status(200).json(statistics);
        } catch (error) {
            console.log(error);
            res.status(500).json({ error: 'Internal error' });
        }
    }
);

router.put('/:voteId',
    authMiddleware,
    validatorMiddleware(createVoteValidation, 'body'),
    async (req: any, res: Response) => {
        const { voteId } = req.params;
        const updateVoteRequest = req.body;
        const voteUseCase = new VoteUseCase(db);
        try {
            const updatedVote = await voteUseCase.updateVote(parseInt(voteId), updateVoteRequest);
            res.status(200).json(updatedVote);
        } catch (error) {
            console.log(error);
            if (error instanceof CustomError) {
                res.status(error.code).json({ error: error.message });
            } else {
                res.status(500).json({ error: 'Internal error' });
            }
        }
    }
);
router.delete('/:voteId',
    authMiddleware,
    validatorMiddleware(selectVoteValidation, 'params'),
    async (req: Request, res: Response) => {
        const { voteId } = req.params;
        const voteUseCase = new VoteUseCase(db);
        try {
            await voteUseCase.deleteVoteById(parseInt(voteId));
            res.status(204).send(); // No content
        } catch (error) {
            console.log(error);
            if (error instanceof CustomError) {
                res.status(error.code).json({ error: error.message });
            } else {
                res.status(500).json({ error: 'Internal error' });
            }
        }
    }
);



export default router;
