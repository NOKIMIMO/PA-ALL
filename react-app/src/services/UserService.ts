import { CustomError } from '../commons/Error';


interface IUserService {
    getUserDataByToken(): Promise<any>;
    getUserList(page: number, limit: number): Promise<any>;
    getUserById(id: string): Promise<any>;
    deleteUserById(id: string): Promise<any>;
    patchUserById(id: string, body: any): Promise<any>;
}

interface PatchUserByIdBody {
    id?: number;
    email?: string;
    password?: string;
    role?: string;
}

class UserService implements IUserService{
    async getUserDataByToken(): Promise<any> {
        const response = await fetch('/api/v1/users/self', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        const data = await response.json();
        if (!response.ok) {
            return new CustomError(response.status, data.error || 'Something went wrong');
        }
        // console.log(data)
        return data;
    }
    async getUserList(page: number, limit: number): Promise<any> {
        const url = new URL('/api/v1/users', window.location.origin);
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
            return new CustomError(response.status, data.error || 'Something went wrong');
        }
        return data;
    }
    async getUserById(id: string): Promise<any> {
        const response = await fetch(`/api/v1/users/${id}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        const data = await response.json();
        if (!response.ok) {
            return new CustomError(response.status, data.error || 'Something went wrong');
        }
        return data;
    }
    async deleteUserById(id: string): Promise<any> {
        const response = await fetch(`/api/v1/users/${id}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        const data = await response.json();
        if (!response.ok) {
            return new CustomError(response.status, data.error || 'Something went wrong');
        }
        return data;
    }
    async patchUserById(id: string, body: PatchUserByIdBody): Promise<any> {
        const response = await fetch(`/api/v1/users/${id}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify(body)
        });
        const data = await response.json();
        if (!response.ok) {
            return new CustomError(response.status, data.error || 'Something went wrong');
        }
        return data;
    }
}
export default new UserService();