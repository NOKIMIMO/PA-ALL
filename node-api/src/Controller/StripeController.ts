import { Request, Response, Router } from 'express';
import { authMiddleware } from "../common/middleware/auth-middleware";
import { accessMiddleware } from "../common/middleware/access-middleware";
import { user_access_type } from "../common/enum/access-type";
import Stripe from "stripe";
import nodemailer from 'nodemailer';
import { Mailer } from '../common/mailer';
import { CustomError } from '../common/error/customError';
import bodyParser from 'body-parser';

interface MembershipResponse {
    id: string;
    price_id: string;
    name: string;
    price: number;
    description: string;
    features: string[];
}
const FreeTier: MembershipResponse = {
    id: 'free',
    price_id: 'free',
    name: 'Free',
    price: 0.00,
    description: 'User\'s Access to website',
    features: [
        'Limited access to events',
        'Access to community posts',
    ],
};

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

const router = Router();

router.get('/licenses',
    async (req: Request, res: Response): Promise<void> => {
        try {
            const productInfo = await stripe.prices.list({
                expand: ['data.product'],
            });

            const licenses: MembershipResponse[] = productInfo.data.map((prices) => {
                const product = prices.product as Stripe.Product; // Type assertion here

                return {
                    id: product.id,
                    price_id: prices.id,
                    name: product.name,
                    price: 0.01 * prices.unit_amount!,
                    description: product.description ? product.description : '',
                    features: product.marketing_features.map((feature) => feature.name || ''), // Assuming features come from marketing_features
                };
            });


            licenses.unshift(FreeTier);
            res.json(licenses);
        } catch (error) {
            console.error('Error fetching licenses:', error);
            res.status(500).json({ error: 'Failed to fetch licenses' });
        }
    });

router.post('/webhook', bodyParser.raw({ type: 'application/json' }), async (req, res) => {
    const sig = req.headers['stripe-signature'];

    let event: Stripe.Event;

    try {
        event = stripe.webhooks.constructEvent(req.body, sig!, endpointSecret!);
    } catch (err) {
        console.error(`Webhook signature verification failed:`, (err as Error).message);
        return res.status(400).send(`Webhook Error: ${(err as Error).message}`);
    }

    // Handle the event
    switch (event.type) {
        case 'checkout.session.completed':
            const session = event.data.object as Stripe.Checkout.Session;
            console.log(`Checkout session completed for session ID: ${session.id}`);
            // You can now update your database to mark the transaction as successful
            break;
        case 'invoice.payment_succeeded':
            const invoice = event.data.object as Stripe.Invoice;
            console.log(`Invoice payment succeeded for invoice ID: ${invoice.id}`);
            // Handle successful payment (e.g., provision access to the service)
            break;
        case 'payment_intent.succeeded':
            const paymentIntent = event.data.object as Stripe.PaymentIntent;
            console.log(`Payment succeeded for PaymentIntent ID: ${paymentIntent.id}`);
            // Handle successful payment (e.g., provision access to the service)
            break;
        // Handle other event types as needed
        default:
            console.log(`Unhandled event type ${event.type}`);
    }

    // Return a response to acknowledge receipt of the event
    res.json({ received: true });
});

router.post('/create-checkout-session', async (req, res) => {
    try {
        const { id } = req.body; // Récupérez l'id depuis la requête

        if (!id) {
            return res.status(400).json({ error: 'Invalid id' });
        }

        // Récupérez le montant de la licence
        const { headers } = req;
        const origin = typeof headers.referer === 'string' ? new URL(headers.referer).origin : 'http://localhost:5173';

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [
                {
                    price: id,
                    quantity: 1,
                },
            ],
            mode: 'subscription',
            success_url: `${origin}/payment-redirect?success=true&session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${origin}/payment-redirect?cancel=true`,
        });
        res.json({ id: session.id });
    } catch (error) {
        console.error('Error creating checkout session:', error);
        res.status(500).json({ error: 'Failed to create checkout session' });
    }
});
router.get('/checkout-session/:sessionId', async (req, res) => {
    const { sessionId } = req.params;

    try {
        const session = await stripe.checkout.sessions.retrieve(sessionId);
        res.json(session);
    } catch (error) {
        console.error('Error retrieving checkout session:', error);
        res.status(500).json({ error: 'Failed to retrieve checkout session' });
    }
});
export default router;