import React, { useEffect, useState } from 'react';
import {EventService} from '../../services/EventService';
import { CustomError } from '../../commons/Error';

interface Event {
    id: number;
    title: string;
    description: string;
    event_date: string;
    location: string;
    userId: number;
    isAG: boolean;
}

const EventTable: React.FC = () => {
    const [events, setEvents] = useState<Event[]>([]);
    const [page, setPage] = useState(1);
    const [limit] = useState(10);
    const [error, setError] = useState<string | null>(null);
    const [editingEvent, setEditingEvent] = useState<Event | null>(null);

    useEffect(() => {
        fetchEvents();
    }, [page, limit]);

    const eventService = new EventService();

    const fetchEvents = async () => {
        try {
            const eventData = await eventService.getEvents(page, limit);
            if (eventData instanceof CustomError) {
                setError(eventData.message);
            } else if (eventData && Array.isArray(eventData.events)) {
                setEvents(eventData.events);
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
            await eventService.deleteEventById(id.toString());
            fetchEvents();
        } catch (err) {
            setError((err as Error).message);
        }
    };

    const handleEdit = (event: Event) => {
        setEditingEvent(event);
    };

    const handleCancelEdit = () => {
        setEditingEvent(null);
    };

    const handleSaveEdit = async () => {
        if (editingEvent) {
            const updateData = {
                eventId: editingEvent.id,
                title: editingEvent.title,
                description: editingEvent.description,
                event_date: editingEvent.event_date,
                location: editingEvent.location
            };
            try {
                await eventService.patchEventById(editingEvent.id.toString(), updateData);
                setEditingEvent(null);
                fetchEvents();
            } catch (err) {
                setError((err as Error).message);
            }
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        if (editingEvent) {
            setEditingEvent({ ...editingEvent, [e.target.name]: e.target.value });
        }
    };

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">Event Management</h1>
            {error && <div className="bg-red-200 text-red-800 p-2 mb-4 rounded">{error}</div>}
            <table className="min-w-full bg-white border border-gray-200">
                <thead>
                    <tr>
                        <th className="py-2 px-4 border-b">ID</th>
                        <th className="py-2 px-4 border-b">Title</th>
                        <th className="py-2 px-4 border-b">Description</th>
                        <th className="py-2 px-4 border-b">Date</th>
                        <th className="py-2 px-4 border-b">Location</th>
                        <th className="py-2 px-4 border-b">Actions</th>
                        <th className="py-2 px-4 border-b">IsAG</th>
                    </tr>
                </thead>
                <tbody>
                    {events.map((event) => (
                        <tr key={event.id}>
                            <td className="py-2 px-4 border-b">{event.id}</td>
                            <td className="py-2 px-4 border-b">
                                {editingEvent && editingEvent.id === event.id ? (
                                    <input
                                        type="text"
                                        name="title"
                                        value={editingEvent.title}
                                        onChange={handleChange}
                                        className="border px-2 py-1"
                                    />
                                ) : (
                                    event.title
                                )}
                            </td>
                            <td className="py-2 px-4 border-b">
                                {editingEvent && editingEvent.id === event.id ? (
                                    <textarea
                                        name="description"
                                        value={editingEvent.description}
                                        onChange={handleChange}
                                        className="border px-2 py-1"
                                    />
                                ) : (
                                    event.description
                                )}
                            </td>
                            <td className="py-2 px-4 border-b">
                                {editingEvent && editingEvent.id === event.id ? (
                                    <input
                                        type="date"
                                        name="event_date"
                                        value={editingEvent.event_date}
                                        onChange={handleChange}
                                        className="border px-2 py-1"
                                    />
                                ) : (
                                    event.event_date
                                )}
                            </td>
                            <td className="py-2 px-4 border-b">
                                {editingEvent && editingEvent.id === event.id ? (
                                    <input
                                        type="text"
                                        name="location"
                                        value={editingEvent.location}
                                        onChange={handleChange}
                                        className="border px-2 py-1"
                                    />
                                ) : (
                                    event.location
                                )}
                            </td>
                            <td className="py-2 px-4 border-b">
                                {editingEvent && editingEvent.id === event.id ? (
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
                                            onClick={() => handleEdit(event)}
                                        >
                                            Edit
                                        </button>
                                        <button
                                            className="bg-red-500 text-white px-2 py-1 rounded"
                                            onClick={() => handleDelete(event.id)}
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

export default EventTable;
