
import { Request, Response, Router } from 'express';
import { generateValidationErrorMessage } from '../common/generate-validation-msg';
import { db } from '../database/db';
import { authMiddleware } from '../common/middleware/auth-middleware';
import { accessMiddleware } from '../common/middleware/access-middleware';
import { user_access_type } from '../common/enum/access-type';
import { validatorMiddleware } from '../common/middleware/validator-middleware';
import { JwtPayload } from 'jsonwebtoken';
import { CustomError } from '../common/error/customError';
import { themeRequestValidation } from '../Validators/commonValidator';
import { CommonUseCase } from '../domain/common-usecase';


const router = Router();

router.post('/themes/download',
    validatorMiddleware(themeRequestValidation, 'body'),
    async (req: Request, res: Response): Promise<void> => {
        try {
            const commonUseCase = new CommonUseCase(db);
            const { theme } = req.body;
            const result  = await commonUseCase.downloadThemeFile(theme);
            res.setHeader('Content-Disposition', `attachment; filename=${theme}.css`);
            res.setHeader('Content-Type', 'text/css');
            res.status(200);
            res.send(result);
            
        } catch (error) {
            res.status(500);
            res.json({ error: 'Internal error' });
        }
    })
export default router;