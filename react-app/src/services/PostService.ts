import { CustomError } from '../commons/Error';

interface CreatePostBody {
    title: string;
    content: string;
    data_access_type?: string;
}

export interface PatchPostByIdBody {
    title?: string;
    content?: string;
    data_access_type?: string;
    userId?: string;
    postId: number;
}

export interface IPostService {
    getPosts(page: number, limit: number): Promise<any>;
    getPostById(id: string): Promise<any>;
    deletePostById(id: string): Promise<any>;
    patchPostById(id: string, body: PatchPostByIdBody): Promise<any>;
    createPost(body: CreatePostBody): Promise<any>;
}

export class PostService implements IPostService {
    async getPosts(page: number, limit: number): Promise<any> {
        const url = new URL('/api/v1/posts', window.location.origin);
        url.searchParams.append('page', page.toString());
        url.searchParams.append('limit', limit.toString());

        const response = await fetch(url.toString(), {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        const data = await response.json();
        if (!response.ok) {
            return new CustomError(response.status, data.error || 'Something went wrong');
        }
        return data;
    }

    async getPostById(id: string): Promise<any> {
        const response = await fetch(`/api/v1/posts/${id}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        const data = await response.json();
        if (!response.ok) {
            return new CustomError(response.status, data.error || 'Something went wrong');
        }
        return data;
    }

    async deletePostById(id: string): Promise<any> {
        const response = await fetch(`/api/v1/posts/${id}`, {
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

    async patchPostById(id: string, body: PatchPostByIdBody): Promise<any> {
        console.log('Sending PATCH request with body:', body); // Log the request body
        const response = await fetch(`/api/v1/posts/${id}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify(body)
        });
        const data = await response.json();
        console.log('Received response:', data); // Log the response data
        if (!response.ok) {
            return new CustomError(response.status, data.error || 'Something went wrong');
        }
        return data;
    }

    async createPost(body: CreatePostBody): Promise<any> {
        const response = await fetch(`/api/v1/posts`, {
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
}
export default new PostService();
