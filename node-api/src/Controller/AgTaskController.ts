import { Request, Response, Router } from 'express';
import { listItemValidation, selectItemValidation } from '../Validators/commonValidator';
import { generateValidationErrorMessage } from '../common/generate-validation-msg';
import { db } from '../database/db';
import { authMiddleware } from '../common/middleware/auth-middleware';
import { accessMiddleware } from '../common/middleware/access-middleware';
import { user_access_type } from '../common/enum/access-type';
import { validatorMiddleware } from '../common/middleware/validator-middleware';
import { JwtPayload } from 'jsonwebtoken';
import { CustomError } from '../common/error/customError';
import { TaskAgUseCase } from '../domain/taskAg-usecase';
import { agTaskSelectOneValidation } from '../Validators/agTaskValidator';
import { selectAgValidation } from '../Validators/agValidator';

const router = Router();
router.get('/',
    authMiddleware,
    validatorMiddleware(listItemValidation, 'body'),
    async (req: Request, res: Response): Promise<void> => {
        const listUserRequest = req.body;
        try {
            const taskUseCase = new TaskAgUseCase(db);
            const tasks = await taskUseCase.ListAllTasks(listUserRequest);
            res.json(tasks);

        }catch (error) {
            if (error instanceof CustomError) {
                res.status(error.code);
                res.json({ error: error.message });
                return;
            }
            console.log(error);
            res.status(500);
            res.json({ error: 'Internal error' });
        }
    })

router.get('/:taskId',
    authMiddleware,
    validatorMiddleware(agTaskSelectOneValidation, 'params'),
    async (req: Request, res: Response): Promise<void> => {
        const taskId = parseInt(req.params.taskId);
        try {
            const taskUseCase = new TaskAgUseCase(db);
            const task = await taskUseCase.selectOneTask({ taskId });
            res.json({ data: task });
        } catch (error) {
            if (error instanceof CustomError) {
                res.status(error.code);
                res.json({ error: error.message });
                return;
            }
            console.log(error);
            res.status(500);
            res.json({ error: 'Internal error' });
        }
    })

router.get('/ag/:agId',
    authMiddleware,
    validatorMiddleware(selectAgValidation, 'params'),
    async (req: Request, res: Response): Promise<void> => {
        const eventId = parseInt(req.params.agId);
        try {
            const taskUseCase = new TaskAgUseCase(db);
            const tasks = await taskUseCase.ListTaskOfAg(eventId);
            res.json({ tasks: tasks }).status(200);
        } catch (error) {
            if (error instanceof CustomError) {
                res.status(error.code);
                res.json({ error: error.message });
                return;
            }
            console.log(error);
            res.status(500);
            res.json({ error: 'Internal error' });
        }
    })
router.get('/user/:itemId',
    authMiddleware,
    validatorMiddleware(selectItemValidation, 'params'),
    async (req: Request, res: Response): Promise<void> => {
        const userId = parseInt(req.params.itemId);
        try {
            const taskUseCase = new TaskAgUseCase(db);
            const tasks = await taskUseCase.listTaskOfUser(userId);
            res.json({ tasks: tasks }).status(200);
        } catch (error) {
            if (error instanceof CustomError) {
                res.status(error.code);
                res.json({ error: error.message });
                return;
            }
            console.log(error);
            res.status(500);
            res.json({ error: 'Internal error' });
        }
    })

router.get('/self',
    authMiddleware,
    async (req: Request & { user?: JwtPayload }, res: Response): Promise<void> => {
        const userId = req.user?.id;
        try {
            const taskUseCase = new TaskAgUseCase(db);
            const tasks = await taskUseCase.listTaskOfUser(userId);
            res.json({ data: tasks }).status(200);
        } catch (error) {
            if (error instanceof CustomError) {
                res.status(error.code);
                res.json({ error: error.message });
                return;
            }
            console.log(error);
            res.status(500);
            res.json({ error: 'Internal error' });
        }
    })

    router.post('/:taskId/finish',
        validatorMiddleware(agTaskSelectOneValidation, 'params'),
        async (req: Request, res: Response): Promise<void> => {
            const taskId = parseInt(req.params.taskId);
            try {
                const taskUseCase = new TaskAgUseCase(db);
                await taskUseCase.finishTask(taskId);
                res.json({ message: 'Task finished' }).status(200);
            } catch (error) {
                if (error instanceof CustomError) {
                    res.status(error.code);
                    res.json({ error: error.message });
                    return;
                }
                console.log(error);
                res.status(500);
                res.json({ error: 'Internal error' });
            }
        })
    
    router.post('/:taskId/unfinish',
        validatorMiddleware(agTaskSelectOneValidation, 'params'),
        async (req: Request, res: Response): Promise<void> => {
            const taskId = parseInt(req.params.taskId);
            try {
                const taskUseCase = new TaskAgUseCase(db);
                await taskUseCase.unfinishTask(taskId);
                res.json({ message: 'Task unfinished' }).status(200);
            } catch (error) {
                if (error instanceof CustomError) {
                    res.status(error.code);
                    res.json({ error: error.message });
                    return;
                }
                console.log(error);
                res.status(500);
                res.json({ error: 'Internal error' });
            }
        })
    

router.get('/:taskId/assigned',
    authMiddleware,
    validatorMiddleware(agTaskSelectOneValidation, 'params'),
    async (req: Request, res: Response): Promise<void> => {
        const taskId = parseInt(req.params.id);
        try {
            const taskUseCase = new TaskAgUseCase(db);
            const users = await taskUseCase.listUserOfTask(taskId);
            res.json({ data: users }).status(200);
        } catch (error) {
            if (error instanceof CustomError) {
                res.status(error.code);
                res.json({ error: error.message });
                return;
            }
            console.log(error);
            res.status(500);
            res.json({ error: 'Internal error' });
        }
    })

router.post('/',
    authMiddleware,
    validatorMiddleware(agTaskSelectOneValidation, 'body'),
    async (req: Request & { user?: JwtPayload }, res: Response): Promise<void> => {
        const createAgRequest = req.body;
        try {
            const taskUseCase = new TaskAgUseCase(db);
            const task = await taskUseCase.createTask({ ...createAgRequest });
            res.status(201);
            res.json({ task });
        } catch (error) {
            if (error instanceof CustomError) {
                res.status(error.code);
                res.json({ error: error.message });
                return;
            }
            console.log(error);
            res.status(500);
            res.json({ error: 'Internal error' });
        }
    })

router.patch('/:taskId',
    authMiddleware,
    validatorMiddleware(agTaskSelectOneValidation, 'params'),
    validatorMiddleware(agTaskSelectOneValidation, 'body'),
    async (req: Request, res: Response): Promise<void> => {
        const taskId = parseInt(req.params.id);
        const task = req.body;
        try {
            const taskUseCase = new TaskAgUseCase(db);
            const updatedTask = await taskUseCase.updateTask( taskId ,{...task });
            res.json({ data: updatedTask }).status(200);
        } catch (error) {
            if (error instanceof CustomError) {
                res.status(error.code);
                res.json({ error: error.message });
                return;
            }
            console.log(error);
            res.status(500);
            res.json({ error: 'Internal error' });
        }
    })

router.delete('/:taskId',
    authMiddleware,
    validatorMiddleware(agTaskSelectOneValidation, 'params'),
    async (req: Request, res: Response): Promise<void> => {
        const taskId = parseInt(req.params.id);
        try {
            const taskUseCase = new TaskAgUseCase(db);
            await taskUseCase.removeTask(taskId);
            res.status(200);
            res.json({ message: 'Task deleted' });
        } catch (error) {
            if (error instanceof CustomError) {
                res.status(error.code);
                res.json({ error: error.message });
                return;
            }
            console.log(error);
            res.status(500);
            res.json({ error: 'Internal error' });
        }
    })

//assign tasks

router.get('/:taskId/assign/:userId',
    authMiddleware,
    validatorMiddleware(agTaskSelectOneValidation, 'params'),
    async (req: Request, res: Response): Promise<void> => {
        const taskId = parseInt(req.params.taskId);
        const userId = parseInt(req.params.userId);
        try {
            const taskUseCase = new TaskAgUseCase(db);
            await taskUseCase.assignTask(taskId, userId);
            res.json({ message: 'Task assigned' }).status(200);
        } catch (error) {
            if (error instanceof CustomError) {
                res.status(error.code);
                res.json({ error: error.message });
                return;
            }
            console.log(error);
            res.status(500);
            res.json({ error: 'Internal error' });
        }
    })

router.post('/:taskId/assign',
    authMiddleware,
    validatorMiddleware(agTaskSelectOneValidation, 'params'),
    validatorMiddleware(listItemValidation, 'body'),
    async (req: Request, res: Response): Promise<void> => {
        const taskId = parseInt(req.params.taskId);
        const userIds = req.body;
        try {
            const taskUseCase = new TaskAgUseCase(db);
            await taskUseCase.assignTaskToMultipleUsers(taskId, userIds);
            res.json({ message: 'Task assigned' }).status(200);
        } catch (error) {
            if (error instanceof CustomError) {
                res.status(error.code);
                res.json({ error: error.message });
                return;
            }
            console.log(error);
            res.status(500);
            res.json({ error: 'Internal error' });
        }
    })
//removing tasks
router.delete('/:taskId/unassign/:userId',
    authMiddleware,
    validatorMiddleware(agTaskSelectOneValidation, 'params'),
    async (req: Request, res: Response): Promise<void> => {
        const taskId = parseInt(req.params.taskId);
        const userId = parseInt(req.params.userId);
        try {
            const taskUseCase = new TaskAgUseCase(db);
            await taskUseCase.removeTaskFromUser(taskId, userId);
            res.json({ message: 'Task removed' }).status(200);
        } catch (error) {
            if (error instanceof CustomError) {
                res.status(error.code);
                res.json({ error: error.message });
                return;
            }
            console.log(error);
            res.status(500);
            res.json({ error: 'Internal error' });
        }
    })

router.post('/:taskId/unassign',
    authMiddleware,
    validatorMiddleware(agTaskSelectOneValidation, 'params'),
    validatorMiddleware(listItemValidation, 'body'),
    async (req: Request, res: Response): Promise<void> => {
        const taskId = parseInt(req.params.taskId);
        const userIds = req.body;
        try {
            const taskUseCase = new TaskAgUseCase(db);
            await taskUseCase.removeTaskFromMultipleUsers(taskId, userIds);
            res.json({ message: 'Task removed' }).status(200);
        } catch (error) {
            if (error instanceof CustomError) {
                res.status(error.code);
                res.json({ error: error.message });
                return;
            }
            console.log(error);
            res.status(500);
            res.json({ error: 'Internal error' });
        }
    })


router.post('/:taskId/clear',
    authMiddleware,
    validatorMiddleware(agTaskSelectOneValidation, 'params'),
    async (req: Request, res: Response): Promise<void> => {
        const taskId = parseInt(req.params.taskId);
        try {
            const taskUseCase = new TaskAgUseCase(db);
            await taskUseCase.clearTask(taskId);
            res.json({ message: 'Task cleared' }).status(200);
        } catch (error) {
            if (error instanceof CustomError) {
                res.status(error.code);
                res.json({ error: error.message });
                return;
            }
            console.log(error);
            res.status(500);
            res.json({ error: 'Internal error' });
        }
    }
)

export default router;

