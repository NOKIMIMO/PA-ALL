import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { StripeService } from '../services/StripeService';
import { LicenseService } from '../services/LicenseService';

const PaymentRedirectPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [status, setStatus] = useState<'success' | 'cancel' | 'error' | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [isProduct, setIsProduct] = useState<boolean>(false);

    useEffect(() => {
        const searchParams = new URLSearchParams(location.search);
        const type = searchParams.get('type');
        const sessionId = searchParams.get('session_id');
        const isSuccess = searchParams.get('success') === 'true';
        const isCancel = searchParams.get('cancel') === 'true';
        if (sessionId && isSuccess) {
            StripeService.getSession(sessionId)
                .then(async (session) => {
                    if (session.payment_status === 'paid') {
                        if (type === 'donation') {
                            // Handle donation
                            console.log('Donation successful:', session);
                            setStatus('success');
                            setIsProduct(false);
                        } else if (type === 'product') {
                            try {
                                const data = await LicenseService.createLicense(sessionId);
                                setStatus('success');
                                setIsProduct(true);
                            } catch (error) {
                                console.error('Error creating license:', error);
                                setStatus('error');
                            }
                        }
                    } else {
                        setStatus('error');
                    }
                    setLoading(false);
                })
                .catch(() => {
                    setStatus('error');
                    setLoading(false);
                });
        } else if (isCancel) {
            setStatus('cancel');
            setLoading(false);
        } else {
            setStatus('error');
            setLoading(false);
        }
    }, [location]);

    const handleRedirect = () => {
        navigate('/');
    };

    if (loading) {
        return (
            <div className="container mx-auto p-4 text-center">
                <p>Processing your payment...</p>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-4 text-center">
            {status === 'success' && isProduct === true && (
                <div>
                    <h1>Payment Successful!</h1>
                    <p>Your subscription is now active. Thank you!</p>
                    <button className="btn btn-primary" onClick={handleRedirect}>
                        Go to Home
                    </button>
                </div>
            )}
            {status === 'success' && isProduct === false && (
                <div>
                    <h1>Payment Successful!</h1>
                    <p>Your Donation was completed. Thank you!</p>
                    <button className="btn btn-primary" onClick={handleRedirect}>
                        Go to Home
                    </button>
                </div>
            )}
            {status === 'cancel' && (
                <div>
                    <h1>Payment Canceled</h1>
                    <p>Your payment was canceled. No charges were made.</p>
                    <button className="btn btn-primary" onClick={handleRedirect}>
                        Go to Home
                    </button>
                </div>
            )}
            {status === 'error' && (
                <div>
                    <h1>Payment Error</h1>
                    <p>There was an issue processing your payment. Please try again.</p>
                    <button className="btn btn-primary" onClick={handleRedirect}>
                        Go to Home
                    </button>
                </div>
            )}
        </div>
    );
};

export default PaymentRedirectPage;
