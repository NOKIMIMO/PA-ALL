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
        validatorMiddleware(createAgValidation,'body'),
        async (req: Request & { user?: JwtPayload }, res: Response): Promise<void> =>{
            const createAgRequest = req.body;
            try {
                const agUseCase = new AgUseCase(db);
                const ag = await agUseCase.createAg({...createAgRequest},req.user?.userId!);
                res.status(201);
                res.json({ag});
            } catch (error) {
                console.log(error);
                res.status(500);
                res.json({ error: 'Internal error' });
            }
        })
router.get('/',
    authMiddleware,
    validatorMiddleware(listItemValidation,'body'),
    async (req: Request, res: Response): Promise<void> =>{
        const listItemRequest = req.body;
        try {
            const agUseCase = new AgUseCase(db);
            const listAgs = await agUseCase.listAgs({ ...listItemRequest});
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
    validatorMiddleware(selectAgValidation,'params'),
    async (req: Request, res: Response): Promise<void> =>{
        const selectAgRequest = req.params;
        const { agId } = selectAgRequest;
        try {
            const agUseCase = new AgUseCase(db);
            const ag = await agUseCase.getAgById({agId:parseInt(agId)});
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
    validatorMiddleware(updateAgValidation,'body'),
    validatorMiddleware(selectAgValidation,'params'),
    async (req: Request, res: Response): Promise<void> =>{
        const updateAgRequest = req.body;
        const selectAgRequest = req.params;
        const { agId } = selectAgRequest;
        try {
            const agUseCase = new AgUseCase(db);
            const ag = await agUseCase.updateAg({...updateAgRequest},parseInt(agId));
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
    validatorMiddleware(selectAgValidation,'params'),
    async (req: Request, res: Response): Promise<void> =>{
        const selectAgRequest = req.params;
        const { agId } = selectAgRequest;
        try {
            const agUseCase = new AgUseCase(db);
            await agUseCase.deleteAg(parseInt(agId));
            res.status(200);
            res.json({message:'Ag deleted successfully'});
        }
        catch (error) {
            console.log(error);
            res.status(500);
            res.json({ error: 'Internal error' });
        }
    })

export default router;
















