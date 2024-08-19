import { Request, Response, Router } from 'express';
import { ListUserValidation, selectUserValidation, updateUserValidation } from '../Validators/userValidator';
import { listItemValidation } from '../Validators/commonValidator';
import { generateValidationErrorMessage } from '../common/generate-validation-msg';
import { UserUseCase } from '../domain/user-usecase';
import { db } from '../database/db';
import { authMiddleware } from '../common/middleware/auth-middleware';
import { accessMiddleware } from '../common/middleware/access-middleware';
import { User } from '../database/models/user';
import { user_access_type } from '../common/enum/access-type';
import { validatorMiddleware } from '../common/middleware/validator-middleware';
import { JwtPayload } from 'jsonwebtoken';
import { CustomError } from '../common/error/customError';
import FileRoutes from './UserFileController';
import BanTicketController from './BanTicketController';


const router = Router();
router.get('/',
    validatorMiddleware(ListUserValidation, 'query'),
    authMiddleware,
    async (req: Request, res: Response): Promise<void> => {
        const listUserRequest = req.query;
        try {
            const UserUsecase = new UserUseCase(db);
            const listUser = await UserUsecase.listUsers({ ...listUserRequest });
            res.status(200);
            res.json(listUser);
        } catch (error) {
            console.log(error);
            res.status(500);
            res.json({ error: 'Internal error' });
        }
    })
router.get('/self',
    authMiddleware,
    async (req: Request & { user?: JwtPayload }, res: Response): Promise<void | CustomError> => {
        try {
            const UserUsecase = new UserUseCase(db);
            const user = await UserUsecase.getUserById(req.user!.userId);
            if (!user) {
                throw new CustomError(404, 'User not found');
            }
            res.status(200);
            res.json({ user});
        } catch (error) {
            console.log(error);
            res.status(500);
            res.json({ error: 'Internal error' });
        }
    })
router.use('/ban', authMiddleware, accessMiddleware(() => [user_access_type.SUPER_ADMIN]), BanTicketController);

router.get('/:id',
    validatorMiddleware(selectUserValidation, 'params'),
    authMiddleware,
    async (req: Request, res: Response): Promise<void> => {
        const getUserRequest = req.params;
        const userId = Number(getUserRequest.id);
        try {
            const UserUsecase = new UserUseCase(db);
            const user = await UserUsecase.getUserById(userId);
            res.status(200);
            res.json(user);
        } catch (error) {
            console.log(error);
            res.status(500);
            res.json({ error: 'Internal error' });
        }
    })
router.delete('/:id',
    authMiddleware,
    validatorMiddleware(selectUserValidation, 'params'),
    accessMiddleware(
        () => { return [user_access_type.SUPER_ADMIN]; }
    ), async (req: Request, res: Response): Promise<void> => {
        const userId = Number(req.params.id); // Récupérez l'ID de l'utilisateur à partir de req.params
        try {
            const UserUsecase = new UserUseCase(db);
            await UserUsecase.deleteUser({ id: userId }); // Utilisez l'ID récupéré pour supprimer l'utilisateur
            res.status(200);
            res.json({ message: 'User deleted successfully' });
        } catch (error) {
            console.log(error);
            res.status(500);
            res.json({ error: 'Internal error' });
        }
    })


router.patch('/:id',
    validatorMiddleware(selectUserValidation, 'params'),
    validatorMiddleware(updateUserValidation, 'body'),
    authMiddleware,
    async (req: Request & { user?: User }, res: Response): Promise<void> => {
        const updateUserRequest = req.body;
        const userId = Number(req.params.id); // Récupérez l'ID de l'utilisateur à partir de req.params
        try {
            const UserUsecase = new UserUseCase(db);
            const user = await UserUsecase.updateUser({ ...updateUserRequest }, userId); // Utilisez l'ID récupéré pour mettre à jour l'utilisateur
            res.status(200);
            res.json(user);
        } catch (error) {
            console.log(error);
            res.status(500);
            res.json({ error: 'Internal error' });
        }
    })


router.use('/:user_id/files', authMiddleware, FileRoutes);

export default router;