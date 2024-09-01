import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { EventService } from '../../services/EventService';
import UserService from '../../services/UserService';
import { useUser } from '../../context/UserContext';
import { user_access_type } from '../../commons/user_access_type';

export default function EventPage() {
    const { eventId } = useParams<{ eventId: string }>();
    const navigate = useNavigate();
    const [event, setEvent] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [participants, setParticipants] = useState<number>(0);
    const [isParticipating, setIsParticipating] = useState<boolean>(false);
    const [totalMembers, setTotalMembers] = useState<number>(0);
    const [minParticipants, setMinParticipants] = useState<number>(0);
    const { user } = useUser();
    const [isEditing, setIsEditing] = useState<boolean>(false);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        event_date: '',
        location: '',
        max_participant: 0,
    });

    const isAdmin = user?.role === user_access_type.ADMIN || user?.role === user_access_type.SUPER_ADMIN;

    const eventService = new EventService();
    const userService = UserService;

    useEffect(() => {
        const fetchEvent = async () => {
            try {
                const eventData = await eventService.getEventById(eventId!);
                setEvent(eventData);

                setFormData({
                    title: eventData.title,
                    description: eventData.description,
                    event_date: eventData.event_date,
                    location: eventData.location,
                    max_participant: eventData.max_participant,
                });
                if (eventData.isAG) {
                    let page = 1;
                    let users: any[] = [];
                    let hasMore = true;

                    while (hasMore) {
                        const usersData = await userService.getUserList(page, 100);
                        users = users.concat(usersData.users);
                        if (usersData.users.length < 100) {
                            hasMore = false;
                        } else {
                            page++;
                        }
                    }

                    const total = users.length;
                    setTotalMembers(total);
                    setMinParticipants(Math.ceil(total / 2));
                }

                setLoading(false);
            } catch (error: any) {
                setError(error.message);
                setLoading(false);
            }
        };

        const fetchParticipants = async () => {
            try {
                const participantsData = await eventService.getEventParticipants(eventId!);
                setParticipants(participantsData.users.length);

                const userData = await userService.getUserDataByToken();
                const isUserParticipating = participantsData.users.some((user: any) => user.userId === userData.userId);
                setIsParticipating(isUserParticipating);
            } catch (error: any) {
                setError(error.message);
            }
        };

        fetchEvent();
        fetchParticipants();
    }, [eventId]);

    const handleJoinEvent = async () => {
        try {
            await eventService.joinEvent(eventId!);
            setIsParticipating(true);
            setParticipants((prev) => prev + 1);
        } catch (error: any) {
            setError(error.message);
        }
    };

    const handleLeaveEvent = async () => {
        try {
            await eventService.leaveEvent(eventId!);
            setIsParticipating(false);
            setParticipants((prev) => prev - 1);
        } catch (error: any) {
            setError(error.message);
        }
    };

    const handleEditEvent = () => {
        setIsEditing(true);
    };

    const handleSaveChanges = async () => {
        try {
            await eventService.patchEventById(eventId!, {
                title: formData.title,
                description: formData.description,
                event_date: formData.event_date,
                location: formData.location,
                max_participants: Number(formData.max_participant),
            });
            setEvent({ ...event, ...formData });
            setIsEditing(false);
        } catch (error: any) {
            setError(error.message);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleCancelEdit = () => {
        setIsEditing(false);
    };

    const handleGoBack = () => {
        navigate(-1);
    };

    if (loading) {
        return <div className="text-center mt-5">Loading...</div>;
    }

    if (error) {
        return <div className="text-red-500 text-center mt-5">{error}</div>;
    }

    const isBelowMinParticipants = event?.isAG && participants < minParticipants;

    return (
        <div className="container mx-auto mt-10 p-5">
            <div className="bg-white shadow-md rounded-lg overflow-hidden">
                <div className="p-5 bg-gray-100">
                    <button
                        onClick={handleGoBack}
                        className="text-gray-500 hover:text-gray-700 mb-3 underline flex items-center"
                    >
                        ← Back
                    </button>
                    <h2 className="text-3xl font-bold text-gray-800 mb-3">{event.title}</h2>
                    {event.isAG && (
                        <div className="text-red-500 font-semibold">
                            <svg className="inline w-6 h-6 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                <path
                                    fillRule="evenodd"
                                    d="M10 15l5.657-5.657a4 4 0 10-5.657-5.657 4 4 0 10-5.657 5.657L10 15zm0 0l-5.657 5.657a4 4 0 105.657-5.657 4 4 0 105.657 5.657L10 15z"
                                    clipRule="evenodd"
                                />
                            </svg>
                            Assemblée Générale
                            <p className="text-sm mt-2">
                                Note: Au moins la moitié des membres de l'association doivent être présents sous peine que l'assemblée générale soit annulée.
                            </p>
                            {totalMembers > 0 && <p className="text-sm mt-2">Minimum de participants requis: {minParticipants}</p>}
                        </div>
                    )}
                </div>
                {isEditing ? (
                    <div className="p-5">
                        <input
                            type="text"
                            name="title"
                            value={formData.title}
                            onChange={handleInputChange}
                            placeholder="Titre de l'événement"
                            className="border p-2 mb-3 w-full"
                        />
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleInputChange}
                            placeholder="Description"
                            className="border p-2 mb-3 w-full"
                        />
                        <input
                            type="datetime-local"
                            name="event_date"
                            value={new Date(formData.event_date).toISOString().slice(0, -8)}
                            onChange={handleInputChange}
                            className="border p-2 mb-3 w-full"
                        />
                        <input
                            type="text"
                            name="location"
                            value={formData.location}
                            onChange={handleInputChange}
                            placeholder="Lieu"
                            className="border p-2 mb-3 w-full"
                        />
                        <input
                            type="number"
                            name="max_participant"
                            value={formData.max_participant}
                            onChange={handleInputChange}
                            placeholder="Nombre maximal de participants"
                            className="border p-2 mb-3 w-full"
                        />
                        <div className="flex justify-end">
                            <button onClick={handleCancelEdit} className="bg-gray-500 text-white px-4 py-2 rounded-md mr-2">
                                Annuler
                            </button>
                            <button onClick={handleSaveChanges} className="bg-blue-500 text-white px-4 py-2 rounded-md">
                                Sauvegarder
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="p-5">
                        <p className="text-gray-800 mb-3">{event.description}</p>
                        <p className="text-gray-600">Date: {new Date(event.event_date).toLocaleString()}</p>
                        <p className="text-gray-600">Lieu: {event.location}</p>
                        <p className="text-gray-600">Participants: {participants} / {event.max_participant}</p>
                        {isBelowMinParticipants && <p className="text-red-500 font-semibold">Participants insuffisants pour l'assemblée générale.</p>}
                        <div className="mt-5">
                            {isParticipating ? (
                                <button onClick={handleLeaveEvent} className="bg-red-500 text-white px-4 py-2 rounded-md">
                                    Quitter l'événement
                                </button>
                            ) : (
                                <button onClick={handleJoinEvent} className="bg-green-500 text-white px-4 py-2 rounded-md">
                                    Participer à l'événement
                                </button>
                            )}
                            {isAdmin && (
                                <button onClick={handleEditEvent} className="bg-yellow-500 text-white px-4 py-2 rounded-md ml-2">
                                    Modifier l'événement
                                </button>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
