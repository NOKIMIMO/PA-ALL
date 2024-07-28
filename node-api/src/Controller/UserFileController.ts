import {Request,Response,Router}  from 'express';
import { FileUseCase } from "../domain/file-usecase";
import { db } from "../database/db";
import { authMiddleware } from "../common/middleware/auth-middleware";
import { File } from "../database/models/file";
import { CustomError } from "../common/error/customError";
import { validatorMiddleware } from "../common/middleware/validator-middleware";
import multer from "multer";
import { JwtPayload } from 'jsonwebtoken';
import { createUserFileValidation } from "../Validators/userFileValidator";

const upload = multer({ dest: process.env.FILE_STORAGE_PATH });

const router = Router({ mergeParams: true });
//base param has user_id
router.get('/',
    authMiddleware,
    validatorMiddleware(createUserFileValidation, 'query'),
    async (req: Request & {user? : JwtPayload}, res: Response): Promise<void> => {
        const userId = parseInt(req.user?.userId!);
        const result = { pretty: req.query.pretty === 'true', ...req.query };
        try {
            const fileUseCase = new FileUseCase(db);
            const file = await fileUseCase.findFilesByUserId(userId,result);
            res.status(200);
            res.send(file);
        } catch (err) {
            if (err instanceof CustomError) {
                res.status(err.code).send(err.message);
            } else {
                res.status(500).send("Failed to find file");
            }
        }
    }
)


export default router;