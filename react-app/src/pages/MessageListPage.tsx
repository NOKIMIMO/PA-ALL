import React from 'react';
import MessageList from '../components/MessageListPage/MessageList';

const MessagesPage: React.FC = () => {
    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">Messages</h1>
            <MessageList />
        </div>
    );
};

export default MessagesPage;
