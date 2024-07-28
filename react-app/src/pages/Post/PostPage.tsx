import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import CommentList from '../../components/PostPage/CommentList';
import { PostService } from '../../services/PostService'; // Ajustez le chemin selon votre projet

interface Post {
  id: string;
  title: string;
  content: string;
  createdAt: string;
}

const PostPage: React.FC = () => {
  const { postId } = useParams<{ postId: string }>();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const postService = new PostService();
        const data = await postService.getPostById(postId!);
        setPost(data);
      } catch (error: any) {
        setError(error.message || 'An unknown error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [postId]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!post) {
    return <div>No post found</div>;
  }

  return (
    <div className="container mx-auto mt-5">
      <div className="p-4 bg-white rounded shadow mb-5">
        <h1 className="text-2xl font-bold">{post.title}</h1>
        <p className="mt-2">{post.content}</p>
        <span className="text-sm text-gray-600">Posté le {new Date(post.createdAt).toLocaleString()}</span>
        <CommentList postId={postId!} />
      </div>
    </div>
  );
};

export default PostPage;
