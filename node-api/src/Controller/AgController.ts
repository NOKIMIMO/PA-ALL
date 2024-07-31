import {Request,response,Response,Router}  from 'express';
import {listItemValidation} from '../Validators/commonValidator';
import { db } from '../database/db';
import { authMiddleware } from '../common/middleware/auth-middleware';
import { validatorMiddleware } from '../common/middleware/validator-middleware';
import { JwtPayload } from 'jsonwebtoken';
import AgUseCase from '../domain/ag-usecase';
import { createAgValidation, selectAgValidation, updateAgValidation } from '../Validators/agValidator';

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
            res.json({ ag });
        } catch (error) {
            console.log(error);
            res.status(500);
            res.json({ error: 'Internal error' });
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
            console.log(error);
            res.status(500);
            res.json({ error: 'Internal error' });
        }
    })

    router.get('/:agId',
    authMiddleware,
    validatorMiddleware(selectAgValidation, 'body'),
    async (req: Request, res: Response): Promise<void> => {
        const agId = parseInt(req.params.agId);
        try {
            const agUsecase = new AgUseCase(db);
            const ag = await agUsecase.getAgById(agId);
            res.status(200);
            res.json(ag);
        }
        catch (error) {
            console.log(error);
            res.status(500);
            res.json({ error: 'Internal error' });
        }
    })
    
router.delete('/:agId',
    authMiddleware,
    validatorMiddleware(selectAgValidation, 'body'),
    async (req: Request, res: Response): Promise<void> => {
        const agId = parseInt(req.params.agId);
        try {
            const agUsecase = new AgUseCase(db);
            const ag = await agUsecase.deleteAg(agId);
            res.status(200);
            res.json(ag);
        }
        catch (error) {
            console.log(error);
            res.status(500);
            res.json({ error: 'Internal error' });
        }
    })

router.patch('/:agId',
    authMiddleware,
    validatorMiddleware(selectAgValidation, 'params'),
    validatorMiddleware(updateAgValidation, 'body'),
    async (req: Request, res: Response): Promise<void> => {
        const agId = parseInt(req.params.agId);
        const updateAgRequest = req.body;
        try {
            const agUsecase = new AgUseCase(db);
            const ag = await agUsecase.updateAg({ ...updateAgRequest }, agId);
            res.status(200);
            res.json(ag);
        }
        catch (error) {
            console.log(error);
            res.status(500);
            res.json({ error: 'Internal error' });
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
            res.json(ag);
        }
        catch (error) {
            console.log(error);
            res.status(500);
            res.json({ error: 'Internal error' });
        }
    })

export default router;