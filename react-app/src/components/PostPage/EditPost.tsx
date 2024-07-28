import React, { useState } from 'react';
import { PostService } from '../../services/PostService';

interface EditPostProps {
    post: Post;
    onPostUpdated: () => void;
    onCancel: () => void;
}

const EditPost: React.FC<EditPostProps> = ({ post, onPostUpdated, onCancel }) => {
    const [title, setTitle] = useState(post.title);
    const [content, setContent] = useState(post.content);
    const [error, setError] = useState<string | null>(null);

    const handleUpdate = async () => {
        try {
            const postService = new PostService();
            await postService.patchPostById(post.id.toString(), {
                title, content,
                postId: post.id
            });
            onPostUpdated();
        } catch (error: any) {
            setError(error.message || 'An unknown error occurred');
        }
    };

    return (
        <div className="max-w-lg mx-auto mt-8 p-6 bg-white rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold mb-4">Edit Post</h2>
            <div className="mb-4">
                <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Title"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
            </div>
            <div className="mb-4">
                <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Content"
                    rows={5}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
            </div>
            {error && <div className="text-red-600 mb-4">{error}</div>}
            <div className="flex justify-end">
                <button
                    onClick={handleUpdate}
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 mr-2"
                >
                    Update
                </button>
                <button
                    onClick={onCancel}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                >
                    Cancel
                </button>
            </div>
        </div>
    );
};

export default EditPost;
