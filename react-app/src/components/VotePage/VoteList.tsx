import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import VoteService from '../../services/VoteService';
import CreateVote from './CreateVote';
import { useUser } from '../../context/UserContext';
import { user_access_type } from '../../commons/user_access_type';

const VoteList: React.FC = () => {
    const [votes, setVotes] = useState<any[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const {user} = useUser();

    const isAdmin = user?.role === user_access_type.ADMIN || user?.role === user_access_type.SUPER_ADMIN;

    useEffect(() => {
        fetchVotes();
    }, []);

    const fetchVotes = async () => {
        setLoading(true);
        try {
            const voteService = VoteService;
            const data = await voteService.getVotes({});
            setVotes(data || []); // Ensure votes is an array
        } catch (error: any) {
            setError(error.message || 'An unknown error occurred');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateVote = () => {
        fetchVotes(); // Refresh the list of votes after creating a new vote
    };

    if (loading) {
        return <div className="flex justify-center items-center h-screen">Loading...</div>;
    }

    if (error) {
        return <div className="text-red-500 text-center">Error: {error}</div>;
    }

    const isVoteExpired = (endDate: string): boolean => {
        return new Date(endDate) < new Date();
    };

    return (
        <div className="max-w-4xl mx-auto p-4">
            <h1 className="text-2xl font-bold text-center mb-4">Vote List</h1>
            
            {isAdmin ? ( <CreateVote onCreateVote={handleCreateVote} onVoteCreated={() => {}}/>):(<div></div>)}
            {votes.length > 0 ? (
                <div className="grid grid-cols-1 gap-4 mt-4">
                    {votes.map(vote => (
                        <div key={vote.id} className="bg-white shadow-md rounded-lg p-4 hover:bg-gray-100 transition duration-300">
                            {isVoteExpired(vote.endDate) ? (
                                <Link to={`/votes/${vote.id}`}>
                                <h3 className="text-xl font-semibold text-gray-400">{vote.title}</h3>
                                </Link>
                            ) : (
                                <Link to={`/votes/${vote.id}`}>
                                    <h3 className="text-xl font-semibold text-blue-600">{vote.title}</h3>
                                </Link>
                            )}
                            <p className="text-gray-500">{vote.endDate}</p>
                            <p className="text-gray-700">{vote.description}</p>
                            {isVoteExpired(vote.endDate) && <p className="text-red-500">This vote has ended.</p>}
                        </div>
                    ))}
                </div>
            ) : (
                <p className="text-center text-gray-500 mt-4">No votes available.</p>
            )}
        </div>
    );
};

export default VoteList;
