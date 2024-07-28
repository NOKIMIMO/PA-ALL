import { CustomError } from "../commons/Error";

interface IFileService {
    uploadFile(file: File | null, name: string, type: "folder" | "pdf" | "txt" | "png" | "jpg" | "other", parentId: number, encrypted: boolean, MasterPassword:String): Promise<any>;
    getFile(id: number): Promise<any>;
    getFilesFromUser(userId: number, param: GetFileRequestQuery): Promise<any>;
    deleteFile(id: number): Promise<any>;
}

interface GetFileRequestQuery {
    pretty?: boolean;
}

class FileService implements IFileService {

    async downloadFile(id: number, masterPassword?:string): Promise<any> {
        if(masterPassword){
            const body ={
                masterPassword:masterPassword
            }
            const response = await fetch(`/api/v1/files/download/${id}`, {  
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(body)
            });
            if (!response.ok) {
                return new CustomError(response.status, 'Something went wrong');
            }
            const data = await response.blob();
            return data;
        }else{
            const response = await fetch(`/api/v1/files/download/${id}`, {  
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            if (!response.ok) {
                return new CustomError(response.status, 'Something went wrong');
            }
            const data = await response.blob();
            return data;
        }
        
    }
    async cryptFile(id: number,pwd:string): Promise<any>{
        const response = await fetch(`/api/v1/files/crypt/${id}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({masterPassword:pwd})
        });
        if (!response.ok) {
            return new CustomError(response.status, 'Something went wrong');
        }
        const data = await response.blob();
        return data;
    }

    async uploadFile(file: File | null, name: string, type: "folder" | "pdf" | "txt" | "png" | "jpg" | "other", parentId: number|null, encrypted: boolean, MasterPassword:String): Promise<any> {
        const formData = new FormData();
        //folder type does not have file
        if (file != null && type !== 'folder') {
            formData.append('file', file);
            if (parentId !== null) {
                formData.append('parentId', parentId.toString());
            }
        }
        formData.append('encrypted', encrypted.toString());
        if(MasterPassword && MasterPassword!= ""){formData.append('masterPassword', MasterPassword.toString());}
        
        formData.append('name', name);
        formData.append('type', type);
        try {
            const response = await fetch('/api/v1/files', {
                method: 'POST',
                body: formData,
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    // 'Content-Type': 'multipart/form-data'
                }

            });
            const data = await response.json();
            if (!response.ok) {
                return new CustomError(response.status, data.error || 'Something went wrong');
            }
            return data;
        } catch (error) {
            console.error('Error uploading file:', error);
            throw new CustomError(500, 'Failed to upload file. Please try again.');
        }
    }

    async getFile(id: number): Promise<any> {
        const response = await fetch(`/api/v1/files/${id}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`

            }
        });
        const data = await response.json();
        if (!response.ok) {
            return new CustomError(response.status, data.error || 'Something went wrong');
        }
        return data;
    }

    async getFilesFromUser(userId: number, param: GetFileRequestQuery): Promise<any> {
        const response = await fetch(`/api/v1/users/${userId}/files?pretty=${param.pretty}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        const data = await response.json();
        if (!response.ok) {
            return new CustomError(response.status, data.error || 'Something went wrong');
        }
        return data;
    }

    async deleteFile(id: number): Promise<any> {
        const response = await fetch(`/api/v1/files/${id}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`

            }
        });
        
        const data = await response;
        if (!response.ok) {
            return new CustomError(response.status ,'Something went wrong');
        }
        return data;
    }
    async getFilePreview(id: number): Promise<any> {
        const response = await fetch(`/api/v1/files/preview/${id}`, {
            //send basck an array buffer
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        const data = await response;
        if (!response.ok) {
            return new CustomError(response.status, data.statusText || 'Something went wrong');
        }
        const fileBuffer = await data.arrayBuffer();
        const blob = new Blob([fileBuffer], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        return url;
    }

}

export default new FileService();