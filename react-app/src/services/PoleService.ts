import { CustomError } from "../commons/Error";

export interface CreatePoleBody {
    title: string;
    description: string;
    data_pole: Record<string, number>;
    data_type_pole: string;
    data_access_type?: string;
}

export interface IPoleService {
    createPole(body: CreatePoleBody): Promise<any>;
    listPoles(filter: any): Promise<any>;
    getPoleById(poleId: number): Promise<any>;
    updatePole(poleId: number, body: Partial<CreatePoleBody>): Promise<any>;
    deletePole(poleId: number): Promise<any>;
}

export class PoleService implements IPoleService {
    async createPole(body: CreatePoleBody): Promise<any> {
        const response = await fetch('/api/v1/poles', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
            body: JSON.stringify(body),
        });
        const data = await response.json();
        if (!response.ok) {
            return new CustomError(response.status, data.error || 'Something went wrong');
        }
        return data;
    }

    async listPoles(): Promise<any> {
        const response = await fetch('/api/v1/poles', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
        });
        const data = await response.json();
        if (!response.ok) {
            return new CustomError(response.status, data.error || 'Something went wrong');
        }
        return data;
    }

    async getPoleById(poleId: number): Promise<any> {
        const response = await fetch(`/api/v1/poles/${poleId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
        });
        const data = await response.json();
        if (!response.ok) {
            return new CustomError(response.status, data.error || 'Something went wrong');
        }
        return data;
    }

    async updatePole(poleId: number, body: Partial<CreatePoleBody>): Promise<any> {
        const response = await fetch(`/api/v1/poles/${poleId}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
            body: JSON.stringify(body),
        });
        const data = await response.json();
        if (!response.ok) {
            return new CustomError(response.status, data.error || 'Something went wrong');
        }
        return data;
    }

    async deletePole(poleId: number): Promise<any> {
        const response = await fetch(`/api/v1/poles/${poleId}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
        });
        const data = await response.json();
        if (!response.ok) {
            return new CustomError(response.status, data.error || 'Something went wrong');
        }
        return data;
    }
}
