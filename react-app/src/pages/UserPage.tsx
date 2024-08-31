import { useNavigate, useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import '../css/reactCalendar.css';
import { useUser } from '../context/UserContext';
import UserService from "../services/UserService";
import { EventService } from "../services/EventService";
import { CustomError } from "../commons/Error";

export default function UserPage() {
    const { number: paramNumber } = useParams<{ number: string }>();
    const [userData, setUserData] = useState<any>(null);
    const [error, setError] = useState<CustomError | null>(null);
    const [loadingPage, setLoadingPage] = useState<boolean>(true);
    const [isOwner, setIsOwner] = useState<boolean>(false);
    const [userEvents, setUserEvents] = useState<any[]>([]);
    const [eventsError, setEventsError] = useState<CustomError | null>(null);
    const { user, loading } = useUser();
    const navigate = useNavigate();
    const eventService = new EventService();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const path = window.location.pathname;
                const paramNumber = path.includes('/user/self') ? 'self' : path.split('/user/')[1];
                
                if (paramNumber !== 'self' && (!paramNumber || isNaN(parseInt(paramNumber)))) {
                    navigate('/404');
                    return;
                }

                // Fetch user data
                
                const data = paramNumber === 'self' && user ? await UserService.getUserById(user.id.toString()) : await UserService.getUserById(paramNumber);
                setUserData(data);

                if (data.id === user?.id) {
                    setIsOwner(true);
                }

                // Fetch user events if applicable
                if (user && ['licensed', 'admin', 'super_admin'].includes(user.role.toLowerCase())) {
                    const response = await eventService.getMyEvents();
                    if (response?.events) {
                        setUserEvents(response.events);
                    } else {
                        setEventsError(new CustomError(500, 'Invalid events format'));
                    }
                }
            } catch (err) {
                setError(err instanceof CustomError ? err : new CustomError(500, 'Something went wrong'));
            } finally {
                setLoadingPage(false);
            }
        };

        if (paramNumber === 'self' && !user) {
            // Wait for user data if needed
            const handleSelfRoute = async () => {
                fetchData();
            };
            handleSelfRoute();
        } else {
            fetchData();
        }
    }, [paramNumber, user, navigate]);

    if (loadingPage) {
        return (
            <div className="flex justify-center items-center h-screen">
                <span className="loading loading-spinner text-primary"></span> Loading...
            </div>
        );
    }

    if (error) {
        return (
            <div className="alert alert-error shadow-lg mt-4">
                <div>
                    <span>Error: {error.message}</span>
                </div>
            </div>
        );
    }

    if (eventsError) {
        return (
            <div className="alert alert-error shadow-lg mt-4">
                <div>
                    <span>Error fetching events: {eventsError.message}</span>
                </div>
            </div>
        );
    }

    const eventDates = userEvents.map(event => ({
        date: new Date(event.event_date).toDateString(),
        title: event.title,
        id: event.id,
    }));

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-3xl font-bold mb-4">User Page</h1>
            {userData && (
                <div className="flex gap-6 mb-6">
                    {/* Left Section - User Data */}
                    <div className="w-1/2">
                        <div className="card w-full bg-base-100 shadow-xl">
                            <div className="card-body">
                                <h2 className="card-title">{userData.name}</h2>
                                <p>ID: {userData.id}</p>
                                <p>Email: {userData.email}</p>
                                <p>Role: {userData.role}</p>
                                <p>Firstname: {userData.firstname}</p>
                                <p>Lastname: {userData.lastname}</p>
                                <p>Created At: {new Date(userData.createdAt).toLocaleString()}</p>
                                {isOwner && (
                                    <p className="text-success">You are viewing your own profile</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right Section - License Info */}
                    <div className="w-1/2">
                        <div className="card w-full bg-base-100 shadow-xl">
                            <div className="card-body">
                                <h2 className="card-title">License Tier</h2>
                                <p>Current Tier: {userData.license.active ? 'Member' : 'Free'}</p>
                                <p>
                                    Expiry Date: {userData.license.expirationDate 
                                        ? new Date(userData.license.expirationDate).toLocaleString() 
                                        : "Jusqu'a ce que vous nous joignez ;)"}
                                </p>
                                <button
                                    className={`btn mt-4 ${userData.license.active ? 'btn-success' : 'btn-primary'}`}
                                    onClick={() => navigate('/licenses')}
                                    disabled={userData.license.active}
                                >
                                    {userData.license.active ? 'You already have an active license' : 'Obtain License'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {userEvents.length > 0 && (
                <div className="card w-full bg-base-100 shadow-xl">
                    <div className="card-body">
                        <h2 className="card-title">User Events</h2>
                        <Calendar
                            className="react-calendar"
                            tileContent={({ date, view }) => {
                                if (view === 'month') {
                                    const event = eventDates.find(event => event.date === date.toDateString());
                                    return event ? <p className="text-xs text-primary">{event.title}</p> : null;
                                }
                                return null;
                            }}
                            tileClassName={({ date, view }) => {
                                if (view === 'month') {
                                    const event = eventDates.find(event => event.date === date.toDateString());
                                    return event ? 'bg-blue-100 text-blue-600 rounded-lg' : 'hover:bg-gray-200 rounded-lg';
                                }
                                return '';
                            }}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}
