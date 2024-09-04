import { CustomError } from '../commons/Error';


interface IUserService {
    getUserDataByToken(): Promise<any>;
    getUserList(page: number, limit: number): Promise<any>;
    getUserById(id: string): Promise<any>;
    deleteUserById(id: string): Promise<any>;
    patchUserById(id: string, body: any): Promise<any>;
}
interface BanUserBody {
    user_id: number;
    reason: string;
    message: string;
    end_date: string;
}

interface PatchUserByIdBody {
    id?: number;
    email?: string;
    password?: string;
    role?: string;
}

class UserService implements IUserService{

    async getAdminUserList(): Promise<any> {
        const response = await fetch('/api/v1/users?role=admin', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
        });
        const data = await response.json();
        if (!response.ok) {
            return new CustomError(response.status, data.error || 'Something went wrong');
        }
        return data

    }
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
        const formatedReturn ={
            id: data.user.id,
            email: data.user.email,
            role: data.user.role,
            firstname: data.user.firstname,
            lastname: data.user.lastname,
            createdAt: data.user.createdAt,
            active: data.user.active,
            license: data.user.license
        }
        return formatedReturn;
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
        
        const formatedReturn ={
            id: data.id,
            email: data.email,
            role: data.role,
            firstname: data.firstname,
            lastname: data.lastname,
            createdAt: data.createdAt,
            active: data.active,
            license : data.license,
        }
        return formatedReturn;
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

    async banUserById(id: string, bodyInput?: BanUserBody): Promise<any> {
        //default date is 30 days from now
        const body = bodyInput || {
            user_id: parseInt(id),
            reason: 'No reason provided',
            message: 'No message provided',
            end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        };
        const response = await fetch(`/api/v1/users/ban`, {
            method: 'POST',
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
    async unBanUserById(id: string): Promise<any> {
        const response = await fetch(`/api/v1/users/ban/user/${id}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
        });
        const data = await response.json();
        if (!response.ok) {
            return new CustomError(response.status, data.error || 'Something went wrong');
        }
        return data;
    }
    async unBanUserByTicketId(id: string): Promise<any> {
        const response = await fetch(`/api/v1/users/ban/${id}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
        });
        const data = await response.json();
        if (!response.ok) {
            return new CustomError(response.status, data.error || 'Something went wrong');
        }
        return data;
    }

}
export default new UserService();