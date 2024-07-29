import { DataSource } from "typeorm";
import { File } from "../database/models/file";
import { CustomError } from "../common/error/customError";
import { CreateFileRequest, UpdateFileRequest } from "../Validators/fileValidator";
import {CreateUserFileRequest } from "../Validators/userFileValidator";
import { createCipheriv, createDecipheriv, randomBytes, scrypt } from 'crypto';
import { promisify } from 'util';
import { readFileSync, writeFileSync } from 'fs';
import { User } from "../database/models/user";
import { DownloadFileRequest} from "../Validators/fileValidator";


export class FileUseCase {

    private dataSource: DataSource

    constructor(dataSource: DataSource) {
        this.dataSource = dataSource
    }

    async createFile(data: CreateFileRequest, userId: number): Promise<File | null> {
        const fileRepo = this.dataSource.getRepository(File)

        if (data.type === 'folder') {
            const newFolder = fileRepo.create({
                name: data.name,
                type: data.type,
                userId: userId,
                parentId: data.parentId,
            })
            return await fileRepo.save(newFolder)
        } else {
            if (data.parentId) {
                const parentFile = await fileRepo.findOneBy({ id: data.parentId })
                if (!parentFile) {
                    throw new CustomError(404, "Parent file not found")
                }
                if (parentFile.type !== 'folder') {
                    throw new CustomError(400, "Parent file is not a folder")
                }
            }
            const newFile = fileRepo.create({
                name: data.name,
                path: data.path,
                type: data.type,
                size: data.size,
                userId: userId,
                // extension: data.mimetype.split('/').pop(),
                extension: data.name.split('.')[1] || 'txt',
                readOnly: data.readOnly || false,
                parentId: data.parentId,
            })            
            if (data.encrypted === true && data.masterPassword) {
                //use lib to encrypt local file
                // Encryption
                const iv = randomBytes(16);
                const salt = randomBytes(16);
                const key = (await promisify(scrypt)(data.masterPassword!, salt, 32)) as Buffer;
                const cipher = createCipheriv('aes-256-ctr', key, iv);

                // Read the file
                const filePath = `${newFile.path}`; // Replace with the actual path to the files
                const fileContent = readFileSync(filePath);

                // Encrypt the file content
                const encryptedContent = Buffer.concat([cipher.update(fileContent), cipher.final()]);

                writeFileSync(filePath, encryptedContent);
        
                // Update the file record
                newFile.isEncrypted = true;
                newFile.iv = iv.toString('hex');
                newFile.salt = salt.toString('hex');


                // Update the file record
                newFile.isEncrypted = true;
            }
            return await fileRepo.save(newFile)
        }


    }

    async findFileById(id: number): Promise<File> {
        try {
            const fileRepo = this.dataSource.getRepository(File)
            const file = await fileRepo.findOneBy({ id })
            if (!file) {
                throw new CustomError(404, "File not found")
            }
            return file
        } catch (err) {
            throw new CustomError(500,   "Failed to find file")
        }
    }

    async updateFile(fileId : number,userId: number,fileRequest: UpdateFileRequest): Promise<File> {
        try {
            const fileRepo = this.dataSource.getRepository(File)
            const file = await fileRepo.findOneBy({ id: fileId })
            if (!file) {
                throw new CustomError(404, "File not found")
            }
            if (file.userId !== userId) {
                throw new CustomError(403, "Unauthorized")
            }
            if (file.type === 'folder') {
                //if file is a folder, update only the name
                if(fileRequest.name){
                    file.name = fileRequest.name
                }
            }
            if (file.type === 'file') {

                if (fileRequest.name) {
                    file.name = fileRequest.name
                }
                if (fileRequest.type) {
                    file.type = fileRequest.type
                }
                if (fileRequest.readOnly) {
                    file.readOnly = fileRequest.readOnly
                }
                if (fileRequest.parentId) {
                    file.parentId = fileRequest.parentId
                }
            }
            return await fileRepo.save(file)
            
        } catch (err) {
            throw new CustomError(500, "Failed to update file")
        }
    }

    async deleteFile(id: number): Promise<void> {
        try {
            const fileRepo = this.dataSource.getRepository(File)
            //delete all child files recursively
            const files = await fileRepo.find({ where: { parentId: id } })
            for (let file of files) {
                await this.deleteFile(file.id)
            }
            await fileRepo.delete(id)
        } catch (err) {
            throw new CustomError(500, "Failed to delete file")
        }
    }

    async findFilesByUserId(userId: number,params : CreateUserFileRequest): Promise<File[]> {
        try {
            const fileRepo = this.dataSource.getRepository(File)
            const data = await fileRepo.find({ where: { userId } })
            if (params.pretty) {
                const dataWithChildren = data.map(file => ({ ...file, children: [] })) as (File & { children: File[] })[];
    
                dataWithChildren.forEach((file) => {
                    if (file.parentId) {
                        const parent = dataWithChildren.find(f => f.id === file.parentId);
                        if (parent) {
                            //if parent is indeed here, add the file to its children as a json object
                            parent.children.push(file);
                            //then remove from the original array
                            dataWithChildren.splice(dataWithChildren.indexOf(file), 1);
                        }
                    }
                });
                return dataWithChildren;
            }
            return data
        } catch (err) {
            throw new CustomError(500, "Failed to find files")
        }
    }

    async findFilesByParentId(parentId: number,params : CreateUserFileRequest): Promise<File[]> {
        try {
            const fileRepo = this.dataSource.getRepository(File)
            return await fileRepo.find({ where: { parentId } })
        } catch (err) {
            throw new CustomError(500, "Failed to find files")
        }
    }
    async cryptFilesById(id: number, userId: number, masterPassword: string): Promise<File> {
        try {
            const fileRepo = this.dataSource.getRepository(File);
            const userRepo = this.dataSource.getRepository(User);
            const file = await fileRepo.findOneBy({ id });
            if (!file) {
                throw new CustomError(404, "File not found");
            }
            if (file.type === 'folder') {
                throw new CustomError(400, "Cannot encrypt a folder");
            }
            const user = await userRepo.findOneBy({ id: userId });
            if (!user) {
                throw new CustomError(404, "User not found");
            }
            if (file.userId !== userId && user.role !== 'admin' && user.role !== 'super_admin') {
                throw new CustomError(403, "Unauthorized");
            }
    
            // Encryption
            const iv = randomBytes(16);
            const salt = randomBytes(16);
            const key = (await promisify(scrypt)(masterPassword, salt, 32)) as Buffer;
            const cipher = createCipheriv('aes-256-ctr', key, iv);
    
            // Read the file
            const filePath = `${file.path}`; // Replace with the actual path to the files
            const fileContent = readFileSync(filePath);
    
            // Encrypt the file content
            const encryptedContent = Buffer.concat([cipher.update(fileContent), cipher.final()]);
    
            writeFileSync(filePath, encryptedContent);
    
            // Update the file record
            file.isEncrypted = true;
            file.iv = iv.toString('hex');
            file.salt = salt.toString('hex');
        
            return await fileRepo.save(file);
        } catch (err) {
            throw new CustomError(500, "Failed to encrypt file");
        }
    }
    async decryptFile(file: File, masterPassword: string): Promise<Buffer> {
        try {
            if (!file) {
                throw new CustomError(404, "File not found");
            }
            if (file.type === 'folder') {
                throw new CustomError(400, "Cannot decrypt a folder");
            }
            if (!file.isEncrypted) {
                throw new CustomError(400, "File is not encrypted");
            }
    
            // Decryption
            const iv = Buffer.from(file.iv, 'hex');
            const salt = Buffer.from(file.salt, 'hex');
            const key = (await promisify(scrypt)(masterPassword, salt, 32)) as Buffer;
            const decipher = createDecipheriv('aes-256-ctr', key, iv);
    
            // Read the encrypted file
            const filePath = `${file.path}`; // Replace with the actual path to the files
            const encryptedContent = readFileSync(filePath);
    
            // Decrypt the file content
            const decryptedContent = Buffer.concat([decipher.update(encryptedContent), decipher.final()]);
    
            return decryptedContent;
        } catch (err) {
            if (err instanceof CustomError) {
                throw err;
            }
            throw new CustomError(500, "Failed to decrypt file");
        }
    }
    
}