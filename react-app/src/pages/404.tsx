import { FaExclamationTriangle } from 'react-icons/fa';
import StripeCheckoutButton from '../components/Stripe';

export default function NotFound() {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-base-100 text-neutral">
            <FaExclamationTriangle className="text-6xl mb-4" />
            <h1 className="text-4xl font-bold mb-2">404</h1>
            <p className="text-xl">Page Not Found</p>
            <StripeCheckoutButton />
        </div>
    );
}