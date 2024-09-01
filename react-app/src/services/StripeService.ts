import { CustomError } from '../commons/Error';

export class StripeService {
    static async createCheckoutSession(amount: number | null, priceId: string | null, mode: string, email: string) {
        const response = await fetch('/api/v1/payment/create-checkout-session', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                amount: amount, // Send the amount to the server
                id: priceId, // Send the priceId to the server
                mode: mode,
                email: email
            }),
        });

        if (!response.ok) {
            throw new Error('Failed to create checkout session');
        }
        return await response.json();
    }

    static async getLicenses(){
        const response = await fetch('/api/v1/payment/licenses', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        });

        if (!response.ok) {
            throw new CustomError(response.status, 'Failed to fetch licenses');
        }
        return await response.json();
    }

    static async getSession(sessionId: string) {
        const response = await fetch(`/api/v1/payment/checkout-session/${sessionId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        });

        if (!response.ok) {
            throw new CustomError(response.status, 'Failed to fetch session');
        }
        return await response.json();
    }

}