import React, { useEffect, useState } from 'react';
import PostService, { PatchPostByIdBody } from '../../services/PostService';
import { CustomError } from '../../commons/Error';

interface Post {
    id: number;
    title: string;
    content: string;
    userId: string;
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
            console.log('Updating post with data:', updateData); // Log data being sent
            try {
                const response = await PostService.patchPostById(editingPost.id.toString(), updateData);
                console.log('Update response:', response); // Log the response from the API
                setEditingPost(null);
                fetchPosts();
            } catch (err) {
                setError((err as Error).message);
                console.error('Error updating post:', err); // Log error details
            }
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        if (editingPost) {
            setEditingPost({ ...editingPost, [e.target.name]: e.target.value });
        }
    };

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">Post Management</h1>
            {error && <div className="bg-red-200 text-red-800 p-2 mb-4 rounded">{error}</div>}
            <table className="min-w-full bg-white border border-gray-200">
                <thead>
                    <tr>
                        <th className="py-2 px-4 border-b">ID</th>
                        <th className="py-2 px-4 border-b">Title</th>
                        <th className="py-2 px-4 border-b">Content</th>
                        <th className="py-2 px-4 border-b">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {posts.map((post) => (
                        <tr key={post.id}>
                            <td className="py-2 px-4 border-b">{post.id}</td>
                            <td className="py-2 px-4 border-b">
                                {editingPost && editingPost.id === post.id ? (
                                    <input
                                        type="text"
                                        name="title"
                                        value={editingPost.title}
                                        onChange={handleChange}
                                        className="border px-2 py-1"
                                    />
                                ) : (
                                    post.title
                                )}
                            </td>
                            <td className="py-2 px-4 border-b">
                                {editingPost && editingPost.id === post.id ? (
                                    <textarea
                                        name="content"
                                        value={editingPost.content}
                                        onChange={handleChange}
                                        className="border px-2 py-1"
                                    />
                                ) : (
                                    post.content
                                )}
                            </td>
                            <td className="py-2 px-4 border-b">
                                {editingPost && editingPost.id === post.id ? (
                                    <>
                                        <button
                                            className="bg-green-500 text-white px-2 py-1 rounded mr-2"
                                            onClick={handleSaveEdit}
                                        >
                                            Save
                                        </button>
                                        <button
                                            className="bg-gray-500 text-white px-2 py-1 rounded"
                                            onClick={handleCancelEdit}
                                        >
                                            Cancel
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <button
                                            className="bg-blue-500 text-white px-2 py-1 rounded mr-2"
                                            onClick={() => handleEdit(post)}
                                        >
                                            Edit
                                        </button>
                                        <button
                                            className="bg-red-500 text-white px-2 py-1 rounded"
                                            onClick={() => handleDelete(post.id)}
                                        >
                                            Delete
                                        </button>
                                    </>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            <div className="flex justify-between items-center mt-4">
                <button
                    className="bg-gray-500 text-white px-3 py-1 rounded"
                    disabled={page === 1}
                    onClick={() => setPage(page - 1)}
                >
                    Previous
                </button>
                <span>Page {page}</span>
                <button
                    className="bg-gray-500 text-white px-3 py-1 rounded"
                    onClick={() => setPage(page + 1)}
                >
                    Next
                </button>
            </div>
        </div>
    );
};

export default PostTable;
