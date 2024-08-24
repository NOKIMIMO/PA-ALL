import { useState } from 'react';
import { HiOutlineChatAlt2, HiX } from 'react-icons/hi';
import { useNavigate } from 'react-router-dom';
import { suggestRoute } from '../utils/routeHelper';

type Message = {
    text: string;
    sender: 'user' | 'bot';
    path?: string;
};

const ChatButton = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState<Message[]>([]);
    const navigate = useNavigate();

    const toggleChat = () => {
        setIsOpen(!isOpen);
    };

    const handleSendMessage = () => {
        if (message.trim()) {
            setMessages([...messages, { text: message, sender: 'user' }]);

            const suggestedRoutes = suggestRoute(message);
            if (suggestedRoutes.length > 0) {
                setMessages((prevMessages) => [
                    ...prevMessages,
                    {
                        text: `Did you mean to go to:`,
                        sender: 'bot',
                    },
                    ...suggestedRoutes.map(route => ({
                        text: `${route.name}`,
                        sender: 'bot',
                        path: route.path // Attach path for navigation
                    } as Message)) // Specify the type of the object as Message
                ]);
            } else {
                setMessages((prevMessages) => [
                    ...prevMessages,
                    { text: "Sorry, I couldn't find what you're looking for.", sender: 'bot' },
                ]);
            }

            setMessage('');
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            handleSendMessage();
        }
    };

    const handleNavigate = (path: string) => {
        navigate(path);
        setIsOpen(false);
    };

    return (
        <>
            <div className="fixed bottom-4 right-4 z-50">
                <button
                    onClick={toggleChat}
                    className="flex items-center justify-center w-12 h-12 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-colors duration-300"
                >
                    {isOpen ? <HiX className="text-2xl" /> : <HiOutlineChatAlt2 className="text-2xl" />}
                </button>
            </div>

            {isOpen && (
                <div className="fixed bottom-20 right-4 z-50 w-80 bg-white border border-gray-300 rounded-lg shadow-lg flex flex-col">
                    <div className="p-4 flex-grow flex flex-col">
                        <h2 className="text-lg font-semibold mb-2">Chat with us</h2>
                        <div className="flex flex-col flex-grow h-48 overflow-y-auto mb-2">
                            {messages.map((msg, index) => (
                                <div
                                    key={index}
                                    className={`p-2 rounded-lg mb-2 ${msg.sender === 'user' ? 'bg-blue-100 text-right self-end' : 'bg-gray-100 text-left'
                                        }`}
                                >
                                    {msg.text}
                                    {msg.sender === 'bot' && msg.path && (
                                        <button
                                            onClick={() => handleNavigate(msg.path!)}
                                            className="text-blue-600 underline ml-2"
                                        >
                                            Go
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                        <div className="flex">
                            <input
                                type="text"
                                className="flex-grow border border-gray-300 rounded-l-lg p-2 focus:outline-none"
                                placeholder="Type a message..."
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                onKeyPress={handleKeyPress}
                            />
                            <button
                                onClick={handleSendMessage}
                                className="bg-blue-600 text-white px-4 py-2 rounded-r-lg hover:bg-blue-700 transition-colors duration-300"
                            >
                                Send
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default ChatButton;
