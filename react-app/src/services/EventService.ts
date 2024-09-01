import { event_category_event, event_category_animal } from "../enum/event-category";
import { CustomError } from "../commons/Error";

interface IEventService {
    getEvents(page: number, limit: number): Promise<any>;
    getEventById(id: string): Promise<any>;
    deleteEventById(id: number): Promise<void>;
    patchEventById(id: string, body: PatchEventByIdBody): Promise<any>;
    createEvent(body: CreateEventBody): Promise<any>;
    getEventParticipants(id: string): Promise<any>;
}

interface PatchEventByIdBody {
    title?: string;
    description?: string;
    event_date?: string;
    location?: string;
    max_participant?: number;
    eventId?: number;
    category_event?: event_category_event;
    category_animal?: event_category_animal;
}

interface CreateEventBody {
    title: string;
    description: string;
    event_date: string;
    location: string;
    max_participant: number;
    usersId: number[];
    category_event?: event_category_event;
    category_animal?: event_category_animal;
}
function validateCreateEvent(body: CreateEventBody): void {
    const errors: string[] = [];

    if (!body.title || typeof body.title !== 'string') errors.push('Title is required and must be a string.');
    if (!body.description || typeof body.description !== 'string') errors.push('Description is required and must be a string.');
    if (!body.event_date || isNaN(new Date(body.event_date).getTime())) errors.push('Event date is required and must be a valid date.');
    if (!body.location || typeof body.location !== 'string') errors.push('Location is required and must be a string.');
    if (body.max_participant === undefined || typeof body.max_participant !== 'number') errors.push('Max participants is required and must be a number.');
    if (body.usersId === undefined || !Array.isArray(body.usersId)) errors.push('UsersId is required and must be an array of numbers.');
    if (body.category_event && !Object.values(event_category_event).includes(body.category_event)) {
        errors.push(`Category event must be one of the following: ${Object.values(event_category_event).join(', ')}.`);
    }
    if (body.category_animal && !Object.values(event_category_animal).includes(body.category_animal)) {
        errors.push(`Category animal must be one of the following: ${Object.values(event_category_animal).join(', ')}.`);
    }

    if (errors.length > 0) throw new CustomError(400, `Validation Error: ${errors.join(' ')}`);
}

function validateUpdateEvent(body: PatchEventByIdBody): void {
    const errors: string[] = [];

    if (body.eventId !== undefined && typeof body.eventId !== 'number') errors.push('Event ID must be a number.');
    if (body.title !== undefined && typeof body.title !== 'string') errors.push('Title must be a string.');
    if (body.description !== undefined && typeof body.description !== 'string') errors.push('Description must be a string.');
    if (body.event_date !== undefined && isNaN(new Date(body.event_date).getTime())) errors.push('Event date must be a valid date.');
    if (body.location !== undefined && typeof body.location !== 'string') errors.push('Location must be a string.');
    if (body.max_participant !== undefined && typeof body.max_participant !== 'number') errors.push('Max participants must be a number.');
    if (body.category_event && !Object.values(event_category_event).includes(body.category_event)) {
        errors.push(`Category event must be one of the following: ${Object.values(event_category_event).join(', ')}.`);
    }
    if (body.category_animal && !Object.values(event_category_animal).includes(body.category_animal)) {
        errors.push(`Category animal must be one of the following: ${Object.values(event_category_animal).join(', ')}.`);
    }

    if (errors.length > 0) throw new CustomError(400, `Validation Error: ${errors.join(' ')}`);
}

function validateDeleteEvent(eventId: string): void {
    if (!eventId || isNaN(Number(eventId))) throw new CustomError(400, 'Event ID is required and must be a number.');
}

export class EventService implements IEventService {
    async getEvents(page: number, limit: number): Promise<any> {
        const url = new URL('/api/v1/events', window.location.origin);
        url.searchParams.append('page', page.toString());
        url.searchParams.append('limit', limit.toString());

        const response = await fetch(url.toString(), {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });

        const data = await response.json();
        if (!response.ok) {
            throw new CustomError(response.status, data.error || 'Something went wrong');
        }
        return data;
    }

    async getEventById(id: string): Promise<any> {
        const response = await fetch(`/api/v1/events/${id}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        const data = await response.json();
        if (!response.ok) {
            throw new CustomError(response.status, data.error || 'Something went wrong');
        }
        return data;
    }

    async deleteEventById(id: number): Promise<void> {
        validateDeleteEvent(id.toString());

        const response = await fetch(`/api/v1/events/${id}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });

        if (!response.ok) {
            const data = await response.text();
            if (data) {
                const error = JSON.parse(data);
                throw new CustomError(response.status, error.message || 'Something went wrong');
            } else {
                throw new CustomError(response.status, 'Something went wrong');
            }
        }
    }

    async patchEventById(id: string, body: PatchEventByIdBody): Promise<any> {
        body.eventId = Number(id);
        validateUpdateEvent(body);

        const response = await fetch(`/api/v1/events/${id}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify(body)
        });
        const data = await response.json();
        if (!response.ok) {
            throw new CustomError(response.status, data.error || 'Something went wrong');
        }
        return data;
    }

    async createEvent(body: CreateEventBody): Promise<any> {
        body.max_participant = Number(body.max_participant);
        validateCreateEvent(body);

        const response = await fetch(`/api/v1/events`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify(body)
        });
        const data = await response.json();
        if (!response.ok) {
            throw new CustomError(response.status, data.error || 'Something went wrong');
        }
        return data;
    }

    async getMyEvents(): Promise<any> {
        const response = await fetch('/api/v1/events/self', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });

        const data = await response.json();
        if (!response.ok) {
            throw new CustomError(response.status, data.error || 'Something went wrong');
        }
        return data;
    }

    async getEventParticipants(id: string): Promise<any> {
        validateDeleteEvent(id);

        const response = await fetch(`/api/v1/events/${id}/users`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });

        const data = await response.json();
        if (!response.ok) {
            throw new CustomError(response.status, data.error || 'Something went wrong');
        }
        return data;
    }

    async joinEvent(eventId: string): Promise<any> {
        validateDeleteEvent(eventId);

        const response = await fetch(`/api/v1/events/${eventId}/join`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        const data = await response.json();
        if (!response.ok) {
            throw new CustomError(response.status, data.error || 'Something went wrong');
        }
        return data;
    }

    async leaveEvent(eventId: string): Promise<any> {
        validateDeleteEvent(eventId);

        const response = await fetch(`/api/v1/events/${eventId}/leave`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });

        if (!response.ok) {
            const data = await response.text();
            let errorMessage = 'Something went wrong';

            try {
                const json = JSON.parse(data);
                errorMessage = json.error || errorMessage;
            } catch (e) {
                errorMessage = data || errorMessage;
            }

            throw new CustomError(response.status, errorMessage);
        }

        return {};
    }
}
