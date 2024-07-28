import React from 'react';
import StripeCheckoutButton from '../components/Stripe';

const DonationPage = () => {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-base-100">
            <h1 className="text-3xl font-bold mb-4">Make a Donation</h1>
            <p className="text-lg mb-8">Thank you for your support! You can donate using the button below.</p>
            <StripeCheckoutButton />
        </div>
    );
};

export default DonationPage;
