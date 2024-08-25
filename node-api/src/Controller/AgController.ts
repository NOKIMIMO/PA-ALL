import { Request, response, Response, Router } from 'express';
import { listItemValidation, selectItemValidation } from '../Validators/commonValidator';
import { db } from '../database/db';
import { authMiddleware } from '../common/middleware/auth-middleware';
import { validatorMiddleware } from '../common/middleware/validator-middleware';
import { JwtPayload } from 'jsonwebtoken';
import AgUseCase from '../domain/ag-usecase';
import { addUsersToAgValidation, createAgValidation, selectAgValidation, updateAgValidation } from '../Validators/agValidator';
import { CustomError } from '../common/error/customError';

const router = Router();
router.post('/',
    authMiddleware,
    validatorMiddleware(createAgValidation, 'body'),
    async (req: Request & { user?: JwtPayload }, res: Response): Promise<void> => {
        const createAgRequest = req.body;
        try {
            const AgUsecase = new AgUseCase(db);
            const ag = await AgUsecase.createAg({ ...createAgRequest }, req.user?.userId!);
            res.status(201);
            res.json({ ag : ag });
        } catch (error) {
            if (error instanceof CustomError) {
                res.status(error.code).send({ error: error.message });
            } else {
                res.status(500);
                res.json({ error: 'Internal error' });
            }
        }
    })
router.get('/',
    authMiddleware,
    validatorMiddleware(listItemValidation, 'body'),
    async (req: Request, res: Response): Promise<void> => {
        const listItemRequest = req.body;
        try {
            const AgUsecase = new AgUseCase(db);
            const listAgs = await AgUsecase.listAgs({ ...listItemRequest });
            res.status(200);
            res.json(listAgs);
        }
        catch (error) {
            if (error instanceof CustomError) {
                res.status(error.code).send({ error: error.message });
            } else {
                res.status(500);
                res.json({ error: 'Internal error' });
            }
        }
    })
router.get('/managed',
    authMiddleware,
    validatorMiddleware(listItemValidation, 'body'),
    async (req: Request & { user?: JwtPayload }, res: Response): Promise<void> => {
        const listItemRequest = req.body;
        try {
            const AgUsecase = new AgUseCase(db);
            const listAgs = await AgUsecase.listAgsOfUser({ ...listItemRequest }, req.user?.userId!);
            res.status(200);
            res.json({data : listAgs});
        }
        catch (error) {
            if (error instanceof CustomError) {
                res.status(error.code).send({ error: error.message });
            } else {
                res.status(500);
                res.json({ error: 'Internal error' });
            }
        }
    })
router.get('/user/:itemId/managed',
    authMiddleware,
    validatorMiddleware(listItemValidation, 'body'),
    validatorMiddleware(selectItemValidation, 'params'),
    async (req: Request & { user?: JwtPayload }, res: Response): Promise<void> => {
        const listItemRequest = req.body;
        const userId = parseInt(req.params.itemId);
        try {
            const AgUsecase = new AgUseCase(db);
            const listAgs = await AgUsecase.listAgsOfUser({ ...listItemRequest }, userId);
            res.status(200);
            res.json({data : listAgs});
        }
        catch (error) {
            if (error instanceof CustomError) {
                res.status(error.code).send({ error: error.message });
            } else {
                res.status(500);
                res.json({ error: 'Internal error' });
            }
        }
    })

// task realted to ag
router.get('/user/:itemId/assigned',
    authMiddleware,
    validatorMiddleware(selectItemValidation, 'params'),
    async (req: Request & { user?: JwtPayload }, res: Response): Promise<void> => {
        const userId = parseInt(req.params.itemId);
        try {
            const AgUsecase = new AgUseCase(db);
            const listAgs = await AgUsecase.listAgsWhereTaskAssigned(userId);
            res.status(200);
            res.json({data : listAgs});
        }
        catch (error) {
            if (error instanceof CustomError) {
                res.status(error.code).send({ error: error.message });
            } else {
                res.status(500);
                res.json({ error: 'Internal error' });
            }
        }
    })
router.get('/self/assigned',
    authMiddleware,
    async (req: Request & { user?: JwtPayload }, res: Response): Promise<void> => {
        const userId = parseInt(req.params.itemId);
        try {
            const AgUsecase = new AgUseCase(db);
            const listAgs = await AgUsecase.listAgsWhereTaskAssigned(req.user?.userId!);
            res.status(200);
            res.json({data : listAgs});
        }
        catch (error) {
            if (error instanceof CustomError) {
                res.status(error.code).send({ error: error.message });
            } else {
                res.status(500);
                res.json({ error: 'Internal error' });
            }
        }
    })

router.get('/joined',
    authMiddleware,
    async (req: Request & { user?: JwtPayload }, res: Response): Promise<void> => {
        try {
            const agUsecase = new AgUseCase(db);
            const ag = await agUsecase.listAgsWhereUserJoined(req.user?.userId!);
            res.status(200);
            res.json({message :ag});
        }
        catch (error) {
            if (error instanceof CustomError) {
                res.status(error.code).send({ error: error.message });
            } else {
                res.status(500);
                res.json({ error: 'Internal error' });
            }
        }
    })


router.get('/:agId',
    authMiddleware,
    validatorMiddleware(selectAgValidation, 'params'),
    async (req: Request, res: Response): Promise<void> => {
        const agId = parseInt(req.params.agId);
        try {
            const agUsecase = new AgUseCase(db);
            const ag = await agUsecase.getAgById(agId);
            res.status(200);
            res.json({message :ag});
        } catch (error) {
            if (error instanceof CustomError) {
                res.status(error.code).send({ error: error.message });
            } else {
                res.status(500);
                res.json({ error: 'Internal error' });
            }
        }
    })

router.delete('/:agId',
    authMiddleware,
    validatorMiddleware(selectAgValidation, 'body'),
    async (req: Request & { user?: JwtPayload }, res: Response): Promise<void> => {
        const agId = parseInt(req.params.agId);
        try {
            const agUsecase = new AgUseCase(db);
            const ag = await agUsecase.deleteAg(agId, req.user?.userId!);
            res.status(200);
            res.json({message :ag});
        }
        catch (error) {
            if (error instanceof CustomError) {
                res.status(error.code).send({ error: error.message });
            } else {
                res.status(500);
                res.json({ error: 'Internal error' });
            }
        }
    })

router.patch('/:agId',
    authMiddleware,
    validatorMiddleware(selectAgValidation, 'params'),
    validatorMiddleware(updateAgValidation, 'body'),
    async (req: Request & { user?: JwtPayload }, res: Response): Promise<void> => {
        const agId = parseInt(req.params.agId);
        const updateAgRequest = req.body;
        try {
            const agUsecase = new AgUseCase(db);
            const ag = await agUsecase.updateAg({ ...updateAgRequest }, agId, req.user?.userId!);
            res.status(200);
            res.json({message :ag});
        }
        catch (error) {
            if (error instanceof CustomError) {
                res.status(error.code).send({ error: error.message });
            } else {
                res.status(500);
                res.json({ error: 'Internal error' });
            }
        }
    })

router.get('/:agId/manager',
    authMiddleware,
    validatorMiddleware(selectAgValidation, 'params'),
    async (req: Request, res: Response): Promise<void> => {
        const agId = parseInt(req.params.agId);
        try {
            const agUsecase = new AgUseCase(db);
            const ag = await agUsecase.getAgMannager(agId);
            res.status(200);
            res.json({message :ag});
        } catch (error) {
            if (error instanceof CustomError) {
                res.status(error.code).send({ error: error.message });
            } else {
                res.status(500);
                res.json({ error: 'Internal error' });
            }
        }
    })


router.post('/:agId/answer',
    authMiddleware,
    validatorMiddleware(selectAgValidation, 'params'),
    //validatorMiddleware(answerAgValidation, 'body'),
    async (req: Request & { user?: JwtPayload }, res: Response): Promise<void> => {
        const agId = parseInt(req.params.agId);
        try {
            const agUsecase = new AgUseCase(db);
            const ag = await agUsecase.answerAg(agId, req.user?.userId!);
            res.status(200);
            res.json({message :ag});
        }
        catch (error) {
            if (error instanceof CustomError) {
                res.status(error.code).send({ error: error.message });
            } else {
                res.status(500);
                res.json({ error: 'Internal error' });
            }
        }
    })


router.get('/:agId/join',
    authMiddleware,
    validatorMiddleware(selectAgValidation, 'params'),
    async (req: Request & { user?: JwtPayload }, res: Response): Promise<void> => {
        const agId = parseInt(req.params.agId);
        try {
            const agUsecase = new AgUseCase(db);
            const ag = await agUsecase.addUserToAg(agId, [req.user?.userId!]);
            res.status(200);
            res.json({message :ag});
        }
        catch (error) {
            if (error instanceof CustomError) {
                res.status(error.code).send({ error: error.message });
            } else {
                res.status(500);
                res.json({ error: 'Internal error' });
            }
        }
    }
)

router.post('/:agId/add',
    authMiddleware,
    validatorMiddleware(selectAgValidation, 'params'),
    validatorMiddleware(addUsersToAgValidation, 'body'),
    async (req: Request, res: Response): Promise<void> => {
        const agId = parseInt(req.params.agId);
        const userIds = req.body;
        try {
            const agUsecase = new AgUseCase(db);
            const ag = await agUsecase.addUserToAg(agId, userIds);
            res.status(200);
            res.json({message :ag});
        }
        catch (error) {
            if (error instanceof CustomError) {
                res.status(error.code).send({ error: error.message });
            } else {
                res.status(500);
                res.json({ error: 'Internal error' });
            }
        }
    }
)

router.get('/:agId/leave',
    authMiddleware,
    validatorMiddleware(selectAgValidation, 'params'),
    async (req: Request & { user?: JwtPayload }, res: Response): Promise<void> => {
        const agId = parseInt(req.params.agId);
        try {
            const agUsecase = new AgUseCase(db);
            const ag = await agUsecase.removeUserToAg(agId, [req.user?.userId!]);
            res.status(200);
            res.json({message :ag});
        }
        catch (error) {
            if (error instanceof CustomError) {
                res.status(error.code).send({ error: error.message });
            } else {
                res.status(500);
                res.json({ error: 'Internal error' });
            }
        }
    }
)
router.post('/:agId/remove',
    authMiddleware,
    validatorMiddleware(selectAgValidation, 'params'),
    validatorMiddleware(addUsersToAgValidation, 'body'),
    async (req: Request & { user?: JwtPayload }, res: Response): Promise<void> => {
        const agId = parseInt(req.params.agId);
        const userIds = req.body;
        try {
            const agUsecase = new AgUseCase(db);
            const ag = await agUsecase.removeUserToAg(agId, userIds);
            res.status(200);
            res.json({message :ag});
        }
        catch (error) {
            if (error instanceof CustomError) {
                res.status(error.code).send({ error: error.message });
            } else {
                res.status(500);
                res.json({ error: 'Internal error' });
            }
        }
    }
)

export default router;