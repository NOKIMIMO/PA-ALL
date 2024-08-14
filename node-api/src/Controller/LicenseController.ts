import  {Request,Response,Router}  from 'express';
import { db } from '../database/db';
import {generateValidationErrorMessage} from '../common/generate-validation-msg';
import {authMiddleware} from '../common/middleware/auth-middleware';
import {accessMiddleware} from '../common/middleware/access-middleware';
import { listItemValidation } from '../Validators/commonValidator';
import { user_access_type } from '../common/enum/access-type';
import {validatorMiddleware} from '../common/middleware/validator-middleware'
import { CustomError } from '../common/error/customError';
import { JwtPayload } from 'jsonwebtoken';
import { createLicenseValidation } from '../Validators/licenseValidator';
import { LicenseUseCase } from '../domain/license-usecase';

const router = Router();

router.post('/',
authMiddleware,
validatorMiddleware(createLicenseValidation,'body'),
async (req: Request & { user?: JwtPayload }, res: Response): Promise<void> =>{
    const createPostRequest = req.body;
    try {
        const licenseUseCase = new LicenseUseCase(db);
        await licenseUseCase.createLicense(createPostRequest.stripe_id,req.user!.userId);
        res.status(201);
        res.json({message : 'License created successfully'});
    } catch (error) {
        console.log(error);
        res.status(500);
        res.json({ error: 'Internal error' });
    }
}
)


export default router;