import { loadStripe } from '@stripe/stripe-js';
import { useEffect, useState } from 'react';
import { StripeService } from '../services/StripeService';
import { useUser } from '../context/UserContext';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUB);

interface TierDataProps {
    id: string;
    price_id:string;
    name: string;
    price: number;
    description: string;
    features: string[];
    payment_mode: 'subscription' | 'payment';
}

const BuyLicenseCard = () => {
    const [tierData, setTierData] = useState<TierDataProps[]>([]);
    const [selectedTier, setSelectedTier] = useState<TierDataProps | null>(null);
    const [sessionId, setSessionId] = useState<string>('');
    const [error, setError] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(true);
    const {user} = useUser();

    useEffect(() => {
        const loadTierData = async () => {
            try {
                const tiers = await StripeService.getLicenses();
                console.log('Tiers:', tiers);
                setTierData(tiers);
                // Set default selected tier if there is data
                if (tiers.length > 0) {
                    setSelectedTier(tiers[0]);
                }
                setLoading(false);
            } catch (error) {
                console.error('Error fetching licenses:', error);
                setError('Failed to load license tiers.');
                setLoading(false);
            }
        };

        loadTierData();
    }, []);

    const handleTierSelection = async (tier: TierDataProps) => {
        console.log('Selected Tier:', tier);
        setSelectedTier(tier);
        if (tier.price > 0) {
            try {
                const session = await StripeService.createCheckoutSession(null,tier.price_id,tier.payment_mode,user?.email!);
                setSessionId(session.id);
                setError('');
            } catch (error) {
                console.error('Error creating checkout session:', error);
                setError('Error creating checkout session. Please try again.');
            }
        }
    };

    const handleClick = async () => {
        if (!selectedTier) return;

        const stripe = await stripePromise;

        if (selectedTier.price === 0) {
            // Handle free tier selection
            alert("You have selected the Free tier. Enjoy your access!");
            //change to toast + naviguate to homePage
            return;
        }

        try {
            const { error } = await stripe!.redirectToCheckout({
                sessionId,
            });

            if (error) {
                console.error('Error redirecting to checkout:', error);
                setError('Error redirecting to checkout. Please try again.');
            }
        } catch (error) {
            console.error('Error redirecting to checkout:', error);
            setError('Error redirecting to checkout. Please try again.');
        }
    };

    if (loading) {
        return (
            <div className="container mx-auto p-4 text-center">
                <p>Loading...</p>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-4">
            <div className="card shadow-lg p-6 bg-base-100">
                <h2 className="text-2xl font-bold mb-4">Choose Your License Tier</h2>

                {/* Tiers Selection */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    {tierData.map((tier, index) => (
                        <div key={index} className={`card p-4 mb-6 ${tier.price === 0 ? 'bg-green-100' : 'bg-base-200'}`}>
                            <h3 className="text-xl font-semibold mb-2">{tier.name}</h3>
                            <p className="text-lg font-bold mb-2">
                                {tier.price === 0 ? 'Free' : `$${tier.price.toFixed(2)}`}
                            </p>
                            <p className="mb-4">{tier.description}</p>
                            <ul className="list-disc pl-4 mb-4">
                                {tier.features.map((feature, i) => (
                                    <li key={i}>{feature}</li>
                                ))}
                            </ul>
                            <button 
                                className={`btn w-full ${selectedTier?.id === tier.id ? 'btn-success' : 'btn-primary'}`}
                                onClick={() => handleTierSelection(tier)}
                            >
                                Select {tier.name}
                            </button>
                        </div>
                    ))}
                </div>

                {/* Purchase Button */}
                {selectedTier && (
                    <div className="card bg-base-200 p-4 mb-6">
                        <h3 className="text-xl font-semibold mb-2">Selected Tier: {selectedTier.name}</h3>
                        <button 
                            className="btn btn-primary w-full" 
                            onClick={handleClick}
                        >
                            {selectedTier.price === 0 ? 'Confirm Free Tier' : `Buy ${selectedTier.name} for $${selectedTier.price.toFixed(2)}`}
                        </button>
                        {error && <p className="text-error mt-2">{error}</p>}
                    </div>
                )}

                {/* Disclaimer or Additional Info */}
                <div className="text-sm text-center">
                    <p className="text-gray-600">By selecting a tier, you agree to the terms and conditions of the membership.</p>
                </div>
            </div>
        </div>
    );
};

export default BuyLicenseCard;
