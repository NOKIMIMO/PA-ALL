import {Request,Response,Router}  from 'express';
import { FileUseCase } from "../domain/file-usecase";
import { db } from "../database/db";
import { authMiddleware } from "../common/middleware/auth-middleware";
import { File } from "../database/models/file";
import fs from 'fs';
import { CustomError } from "../common/error/customError";
import { validatorMiddleware } from "../common/middleware/validator-middleware";
import { createFileValidation, updateFileValidation } from "../Validators/fileValidator";
import multer from "multer";
import { JwtPayload } from 'jsonwebtoken';
import path from 'path';
import { downloadFileValidation} from "../Validators/fileValidator";
import { saveToTemporaryFile } from "../common/file/fileDLHandler";
import { readFile } from 'fs/promises';



const upload = multer({ dest: process.env.FILE_STORAGE_PATH });

const router = Router();
router.get('/update/app',
    async (req: Request, res: Response): Promise<void> => {
        try {
            const filePath = path.resolve(process.env.APP_STORAGE_PATH??'');
            
            res.download(filePath, process.env.APP_STORAGE_PATH??'', (err) => {
                if (err) {
                    console.error("Failed to download file:", err);
                    res.status(500).send({ error: "Failed to download file" });
                }
            });
            return ;
        } catch (err) {
            if (err instanceof CustomError) {
                res.status(err.code).send(err.message);
            } else {
                res.status(500).send({ error: "Failed to update files" });
            }
        }
    }
);
router.post('/',
    authMiddleware,
    upload.single('file'),
    validatorMiddleware(createFileValidation, 'body'),
    async (req: Request & {user?:JwtPayload}, res:Response): Promise<void> => {
        if (!req.file && req.body.type !== 'folder') {
            res.status(400).send("File is required");
            return;
        }
        const createFileRequest = {...req.body, ...req.file};
        if (createFileRequest.encrypted ===true && !createFileRequest.masterPassword) {
            res.status(400).send("Master password is required to encrypt file");
            return;
        }
        try {
            const fileUseCase = new FileUseCase(db);
            const createdFile = await fileUseCase.createFile(createFileRequest, req.user?.userId!);
            res.status(201);
            res.send(createdFile);
        } catch (err) {
            // delete file created and throw error
            if (req.file?.path) {
                fs.unlink(req.file.path, (unlinkErr) => {
                    if (unlinkErr) {
                        console.error('Failed to delete file:', unlinkErr);
                    }
                });
            }
            if (err instanceof CustomError) {
                console.log(err)
                res.status(err.code).send({error : err.message});
            } else {
                console.log(err)
                res.status(500).send({error:"Failed to create file"});
            }
        }
    }
);
router.get('/:fileId',
    authMiddleware,
    async (req: Request, res: Response): Promise<void> => {
        const fileId = parseInt(req.params.fileId);
        try {
            const fileUseCase = new FileUseCase(db);
            const file = await fileUseCase.findFileById(fileId);
            if (!file ) {
                throw new CustomError(404, "File not found");
            }
            res.status(200);
            res.send(file);
        } catch (err) {
            if (err instanceof CustomError) {
                res.status(err.code).send(err.message);
            } else {
                res.status(500).send({error:"Failed to find file"});
            }
        }
    }
)
router.get('/preview/:fileId', async (req: Request, res: Response): Promise<void> => {
    const fileId = parseInt(req.params.fileId);
    try {
        const fileUseCase = new FileUseCase(db);
        const file = await fileUseCase.findFileById(fileId);
        
        if (!file || !file.path) {
            throw new CustomError(404, "File not found");
        }
        
        const filePath = path.resolve(file.path);
        const ext = path.extname(filePath).toLowerCase();
        
        let mimeType = 'application/octet-stream'; // default mime type

        switch (ext) {
            case '.pdf':
                mimeType = 'application/pdf';
                break;
            case '.txt':
                mimeType = 'text/plain';
                break;
            case '.png':
                mimeType = 'image/png';
                break;
            case '.jpg':
            case '.jpeg':
                mimeType = 'image/jpeg';
                break;
        }

        // Read the file into a buffer
        const fileBuffer = await readFile(filePath);

        // Set response headers
        res.setHeader('Content-Type', mimeType);
        res.setHeader('Content-Length', fileBuffer.length);

        // Send the buffer
        res.send(fileBuffer);
    } catch (err) {
        if (err instanceof CustomError) {
            res.status(err.code).send(err.message);
        } else {
            res.status(500).send({ error: "Failed to serve file" });
        }
    }
});

router.delete('/:fileId',
    authMiddleware,
    async (req: Request, res: Response): Promise<void> => {
        const fileId = parseInt(req.params.fileId);
        try {
            const fileUseCase = new FileUseCase(db);
            await fileUseCase.deleteFile(fileId);
            res.status(204);
            res.send();
        } catch (err) {
            if (err instanceof CustomError) {
                res.status(err.code).send(err.message);
            } else {
                res.status(500).send({error:"Failed to delete file"});
            }
        }
    }
)
router.post('/download/:fileId',
    authMiddleware,
    validatorMiddleware(downloadFileValidation, 'body'),
    async (req: Request, res: Response): Promise<void> => {

        const fileId = parseInt(req.params.fileId);
        const masterPassword = req.body.masterPassword;
        try {
            const fileUseCase = new FileUseCase(db);
            const file = await fileUseCase.findFileById(fileId);
            
            if (!file || !file.path) {
                throw new CustomError(404,"File not found");
            }
            if (file.isEncrypted && !masterPassword) {
                throw new CustomError(400,"Master password is required to download the file");
            }
            if (file.isEncrypted) {
                const decryptedFile= await fileUseCase.decryptFile(file, masterPassword); // decrypted file is to string 
                console.log("data decrypted")
                console.log(decryptedFile)
                const tempFilePath = saveToTemporaryFile(decryptedFile, file.name);
                
                res.download(tempFilePath, file.name, (err) => {
                    if (err) {
                        console.error("Failed to download file:", err);
                        res.status(500).send({ error: "Failed to download file" });
                    } else {
                        fs.unlinkSync(tempFilePath); // Optionally delete the temporary file after download
                    }
                });
                return;
            }
            const filePath = path.resolve(file.path);
            
            res.download(filePath, file.name, (err) => {
                if (err) {
                    console.error("Failed to download file:", err);
                    res.status(500).send({ error: "Failed to download file" });
                }
            });
            return ;
        } catch (err) {
            if (err instanceof CustomError) {
                res.status(err.code).send(err.message);
            } else {
                res.status(500).send({ error: "Failed to download file" });
            }
        }
    }
);
router.post('/crypt/:fileId',
    authMiddleware,
    validatorMiddleware(downloadFileValidation, 'body'),
    async(req: Request & {user?:JwtPayload}, res: Response): Promise<void> => {
        const fileId = parseInt(req.params.fileId);
        const masterPassword = req.body.masterPassword;
        try {
            const fileUseCase = new FileUseCase(db);
            await fileUseCase.cryptFilesById(fileId, req.user?.userId!,masterPassword);
        } catch (err) {
            if (err instanceof CustomError) {
                res.status(err.code).send(err.message);
            } else {
                res.status(500).send({ error: "Failed to download file" });
            }
        }
    }
);
router.patch('/:fileId',
    authMiddleware,
    validatorMiddleware(updateFileValidation, 'body'),
    async (req: Request & {user?:JwtPayload}, res: Response): Promise<void> => {
        const fileId = parseInt(req.params.fileId);
        try {
            const fileUseCase = new FileUseCase(db);
            const updatedFile = await fileUseCase.updateFile(fileId,req.user?.userId!, req.body);
            res.status(200);
            res.send(updatedFile);
        } catch (err) {
            if (err instanceof CustomError) {
                res.status(err.code).send(err.message);
            } else {
                res.status(500).send({error:"Failed to update file"});
            }
        }
    });
    




export default router;