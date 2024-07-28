import { Express,Response } from 'express';
import userRoutes from './UserController';
import authRoutes from './AuthController';
import eventRoutes from './EventController';
import postRoutes from './PostController';
import fileRoutes from './FileController';
import contactRoutes from './ContactController'; // Ajoutez cette ligne
import voteRoutes from './VoteController';
import { authMiddleware } from "../common/middleware/auth-middleware";
import { accessMiddleware } from "../common/middleware/access-middleware";
import { user_access_type } from "../common/enum/access-type";
import Stripe from "stripe";
import fs from 'fs';
// const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);


export const routes = (app: Express) => {
    app.get('/api/v1/health', async (req, res) => {
        res.send({ message: 'OK' });
    });

    app.get('/api/v1/health/access', authMiddleware, accessMiddleware(() => [user_access_type.SUPER_ADMIN]), async (req, res) => {
        res.send({ message: 'OK' });
    });

    app.get('/api/v1/health/check', authMiddleware, async (req, res) => {
        res.send({ message: 'OK' });
    });

    app.use('/api/v1/users', userRoutes);
    app.use('/api/v1/auth', authRoutes);
    app.use('/api/v1/events', eventRoutes);
    app.use('/api/v1/posts', postRoutes);
    app.use('/api/v1/files', fileRoutes);
    app.use('/api/v1/votes', voteRoutes); // Utilisez le contrôleur de votes

    app.use('/api/v1/contact', contactRoutes); // Ajoutez cette ligne
    app.post('/api/v1/create-checkout-session', async (req, res) => {
        try {
            const { amount } = req.body; // Récupérez le montant depuis la requête

            if (!amount || isNaN(amount) || amount <= 0) {
                return res.status(400).json({ error: 'Invalid amount' });
            }

            const { headers } = req;
            const origin = typeof headers.referer === 'string' ? new URL(headers.referer).origin : 'https://your_domain.com';

            const session = await stripe.checkout.sessions.create({
                payment_method_types: ['card'],
                line_items: [
                    {
                        price_data: {
                            currency: 'usd',
                            product_data: {
                                name: 'Donation',
                            },
                            unit_amount: amount * 100, // Amount in cents
                        },
                        quantity: 1,
                    },
                ],
                mode: 'payment',
                success_url: `${origin}/?success=true&session_id={CHECKOUT_SESSION_ID}`,
                cancel_url: `${origin}/?cancel=true&session_id={CHECKOUT_SESSION_ID}`,
            });

            res.json({ id: session.id });
        } catch (error) {
            console.error('Error creating checkout session:', error);
            res.status(500).json({ error: 'Failed to create checkout session' });
        }
    });
    app.get('/api/v1/checkout-session/:sessionId', async (req, res) => {
        const { sessionId } = req.params;

        try {
            const session = await stripe.checkout.sessions.retrieve(sessionId);
            res.json(session);
        } catch (error) {
            console.error('Error retrieving checkout session:', error);
            res.status(500).json({ error: 'Failed to retrieve checkout session' });
        }
    });
    // app.get('/api/v1/download', async (res: Response) => {
    //     console.log(Object.keys(res)); 
    //     const file = "../../test.txt";
    //     console.log(file);
    //     res.download(file, (err) => {
    //         if (err) {
    //             res.status(500).send('Error downloading file');
    //         }
    //     });
    // });

    // app.get('/api/v1/download', async (req, res) => {
    //     const file = fs.createWriteStream("README.md");

    //     res.pipe(file);

    //     file.on('finish', () => {
    //         file.close(() => {
    //             console.log('Download Completed');
    //             res.send('Download Completed');
    //         });
    //     });
    //     file.on('error', (err) => {
    //         fs.unlink("README.md", () => {}); // Delete the file async if there's an error
    //         console.error('File stream error:', err);
    //         res.status(500).send('File download error');
    //     });
    // });

    // app.get("/api/v1/download", function(response) {
    //     // const file = fs.createWriteStream(process.env.APP_STORAGE_PATH??'');
    //     const file = fs.createWriteStream("README.md");
    //     console.log(file);
    //     response.pipe(file);
     
    //     // after download completed close filestream
    //     file.on("finish", () => {
    //         file.close();
    //         console.log("Download Completed");
    //     });
    //  });
};
