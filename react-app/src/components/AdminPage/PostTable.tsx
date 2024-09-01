import React, { useEffect, useState } from 'react';
import PostService, { PatchPostByIdBody } from '../../services/PostService';
import { CustomError } from '../../commons/Error';
import GenericTable from './GenereicTable';

interface Post {
    id: number;
    title: string;
    content: string;
    userId: string;
    active: boolean;
}

const PostTable: React.FC = () => {
    const [posts, setPosts] = useState<Post[]>([]);
    const [page, setPage] = useState(1);
    const [limit] = useState(10);
    const [error, setError] = useState<string | null>(null);
    const [editingPost, setEditingPost] = useState<Post | null>(null);

    useEffect(() => {
        fetchPosts();
    }, [page, limit]);

    const fetchPosts = async () => {
        try {
            const postData = await PostService.getPosts(page, limit);
            if (postData instanceof CustomError) {
                setError(postData.message);
            } else if (postData && Array.isArray(postData.posts)) {
                setPosts(postData.posts);
                setError(null);
            } else {
                setError('Unexpected data format');
            }
        } catch (err) {
            setError((err as Error).message);
        }
    };

    const handleDelete = async (id: number) => {
        try {
            await PostService.deletePostById(id.toString());
            fetchPosts();
        } catch (err) {
            setError((err as Error).message);
        }
    };

    const handleEdit = (post: Post) => {
        setEditingPost(post);
    };

    const handleCancelEdit = () => {
        setEditingPost(null);
    };

    const handleSaveEdit = async () => {
        if (editingPost) {
            const updateData: PatchPostByIdBody = {
                title: editingPost.title,
                content: editingPost.content,
                userId: editingPost.userId,
                postId: editingPost.id
            };
            try {
                await PostService.patchPostById(editingPost.id.toString(), updateData);
                setEditingPost(null);
                fetchPosts();
            } catch (err) {
                setError((err as Error).message);
            }
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        if (editingPost) {
            setEditingPost({ ...editingPost, [e.target.name]: e.target.value });
        }
    };

    const headers = ['ID', 'Title', 'Content'];

    return (
        <div className="container mx-auto p-8 bg-black text-white rounded-xl shadow-2xl">
            <h1 className="text-4xl font-bold mb-8 text-center">Post Management</h1>
            {error && <div className="bg-red-600 text-white p-4 mb-8 rounded-lg">{error}</div>}
            <GenericTable<Post>
                headers={headers}
                rows={posts}
                renderRow={(post, isEditing, handleInputChange) => (
                    <>
                        <td className="py-2 px-4 border-b">{post.id}</td>
                        <td className="py-2 px-4 border-b">
                            {isEditing ? (
                                <input
                                    type="text"
                                    name="title"
                                    value={post.title}
                                    onChange={handleInputChange}
                                    className="bg-gray-900 text-white border-b-2 border-yellow-500 focus:border-yellow-700 focus:outline-none px-3 py-2"
                                />
                            ) : (
                                post.title
                            )}
                        </td>
                        <td className="py-2 px-4 border-b">
                            {isEditing ? (
                                <textarea
                                    name="content"
                                    value={post.content}
                                    onChange={handleInputChange}
                                    className="bg-gray-900 text-white border-b-2 border-yellow-500 focus:border-yellow-700 focus:outline-none px-3 py-2"
                                />
                            ) : (
                                post.content
                            )}
                        </td>
                    </>
                )}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onSaveEdit={handleSaveEdit}
                onCancelEdit={handleCancelEdit}
                editingRow={editingPost}
            />
            <div className="flex justify-between items-center mt-8">
                <button
                    className="bg-yellow-500 text-black px-6 py-3 rounded-full shadow-lg hover:bg-yellow-600 transition"
                    disabled={page === 1}
                    onClick={() => setPage(page - 1)}
                >
                    Previous
                </button>
                <span className="text-gray-400 text-xl font-semibold">Page {page}</span>
                <button
                    className="bg-yellow-500 text-black px-6 py-3 rounded-full shadow-lg hover:bg-yellow-600 transition"
                    onClick={() => setPage(page + 1)}
                >
                    Next
                </button>
            </div>
        </div>
    );
};

export default PostTable;
