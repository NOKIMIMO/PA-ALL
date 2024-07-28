import React from 'react';
import { Message } from '../../services/MessageService';

interface MessageItemProps {
    message: Message;
}

const MessageItem: React.FC<MessageItemProps> = ({ message }) => {
    return (
        <div className="border rounded p-4 mb-4">
            <h3 className="font-bold text-lg">{message.name}</h3>
            <p className="text-gray-700">{message.email}</p>
            <p className="mt-2">{message.message}</p>
            <p className="text-gray-500 text-sm mt-4">Received on: {new Date(message.createdAt).toLocaleString()}</p>
        </div>
    );
};

export default MessageItem;
