import React, { useState } from 'react';
import { Comment as CommentType } from './CommentList';
interface CommentProps {
    comment: CommentType;
    addReply: (parentId: number, content: string) => void;
    deleteComment: (comment: CommentType) => void;
    fetchComments: () => void;
}

const Comment: React.FC<CommentProps> = ({ comment, addReply, deleteComment, fetchComments }) => {
    const [isReplying, setIsReplying] = useState(false);
    const [replyContent, setReplyContent] = useState('');

    const handleReply = () => {
        if (replyContent.trim() === '') {
            return; // Ne pas envoyer de réponse vide
        }
        addReply(comment.id, replyContent);
        setReplyContent('');
        setIsReplying(false);
    };

    const handleDelete = async (comment: CommentType) => {
        await deleteComment(comment);
        fetchComments(); // Recharger les commentaires après la suppression
    };

    return (
        <div className="p-4 mb-4 bg-white rounded shadow">
            <div className="mb-2">
                <p>{comment.content}</p>
                <span className="text-sm text-gray-600">Posted on {new Date(comment.createdAt).toLocaleString()}</span>
                {comment.userEmail && (
                    <span className="text-sm text-gray-600"> by {comment.userEmail}</span>
                )}
            </div>
            <div className="space-x-4">
            <button
                onClick={() => setIsReplying(!isReplying)}
                className="text-blue-500 hover"
            >
                Reply
            </button>
            <button
                onClick={() => handleDelete(comment)}
                className="text-blue-500 hover text-red-500"
            >
                Delete
            </button>
            </div>
            {isReplying && (
                <div className="mt-2">
                    <textarea
                        value={replyContent}
                        onChange={(e) => setReplyContent(e.target.value)}
                        className="w-full p-2 border rounded"
                        placeholder="Write your reply..."
                    ></textarea>
                    <button
                        onClick={handleReply}
                        className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                        Send
                    </button>
                </div>
            )}
            {comment.replies && Array.isArray(comment.replies) && comment.replies.length > 0 && (
                <div className="mt-4 ml-6">
                    {comment.replies.map((reply) => (
                        <Comment key={reply.id} comment={reply} addReply={addReply} deleteComment={deleteComment} fetchComments={fetchComments} />
                    ))}
                </div>
            )}
        </div>
    );
};

export default Comment;