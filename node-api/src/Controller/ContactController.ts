import { Router, Request, Response } from 'express';
import { db } from '../database/db';
import { ContactUseCase } from '../domain/contact-usecase';
import { validatorMiddleware } from '../common/middleware/validator-middleware';
import { createContactValidation } from '../Validators/contactValidator';

const router = Router();

router.post('/',
    validatorMiddleware(createContactValidation, 'body'),
    async (req: Request, res: Response): Promise<void> => {
        const createContactRequest = req.body;
        try {
            const contactUseCase = new ContactUseCase(db);
            const contact = await contactUseCase.createContact(createContactRequest);
            res.status(201);
            res.json(contact);
        } catch (error) {
            console.log(error);
            res.status(500);
            res.json({ error: 'Internal error' });
        }
    }
);

router.get('/',
    async (req: Request, res: Response): Promise<void> => {
        try {
            const contactUseCase = new ContactUseCase(db);
            const contacts = await contactUseCase.listContacts();
            res.status(200);
            res.json(contacts);
        } catch (error) {
            console.log(error);
            res.status(500);
            res.json({ error: 'Internal error' });
        }
    }
);

export default router;
