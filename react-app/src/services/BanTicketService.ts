import { CustomError } from '../commons/Error';

class BanTicketService {

    async getBanTicketList(page: number, limit: number,active?:boolean): Promise<any> {
        const url = new URL('/api/v1/users/ban', window.location.origin);
        url.searchParams.append('page', page.toString());
        url.searchParams.append('limit', limit.toString());
        if(active){
            url.searchParams.append('active', active.toString());
        }
    
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
    async deleteBanTicketById(id: string): Promise<any> {
        const response = await fetch(`/api/v1/users/ban/${id}`, {
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
    async patchBanTicketById(id: string, data: any): Promise<any> {
        const response = await fetch(`/api/v1/users/ban/${id}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify(data)
        });
        const res = await response.json();
        if (!response.ok) {
            return new CustomError(response.status, data.error || 'Something went wrong');
        }
        return data;
    }
}

export default new BanTicketService();