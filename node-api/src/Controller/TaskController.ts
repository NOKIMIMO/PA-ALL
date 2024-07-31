import { Request, Response, Router } from 'express';
import { listItemValidation } from '../Validators/commonValidator';
import { generateValidationErrorMessage } from '../common/generate-validation-msg';
import { db } from '../database/db';
import { authMiddleware } from '../common/middleware/auth-middleware';
import { accessMiddleware } from '../common/middleware/access-middleware';
import { user_access_type } from '../common/enum/access-type';
import { validatorMiddleware } from '../common/middleware/validator-middleware';
import { taskAssignMultipleValidation, taskAssignValidation, taskCreateValidation, taskSelectOneValidation } from '../Validators/taskValidator';
import { JwtPayload } from 'jsonwebtoken';
import { CustomError } from '../common/error/customError';
import { TaskUseCase } from '../domain/task-usecase';


const router = Router();
router.get('/',
    validatorMiddleware(listItemValidation, 'body'),
    authMiddleware,
    async (req: Request, res: Response): Promise<void> => {
        const listUserRequest = req.body;
        try {
            const taskUseCase = new TaskUseCase(db);
            const tasks = await taskUseCase.ListAllTasks(listUserRequest);
            res.json(tasks);
            
        } catch (error) {
            console.log(error);
            res.status(500);
            res.json({ error: 'Internal error' });
        }
    })

router.get('/:taskId',
    authMiddleware,
    validatorMiddleware(taskSelectOneValidation, 'params'),
    async (req: Request, res: Response): Promise<void> => {
        const taskId = parseInt(req.params.id);
        try {
            const taskUseCase = new TaskUseCase(db);
            const task = await taskUseCase.selectOneTask({taskId});
            res.json({data : task});
        } catch (error) {
            console.log(error);
            res.status(500);
            res.json({ error: 'Internal error' });
        }
    })

router.get('/event/:eventId',
    authMiddleware,
    validatorMiddleware(taskSelectOneValidation, 'params'),
    async (req: Request, res: Response): Promise<void> => {
        const eventId = parseInt(req.params.id);
        try {
            const taskUseCase = new TaskUseCase(db);
            const tasks = await taskUseCase.ListTaskOfEvent(eventId);
            res.json({data : tasks}).status(200);
        } catch (error) {
            console.log(error);
            res.status(500);
            res.json({ error: 'Internal error' });
        }
    })

router.get('/user/:userId',
    authMiddleware,
    validatorMiddleware(taskSelectOneValidation, 'params'),
    async (req: Request, res: Response): Promise<void> => {
        const userId = parseInt(req.params.id);
        const task = req.body;
        try {
            const taskUseCase = new TaskUseCase(db);
            const tasks = await taskUseCase.listTaskOfUser(userId);
            res.json({data : tasks}).status(200);
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
            const taskUseCase = new TaskUseCase(db);
            const tasks = await taskUseCase.listTaskOfUser(req.user!.userId);
            res.json(tasks).status(200);
        } catch (error) {
            console.log(error);
            res.status(500);
            res.json({ error: 'Internal error' });
        }
    })


router.get('/:taskId/assigned',
    authMiddleware,
    validatorMiddleware(taskSelectOneValidation, 'params'),
    async (req: Request, res: Response): Promise<void> => {
        const taskId = parseInt(req.params.id);
        try {
            const taskUseCase = new TaskUseCase(db);
            const users = await taskUseCase.listUserOfTask(taskId);
            res.json(users).status(200);
        } catch (error) {
            console.log(error);
            res.status(500);
            res.json({ error: 'Internal error' });
        }
    })

router.post('/',
    authMiddleware,
    validatorMiddleware(taskCreateValidation, 'body'),
    async (req: Request, res: Response): Promise<void> => {
        const task = req.body;
        try {
            const taskUseCase = new TaskUseCase(db);
            await taskUseCase.createTask(task);
            res.json({ message: 'Task created' }).status(200);
        } catch (error) {
            console.log(error);
            res.status(500);
            res.json({ error: 'Internal error' });
        }
    })

router.patch('/:taskId',
    authMiddleware,
    validatorMiddleware(taskCreateValidation, 'body'),
    validatorMiddleware(taskSelectOneValidation, 'params'),
    async (req: Request, res: Response): Promise<void> => {
        const taskId = parseInt(req.params.id);
        const task = req.body;
        try {
            const taskUseCase = new TaskUseCase(db);
            await taskUseCase.updateTask(taskId, task);
            res.json({ message: 'Task updated' });
        } catch (error) {
            console.log(error);
            res.status(500);
            res.json({ error: 'Internal error' });
        }
    })

router.delete('/:taskId',
    authMiddleware,
    validatorMiddleware(taskSelectOneValidation, 'params'),
    async (req: Request, res: Response): Promise<void> => {
        const taskId = parseInt(req.params.id);
        try {
            const taskUseCase = new TaskUseCase(db);
            await taskUseCase.removeTask(taskId);
            res.json({ message: 'Task removed' });
        } catch (error) {
            console.log(error);
            res.status(500);
            res.json({ error: 'Internal error' });
        }
    })

//assigning tasks

router.get('/:taskId/assign/:userId',
    authMiddleware,
    validatorMiddleware(taskAssignValidation, 'params'),
    async (req: Request, res: Response): Promise<void> => {
        const taskId = parseInt(req.params.taskId);
        const userId = parseInt(req.params.userId);
        try {
            const taskUseCase = new TaskUseCase(db);
            await taskUseCase.assignTask(taskId, userId);
            res.json({ message: 'Task assigned' });
        } catch (error) {
            console.log(error);
            res.status(500);
            res.json({ error: 'Internal error' });
        }
    })
router.post('/:taskId/assign',
    authMiddleware,
    validatorMiddleware(taskSelectOneValidation, 'params'),
    validatorMiddleware(taskAssignMultipleValidation , 'body'),
    async (req: Request, res: Response): Promise<void> => {
        const taskId = parseInt(req.params.taskId);
        const userId = req.body.userId;
        try {
            const taskUseCase = new TaskUseCase(db);
            await taskUseCase.assignTaskToMultipleUsers(taskId, userId);
            res.json({ message: 'Task assigned' });
        } catch (error) {
            console.log(error);
            res.status(500);
            res.json({ error: 'Internal error' });
        }
    })

//removing tasks

router.delete('/:taskId/unassign/:userId',
    authMiddleware,
    validatorMiddleware(taskAssignValidation, 'params'),
    async (req: Request, res: Response): Promise<void> => {
        const taskId = parseInt(req.params.taskId);
        const userId = parseInt(req.params.userId);
        try {
            const taskUseCase = new TaskUseCase(db);
            await taskUseCase.removeTaskFromUser(taskId, userId);
            res.json({ message: 'Task removed' });
        } catch (error) {
            console.log(error);
            res.status(500);
            res.json({ error: 'Internal error' });
        }
    })

router.post('/:taskId/unassign',
    authMiddleware,
    validatorMiddleware(taskSelectOneValidation, 'params'),
    validatorMiddleware(taskAssignMultipleValidation , 'body'),
    async (req: Request, res: Response): Promise<void> => {
        const taskId = parseInt(req.params.taskId);
        const userId = req.body.userId;
        try {
            const taskUseCase = new TaskUseCase(db);
            await taskUseCase.removeTaskFromMultipleUsers(taskId, userId);
            res.json({ message: 'Task removed' });
        } catch (error) {
            console.log(error);
            res.status(500);
            res.json({ error: 'Internal error' });
        }
    })

    router.post('/:taskId/clear',
        authMiddleware,
        validatorMiddleware(taskSelectOneValidation, 'params'),
        async (req: Request, res: Response): Promise<void> => {
            const taskId = parseInt(req.params.taskId);
            try {
                const taskUseCase = new TaskUseCase(db);
                await taskUseCase.clearTask(taskId);
                res.json({ message: 'Task cleared' });
            } catch (error) {
                console.log(error);
                res.status(500);
                res.json({ error: 'Internal error' });
            }
        })

export default router;