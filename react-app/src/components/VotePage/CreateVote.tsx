import React, { useState } from 'react';
import { IVoteService } from '../../services/VoteService';
import VoteService from '../../services/VoteService';

const CreateVote: React.FC<{ onCreateVote: () => void }> = ({ onCreateVote }) => {
    const [title, setTitle] = useState<string>('');
    const [description, setDescription] = useState<string>('');
    const [endDate, setEndDate] = useState<string>('');
    const [secondRoundEnabled, setSecondRoundEnabled] = useState<boolean>(false);
    const [options, setOptions] = useState<string[]>(['', '']);

    const handleCreateVote = async () => {
        try {
            const voteService: IVoteService = VoteService;
            await voteService.createVote({
                title,
                description,
                endDate: new Date(endDate),
                secondRoundEnabled,
                options: options.map(name => ({ name }))
            });
            onCreateVote();
            setTitle('');
            setDescription('');
            setEndDate('');
            setSecondRoundEnabled(false);
            setOptions(['', '']);
        } catch (error: any) {
            console.error('Failed to create vote:', error);
        }
    };

    const handleOptionChange = (index: number, value: string) => {
        const newOptions = [...options];
        newOptions[index] = value;
        setOptions(newOptions);
    };

    const addOption = () => {
        setOptions([...options, '']);
    };

    const removeOption = (index: number) => {
        if (options.length > 2) {
            const newOptions = options.filter((_, i) => i !== index);
            setOptions(newOptions);
        }
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-bold mb-4">Create a new vote</h2>
            <input
                type="text"
                placeholder="Title"
                value={title}
                onChange={e => setTitle(e.target.value)}
                className="w-full p-2 mb-4 border rounded-md"
            />
            <textarea
                placeholder="Description"
                value={description}
                onChange={e => setDescription(e.target.value)}
                className="w-full p-2 mb-4 border rounded-md"
            />
            <input
                type="date"
                value={endDate}
                onChange={e => setEndDate(e.target.value)}
                className="w-full p-2 mb-4 border rounded-md"
            />
            <label className="flex items-center mb-4">
                <input
                    type="checkbox"
                    checked={secondRoundEnabled}
                    onChange={e => setSecondRoundEnabled(e.target.checked)}
                    className="mr-2"
                />
                Enable Second Round
            </label>
            {options.map((option, index) => (
                <div key={index} className="flex items-center mb-2">
                    <input
                        type="text"
                        placeholder={`Option ${index + 1}`}
                        value={option}
                        onChange={e => handleOptionChange(index, e.target.value)}
                        className="flex-1 p-2 border rounded-md"
                    />
                    <button
                        type="button"
                        onClick={() => removeOption(index)}
                        className="ml-2 px-3 py-1 bg-red-500 text-white rounded-md hover:bg-red-600 transition duration-200"
                    >
                        Remove
                    </button>
                </div>
            ))}
            <button
                type="button"
                onClick={addOption}
                className="w-full mb-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition duration-200"
            >
                Add Option
            </button>
            <button
                type="button"
                onClick={handleCreateVote}
                className="w-full px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition duration-200"
            >
                Create Vote
            </button>
        </div>
    );
};

export default CreateVote;
