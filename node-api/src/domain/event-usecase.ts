import { DataSource, In } from "typeorm";
import { Event } from "../database/models/event";
import { JwtPayload } from "jsonwebtoken";
import { ListItemRequest } from "../Validators/commonValidator";
import { createEventValidationRequest, selectEventRequest, updateEventRequest } from "../Validators/eventValidator";
import { User } from "../database/models/user";
import { user_access_type } from "../common/enum/access-type";
import { UsersEvents } from "../database/models/users-events";
import { EventManager } from "../database/models/eventMannager";
import { UserResponse } from "../Validators/userValidator";
import { Task } from "../database/models/task";
import { UserTask } from "../database/models/user-task";
import { CustomError } from "../common/error/customError";

export default class EventUseCase {

    constructor(private readonly db: DataSource) { }

    async removeMannagerFromEvent(eventId: number, userId: number, currentUserId: number): Promise<void> {
        const eventManagerRepository = this.db.getRepository(EventManager)
        const eventRepository = this.db.getRepository(Event)
        const event = await eventRepository.findOneBy({ id: eventId })
        if (!event) {
            throw new CustomError(404,'Event not found')
        }
        const userRepo = this.db.getRepository(User)
        const user = await userRepo.findOneBy({ id: currentUserId })
        if (!user) {
            throw new CustomError(404,'User not found')
        }
        if (user.role !== user_access_type.SUPER_ADMIN, user.role !== user_access_type.ADMIN) {
            throw new CustomError(401,'User not allowed to remove event manager')
        }
        const eventManagerToDelete = await eventManagerRepository.findOneBy({ eventId: eventId, userId: userId })
        if (!eventManagerToDelete) {
            throw new CustomError(404,'Event manager not found')
        }
        
        await eventManagerRepository.remove(eventManagerToDelete)
    }

    async listEventWhereTaskAssigned(userId: number): Promise<{ events: Event[]; totalCount: number; }> {
        const userRepository = this.db.getRepository(User)
        const user = await userRepository.findOneBy({ id: userId })
        if (!user) {
            throw new CustomError(404,'User not found')
        }
        const userTaskRepository = this.db.getRepository(UserTask);
        const UserTaks = await userTaskRepository.findBy({ userId: userId });

        const taskRepository = this.db.getRepository(Task);
        const tasksIds = UserTaks.map((userTask) => userTask.taskId);
        const tasks = await taskRepository.findBy({ id: In(tasksIds) });

        const eventRepository = this.db.getRepository(Event);
        const eventIds = tasks.map((task) => task.eventId);
        const events = await eventRepository.findBy({ id: In(eventIds) });
    
        return { events, totalCount: events.length }
    }

    async listManagedEventsByUser(userId: number): Promise<{ events: Event[]; totalCount: number; }> {
        const userRepository = this.db.getRepository(User)
        const user = await userRepository.findOneBy({ id: userId })
        if (!user) {
            throw new CustomError(404,'User not found')
        }
        const eventrRepository = this.db.getRepository(Event)
        const eventManagerRepository = this.db.getRepository(EventManager)
        const eventsManager = await eventManagerRepository.find({ where: { userId: userId } })
        const events = await eventrRepository.find({ where: eventsManager.map((eventManager) => ({ id: eventManager.eventId })) })
        return { events, totalCount: events.length }
    }

    async listEvents(filter: ListItemRequest): Promise<{ events: Event[]; totalCount: number; }> {
        const query = this.db.createQueryBuilder(Event, 'event')
        if (filter.limit) {
            query.limit(filter.limit)
            if (filter.page) {
                query.offset((filter.page - 1) * filter.limit)
            }
        }
        const [events, totalCount] = await query.getManyAndCount()
        return { events, totalCount }
    }
    async getMannagerOfEvent(eventId: number): Promise<UserResponse[]> {
        const eventManagerRepository = this.db.getRepository(EventManager);
        const eventManager = await eventManagerRepository.findBy({ eventId });
        if (!eventManager) {
            throw new CustomError(404,'Event not found')
        }
        const userRepository = this.db.getRepository(User);
        const manngerUsersId = eventManager.map((eventManager) => eventManager.userId);
        const users = await userRepository.findBy({id: In(manngerUsersId)});

        // Map to UserResponse while excluding the password field
        const userResponse = users.map(user => ({
            id: user.id,
            email: user.email,
            role: user.role,
            lastname: user.lastname,
            firstname: user.firstname,
            active: user.active,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt
        }));
    
        return userResponse;
     
    }
    async listEventsByUser(userId: number): Promise<{ events: Event[]; }> {
        const query = this.db.createQueryBuilder(Event, 'event')

        const events = (await query.getMany()).filter((event) => event.userId === userId)
        return { events }
    }
    async listMyManagedEvents(userId: number): Promise<{ events: Event[]; totalCount: number; }> {
        const eventrRepository = this.db.getRepository(Event)
        const eventManagerRepository = this.db.getRepository(EventManager)
        const eventsManager = await eventManagerRepository.find({ where: { userId: userId } })
        const events = await eventrRepository.find({ where: eventsManager.map((eventManager) => ({ id: eventManager.eventId })) })
        return { events, totalCount: events.length }
    }

    async listMyEvents(userId: number): Promise<{ events: Event[]; totalCount: number; }> {
        const query = this.db.getRepository(User)
        const userEventQuery = this.db.getRepository(UsersEvents)
        const eventQuery = this.db.getRepository(Event)
        const user = await query.findOneBy({ id: userId })
        if (!user) {
            throw new CustomError(404,'User not found')
        }
        const [userEvents, totalCount] = await userEventQuery.findAndCount({ where: { userid: userId } });
        const events = await eventQuery.find({ where: userEvents.map((userEvent) => ({ id: userEvent.eventid })) })
        return { events, totalCount }
    }

    async addMannagerToEvent(eventId: number, userIds: number[], currentUserId: number): Promise<void> {
        const eventManagerRepository = this.db.getRepository(EventManager)
        const eventRepository = this.db.getRepository(Event)
        const event = await eventRepository.findOneBy({ id: eventId })
        if (!event) {
            throw new CustomError(404,'Event not found')
        }
        const eventManager = await eventManagerRepository.findOneBy({ eventId: eventId, userId: currentUserId })
        if (!eventManager) {
            const userRepo = this.db.getRepository(User)
            const user = await userRepo.findOneBy({ id: currentUserId })
            if (!user) {
                throw new CustomError(404,'Event not found')
            }
            if (user.role !== user_access_type.SUPER_ADMIN, user.role !== user_access_type.ADMIN) {
                throw new CustomError(401,'User not allowed to remove event manager')
            }
        }
        for(const userId of userIds){
            const alreadyExists = await eventManagerRepository.findOneBy({ eventId: eventId, userId: userId })
            if (alreadyExists) {
                throw new CustomError(401,'User already added as event manager')
            }
            const userRepo = this.db.getRepository(User)
            const user = await userRepo.findOneBy({ id: userId })
            if (!user) {
                throw new CustomError(404,'User not found')
            }
            const newEventManager = eventManagerRepository.create({ eventId: eventId, userId: userId })
            await eventManagerRepository.save(newEventManager)
        }

    }

    async createEvent(data: createEventValidationRequest, userid: number): Promise<Event> {
        const eventRepository = this.db.getRepository(Event);
        //today + 3 days
        const today = new Date();
        today.setDate(today.getDate() + 3);
        if(data.event_date < today){
            throw new CustomError(401,'Event date must be in the future')
        }
        if(data.max_participant && data.max_participant <5){
            throw new CustomError(401,'Max participant must be greater than 5 if specified')
        }
        const newEvent = eventRepository.create({ ...data, user: { id: userid } });
        const newEventReturn = await eventRepository.save(newEvent);
        const eventMannagerRepository = this.db.getRepository(EventManager);
        const eventMannager = eventMannagerRepository.create({ event: newEvent, user: { id: userid } });
        await eventMannagerRepository.save(eventMannager);
        return newEventReturn;
    }
    async getEventById(data: selectEventRequest): Promise<Event | null> {
        const repo = this.db.getRepository(Event)
        return await repo.findOneBy({ id: data.eventId })
    }

    async updateEvent(data: updateEventRequest, userid: number): Promise<Event | null> {
        const repo = this.db.getRepository(Event)
        const eventFind = await repo.findOneBy({ id: data.eventId })
        if (!eventFind) {
            return null
        }
        const userRepo = this.db.getRepository(User)
        const user = await userRepo.findOneBy({ id: userid })
        if (!user) {
            throw new CustomError(404,'User not found')
        }
        if (user.role !== user_access_type.SUPER_ADMIN && user.role !== user_access_type.ADMIN) {
            throw new CustomError(401,'User not allowed to remove event manager')
        }
        if (data.title) {
            eventFind.title = data.title
        }
        if (data.description) {
            eventFind.description = data.description
        }
        if (data.event_date) {
            //TODO: validate DATE is not in the past
            eventFind.event_date = data.event_date
        }
        if (data.location) {
            //TODO: validate location is in the right format
            eventFind.location = data.location
        }
        if (data.data_access_type) {
            eventFind.data_access_type = data.data_access_type
        }
        if (data.max_participant) {
            if (data.max_participant < 5) {
                throw new CustomError(401,'Max participant must be greater than 5 if specified')
            }
            eventFind.max_participant = data.max_participant
        }
        const updatedEvent = await repo.save(eventFind)
        return updatedEvent
    }


    async deleteEvent(data: selectEventRequest, userid: number): Promise<void> {
        const repo = this.db.getRepository(Event)
        const userRepo = this.db.getRepository(User)
        const event = await repo.findOneBy({ id: data.eventId })
        const eventMannagerRepository = this.db.getRepository(EventManager)
        if (!event) {
            throw new CustomError(404,'Event not found')
        }
        const user = await userRepo.findOneBy({ id: userid })
        if (!user) {
            throw new CustomError(404,'User not found')
        }
        if ((user.role !== user_access_type.ADMIN && user.role !== user_access_type.SUPER_ADMIN) && user.id !== event.userId) {
            throw new CustomError(401,'User not allowed to delete this event')
        }
        await eventMannagerRepository.delete({ eventId: data.eventId })
        const eventTaskRepository = this.db.getRepository(Task)
        await eventTaskRepository.delete({ eventId: data.eventId })
        await repo.remove(event)
    }

    async addUsersToEvent(eventId: number, usersid: number[]): Promise<string[] | null> {
        const repo = this.db.getRepository(UsersEvents)
        const eventRepo = this.db.getRepository(Event)
        const event = await eventRepo.findOneBy({ id: eventId })
        if (!event) {
            throw new Error('Event not found')
        }
        const string = []
        for (const userId of usersid) {
            const alreadyExists = await repo.findOneBy({ eventid: eventId, userid: userId })
            if (alreadyExists) {
                string.push('User ' + userId + ' already joined this event')
                continue
            }

            const userRepo = this.db.getRepository(User)
            const user = await userRepo.findOneBy({ id: userId })

            if (!user) {
                string.push('User ' + userId + ' not found')
                continue
            }
            const userEvent = repo.create({ eventid: event.id, userid: user.id })
            await repo.save(userEvent)
        }
        if (string.length === 0) {
            string.push('All users added successfully')
        }
        return string
    }

    async leaveEvent(data: selectEventRequest, userid: number): Promise<void> {
        const repo = this.db.getRepository(UsersEvents)
        const userEvent = await repo.findOneBy({ eventid: data.eventId, userid })
        if (!userEvent) {
            throw new CustomError(401,'User has not joined this event')
        }
        await repo.remove(userEvent)
    }

    async removeUsersFromEvent(data: selectEventRequest, usersid: number[]): Promise<string[] | null> {
        const repo = this.db.getRepository(UsersEvents)
        const userEvents = await repo.find({ where: { eventid: data.eventId, userid: In(usersid) } })
        const eventRepo = this.db.getRepository(Event)
        const event = await eventRepo.findOneBy({ id: data.eventId })
        if (!event) {
            throw new CustomError(404,'Event not found')
        }
        if (!userEvents) {
            throw new CustomError(400,'User(s) not found in given event')
        }
        const string = []
        for (const userId of usersid) {
            const alreadyExists = await repo.findOneBy({ eventid: data.eventId, userid: userId })
            if (!alreadyExists) {
                string.push('User ' + userId + ' not found in this event')
                continue
            }
            await repo.delete({ eventid: data.eventId, userid: userId })
        }
        if (string.length === 0) {
            string.push('All users removed successfully')
        }
        return string
    }

    async listEventParticipants(data: selectEventRequest): Promise<UserResponse[]> {
        const repo = this.db.getRepository(UsersEvents)
        const userRepo = this.db.getRepository(User)
        const userEvents = await repo.find({ where: { eventid: data.eventId } })
        const userIds = userEvents.map(userEvent => userEvent.userid);
        const users = await userRepo.find({ where: { id: In(userIds) } });
        const userResponse = users.map(user => {
            return {
                id: user.id,
                email: user.email,
                role: user.role,
                lastname: user.lastname,
                firstname: user.firstname,
                active: user.active,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt
            }
        })
        return userResponse
    }

}