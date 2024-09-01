import React, { useEffect, useState } from 'react';
import { EventService } from '../../services/EventService';
import { CustomError } from '../../commons/Error';
import GenericTable from './GenereicTable';

interface Event {
    id: number;
    title: string;
    description: string;
    event_date: string;
    location: string;
    userId: number;
    max_participants: number;
    active: boolean;
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
            await eventService.deleteEventById(id);
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
                location: editingEvent.location,
                max_participants : editingEvent.max_participants,
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

    const headers = ['ID', 'Title', 'Description', 'Date', 'Location'];

    return (
        <div className="container mx-auto p-8 bg-black text-white rounded-xl shadow-2xl">
            <h1 className="text-4xl font-bold mb-8 text-center">Event Management</h1>
            {error && <div className="bg-red-600 text-white p-4 mb-8 rounded-lg">{error}</div>}
            <GenericTable<Event>
                headers={headers}
                rows={events}
                renderRow={(event, isEditing, handleInputChange) => (
                    <>
                        <td className="py-2 px-4 border-b">{event.id}</td>
                        <td className="py-2 px-4 border-b">
                            {isEditing ? (
                                <input
                                    type="text"
                                    name="title"
                                    value={event.title}
                                    onChange={handleInputChange}
                                    className="bg-gray-900 text-white border-b-2 border-yellow-500 focus:border-yellow-700 focus:outline-none px-3 py-2"
                                />
                            ) : (
                                event.title
                            )}
                        </td>
                        <td className="py-2 px-4 border-b">
                            {isEditing ? (
                                <textarea
                                    name="description"
                                    value={event.description}
                                    onChange={handleInputChange}
                                    className="bg-gray-900 text-white border-b-2 border-yellow-500 focus:border-yellow-700 focus:outline-none px-3 py-2"
                                />
                            ) : (
                                event.description
                            )}
                        </td>
                        <td className="py-2 px-4 border-b">
                            {isEditing ? (
                                <input
                                    type="date"
                                    name="event_date"
                                    value={event.event_date}
                                    onChange={handleInputChange}
                                    className="bg-gray-900 text-white border-b-2 border-yellow-500 focus:border-yellow-700 focus:outline-none px-3 py-2"
                                />
                            ) : (
                                event.event_date
                            )}
                        </td>
                        <td className="py-2 px-4 border-b">
                            {isEditing ? (
                                <input
                                    type="text"
                                    name="location"
                                    value={event.location}
                                    onChange={handleInputChange}
                                    className="bg-gray-900 text-white border-b-2 border-yellow-500 focus:border-yellow-700 focus:outline-none px-3 py-2"
                                />
                            ) : (
                                event.location
                            )}
                        </td>
                    </>
                )}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onSaveEdit={handleSaveEdit}
                onCancelEdit={handleCancelEdit}
                editingRow={editingEvent}
            />
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

export default EventTable;
