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

    const isAdmin = user?.role === user_access_type.ADMIN || user?.role === user_access_type.SUPER_ADMIN;

    const eventService = new EventService();
    const userService = UserService;

    useEffect(() => {
        const fetchEvent = async () => {
            try {
                const eventData = await eventService.getEventById(eventId!);
                setEvent(eventData);

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
            setParticipants(prev => prev + 1);
        } catch (error: any) {
            setError(error.message);
        }
    };

    const handleLeaveEvent = async () => {
        try {
            await eventService.leaveEvent(eventId!);
            setIsParticipating(false);
            setParticipants(prev => prev - 1);
        } catch (error: any) {
            setError(error.message);
        }
    };

    const handleEditEvent = () => {
        navigate(`/edit-event/${eventId}`);
    };

    const handleCreateEvent = () => {
        navigate('/create-event');
    };

    const handleGoBack = () => {
        navigate(-1); // Navigate back to the last page visited
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
                                <path fillRule="evenodd" d="M10 15l5.657-5.657a4 4 0 10-5.657-5.657 4 4 0 10-5.657 5.657L10 15zm0 0l-5.657 5.657a4 4 0 105.657-5.657 4 4 0 105.657 5.657L10 15z" clipRule="evenodd" />
                            </svg>
                            Assemblée Générale
                            <p className="text-sm mt-2">Note: Au moins la moitié des membres de l'association doivent être présents sous peine que l'assemblée générale soit annulée.</p>
                            {totalMembers > 0 && (
                                <p className="text-sm mt-2">Minimum de participants requis: {minParticipants}</p>
                            )}
                        </div>
                    )}
                </div>
                <div className="p-5">
                    <p className="text-gray-700"><strong>Description:</strong> {event.description}</p>
                    <p className="text-gray-700 mt-3"><strong>Location:</strong> {event.location}</p>
                    <p className="text-gray-700 mt-3"><strong>Event Date:</strong> {event.event_date}</p>
                    {event.data_access_type && (
                        <p className="text-gray-700 mt-3"><strong>Data Access Type:</strong> {event.data_access_type}</p>
                    )}
                    <p className={`text-gray-700 mt-3 flex items-center ${isBelowMinParticipants ? 'text-red-500' : 'text-gray-700'}`}>
                        <strong>Participants:</strong>
                        <svg className="w-5 h-5 text-gray-500 ml-2" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M13 7a4 4 0 11-8 0 4 4 0 018 0zm2 7a7 7 0 00-14 0h14z" />
                        </svg>
                        {participants}
                    </p>
                </div>
                <div className="p-5">
                    {!isParticipating ? (
                        <button
                            onClick={handleJoinEvent}
                            className="bg-green-500 text-white px-4 py-2 rounded-md"
                        >
                            Participer à l'événement
                        </button>
                    ) : (
                        <button
                            onClick={handleLeaveEvent}
                            className="bg-red-500 text-white px-4 py-2 rounded-md"
                        >
                            Annuler mon inscription
                        </button>
                    )}
                </div>
                {isAdmin && (
                    <div className="p-5">
                        <button
                            onClick={handleEditEvent}
                            className="bg-blue-500 text-white px-4 py-2 rounded-md mr-2"
                        >
                            Modifier l'événement
                        </button>
                        <button
                            onClick={handleCreateEvent}
                            className="bg-yellow-500 text-white px-4 py-2 rounded-md"
                        >
                            Créer un nouvel événement
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
