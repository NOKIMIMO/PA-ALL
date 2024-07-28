import React, { useEffect, useState } from 'react';
import { PostService } from '../services/PostService';
import { Card } from '../components/Card';
import CreatePost from '../components/PostPage/CreatePost';
import EditPost from '../components/PostPage/EditPost';

interface User {
    id: number;
    name: string;
    role: string;
    // Autres propriétés d'utilisateur si nécessaire
}

const PostListPage: React.FC = () => {
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [editingPost, setEditingPost] = useState<Post | null>(null);
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [searchQuery, setSearchQuery] = useState<string>('');
    
    useEffect(() => {
        // Lire l'utilisateur courant depuis le localStorage
        const userRole = localStorage.getItem('userRole'); // Assurez-vous que 'userRole' est bien stocké dans localStorage
        const userId = localStorage.getItem('userId');
        const userName = localStorage.getItem('userName');

        // Définir l'utilisateur courant basé sur le localStorage
        if (userRole && userId && userName) {
            setCurrentUser({
                id: parseInt(userId, 10),
                name: userName,
                role: userRole,
            });
        }

        fetchPosts();
    }, []);

    const fetchPosts = async () => {
        setLoading(true);
        try {
            const postService = new PostService();
            const data = await postService.getPosts(1, 10); // Page 1, limit 10
            setPosts(data.posts);
        } catch (error: any) {
            setError(error.message || 'An unknown error occurred');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (postId: number) => {
        try {
            const postService = new PostService();
            await postService.deletePostById(postId.toString());
            fetchPosts(); // Refresh posts after deletion
        } catch (error: any) {
            setError(error.message || 'An unknown error occurred');
        }
    };

    const canEditOrDelete = (post: Post) => {
        return currentUser && (currentUser.id === post.userId || currentUser.role === 'admin');
    };

    const filteredPosts = posts.filter(post => 
        post.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (loading) {
        return <div className="spinner-border" role="status">
            <span className="sr-only">Loading...</span>
        </div>;
    }

    if (error) {
        return <div className="alert alert-danger" role="alert">
            Error: {error}
        </div>;
    }

    return (
        <div className="container mt-5">
            {currentUser?.role === 'admin' && (
                <CreatePost onPostCreated={fetchPosts} />
            )}
            <div className="mb-4">
                <input
                    type="text"
                    placeholder="Search posts"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
            </div>
            <div className="list-group">
                {filteredPosts.length === 0 ? (
                    <p>No posts found</p>
                ) : (
                    filteredPosts.map((post) => (
                        editingPost && editingPost.id === post.id ? (
                            <EditPost
                                key={post.id}
                                post={post}
                                onPostUpdated={() => { setEditingPost(null); fetchPosts(); }}
                                onCancel={() => setEditingPost(null)}
                            />
                        ) : (
                            <Card
                                key={post.id}
                                title={post.title}
                                content={post.content}
                                subtext={null}
                                pageLink={"./Post/PostPage/" + post.id}
                                showActions={canEditOrDelete(post)}
                                onEdit={() => {
                                    if (currentUser?.role === 'admin') {
                                        setEditingPost(post);
                                    }
                                }}
                                onDelete={() => {
                                    if (currentUser?.role === 'admin') {
                                        handleDelete(post.id);
                                    }
                                }}
                            />
                        )
                    ))
                )}
            </div>
        </div>
    );
};

export default PostListPage;
