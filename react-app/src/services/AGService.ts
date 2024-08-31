import { ag_category } from "../enum/ag-category";
import { CustomError } from "../commons/Error";

const BASE_URL = '/api/v1/ag';

interface IAgService {
    createAg(createAgRequest: any): Promise<any>;
    listAgs(listItemRequest: any): Promise<any>;
    listAgsManaged(listItemRequest: any): Promise<any>;
    listAgsManagedByUser(userId: number, listItemRequest: any): Promise<any>;
    listAgsAssignedToUser(userId: number): Promise<any>;
    listAgsAssignedToSelf(): Promise<any>;
    listAgsJoined(): Promise<any>;
    getAgById(agId: number): Promise<any>;
    deleteAg(agId: number): Promise<void>;
    updateAg(agId: number, updateAgRequest: any): Promise<any>;
    getAgManager(agId: number): Promise<any>;
    answerAg(agId: number): Promise<any>;
    joinAg(agId: number): Promise<any>;
    addUsersToAg(agId: number, userIds: number[]): Promise<any>;
    leaveAg(agId: number): Promise<any>;
    removeUsersFromAg(agId: number, userIds: number[]): Promise<any>;
}

interface CreateAgRequest {
    title: string;
    description: string;
    ag_date: string;
    location: string;
    minimum_participants: number;
    category?: ag_category;
    vote_id?: number;
    ban_appeal_id?: number;
}

interface UpdateAgRequest {
    title?: string;
    description?: string;
    ag_date?: string;
    location?: string;
    minimum_participants?: number;
    category?: ag_category;
}


class AgService implements IAgService {
    // Helper method to handle the response
    private async handleResponse(response: Response) {
        if (!response.ok) {
            const errorMessage = await response.text();
            throw new CustomError(response.status,errorMessage || 'Something went wrong');
        }
        return response.json();
    }

    // Create a new AG
    async createAg(createAgRequest: CreateAgRequest) {
        const response = await fetch(`${BASE_URL}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.getToken()}`
            },
            body: JSON.stringify(createAgRequest)
        });
        return this.handleResponse(response);
    }

    // List all AGs
    async listAgs(listItemRequest: any) {
        const url = new URL(`${BASE_URL}`, window.location.origin);
        url.searchParams.append('page', listItemRequest.page.toString());
        url.searchParams.append('limit', listItemRequest.limit.toString());
        const response = await fetch(url.toString(), {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.getToken()}`
            },
        });
        return this.handleResponse(response);
    }

    // List AGs managed by the current user
    async listAgsManaged(listItemRequest: any) {
        const response = await fetch(`${BASE_URL}/managed`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.getToken()}`
            },
            body: JSON.stringify(listItemRequest)
        });
        return this.handleResponse(response);
    }

    // List AGs managed by a specific user
    async listAgsManagedByUser(userId: number, listItemRequest: any) {
        const response = await fetch(`${BASE_URL}/user/${userId}/managed`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.getToken()}`
            },
            body: JSON.stringify(listItemRequest)
        });
        return this.handleResponse(response);
    }

    // List AGs where tasks are assigned to a specific user
    async listAgsAssignedToUser(userId: number) {
        const response = await fetch(`${BASE_URL}/user/${userId}/assigned`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${this.getToken()}`
            }
        });
        return this.handleResponse(response);
    }

    // List AGs where tasks are assigned to the current user
    async listAgsAssignedToSelf() {
        const response = await fetch(`${BASE_URL}/self/assigned`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${this.getToken()}`
            }
        });
        return this.handleResponse(response);
    }

    async getAgParticipants(id: number): Promise<any> {
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

    // List AGs where the current user has joined
    async listAgsJoined() {
        const response = await fetch(`${BASE_URL}/joined`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${this.getToken()}`
            }
        });
        return this.handleResponse(response);
    }

    // Get AG by ID
    async getAgById(agId: number) {
        const response = await fetch(`${BASE_URL}/${agId}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${this.getToken()}`
            }
        });
        return this.handleResponse(response);
    }

    // Delete AG
    async deleteAg(agId: number) {
        const response = await fetch(`${BASE_URL}/${agId}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.getToken()}`
            }
        });
        return this.handleResponse(response);
    }

    // Update AG
    async updateAg(agId: number, updateAgRequest: UpdateAgRequest) {
        const response = await fetch(`${BASE_URL}/${agId}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.getToken()}`
            },
            body: JSON.stringify(updateAgRequest)
        });
        return this.handleResponse(response);
    }

    // Get AG Manager
    async getAgManager(agId: number) {
        const response = await fetch(`${BASE_URL}/${agId}/manager`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${this.getToken()}`
            }
        });
        return this.handleResponse(response);
    }

    // Answer AG
    async answerAg(agId: number) {
        const response = await fetch(`${BASE_URL}/${agId}/answer`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${this.getToken()}`
            }
        });
        return this.handleResponse(response);
    }

    // Join AG
    async joinAg(agId: number) {
        const response = await fetch(`${BASE_URL}/${agId}/join`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${this.getToken()}`
            }
        });
        return this.handleResponse(response);
    }

    // Add users to AG
    async addUsersToAg(agId: number, userIds: number[]) {
        const response = await fetch(`${BASE_URL}/${agId}/add`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.getToken()}`
            },
            body: JSON.stringify(userIds)
        });
        return this.handleResponse(response);
    }

    // Leave AG
    async leaveAg(agId: number) {
        const response = await fetch(`${BASE_URL}/${agId}/leave`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${this.getToken()}`
            }
        });
        return this.handleResponse(response);
    }

    // Remove users from AG
    async removeUsersFromAg(agId: number, userIds: number[]) {
        const response = await fetch(`${BASE_URL}/${agId}/remove`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.getToken()}`
            },
            body: JSON.stringify(userIds)
        });
        return this.handleResponse(response);
    }

    private getToken() {
        return localStorage.getItem('token') || '';
    }
}

export default new AgService();
