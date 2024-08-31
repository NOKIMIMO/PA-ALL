import React, { useState } from 'react';
import { EventService } from '../../services/EventService';

interface EditEventProps {
    event: Event;
    onEventUpdated: () => void;
    onCancel: () => void;
}

interface Event {
    id: number;
    title: string;
    description: string;
    event_date: string;
    location: string;
    userId: number;
    max_participants: number;
}

const EditEvent: React.FC<EditEventProps> = ({ event, onEventUpdated, onCancel }) => {
    const [title, setTitle] = useState(event.title);
    const [description, setDescription] = useState(event.description);
    const [eventDate, setEventDate] = useState(event.event_date);
    const [location, setLocation] = useState(event.location);
    const [error, setError] = useState<string | null>(null);

    const handleUpdate = async () => {
        try {
            const eventService = new EventService();
            await eventService.patchEventById(event.id.toString(), {
                title,
                description,
                event_date: eventDate,
                location,
                eventId: event.id,
                max_participants: event.max_participants, 
            });
            onEventUpdated();
        } catch (error: any) {
            setError(error.message || 'An unknown error occurred');
        }
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="title">
                    Title
                </label>
                <input
                    id="title"
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Title"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
            </div>
            <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="description">
                    Description
                </label>
                <textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Description"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
            </div>
            <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="eventDate">
                    Event Date
                </label>
                <input
                    id="eventDate"
                    type="date"
                    value={eventDate}
                    onChange={(e) => setEventDate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
            </div>
            <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="location">
                    Location
                </label>
                <input
                    id="location"
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="Location"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
            </div>
            {error && <div className="mb-4 text-red-500 text-sm">{error}</div>}
            <div className="flex justify-end space-x-4">
                <button
                    onClick={handleUpdate}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400"
                >
                    Update
                </button>
                <button
                    onClick={onCancel}
                    className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-400"
                >
                    Cancel
                </button>
            </div>
        </div>
    );
};

export default EditEvent;
