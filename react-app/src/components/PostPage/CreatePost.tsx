import React, { useState } from 'react';
import PostService from '../../services/PostService';
import { CustomError } from '../../commons/Error';
import { useToast } from '../../context/ToastManager';
import { ToastType } from '../../enum/toast';

interface CreatePostProps {
    onPostCreated: () => void; // Callback pour rafraîchir la liste des posts après la création
}

const CreatePost: React.FC<CreatePostProps> = ({ onPostCreated }) => {
    const [showForm, setShowForm] = useState(false);
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [error, setError] = useState<string | null>(null);
    const { addToast } = useToast();

    const handleCreatePost = async () => {
        try {
            const response = await PostService.createPost({ title, content });
            if (response instanceof CustomError) {
                setError(response.message);
            } else {
                setShowForm(false);
                setTitle('');
                setContent('');
                setError(null);
                onPostCreated();
                addToast('Post created successfully', ToastType.SUCCESS);
            }
        } catch (err) {
            setError((err as Error).message);
        }
    };

    return (
        <div>
            <button
                className="bg-green-500 text-white px-4 py-2 rounded"
                onClick={() => setShowForm(!showForm)}
            >
                {showForm ? 'Cancel' : 'Create Post'}
            </button>
            {showForm && (
                <div className="mt-4">
                    {error && <div className="bg-red-200 text-red-800 p-2 mb-4 rounded">{error}</div>}
                    <div className="mb-4">
                        <label className="block mb-1">Title</label>
                        <input
                            type="text"
                            className="w-full px-4 py-2 border rounded"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block mb-1">Content</label>
                        <textarea
                            className="w-full px-4 py-2 border rounded"
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                        />
                    </div>
                    <button
                        className="bg-blue-500 text-white px-4 py-2 rounded"
                        onClick={handleCreatePost}
                    >
                        Save Post
                    </button>
                </div>
            )}
        </div>
    );
};

export default CreatePost;
