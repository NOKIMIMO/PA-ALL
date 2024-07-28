import { CustomError } from "../commons/Error";

interface IEventService {
    getEvents(page: number, limit: number): Promise<any>;
    getEventById(id: string): Promise<any>;
    deleteEventById(id: string): Promise<void>;
    patchEventById(id: string, body: PatchEventByIdBody): Promise<any>;
    createEvent(body: CreateEventBody): Promise<any>;
}

interface PatchEventByIdBody {
    title?: string;
    description?: string;
    event_date?: string;
    location?: string;
    eventId?: number;
}

interface CreateEventBody {
    title: string;
    description: string;
    event_date: string;
    location: string;
    isAG: boolean;
    usersId: [];
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

    async deleteEventById(id: string): Promise<void> {
        const response = await fetch(`/api/v1/events/${id}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });

        // Check if the response is not ok and throw error if necessary
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

    async getEventParticipants(id: string): Promise<any> {
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

    async patchEventById(id: string, body: PatchEventByIdBody): Promise<any> {
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
        console.log('Creating event with body:', body);
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
    
    async joinEvent(eventId: string): Promise<any> {
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
        const response = await fetch(`/api/v1/events/${eventId}/leave`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
    
        // Vérifiez la réponse
        if (!response.ok) {
            const data = await response.text();  // Lire la réponse en tant que texte
            let errorMessage = 'Something went wrong';
    
            try {
                // Essayez de parser la réponse JSON si possible
                const json = JSON.parse(data);
                errorMessage = json.error || errorMessage;
            } catch (e) {
                // Si la réponse n'est pas JSON, utilisez le message par défaut
                errorMessage = data || errorMessage;
            }
    
            throw new CustomError(response.status, errorMessage);
        }
    
        // Si la réponse est correcte mais vide, renvoyez un message de succès vide
        return {};
    }
    
    
    
}
