import { Request, Response, Router } from 'express';
import { listItemValidation, selectItemValidation } from '../Validators/commonValidator';
import { generateValidationErrorMessage } from '../common/generate-validation-msg';
import { UserUseCase } from '../domain/user-usecase';
import { db } from '../database/db';
import { authMiddleware } from '../common/middleware/auth-middleware';
import { accessMiddleware } from '../common/middleware/access-middleware';
import { User } from '../database/models/user';
import { BanTicket } from '../database/models/banTicket';
import { user_access_type } from '../common/enum/access-type';
import { validatorMiddleware } from '../common/middleware/validator-middleware';
import { JwtPayload } from 'jsonwebtoken';
import { CustomError } from '../common/error/customError';
import FileRoutes from './UserFileController';
import BanTicketUseCase from '../domain/banTicket-usecase';


const router = Router();
router.get('/',
    validatorMiddleware(listItemValidation, 'body'),
    authMiddleware,
    async (req: Request, res: Response): Promise<void> => {
        const listUserRequest = req.body;
        try {
            const banTicketUseCase = new BanTicketUseCase(db);
            const listUser = await banTicketUseCase.listBanTicketsWithUser({ ...listUserRequest });
            res.status(200);
            res.json(listUser);
        } catch (err) {
            if (err instanceof CustomError) {
                res.status(err.code).send({error: err.message});
            } else {
                res.status(500).send({ error: 'Internal error' });
            }
        }
    })

router.post('/',
    authMiddleware,
    async (req: Request & {user?: JwtPayload}, res: Response): Promise<void> => {
        const createBanTicketRequest = req.body;
        const userId = req.user?.userId;
        try {
            const banTicketUseCase = new BanTicketUseCase(db);
            const banTicket = await banTicketUseCase.banUser({ ...createBanTicketRequest }, userId!);
            res.status(200);
            res.json(banTicket);
        } catch (err) {
            if (err instanceof CustomError) {
                res.status(err.code).send({error: err.message});
            } else {
                res.status(500).send({ error: 'Internal error' });
            }
        }
    })
router.delete('/:itemId',
    validatorMiddleware(selectItemValidation, 'params'),
    authMiddleware,
    async (req: Request, res: Response): Promise<void> => {
        const banTicketId = parseInt(req.params.itemId);
        try {
            const banTicketUseCase = new BanTicketUseCase(db);
            await banTicketUseCase.unbanUser(banTicketId);
            res.status(200);
            res.json({message: 'Ban ticket deleted'});
        } catch (err) {
            if (err instanceof CustomError) {
                res.status(err.code).send({error: err.message});
            } else {
                res.status(500).send({ error: 'Internal error' });
            }
        }
    })

export default router;