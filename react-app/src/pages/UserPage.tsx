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
    const { number } = useParams<{ number: string }>();
    const [userData, setUserData] = useState<any>(null);
    const [error, setError] = useState<CustomError | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [isOwner, setIsOwner] = useState<boolean>(false);
    const [userEvents, setUserEvents] = useState<any[]>([]);
    const [eventsError, setEventsError] = useState<CustomError | null>(null);
    const { user, fetchUserData } = useUser(); // Access user and fetchUserData from context
    const navigate = useNavigate();

    const eventService = new EventService();

    useEffect(() => {
        if (number === undefined || isNaN(parseInt(number))) {
            location.href = '/404';
            return;
        }
        const loadUserData = async () => {
            try {
                if (!user) {
                    await fetchUserData();
                }
                if (user && user.id) {
                    const data = await UserService.getUserById(number);
                    setUserData(data);
                    if (data.id === user.id) {
                        setIsOwner(true);
                    }
                }
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
                if (user && (user.role.toLowerCase() === 'licensed' || user.role.toLowerCase() === 'admin' || user.role.toLowerCase() === 'super_admin')) {
                    const response = await eventService.getMyEvents();
                    if (response && Array.isArray(response.events)) {
                        setUserEvents(response.events);
                    } else {
                        setEventsError(new CustomError(500, 'Invalid events format'));
                    }
                }
            } catch (err) {
                if (err instanceof CustomError) {
                    setEventsError(err);
                } else {
                    setEventsError(new CustomError(500, 'Something went wrong while fetching events'));
                }
            }
        };

        loadUserData();
        fetchUserEvents();
    }, [user, number, fetchUserData]);

    if (loading || !user) {
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

    const eventDates = userEvents.map(event => {
        return {
            date: new Date(event.event_date).toDateString(),
            title: event.title,
            id: event.id,
        };
    });

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
                                    <p className="text-success">
                                        You are viewing your own profile
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right Section - License Info */}
                    <div className="w-1/2">
                        <div className="card w-full bg-base-100 shadow-xl">
                            <div className="card-body">
                                <h2 className="card-title">License Tier</h2>
                                <p>
                                    Current Tier: {userData.license.active ? 'Member' : 'Free'}
                                </p>
                                <p>
                                    Expiry Date: {new Date(userData.license.expirationDate).toLocaleString()}
                                </p>
                                {userData.license.active && (
                                    <button
                                        className="btn btn-success mt-4 "
                                        onClick={() => navigate('/licenses')}
                                        disabled
                                    >
                                        You already have an active license
                                    </button>
                                )}
                                {!userData.license && (
                                    <button
                                        className="btn btn-primary mt-4"
                                        onClick={() => navigate('/licenses')}
                                    >
                                        Obtain License
                                    </button>
                                )}

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
                                    const currentDate = date.toDateString();
                                    const event = eventDates.find(event => event.date === currentDate);
                                    if (event) {
                                        return <p className="text-xs text-primary">{event.title}</p>;
                                    }
                                }
                                return null;
                            }}
                            tileClassName={({ date, view }) => {
                                if (view === 'month') {
                                    const currentDate = date.toDateString();
                                    const event = eventDates.find(event => event.date === currentDate);
                                    if (event) {
                                        return 'bg-blue-100 text-blue-600 rounded-lg';
                                    }
                                }
                                return 'hover:bg-gray-200 rounded-lg';
                            }}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}
