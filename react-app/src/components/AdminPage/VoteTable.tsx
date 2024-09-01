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
                    id: option.id,
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
        <div className="container mx-auto p-8 bg-black text-white rounded-xl shadow-2xl">
            <h1 className="text-4xl font-bold mb-8 text-center">Vote Management</h1>
            {error && <div className="bg-red-600 text-white p-4 mb-8 rounded-lg">{error}</div>}
            <table className="min-w-full bg-gray-800 border border-gray-700 rounded-xl shadow-lg overflow-hidden">
                <thead className='bg-gray-900 text-gray-400'>
                    <tr>
                        <th className="py-3 px-4 border-b border-gray-600">ID</th>
                        <th className="py-3 px-4 border-b border-gray-600">Title</th>
                        <th className="py-3 px-4 border-b border-gray-600">Description</th>
                        <th className="py-3 px-4 border-b border-gray-600">Options</th>
                        <th className="py-3 px-4 border-b border-gray-600">End Date</th>
                        <th className="py-3 px-4 border-b border-gray-600">Second Round Enabled</th>
                        <th className="py-3 px-4 border-b border-gray-600">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {votes.map((vote) => (
                        <tr key={vote.id} className="hover:bg-gray-700">
                            <td className="py-2 px-4 border-b border-gray-600">{vote.id}</td>
                            <td className="py-2 px-4 border-b border-gray-600">
                                {editingVote && editingVote.id === vote.id ? (
                                    <input
                                        type="text"
                                        name="title"
                                        value={editingVote.title}
                                        onChange={handleChange}
                                        className="bg-gray-800 text-white border-b-2 border-yellow-500 focus:border-yellow-700 focus:outline-none px-3 py-2"
                                    />
                                ) : (
                                    vote.title
                                )}
                            </td>
                            <td className="py-2 px-4 border-b border-gray-600">
                                {editingVote && editingVote.id === vote.id ? (
                                    <textarea
                                        name="description"
                                        value={editingVote.description}
                                        onChange={handleChange}
                                        className="bg-gray-800 text-white border-b-2 border-yellow-500 focus:border-yellow-700 focus:outline-none px-3 py-2"
                                    />
                                ) : (
                                    vote.description
                                )}
                            </td>
                            <td className="py-2 px-4 border-b border-gray-600">
                                {editingVote && editingVote.id === vote.id ? (
                                    <div>
                                        {editingVote.options.map((option, index) => (
                                            <input
                                                key={option.id}
                                                type="text"
                                                value={option.name}
                                                onChange={(e) => handleOptionChange(index, e)}
                                                className="bg-gray-800 text-white border-b-2 border-yellow-500 focus:border-yellow-700 focus:outline-none px-3 py-2 mb-2"
                                            />
                                        ))}
                                    </div>
                                ) : (
                                    vote.options.map(option => <div key={option.id}>{option.name}</div>)
                                )}
                            </td>
                            <td className="py-2 px-4 border-b border-gray-600">
                                {editingVote && editingVote.id === vote.id ? (
                                    <input
                                        type="date"
                                        name="endDate"
                                        value={new Date(editingVote.endDate).toISOString().split('T')[0]}
                                        onChange={handleChange}
                                        className="bg-gray-800 text-white border-b-2 border-yellow-500 focus:border-yellow-700 focus:outline-none px-3 py-2"
                                    />
                                ) : (
                                    new Date(vote.endDate).toLocaleDateString()
                                )}
                            </td>
                            <td className="py-2 px-4 border-b border-gray-600">
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
                                        className="bg-gray-800 text-white border-b-2 border-yellow-500 focus:border-yellow-700 focus:outline-none px-2 py-1"
                                    />
                                ) : (
                                    vote.secondRoundEnabled ? 'Yes' : 'No'
                                )}
                            </td>
                            <td className="py-2 px-4 border-b border-gray-600">
                                {editingVote && editingVote.id === vote.id ? (
                                    <>
                                        <button
                                            className="bg-green-500 text-white px-4 py-2 rounded mr-2 hover:bg-green-600 transition"
                                            onClick={handleSaveEdit}
                                        >
                                            Save
                                        </button>
                                        <button
                                            className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition"
                                            onClick={handleCancelEdit}
                                        >
                                            Cancel
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <button
                                            className="bg-blue-500 text-white px-4 py-2 rounded mr-2 hover:bg-blue-600 transition"
                                            onClick={() => handleEdit(vote)}
                                        >
                                            Edit
                                        </button>
                                        <button
                                            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition"
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

export default VoteTable;
