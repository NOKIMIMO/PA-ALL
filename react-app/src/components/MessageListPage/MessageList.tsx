import React, { useEffect, useState } from 'react';
import MessageService, { Message } from '../../services/MessageService';
import MessageItem from './MessageItem';
import { CustomError } from '../../commons/Error';

const MessageList: React.FC = () => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

    useEffect(() => {
        const fetchMessages = async () => {
            setLoading(true);
            setError(null);
            const result = await MessageService.getMessages();

            if (result instanceof CustomError) {
                setError(result.message);
            } else {
                setMessages(result);
            }
            setLoading(false);
        };

        fetchMessages();
    }, []);

    const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setSortOrder(e.target.value as 'asc' | 'desc');
    };

    const sortedMessages = [...messages].sort((a, b) => {
        const dateA = new Date(a.createdAt).getTime();
        const dateB = new Date(b.createdAt).getTime();
        return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
    });

    if (loading) {
        return <p>Loading...</p>;
    }

    if (error) {
        return <p className="text-red-500">{error}</p>;
    }

    return (
        <div>
            <div className="flex justify-between items-center mb-4">
                <select value={sortOrder} onChange={handleSortChange} className="select select-bordered">
                    <option value="asc">Date (Ascending)</option>
                    <option value="desc">Date (Descending)</option>
                </select>
            </div>
            {sortedMessages.length === 0 ? (
                <p>No messages found.</p>
            ) : (
                sortedMessages.map(message => <MessageItem key={message.id} message={message} />)
            )}
        </div>
    );
};

export default MessageList;
