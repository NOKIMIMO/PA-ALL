import { loadStripe } from '@stripe/stripe-js';
import { useEffect, useState } from 'react';
import { StripeService } from '../services/StripeService';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUB);

const StripeCheckoutButton = () => {
    const [sessionId, setSessionId] = useState<string>('');
    const [amount, setAmount] = useState<string>(''); // État pour le montant de la donation
    const [error, setError] = useState<string>('');

    useEffect(() => {
        const createCheckoutSession = async () => {
            // Convertir `amount` en nombre pour les vérifications
            const parsedAmount = parseFloat(amount);

            if (isNaN(parsedAmount) || parsedAmount <= 0) {
                setError('Please enter a valid amount');
                return;
            }
            try {
                const session = await StripeService.createCheckoutSession(parsedAmount);
                setSessionId(session.id);
                setError(''); // Réinitialisez l'erreur si la création réussit
            } catch (error) {
                console.error('Error creating checkout session:', error);
                setError('Error creating checkout session. Please try again.');
            }
        };

        if (amount) {
            createCheckoutSession();
        }
    }, [amount]);

    const handleClick = async () => {
        const stripe = await stripePromise;

        try {
            const { error } = await stripe!.redirectToCheckout({
                sessionId,
            });

            if (error) {
                console.error('Error redirecting to checkout:', error);
                // Handle error condition as needed
            }
        } catch (error) {
            console.error('Error redirecting to checkout:', error);
            // Handle error condition as needed
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-base-100">
            <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow-md">
                <h1 className="text-3xl font-bold mb-4">Make a Donation</h1>
                <p className="text-lg mb-4">Enter the amount you want to donate:</p>
                <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="border border-gray-300 p-2 mb-4 w-full"
                    placeholder="Amount in dollars"
                />
                {error && <p className="text-red-500 mb-4">{error}</p>}
                <button
                    onClick={handleClick}
                    className="btn btn-primary"
                    disabled={!sessionId}
                >
                    Donate
                </button>
            </div>
        </div>
    );
};

export default StripeCheckoutButton;
