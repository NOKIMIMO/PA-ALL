import { CustomError } from '../commons/Error';

export class LicenseService {
    static async createLicense(stripe_id: string): Promise<void> {
        const response = await fetch('/api/v1/licenses', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({ stripe_id })
        });
        const data = await response.json();
        if (!response.ok) {
            throw new CustomError(response.status, data.error || 'Something went wrong');
        }
        return data;
    }
}