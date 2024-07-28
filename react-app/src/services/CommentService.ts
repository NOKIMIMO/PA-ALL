import { CustomError } from "../commons/Error";

interface CreateCommentBody {
    content: string;
    parentId?: string;
}

interface PatchCommentByIdBody {
    content: string;
}

interface ICommentService {
    getCommentsByPostId(postId: string): Promise<any>;
    createComment(postId: string, body: CreateCommentBody): Promise<any>;
    deleteCommentById(postId: string, commentId: string): Promise<any>;
}

export class CommentService implements ICommentService {
    async getCommentsByPostId(postId: string): Promise<any> {
        console.log(`Fetching comments for postId: ${postId}`); // Add log here
        const response = await fetch(`/api/v1/posts/${postId}/comment`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        });
        const data = await response.json();
        if (!response.ok) {
            console.error(`Error fetching comments for postId: ${postId}`, data); // Add log here
            throw new CustomError(response.status, data.error || 'Something went wrong');
        }
        return data;
    }

    async createComment(postId: string, body: CreateCommentBody): Promise<any> {
        console.log(body);
        const response = await fetch(`/api/v1/posts/${postId}/comment`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify(body)
        });
        const data = await response.json();
        if (!response.ok) {
            return new CustomError(response.status, data.error || 'Something went wrong');
        }
        return data;
    }

    async deleteCommentById(postId: string, commentId: string): Promise<any> {
        const response = await fetch(`/api/v1/posts/${postId}/comment/${commentId}`, {
            method: 'DELETE',
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

    async patchCommentById(postId: string, commentId: string, body: PatchCommentByIdBody): Promise<any> {
        const response = await fetch(`/api/v1/posts/${postId}/comment/${commentId}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify(body)
        });
        const data = await response.json();
        if (!response.ok) {
            return new CustomError(response.status, data.error || 'Something went wrong');
        }
        return data;
    }
}
