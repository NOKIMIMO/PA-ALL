import { FaLock } from 'react-icons/fa';
import { Link } from 'react-router-dom';

export default function NotAuthorizedPage() {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-base-100 text-neutral">
            <FaLock className="text-6xl mb-4 text-warning" />
            <h1 className="text-4xl font-bold mb-2">403</h1>
            <p className="text-xl mb-4">You are not authorized to access this page.</p>
            <Link to="/" className="btn btn-primary">
                Go Back Home
            </Link>
        </div>
    );
}