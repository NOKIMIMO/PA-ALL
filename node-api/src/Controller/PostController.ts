import { UserUseCase } from './../domain/user-usecase';
import  {Request,Response,Router}  from 'express';
import { db } from '../database/db';
import {generateValidationErrorMessage} from '../common/generate-validation-msg';
import {authMiddleware} from '../common/middleware/auth-middleware';
import {accessMiddleware} from '../common/middleware/access-middleware';
import { User } from '../database/models/user';
import { listItemValidation } from '../Validators/commonValidator';
import { PostUseCase } from '../domain/post-usecase';
import { createPostValidation, selectPostValidation, updatePostValidation } from '../Validators/postValidator';
import commentRoute from './CommentController';
import { user_access_type } from '../common/enum/access-type';
import {validatorMiddleware} from '../common/middleware/validator-middleware'
import { CustomError } from '../common/error/customError';
import { JwtPayload } from 'jsonwebtoken';

const router = Router();
router.get('/',
validatorMiddleware(listItemValidation,'body'),
async (req: Request, res: Response): Promise<void> =>{
    const listItemRequest = req.body;
    try {
        const postUseCase = new PostUseCase(db);
        const listPole = await postUseCase.listPosts({ ...listItemRequest});
        res.status(200);
        res.json(listPole);
    } catch (error) {
        console.log(error);
        res.status(500);
        res.json({ error: 'Internal error' });
    }
})
router.get('/:postId',
validatorMiddleware(selectPostValidation,'params'),
async (req: Request, res: Response): Promise<void> =>{
    const getPostRequest = {...req.body,...req.params};
    try {
        const postUseCase = new PostUseCase(db);
        const post = await postUseCase.getPostById({...getPostRequest});
        if (!post) {
            res.status(404);
            res.json({ error: 'Post not found' });
            return;
        }
        res.status(200);
        res.json(post);
    } catch (error) {
        console.log(error);
        res.status(500);
        res.json({ error: 'Internal error' });
    }
})

router.post('/',
validatorMiddleware(createPostValidation,'body'),
authMiddleware,
async (req: Request & { user?: JwtPayload }, res: Response): Promise<void> =>{
    const createPostRequest = req.body;
    try {
        const postUseCase = new PostUseCase(db);
        const user = req.user as User;  
        const post = await postUseCase.createPost(createPostRequest,req.user?.userId!);
        res.status(200);
        res.json(post);
    } catch (error) {
        console.log(error);
        res.status(500);
        res.json({ error: 'Internal error' });
    }
})

router.patch('/:postId',
authMiddleware,
validatorMiddleware(selectPostValidation,'params'),
validatorMiddleware(updatePostValidation,'body'),
async (req: Request & { user?: JwtPayload }, res: Response): Promise<void> =>{
    const updatedPostRequest = req.body;
    try {
        const postUseCase = new PostUseCase(db);
        console.log(req)
        const post = await postUseCase.updatePost({...updatedPostRequest},req.user?.userId!);
        if (!post) {
            res.status(404);
            res.json({ error: 'Post not found' });
            return;
        }
        res.status(200);
        res.json(post);
    } catch (error) {
        if (error instanceof CustomError) {
            res.status(error.code);
            res.json({ error: error.message });
            return;
        }
        res.status(500);
        res.json({ error: 'Internal error' });
    }
})
router.delete('/:postId',
    authMiddleware,
    validatorMiddleware(selectPostValidation, 'params'),
    async (req: Request & { user?: JwtPayload }, res: Response): Promise<void> => {
        const { postId } = req.params; // Récupération du paramètre postId
        try {
            const postUseCase = new PostUseCase(db);
            await postUseCase.deletePost(parseInt(postId), req.user?.userId!);
            res.status(200).json({ message: 'Post deleted' });
        } catch (error) {
            if (error instanceof CustomError) {
                res.status(error.code).json({ error: error.message });
            } else {
                res.status(500).json({ error: 'Internal error' });
            }
        }
    });
    
router.use('/:postId/comment',validatorMiddleware(selectPostValidation,'params'),commentRoute);
export default router;
