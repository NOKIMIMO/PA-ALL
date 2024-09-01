import { useEffect, useState } from "react";
import { EventService } from "../services/EventService";
import { Card } from "../components/Card";
import EditEvent from "../components/EventPage/EditEvent";
import CreateEvent from "../components/EventPage/CreateEvent";
import { user_access_type } from "../commons/user_access_type";
import { useUser } from '../context/UserContext';
import Loading from "../components/Loading";

interface Event {
  id: number;
  title: string;
  description: string;
  event_date: string;
  location: string;
  userId: number;
}

interface EventsResponse {
  events: Event[];
  totalCount: number;
}

export default function EventListPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [startDate, setStartDate] = useState<string>(getTodayDate());
  const [endDate, setEndDate] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [creatingEvent, setCreatingEvent] = useState<boolean>(false);
  const { user } = useUser();
  const [isAdmin, setIsAdmin] = useState<boolean>(false); // Add state for admin check
  const eventService = new EventService();

  function getTodayDate(): string {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  useEffect(() => {
    fetchEvents();
    checkAdminRole();
  }, []);

  const checkAdminRole = () => {
    setIsAdmin(user?.role === user_access_type.ADMIN || user?.role === user_access_type.SUPER_ADMIN);
  };

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const data: EventsResponse = await eventService.getEvents(1, 10);
      if (data && data.events) {
        setEvents(data.events);
      } else {
        setError("No events found");
      }
      setLoading(false);
    } catch (err: any) {
      setError(err.message || "Failed to fetch events");
      setLoading(false);
    }
  };

  const filterEventsByDate = (events: Event[], startDate: string, endDate: string) => {
    if (!startDate && !endDate) {
      return events;
    }

    const start = new Date(startDate).getTime();
    const end = new Date(endDate).getTime();

    return events.filter(event => {
      const eventDate = new Date(event.event_date).getTime();
      return (!startDate || eventDate >= start) && (!endDate || eventDate <= end);
    });
  };

  const filterEventsBySearch = (events: Event[], query: string) => {
    if (!query) {
      return events;
    }

    return events.filter(event =>
      event.title.toLowerCase().includes(query.toLowerCase()) ||
      event.description.toLowerCase().includes(query.toLowerCase()) ||
      event.location.toLowerCase().includes(query.toLowerCase())
    );
  };

  const handleDelete = async (eventId: number) => {
    try {
      await eventService.deleteEventById(eventId);
      fetchEvents(); // Refresh events after deletion
    } catch (error: any) {
      setError(error.message || 'An unknown error occurred');
    }
  };

  const handleEventCreated = () => {
    setCreatingEvent(false);
    fetchEvents();
  };

  const filteredEvents = filterEventsByDate(events, startDate, endDate);
  const finalFilteredEvents = filterEventsBySearch(filteredEvents, searchQuery);
  if (loading) return <Loading/>
  

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="container mx-auto mt-5 p-4">
      <div className="flex justify-between mb-4">
        <div>
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Start Date:
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="ml-2 p-2 border border-gray-300 rounded-md"
            />
          </label>
        </div>
        <div>
          <label className="block text-gray-700 text-sm font-bold mb-2">
            End Date:
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="ml-2 p-2 border border-gray-300 rounded-md"
            />
          </label>
        </div>
        <div>
          <input
            type="text"
            placeholder="Search events..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="p-2 border border-gray-300 rounded-md"
          />
        </div>
        {isAdmin && (
          <div>
            <button
              onClick={() => setCreatingEvent(true)}
              className="bg-blue-500 text-white px-4 py-2 rounded-md"
            >
              Create Event
            </button>
          </div>
        )}
      </div>

      {creatingEvent && (
        <CreateEvent onEventCreated={handleEventCreated} onCancel={() => setCreatingEvent(false)} />
      )}

      <div className="max-w-screen-lg mx-auto mt-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {finalFilteredEvents.length > 0 ? (
            finalFilteredEvents.map(event => (
              editingEvent && editingEvent.id === event.id ? (
                <EditEvent
                  key={event.id}
                  event={event}
                  onEventUpdated={() => { setEditingEvent(null); fetchEvents(); }}
                  onCancel={() => setEditingEvent(null)}
                />
              ) : (
                <Card
                  key={event.id}
                  title={event.title}
                  content={event.description}
                  subtext={event.event_date}
                  pageLink={"./Event/EventPage/" + event.id}
                  showActions={isAdmin} // Show edit and delete actions only if admin
                  onEdit={() => setEditingEvent(event)}
                  onDelete={() => handleDelete(event.id)}
                />
              )
            ))
          ) : (
            <div>No events found in the selected date range</div>
          )}
        </div>
      </div>
    </div>
  );
}
