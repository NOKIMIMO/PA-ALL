import { Express,Response } from 'express';
import userRoutes from './UserController';
import authRoutes from './AuthController';
import eventRoutes from './EventController';
import postRoutes from './PostController';
import fileRoutes from './FileController';
import contactRoutes from './ContactController'; // Ajoutez cette ligne
import voteRoutes from './VoteController';
import AgController from './AgController';
import AgTaskController from './AgTaskController';
import TaskController from './TaskController';
import CommonController from './CommonController';
import { authMiddleware } from "../common/middleware/auth-middleware";
import { accessMiddleware } from "../common/middleware/access-middleware";
import { user_access_type } from "../common/enum/access-type";
import Stripe from "stripe";
import nodemailer from 'nodemailer';
import { Mailer } from '../common/mailer';
import { CustomError } from '../common/error/customError';

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

    app.use('/api/v1/commons', CommonController);

    app.use('/api/v1/users', userRoutes);
    app.use('/api/v1/auth', authRoutes);
    app.use('/api/v1/events',
        authMiddleware,
        accessMiddleware(() => [user_access_type.SUPER_ADMIN,user_access_type.ADMIN,user_access_type.EMPLOYEE,user_access_type.LICENSED]),
         eventRoutes);
    app.use('/api/v1/posts', postRoutes);
    app.use('/api/v1/files', fileRoutes);
    app.use('/api/v1/votes', voteRoutes); // Utilisez le contrôleur de votes
    app.use('/api/v1/ag',
        authMiddleware,
        accessMiddleware(() => [user_access_type.SUPER_ADMIN,user_access_type.ADMIN,user_access_type.EMPLOYEE]),
         AgController);
    app.use('/api/v1/ag-tasks',
        authMiddleware,
        accessMiddleware(() => [user_access_type.SUPER_ADMIN,user_access_type.ADMIN,user_access_type.EMPLOYEE]),
         AgTaskController);
    app.use('/api/v1/tasks',
        authMiddleware,
        accessMiddleware(() => [user_access_type.SUPER_ADMIN,user_access_type.ADMIN,user_access_type.EMPLOYEE]),
        TaskController);
    app.use('/api/v1/contact', contactRoutes); // Ajoutez cette ligne
    app.post('/api/v1/create-checkout-session', async (req, res) => {
        try {
            const { amount } = req.body; // Récupérez le montant depuis la requête

            if (!amount || isNaN(amount) || amount <= 0) {
                return res.status(400).json({ error: 'Invalid amount' });
            }

            const { headers } = req;
            const origin = typeof headers.referer === 'string' ? new URL(headers.referer).origin : 'http://localhost:5173';

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
    app.post('/api/v1/send-email', async (req, res) => {
        const mailer = new Mailer();

        try{
            mailer.sendMail(req.body.to,req.body.subject,req.body.text)
            res.status(200).send('Email sent successfully!');
        }catch(e){
            if (e instanceof CustomError) {
                const customError = e as CustomError;
                res.status(customError.code).send({error: customError.message, "details": customError.additionalInfo});
            } else {
                console.error('Error sending email:', e);
                res.status(500).send('Error sending email');
            }
        }

        const { to, subject, text } = req.body;
    
        if (!to || !subject || !text) {
            return res.status(400).send('Please provide to, subject and text fields');
        }
    
        // Nodemailer transporter configuration
        let transporter = nodemailer.createTransport({
            service: 'gmail', // Use your email service provider here
            auth: {
                user: process.env.EMAIL, // Your email address
                pass: process.env.EMAIL_PASSWORD, // Your email password or app-specific password
            },
        });
    
        try {
            // Send mail with defined transport object
            await transporter.sendMail({
                from: `"Your Name" <${process.env.EMAIL}>`, // Sender address
                to, // List of receivers
                subject, // Subject line
                text, // Plain text body
            });
    
            res.status(200).send('Email sent successfully!');
        } catch (error) {
            console.error('Error sending email:', error);
            res.status(500).send('Error sending email');
        }
    });
};
