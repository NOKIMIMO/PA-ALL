import React, { useEffect, useState } from 'react';
import VoteService from '../../services/VoteService';
import { CustomError } from '../../commons/Error';

interface VoteOption {
    id: number;
    name: string;
    voteCount: number;
}

interface Vote {
    id: number;
    title: string;
    description: string;
    options: VoteOption[];
    endDate: string;
    secondRoundEnabled: boolean;
}

const VoteTable: React.FC = () => {
    const [votes, setVotes] = useState<Vote[]>([]);
    const [page, setPage] = useState(1);
    const [limit] = useState(10);
    const [error, setError] = useState<string | null>(null);
    const [editingVote, setEditingVote] = useState<Vote | null>(null);

    useEffect(() => {
        fetchVotes();
    }, [page, limit]);

    const fetchVotes = async () => {
        try {
            const data = await VoteService.getVotes({ page, limit });
            if (data instanceof CustomError) {
                setError(data.message);
            } else if (Array.isArray(data)) {
                setVotes(data);
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
            await VoteService.deleteVoteById(id.toString());
            fetchVotes();
        } catch (err) {
            setError((err as Error).message);
        }
    };

    const handleEdit = (vote: Vote) => {
        setEditingVote(vote);
    };

    const handleCancelEdit = () => {
        setEditingVote(null);
    };

    const handleSaveEdit = async () => {
        if (editingVote) {
            const updateData = {
                title: editingVote.title,
                description: editingVote.description,
                endDate: new Date(editingVote.endDate),
                secondRoundEnabled: editingVote.secondRoundEnabled,
                options: editingVote.options.map(option => ({
                    id: option.id,  // Inclure l'ID de l'option pour la mise à jour
                    name: option.name,
                    voteCount: option.voteCount
                }))
            };
    
            try {
                await VoteService.updateVote(editingVote.id, updateData);
                setEditingVote(null);
                fetchVotes();
            } catch (err) {
                setError((err as Error).message);
            }
        }
    };
    
    
    

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        if (editingVote) {
            setEditingVote({ ...editingVote, [e.target.name]: e.target.value });
        }
    };
    
    const handleOptionChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
        if (editingVote) {
            const updatedOptions = [...editingVote.options];
            updatedOptions[index] = {
                ...updatedOptions[index],
                name: e.target.value
            };
            setEditingVote({ ...editingVote, options: updatedOptions });
        }
    };

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">Vote Management</h1>
            {error && <div className="bg-red-200 text-red-800 p-2 mb-4 rounded">{error}</div>}
            <table className="min-w-full bg-white border border-gray-200">
                <thead>
                    <tr>
                        <th className="py-2 px-4 border-b">ID</th>
                        <th className="py-2 px-4 border-b">Title</th>
                        <th className="py-2 px-4 border-b">Description</th>
                        <th className="py-2 px-4 border-b">Options</th>
                        <th className="py-2 px-4 border-b">End Date</th>
                        <th className="py-2 px-4 border-b">Second Round Enabled</th>
                        <th className="py-2 px-4 border-b">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {votes.map((vote) => (
                        <tr key={vote.id}>
                            <td className="py-2 px-4 border-b">{vote.id}</td>
                            <td className="py-2 px-4 border-b">
                                {editingVote && editingVote.id === vote.id ? (
                                    <input
                                        type="text"
                                        name="title"
                                        value={editingVote.title}
                                        onChange={handleChange}
                                        className="border px-2 py-1"
                                    />
                                ) : (
                                    vote.title
                                )}
                            </td>
                            <td className="py-2 px-4 border-b">
                                {editingVote && editingVote.id === vote.id ? (
                                    <textarea
                                        name="description"
                                        value={editingVote.description}
                                        onChange={handleChange}
                                        className="border px-2 py-1"
                                    />
                                ) : (
                                    vote.description
                                )}
                            </td>
                            <td className="py-2 px-4 border-b">
                                {editingVote && editingVote.id === vote.id ? (
                                    <div>
                                        {editingVote.options.map((option, index) => (
                                            <input
                                                key={option.id}
                                                type="text"
                                                value={option.name}
                                                onChange={(e) => handleOptionChange(index, e)}
                                                className="border px-2 py-1 mb-1"
                                            />
                                        ))}
                                    </div>
                                ) : (
                                    vote.options.map(option => <div key={option.id}>{option.name}</div>)
                                )}
                            </td>
                            <td className="py-2 px-4 border-b">
                                {editingVote && editingVote.id === vote.id ? (
                                    <input
                                        type="date"
                                        name="endDate"
                                        value={new Date(editingVote.endDate).toISOString().split('T')[0]}
                                        onChange={handleChange}
                                        className="border px-2 py-1"
                                    />
                                ) : (
                                    new Date(vote.endDate).toLocaleDateString()
                                )}
                            </td>
                            <td className="py-2 px-4 border-b">
                                {editingVote && editingVote.id === vote.id ? (
                                    <input
                                        type="checkbox"
                                        name="secondRoundEnabled"
                                        checked={editingVote.secondRoundEnabled}
                                        onChange={(e) =>
                                            setEditingVote({
                                                ...editingVote,
                                                secondRoundEnabled: e.target.checked
                                            })
                                        }
                                        className="mr-2"
                                    />
                                ) : (
                                    vote.secondRoundEnabled ? 'Yes' : 'No'
                                )}
                            </td>
                            <td className="py-2 px-4 border-b">
                                {editingVote && editingVote.id === vote.id ? (
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
                                            onClick={() => handleEdit(vote)}
                                        >
                                            Edit
                                        </button>
                                        <button
                                            className="bg-red-500 text-white px-2 py-1 rounded"
                                            onClick={() => handleDelete(vote.id)}
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

export default VoteTable;
