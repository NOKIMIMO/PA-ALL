import { CustomError } from "../commons/Error";
import { useParams } from "react-router-dom"; // Importez useNavigate pour la redirection
import UserService from "../services/UserService";
import { EventService } from "../services/EventService";
import { useState, useEffect } from "react";
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';

export default function UserPage() {
    const { number } = useParams<{ number: string }>();
    const [userData, setUserData] = useState<any>(null);
    const [error, setError] = useState<CustomError | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [isOwner, setIsOwner] = useState<boolean>(false);
    const [userEvents, setUserEvents] = useState<any[]>([]);
    const [eventsError, setEventsError] = useState<CustomError | null>(null);

    const eventService = new EventService();
    // const navigate = useNavigate(); // Utilisez useNavigate pour la redirection

    useEffect(() => {
        if (number === undefined || isNaN(parseInt(number))) {
            location.href = '/404';
            return;
        }

        const fetchUserData = async () => {
            try {
                const data = await UserService.getUserById(number);
                const user = await UserService.getUserDataByToken();
                if (data.id === user.id) {
                    setIsOwner(true);
                }
                setUserData(data);
            } catch (err) {
                if (err instanceof CustomError) {
                    setError(err);
                } else {
                    setError(new CustomError(500, 'Something went wrong'));
                }
            } finally {
                setLoading(false);
            }
        };

        const fetchUserEvents = async () => {
            try {
                const response = await eventService.getMyEvents();
                console.log('Fetched events:', response); // Verify events are fetched
                if (response && Array.isArray(response.events)) {
                    setUserEvents(response.events);
                } else {
                    setEventsError(new CustomError(500, 'Invalid events format'));
                }
            } catch (err) {
                if (err instanceof CustomError) {
                    setEventsError(err);
                } else {
                    setEventsError(new CustomError(500, 'Something went wrong while fetching events'));
                }
            }
        };

        fetchUserData();
        fetchUserEvents();
    }, [number]);

    if (loading) {
        return <div className="flex justify-center items-center h-screen"><span className="loading loading-spinner text-primary"></span> Loading...</div>;
    }

    if (error) {
        return <div className="alert alert-error shadow-lg mt-4"><div><span>Error: {error.message}</span></div></div>;
    }

    if (eventsError) {
        return <div className="alert alert-error shadow-lg mt-4"><div><span>Error fetching events: {eventsError.message}</span></div></div>;
    }

    const eventDates = userEvents.map(event => {
        return {
            date: new Date(event.event_date).toDateString(),
            title: event.title,
            id: event.id,
        };
    });

    // const handleDayClick = (date) => {
    //     const clickedDate = date.toDateString();
    //     const event = eventDates.find(event => event.date === clickedDate);
    //     if (event) {
    //         navigate(`../../Event/EventPage/${event.id}`); // Redirige vers la page de l'événement
    //     }
    // };

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-3xl font-bold mb-4">User Page</h1>
            {userData && (
                <div className="card w-full bg-base-100 shadow-xl mb-6">
                    <div className="card-body">
                        <h2 className="card-title">{userData.name}</h2>
                        <p>ID: {userData.id}</p>
                        <p>Email: {userData.email}</p>
                        {isOwner && <p className="text-success">You are viewing your own profile</p>}
                    </div>
                </div>
            )}
            {userEvents.length > 0 && (
                <div className="card w-full bg-base-100 shadow-xl">
                    <div className="card-body">
                        <h2 className="card-title">User Events</h2>
                        <Calendar
                            tileContent={({ date, view }: { date: Date; view: string }) => {
                                if (view === 'month') {
                                    const currentDate = date.toDateString();
                                    const event = eventDates.find(event => event.date === currentDate);
                                    if (event) {
                                        return <p className="text-xs text-primary">{event.title}</p>;
                                    }
                                }
                                return null;
                            }}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}
