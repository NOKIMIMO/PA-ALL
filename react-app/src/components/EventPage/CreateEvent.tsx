import React, { useState } from "react";
import {EventService} from '../../services/EventService';
import { useToast } from '../../context/ToastManager';
import { ToastType } from '../../enum/toast';
import { event_category_animal, event_category_event } from "../../enum/event-category";

interface CreateEventProps {
  onEventCreated: () => void;
  onCancel: () => void;
  
}
interface CreateEventBody {
  title: string;
  description: string;
  event_date: string;
  location: string;
  max_participants: number;
  usersId: [];
  category_event?: event_category_event
  category_animal?: event_category_animal
}



const CreateEvent: React.FC<CreateEventProps> = ({ onEventCreated, onCancel }) => {
  const [title, setTitle] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [eventDate, setEventDate] = useState<string>("");
  const [location, setLocation] = useState<string>("");
  const [maxParticipants, setMaxParticipants] = useState<number>(10); // Default value
  const [usersId, setUsersId] = useState<any>([]); // This would be populated by some user selection component
  const [categoryEvent, setCategoryEvent] = useState<event_category_event | undefined>(undefined);
  const [categoryAnimal, setCategoryAnimal] = useState<event_category_animal | undefined>(undefined);
  const { addToast } = useToast();

  const eventService = new EventService();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const createEventBody: CreateEventBody = {
      title,
      description,
      event_date: eventDate,
      location,
      max_participants: maxParticipants,
      usersId,
      category_event: categoryEvent,
      category_animal: categoryAnimal,
    };

    try {
      await eventService.createEvent(createEventBody);
      onEventCreated();
      addToast('Event created successfully', ToastType.SUCCESS);
    } catch (error) {
      console.error('Failed to create event', error);
      addToast('Failed to create event', ToastType.ERROR);
    }
  };

  return (
    <div className="bg-white p-4 rounded shadow-md">
      <h2 className="text-2xl font-bold mb-4">Create Event</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">Date</label>
          <input
            type="date"
            value={eventDate}
            onChange={(e) => setEventDate(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">Location</label>
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">Maximum Participants</label>
          <input
            type="number"
            value={maxParticipants}
            onChange={(e) => setMaxParticipants(Number(e.target.value))}
            className="w-full p-2 border border-gray-300 rounded-md"
            min={5}
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">Event Category</label>
          <select
            value={categoryEvent}
            onChange={(e) => setCategoryEvent(e.target.value as event_category_event)}
            className="w-full p-2 border border-gray-300 rounded-md"
          >
            <option value="">Select Event Category</option>
            {Object.values(event_category_event).map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">Animal Category</label>
          <select
            value={categoryAnimal}
            onChange={(e) => setCategoryAnimal(e.target.value as event_category_animal)}
            className="w-full p-2 border border-gray-300 rounded-md"
          >
            <option value="">Select Animal Category</option>
            {Object.values(event_category_animal).map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
        <div className="flex justify-end">
          <button type="button" onClick={onCancel} className="bg-gray-500 text-white px-3 py-1 rounded mr-2">
            Cancel
          </button>
          <button type="submit" className="bg-blue-500 text-white px-3 py-1 rounded">
            Create
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateEvent;