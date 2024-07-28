import { Request, Response, Router } from 'express';
import { createUserValidation,LoginUserValidation } from '../Validators/userValidator';
import {generateValidationErrorMessage} from '../common/generate-validation-msg';
import { db } from '../database/db';
import { compare, hash } from 'bcrypt';
import { QueryFailedError} from 'typeorm';
import { JwtPayload, sign } from "jsonwebtoken";
import { logger } from '../common/logger';
import { Token } from '../database/models/token';
import { UserUseCase} from '../domain/user-usecase';
import { authMiddleware } from '../common/middleware/auth-middleware';
import { User } from '../database/models/user';
import { validatorMiddleware } from '../common/middleware/validator-middleware';

const router = Router();
router.post('/signup', 
validatorMiddleware(createUserValidation,'body'),
async (req: Request, res: Response) => {

    try {
        const createUserRequest = req.body
        const hashedPassword = await hash(createUserRequest.password, 10);
        const UserUsecase = new UserUseCase(db);
        const user = await UserUsecase.createUser(createUserRequest.email,hashedPassword);
        
        const secret = process.env.JWT_SECRET ?? ""
        const token = sign({ userId: user.id, email: user.email }, secret, { expiresIn: '1d' });
        await db.getRepository(Token).save({ token: token, user: user })
        res.status(200).json({ token });
    } catch (error) {
        if (error instanceof QueryFailedError) {
            if (error.driverError['code'] === '23505') {
                res.status(400).send({ "error": "email already exists" });
            }
        } else {
            logger.error(error);
            res.status(500).send({ "error": "internal error retry later" });
        }
    }
})

router.post('/login', 
validatorMiddleware(LoginUserValidation,'body'),
async (req: Request, res: Response) => {
    try {
        const loginUserRequest = req.body
        const UserUsecase = new UserUseCase(db);
        const user = await UserUsecase.logUser(loginUserRequest.email,loginUserRequest.password);
        // valid user exist + correct pwd 
        if (!user) {
            res.status(400).send({ error: "username or password not valid" })
            return
        }
        if (user.active === false) {
            res.status(400).send({ error: "user was deleted" })
            return
        }
        const secret = process.env.JWT_SECRET ?? ""
        const token = sign({ userId: user.id, email: user.email }, secret, { expiresIn: '1d' });
        await db.getRepository(Token).save({ token: token, user: user })
        res.status(200).json({ token });
    } catch (error) {
        console.log(error)
        res.status(500).send({ "error": "internal error retry later" })
        return
    }
})

router.post('/logout',authMiddleware, async (req: Request & { user?: JwtPayload }, res: Response) => {
    if (!req.user) {
        res.status(400);
        res.json({ error: 'User not valid  ' });
        return;
    }
    try {
        console.log(req.user)
        const tokenRepo = db.getRepository(Token)
        const token = req.headers['authorization']?.split(' ')[1]
        console.log(token)
        if (!token) {
            res.status(400).send ({error: "token not found, erreur étrange"})
            return
        }
        await tokenRepo.delete({ token: token , user: {id: req.user.userId}})
        res.status(200).send({ message: "logout success" })
    } catch (error) {
        console.log(error)
        res.status(500).send({ "error": "internal error retry later" })
        return
    }
})


export default router;