import { CustomError } from '../commons/Error';

export interface Message {
    id: string;
    name: string;
    email: string;
    message: string;
    createdAt: string;
}

class MessageService {
    async getMessages(): Promise<Message[] | CustomError> {
        try {
            const response = await fetch('/api/v1/contact', {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' },
            });
            const data = await response.json();

            if (!response.ok) {
                return new CustomError(response.status, data.error || 'Something went wrong');
            }
            return data as Message[];
        } catch (error) {
            return new CustomError(500, 'Network error or server not reachable');
        }
    }
}

export default new MessageService();
