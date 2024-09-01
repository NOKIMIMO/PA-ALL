import { useState, useEffect } from 'react';

interface BanModalProps {
    userId: number | null;
    onSubmit: (data: { user_id: number; message: string; reason: string; end_date: string }) => void;
    onClose: () => void;
}

const BanModal: React.FC<BanModalProps> = ({ userId, onSubmit, onClose }) => {
    const [message, setMessage] = useState<string | null>(null);
    const [reason, setReason] = useState<string | null>(null);
    const [end_date, setEndDate] = useState<string>(getDefaultBanEndDate());

    function getDefaultBanEndDate(): string {
        const defaultEndDate = new Date();
        defaultEndDate.setMonth(defaultEndDate.getMonth() + 6);
        return defaultEndDate.toISOString().split('T')[0]; // Format to 'YYYY-MM-DD'
    }

    function getMinBanEndDate(): string {
        const minEndDate = new Date();
        minEndDate.setDate(minEndDate.getDate() + 14);
        return minEndDate.toISOString().split('T')[0]; // Format to 'YYYY-MM-DD'
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault(); // Prevent form from reloading the page

        if (!message || !reason || !end_date) {
            alert('All fields are required');
            return;
        }

        if (userId !== null) {
            onSubmit({
                user_id: userId,
                message,
                reason,
                end_date,
            });
        }
    };

    return (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center">
            <div className="bg-white text-black p-8 rounded-lg shadow-lg max-w-md w-full">
                <h2 className="text-2xl font-bold mb-4">Ban User</h2>
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2">Message</label>
                        <input
                            type="text"
                            className="w-full p-2 border border-gray-300 rounded"
                            value={message ?? ''}
                            onChange={(e) => setMessage(e.target.value)}
                            required
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2">Reason</label>
                        <input
                            type="text"
                            className="w-full p-2 border border-gray-300 rounded"
                            value={reason ?? ''}
                            onChange={(e) => setReason(e.target.value)}
                            required
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2">End Date</label>
                        <input
                            type="date"
                            className="w-full p-2 border border-gray-300 rounded"
                            value={end_date}
                            onChange={(e) => setEndDate(e.target.value)}
                            min={getMinBanEndDate()}
                            required
                        />
                    </div>
                    <div className="flex justify-end">
                        <button
                            type="submit"
                            className="bg-red-600 text-white px-4 py-2 rounded mr-2"
                        >
                            Ban User
                        </button>
                        <button
                            type="button"
                            className="bg-gray-300 text-black px-4 py-2 rounded"
                            onClick={onClose}
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default BanModal;
