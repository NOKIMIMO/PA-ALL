import React, { useState, useEffect } from 'react';
import Comment from './Comment';
import { CommentService } from '../../services/CommentService';
import userService from '../../services/UserService';

export interface Comment {
    id: number;
    content: string;
    createdAt: string;
    userId: number;
    userEmail?: string;
    replies: Comment[];
}

const CommentList: React.FC<{ postId: string }> = ({ postId }) => {
    const [comments, setComments] = useState<Comment[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [newCommentContent, setNewCommentContent] = useState('');

    const fetchComments = async () => {
        setLoading(true);
        try {
            const commentService = new CommentService();
            const data = await commentService.getCommentsByPostId(postId);
    
            const commentsWithUserEmails = await Promise.all(
                data.comments.map(async (comment: Comment) => {
                    try {
                        const user = await userService.getUserById(comment.userId.toString());
                        const repliesWithUserEmails = await fetchReplies(comment.replies, postId);
    
                        return { ...comment, userEmail: user.email, replies: repliesWithUserEmails };
                    } catch (error) {
                        console.error(`Failed to fetch user details for comment ${comment.id}`, error);
                        return { ...comment, userEmail: 'Unknown', replies: [] };
                    }
                })
            );
    
            setComments(commentsWithUserEmails);
        } catch (error: any) {
            setError(error.message || 'An unknown error occurred');
        } finally {
            setLoading(false);
        }
    };
    
    useEffect(() => {
        fetchComments();
    }, [postId]);
    

    const fetchReplies = async (replies: Comment[], postId: string): Promise<Comment[]> => {
        return Promise.all(
            replies.map(async (reply) => {
                try {
                    const user = await userService.getUserById(reply.userId.toString());
                    const nestedReplies = await fetchReplies(reply.replies, postId);
                    return { ...reply, userEmail: user.email, replies: nestedReplies };
                } catch (error) {
                    console.error(`Failed to fetch user details for reply ${reply.id}`, error);
                    return { ...reply, userEmail: 'Unknown', replies: [] };
                }
            })
        );
    };

    const deleteComment = async (comment: Comment): Promise<any> => {
        setLoading(true);
        try {
            const commentService = new CommentService();
            
            // Suppression des réponses d'abord
            await Promise.all(comment.replies.map(reply => commentService.deleteCommentById(postId, reply.id.toString())));
            
            // Suppression du commentaire principal
            await commentService.deleteCommentById(postId, comment.id.toString());
            
            // Recharger les commentaires
            fetchComments();
        } catch (error: any) {
            setError(error.message || 'Failed to delete comment');
        }
        setLoading(false);
    };
    

    const addReply = async (parentId: number, content: string) => {
        try {
            const commentService = new CommentService();
            await commentService.createComment(postId, {
                content,
                parentId: parentId.toString(),
            });

            // Fetch the updated replies for the specific parent comment
            const updatedRepliesResponse = await commentService.getCommentsByPostId(postId);
            const updatedReplies = updatedRepliesResponse.comments;

            // Update local comments with the new replies
            const updatedComments = updateCommentsWithReply(comments, parentId, updatedReplies);

            setComments(updatedComments);
            // Recharger les commentaires
            fetchComments();
        } catch (error: any) {
            setError(error.message || 'Failed to add reply');
        }
    };

    const updateCommentsWithReply = (comments: Comment[], parentId: number, updatedReplies: Comment[]): Comment[] => {
        return comments.map(comment => {
            if (comment.id === parentId) {
                return {
                    ...comment,
                    replies: updatedReplies,
                };
            } else if (comment.replies && comment.replies.length > 0) {
                return {
                    ...comment,
                    replies: updateCommentsWithReply(comment.replies, parentId, updatedReplies),
                };
            }
            return comment;
        });
    };

    const handleNewCommentSubmit = async () => {
        try {
            const commentService = new CommentService();
            const newCommentData = await commentService.createComment(postId, { content: newCommentContent });

            setComments([...comments, newCommentData]);
            setNewCommentContent('');
        } catch (error: any) {
            setError(error.message || 'Failed to create new comment');
        }
    };

    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>Error: {error}</div>;
    }

    return (
        <div>
            <div className="mb-4">
                <textarea
                    value={newCommentContent}
                    onChange={(e) => setNewCommentContent(e.target.value)}
                    className="w-full p-2 border rounded"
                    placeholder="Write your comment..."
                ></textarea>
                <button
                    onClick={handleNewCommentSubmit}
                    className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                    Add Comment
                </button>
            </div>
            {comments.map((comment) => (
                <Comment
                    key={comment.id}
                    comment={comment}
                    addReply={addReply}
                    deleteComment={deleteComment}
                    fetchComments={fetchComments}
                />
            ))}
        </div>
    );
    
};

export default CommentList;
