import { useState } from 'react';
import PostTable from '../../components/AdminPage/PostTable';
import UserTable from '../../components/AdminPage/UsersTable';
import EventTable from '../../components/AdminPage/EventTable';
import MessageListPage from '../MessageListPage';
import VoteTable from '../../components/AdminPage/VoteTable';

export default function AdminPage() {
    const [activeTab, setActiveTab] = useState('users');

    const renderContent = () => {
        switch (activeTab) {
            case 'users':
                return <UserTable />;
            case 'posts':
                return <PostTable />;
            case 'events':
                return <EventTable />;
            case 'messages':
                return <MessageListPage />;
            case 'votes':
                return <VoteTable />;
            default:
                return null;
        }
    };

    return (
        <div className="flex flex-col min-h-screen w-full bg-gray-100">
            {/* Tab navigation */}
            <div className="tabs w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white">
                <a
                    className={`tab tab-lifted ${activeTab === 'users' ? 'tab-active' : ''} hover:bg-purple-700`}
                    onClick={() => setActiveTab('users')}
                >
                    Users
                </a>
                <a
                    className={`tab tab-lifted ${activeTab === 'posts' ? 'tab-active' : ''} hover:bg-purple-700`}
                    onClick={() => setActiveTab('posts')}
                >
                    Posts
                </a>
                <a
                    className={`tab tab-lifted ${activeTab === 'events' ? 'tab-active' : ''} hover:bg-purple-700`}
                    onClick={() => setActiveTab('events')}
                >
                    Events
                </a>
                <a
                    className={`tab tab-lifted ${activeTab === 'messages' ? 'tab-active' : ''} hover:bg-purple-700`}
                    onClick={() => setActiveTab('messages')}
                >
                    Messages
                </a>
                <a
                    className={`tab tab-lifted ${activeTab === 'votes' ? 'tab-active' : ''} hover:bg-purple-700`}
                    onClick={() => setActiveTab('votes')}
                >
                    Votes
                </a>
            </div>

            {/* Content area */}
            <div className="flex-grow p-4 bg-white shadow-md rounded-lg">
                {renderContent()}
            </div>
        </div>
    );
}
