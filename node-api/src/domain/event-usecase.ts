import { DataSource, In } from "typeorm";
import { Event } from "../database/models/event";
import { JwtPayload } from "jsonwebtoken";
import { ListItemRequest } from "../Validators/commonValidator";
import { createEventValidationRequest, selectEventRequest, updateEventRequest } from "../Validators/eventValidator";
import { User } from "../database/models/user";
import { user_access_type } from "../common/enum/access-type";
import { UsersEvents } from "../database/models/users-events";

export default class EventUseCase {

    constructor(private readonly db:DataSource) {}

    async listEvents(filter:ListItemRequest): Promise<{ events: Event[]; totalCount: number; }>{
        const query = this.db.createQueryBuilder(Event, 'event')
        if(filter.limit){
            query.limit(filter.limit)
            if(filter.page){
                query.offset((filter.page-1) * filter.limit)
            }
        }
        const [events, totalCount] = await query.getManyAndCount()
        return {events,totalCount}
    }
    async listEventsByUser(userId: number): Promise<{ events: Event[];}>{
        const query = this.db.createQueryBuilder(Event, 'event')
        
        const events = (await query.getMany()).filter((event) => event.userId === userId)
        return {events}
    }

    async listMyEvents(userId: number): Promise<{ events: Event[]; totalCount: number; }> {
        const query = this.db.getRepository(User)
        const userEventQuery = this.db.getRepository(UsersEvents)
        const eventQuery = this.db.getRepository(Event)
        const user = await query.findOneBy({id: userId})
        if (!user) {
            throw new Error('User not found')
        }
        const [userEvents, totalCount] = await userEventQuery.findAndCount({where: {userid: userId}});
        const events = await eventQuery.find({where: userEvents.map((userEvent) => ({id: userEvent.eventid}))})
        return { events, totalCount }
    }

    async createEvent(data: createEventValidationRequest,userid:number): Promise<Event> {
        const eventRepository = this.db.getRepository(Event);
        const newEvent = eventRepository.create({...data,user :{id:userid}});
        return await eventRepository.save(newEvent);
    }
    async getEventById(data:selectEventRequest): Promise<Event|null>{
        const repo = this.db.getRepository(Event)
        return await repo.findOneBy({ id: data.eventId })
    }

    async updateEvent(data:updateEventRequest, userid:number): Promise<Event | null>{
        const repo = this.db.getRepository(Event)
        const eventFind = await repo.findOneBy({id: data.eventId})
        if (!eventFind) {
            return null
        }
        if (data.title){
            eventFind.title = data.title
        }
        if (data.description){
            eventFind.description = data.description
        }
        if (data.event_date){
            //TODO: validate DATE is not in the past
            eventFind.event_date = data.event_date
        }
        if (data.location){
            //TODO: validate location is in the right format
            eventFind.location = data.location
        }
        if (data.data_access_type){
            eventFind.data_access_type = data.data_access_type
        }
        const updatedEvent = await repo.save(eventFind)
        return updatedEvent
    }


    async deleteEvent(data: selectEventRequest,userid:number): Promise<void>{
        const repo = this.db.getRepository(Event)
        const userRepo = this.db.getRepository(User)
        const event = await repo.findOneBy({id : data.eventId})
        if (!event) {
            throw new Error('Event not found')
        }
        const user = await userRepo.findOneBy({id: userid})
        if (!user) {
            throw new Error('User not found')
        }
        if ((user.role !== user_access_type.ADMIN && user.role !== user_access_type.SUPER_ADMIN) && user.id !== event.userId) {
            throw new Error('User not allowed to delete this event')
        }
        await repo.remove(event)
    }

    async addUsersToEvent(data:selectEventRequest, usersid:number[]): Promise<string[] | null> {
        const repo = this.db.getRepository(UsersEvents)
        const eventRepo = this.db.getRepository(Event)
        const event = await eventRepo.findOneBy({id: data.eventId})
        if (!event) {
            throw new Error('Event not found')
        }
        const string = []
        for(const userId of usersid){
            const alreadyExists = await repo.findOneBy({eventid: data.eventId, userid: userId})
            if (alreadyExists) {
                string.push('User '+userId+' already joined this event')
                continue
            }
            
            const userRepo = this.db.getRepository(User)
            const user = await userRepo.findOneBy({id: userId})

            if(!user){
                string.push('User '+userId+' not found')
                continue
            }
            const userEvent = repo.create({eventid: event.id, userid: user.id})
            await repo.save(userEvent)
        }
        if(string.length === 0){
            string.push('All users added successfully')
        }
        return string
    }

    async leaveEvent(data:selectEventRequest, userid:number): Promise<void> {
        const repo = this.db.getRepository(UsersEvents)
        const userEvent = await repo.findOneBy({eventid: data.eventId, userid})
        if (!userEvent) {
            throw new Error('User has not joined this event')
        }
        await repo.remove(userEvent)
    }

    async removeUsersFromEvent(data:selectEventRequest, usersid:number[]): Promise<string[] | null> {
        const repo = this.db.getRepository(UsersEvents)
        const userEvents = await repo.find({where: {eventid: data.eventId, userid: In(usersid)}})
        const eventRepo = this.db.getRepository(Event)
        const event = await eventRepo.findOneBy({id: data.eventId})
        if (!event) {
            throw new Error('Event not found')
        }
        if (!userEvents) {
            throw new Error('User(s) not found in given event')
        }
        const string = []
        for(const userId of usersid){
            const alreadyExists = await repo.findOneBy({eventid: data.eventId, userid: userId})
            if (!alreadyExists) {
                string.push('User '+userId+' not found in this event')
                continue
            }
            await repo.delete({eventid: data.eventId, userid: userId})
        }
        if(string.length === 0){
            string.push('All users removed successfully')
        }
        return string
    }

    async listEventParticipants(data:selectEventRequest): Promise<User[]> {
        const repo = this.db.getRepository(UsersEvents)
        const userRepo = this.db.getRepository(User)
        const userEvents = await repo.find({where: {eventid: data.eventId}})
        const userIds = userEvents.map(userEvent => userEvent.userid);
        const users = await userRepo.find({ where: { id: In(userIds) } });
        return users
    }

}