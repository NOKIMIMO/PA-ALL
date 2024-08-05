import { Request, response, Response, Router } from 'express';
import { listItemValidation } from '../Validators/commonValidator';
import { db } from '../database/db';
import { authMiddleware } from '../common/middleware/auth-middleware';
import EventUseCase from '../domain/event-usecase';
import { addEventMannagerValidation, addUsersToEventValidation, createEventValidation, selectEventByUserValidation, selectEventValidation, updateEventValidation } from '../Validators/eventValidator';
import { validatorMiddleware } from '../common/middleware/validator-middleware';
import { JwtPayload } from 'jsonwebtoken';

const router = Router();
router.post('/',
    authMiddleware,
    validatorMiddleware(createEventValidation, 'body'),
    async (req: Request & { user?: JwtPayload }, res: Response): Promise<void> => {
        const createEventRequest = req.body;
        try {
            const EventUsecase = new EventUseCase(db);
            const event = await EventUsecase.createEvent({ ...createEventRequest }, req.user?.userId!);
            if (req.body.usersId !== undefined) {
                const addParticipants = await EventUsecase.addUsersToEvent({ eventId: event.id }, req.body.usersId);
                console.log(addParticipants);
            }

            res.status(201);
            res.json({ event });
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
            const EventUsecase = new EventUseCase(db);
            const listEvents = await EventUsecase.listEvents({ ...listItemRequest });
            res.status(200);
            res.json(listEvents);
        }
        catch (error) {
            console.log(error);
            res.status(500);
            res.json({ error: 'Internal error' });
        }
    })

router.get('/self',
    authMiddleware,
    validatorMiddleware(listItemValidation, 'body'),
    async (req: Request & { user?: JwtPayload }, res: Response): Promise<void> => {
        console.log("dans event self")
        try {
            const EventUsecase = new EventUseCase(db);
            const listEvents = await EventUsecase.listMyEvents(req.user?.userId);
            res.status(200);
            res.json(listEvents);
        }
        catch (error) {
            console.log(error);
            res.status(500);
            res.json({ error: 'Internal error' });
        }
    })

router.get('/self/managed',
    authMiddleware,
    validatorMiddleware(listItemValidation, 'body'),
    async (req: Request & { user?: JwtPayload }, res: Response): Promise<void> => {
        console.log("dans event self mannaged")
        try {
            const EventUsecase = new EventUseCase(db);
            const listEvents = await EventUsecase.listMyManagedEvents(req.user?.userId);
            res.status(200);
            res.json(listEvents);
        }
        catch (error) {
            console.log(error);
            res.status(500);
            res.json({ error: 'Internal error' });
        }
    }
)



router.get('/user',
    authMiddleware,
    async (req: Request & { user?: JwtPayload }, res: Response): Promise<void> => {
        try {
            const EventUsecase = new EventUseCase(db);
            const listEvents = await EventUsecase.listEventsByUser(req.user?.userId);
            res.status(200);
            res.json(listEvents);
        }
        catch (error) {
            console.log(error);
            res.status(500);
            res.json({ error: 'Internal error' });
        }
    })

router.get('/managed',
    authMiddleware,
    async (req: Request & { user?: JwtPayload }, res: Response): Promise<void> => {
        try {
            const EventUsecase = new EventUseCase(db);
            const listEvents = await EventUsecase.listManagedEventsByUser(req.user?.userId);
            res.status(200);
            res.json(listEvents);
        }
        catch (error) {
            console.log(error);
            res.status(500);
            res.json({ error: 'Internal error' });
        }
    })

router.get('/:eventId',
    authMiddleware,
    validatorMiddleware(selectEventValidation, 'params'),
    async (req: Request, res: Response): Promise<void> => {
        const getEventRequest = { ...req.body, ...req.params };
        try {
            const EventUsecase = new EventUseCase(db);
            const event = await EventUsecase.getEventById({ ...getEventRequest });
            if (!event) {
                res.status(404);
                res.json({ error: 'Event not found' });
                return;
            }
            res.status(200);
            res.json(event);
        } catch (error) {
            console.log(error);
            res.status(500);
            res.json({ error: 'Internal error' });
        }
    })


router.delete('/:eventId',
    authMiddleware,
    validatorMiddleware(selectEventValidation, 'params'),
    async (req: Request & { user?: JwtPayload }, res: Response): Promise<void> => {
        const deleteEventRequest = { ...req.body, ...req.params };
        try {
            const EventUsecase = new EventUseCase(db);
            await EventUsecase.deleteEvent({ ...deleteEventRequest }, req.user?.userId!);
            res.status(204);
            res.json();
        } catch (error) {
            if ((error as Error).message === 'User not allowed to delete this event') {
                res.status(403);
                res.json({ error: 'Forbidden' });
                return;
            }
            res.status(500);
            res.json({ error: 'Internal error' });
        }
    })
router.patch('/:eventId',
    authMiddleware,
    validatorMiddleware(selectEventValidation, 'params'),
    validatorMiddleware(updateEventValidation, 'body'),
    async (req: Request & { user?: JwtPayload }, res: Response): Promise<void> => {
        const updateEventRequest = { ...req.body, ...req.params };
        try {
            const EventUsecase = new EventUseCase(db);
            const updateEvent = await EventUsecase.updateEvent({ ...updateEventRequest }, req.user?.userId!);
            if (!updateEvent) {
                res.status(404);
                res.json({ error: 'Event not found' });
                return;
            }
            res.status(200);
            res.json(updateEvent);
        } catch (error) {
            console.log(error);
            res.status(500);
            res.json({ error: 'Internal error' });
        }
    })

router.get('/:eventId/managed',
    authMiddleware,
    validatorMiddleware(selectEventValidation, 'params'),
    async (req: Request, res: Response): Promise<void> => {
        const eventId = parseInt(req.params.eventId);
        try {
            const EventUsecase = new EventUseCase(db);
            const event = await EventUsecase.getMannagerOfEvent( eventId);
            res.status(200);
            res.json(event);
        } catch (error) {
            console.log(error);
            res.status(500);
            res.json({ error: 'Internal error' });
        }
    }
)

router.post('/:eventId/manage',
    authMiddleware,
    validatorMiddleware(selectEventValidation, 'params'),
    validatorMiddleware(addEventMannagerValidation, 'body'),
    async (req: Request & { user?: JwtPayload }, res: Response): Promise<void> => {
        const eventId = parseInt(req.params.eventId);
        const usersId = req.body.usersId;
        try {
            const EventUsecase = new EventUseCase(db);
            await EventUsecase.addMannagerToEvent(eventId,usersId,req.user?.userId!);
            res.status(201)
            res.json({ message: "Users added to mannage the event" });
        } catch (error) {
            if ((error as Error).message === 'Event not found') {
                res.status(404);
                res.json({ error: 'Event not found' });
                return;
            }
            console.log(error);
            res.status(500);
            res.json({ error: 'Internal error' });
        }
    })

router.delete('/:eventId/manage/self',
    authMiddleware,
    validatorMiddleware(selectEventValidation, 'params'),
    async (req: Request & { user?: JwtPayload }, res: Response): Promise<void> => {
        const eventId = parseInt(req.params.eventId);
        const usersId = req.body.usersId;
        try {
            const EventUsecase = new EventUseCase(db);
            await EventUsecase.removeMannagerFromEvent(eventId,req.user?.userId!,req.user?.userId!);
            res.status(204)
            res.json();
        } catch (error) {
            if ((error as Error).message === 'Event not found') {
                res.status(404);
                res.json({ error: 'Event not found' });
                return;
            }
            console.log(error);
            res.status(500);
            res.json({ error: 'Internal error' });
        }
    })

router.delete('/:eventId/manage/:userId',
    authMiddleware,
    validatorMiddleware(selectEventValidation, 'params'),
    async (req: Request & { user?: JwtPayload }, res: Response): Promise<void> => {
        const eventId = parseInt(req.params.eventId);
        const usersId = req.body.usersId;
        try {
            const EventUsecase = new EventUseCase(db);
            await EventUsecase.removeMannagerFromEvent(eventId,usersId,req.user?.userId!);
            res.status(204)
            res.json();
        } catch (error) {
            if ((error as Error).message === 'Event not found') {
                res.status(404);
                res.json({ error: 'Event not found' });
                return;
            }
            console.log(error);
            res.status(500);
            res.json({ error: 'Internal error' });
        }
    })


router.get('/:eventId/users',
    authMiddleware,
    validatorMiddleware(selectEventValidation, 'params'),
    async (req: Request, res: Response): Promise<void> => {
        const getEventRequest = { ...req.body, ...req.params };
        try {
            const EventUsecase = new EventUseCase(db);
            const users = await EventUsecase.listEventParticipants({ ...getEventRequest });
            if (!users) {
                res.status(404);
                res.json({ error: 'Event not found' });
                return;
            }
            res.status(200);
            res.json({ users: users });
        } catch (error) {
            console.log(error);
            res.status(500);
            res.json({ error: 'Internal error' });
        }
    }
)


router.post('/:eventId/join',
    authMiddleware,
    validatorMiddleware(selectEventValidation, 'params'),
    async (req: Request & { user?: JwtPayload }, res: Response): Promise<void> => {
        const joinEventRequest = { ...req.body, ...req.params };
        try {
            const EventUsecase = new EventUseCase(db);
            const response = await EventUsecase.addUsersToEvent({ ...joinEventRequest }, [req.user?.userId!]);
            res.status(201)
            res.json({ message: response });
        } catch (error) {
            console.log(error);
            if ((error as Error).message === 'Event not found') {
                res.status(404);
                res.json({ error: 'Event not found' });
                return;
            }
            res.status(500);
            res.json({ error: 'Internal error' });
        }
    })

router.post('/:eventId/add',
    authMiddleware,
    validatorMiddleware(selectEventValidation, 'params'),
    validatorMiddleware(addUsersToEventValidation, 'body'),
    async (req: Request, res: Response): Promise<void> => {
        const addUsersToEventRequest = { ...req.body, ...req.params };
        try {
            const EventUsecase = new EventUseCase(db);
            const response = await EventUsecase.addUsersToEvent({ ...addUsersToEventRequest }, req.body.usersId);
            res.status(201)
            res.json({ message: response });
        } catch (error) {
            if ((error as Error).message === 'Event not found') {
                res.status(404);
                res.json({ error: 'Event not found' });
                return;
            }
            console.log(error);
            res.status(500);
            res.json({ error: 'Internal error' });
        }
    })



router.delete('/:eventId/leave',
    authMiddleware,
    validatorMiddleware(selectEventValidation, 'params'),
    async (req: Request & { user?: JwtPayload }, res: Response): Promise<void> => {
        const joinEventRequest = { ...req.body, ...req.params };
        try {
            const EventUsecase = new EventUseCase(db);
            await EventUsecase.leaveEvent({ ...joinEventRequest }, req.user?.userId!);
            res.status(204)
            res.json();
        }
        catch (error) {
            if ((error as Error).message === 'User has not joined this event') {
                res.status(403);
                res.json({ error: 'User has not joined this event' });
                return;

            }
            console.log(error);
            res.status(500);
            res.json({ error: 'Internal error' });
        }

    })

router.post('/:eventId/remove',
    authMiddleware,
    validatorMiddleware(selectEventValidation, 'params'),
    validatorMiddleware(addUsersToEventValidation, 'body'),
    async (req: Request, res: Response): Promise<void> => {
        const addUsersToEventRequest = { ...req.body, ...req.params };
        console.log(req.body)
        try {
            const EventUsecase = new EventUseCase(db);
            const response = await EventUsecase.removeUsersFromEvent({ ...addUsersToEventRequest }, req.body.usersId);
            res.status(201)
            res.json({ message: response });
        } catch (error) {
            if ((error as Error).message === 'Event not found') {
                res.status(404);
                res.json({ error: 'Event not found' });
                return;
            }
            console.log(error);
            res.status(500);
            res.json({ error: 'Internal error' });
        }
    })


export default router;