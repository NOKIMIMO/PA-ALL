import  {Request,Response,Router}  from 'express';
import { db } from '../database/db';
import {generateValidationErrorMessage} from '../common/generate-validation-msg';
import {authMiddleware} from '../common/middleware/auth-middleware';
import {accessMiddleware} from '../common/middleware/access-middleware';
import { User } from '../database/models/user';
import { createCommentValidation, deleteCommentValidation, ListCommentValidation, selectCommentValidation, updateCommentValidation } from '../Validators/commentValidator';
import { CommentUseCase } from '../domain/comment-usecase';
import { user_access_type } from '../common/enum/access-type';
import { validatorMiddleware } from '../common/middleware/validator-middleware';
import { CustomError } from '../common/error/customError';
import { JwtPayload } from 'jsonwebtoken';
import { selectPostValidation } from '../Validators/postValidator';

const router = Router({mergeParams: true});
router.get('/',
    validatorMiddleware(ListCommentValidation, 'body'),
    async (req: Request, res: Response): Promise<void> => {
        const listItemRequest = { ...req.body, ...req.params };
        try {
            const commentUseCase = new CommentUseCase(db);
            const listComent = await commentUseCase.listCommentsOfPost({ ...listItemRequest });
            res.status(200);
            res.json(listComent);
        } catch (error) {
            console.log(error);
            res.status(500);
            res.json({ error: 'Internal error' });
        }
    }
);

router.get('/:parentId',
validatorMiddleware(selectCommentValidation,'params'),
validatorMiddleware(ListCommentValidation,'body'),
async (req: Request, res: Response): Promise<void> =>{
    const getCommentRequest = {...req.body,...req.params};
    try {
        const commentUseCase = new CommentUseCase(db);
        const comment = await commentUseCase.listCommentsOfComment({...getCommentRequest});
        if (!comment) {
            res.status(404);
            res.json({ error: 'Comment not found' });
            return;
        }
        res.status(200);
        res.json(comment);
    } catch (error) {
        console.log(error);
        res.status(500);
        res.json({ error: 'Internal error' });
    }
})
router.post('/',
    authMiddleware,
    validatorMiddleware(createCommentValidation,'body'),
    async (req: Request & { user?: JwtPayload }, res: Response): Promise<void> =>{
        const createCommentRequest = {...req.body,...req.params};
        try {
            const commentUseCase = new CommentUseCase(db);
            console.log("CREATE=")
            console.log(createCommentRequest)
            const comment = await commentUseCase.createComment({...createCommentRequest},req.user?.userId!);
            res.status(201);
            res.json(comment);
        } catch (error) {
            console.error('Error in POST /comments:', error); // Log more details
            res.status(500);
            res.json({ error: 'Internal error' });
        }
    });
    
router.patch('/:parentId',
validatorMiddleware(selectCommentValidation,'params'),
validatorMiddleware(updateCommentValidation,'body'),
authMiddleware,async (req: Request & { user?: JwtPayload }, res: Response): Promise<void> =>{
    const updateCommentRequest = {...req.body,...req.params};
    try {
        const commentUseCase = new CommentUseCase(db);
        const updatedComment = await commentUseCase.updateComment({...updateCommentRequest},req.user?.userId!);
        if (!updatedComment) {
            res.status(404);
            res.json({ error: 'Comment not found' });
            return;
        }
        res.status(200);
        res.json(updatedComment);
    } catch (error) {
        console.log(error);
        res.status(500);
        res.json({ error: 'Internal error' });
    }
})

router.delete('/:parentId',
    authMiddleware,
    validatorMiddleware(deleteCommentValidation, 'params'),
    async (req: Request & { user?: JwtPayload }, res: Response): Promise<void> => {
      console.log("premier");
      const deleteCommentRequest =  {...req.body, ...req.params};
      console.log("deleteCommentRequest");
      console.log(deleteCommentRequest);
      try {
          const commentUseCase = new CommentUseCase(db);
          const isDeleted = await commentUseCase.deleteComment({...deleteCommentRequest});
          if (!isDeleted) {
              res.status(404);
              res.json({ error: 'Comment not found' });
              return;
          }
          res.status(200);
          res.json({ message: 'Comment deleted' });
      } catch (error) {
          console.log(error);
          res.status(500);
          res.json({ error: 'Internal error' });
      }
  });
  

export default router;