import React, { useState } from "react";
import {EventService} from '../../services/EventService';
import { useToast } from '../../context/ToastManager';
import { ToastType } from '../../enum/toast';

interface CreateEventProps {
  onEventCreated: () => void;
  onCancel: () => void;
}

const CreateEvent: React.FC<CreateEventProps> = ({ onEventCreated, onCancel }) => {
  const [title, setTitle] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [eventDate, setEventDate] = useState<string>("");
  const [location, setLocation] = useState<string>("");
  const [isAG, setIsAG] = useState<boolean>(false);
  const { addToast } = useToast();

  const eventService = new EventService();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await eventService.createEvent({
        title, description, event_date: eventDate, location, isAG,
        usersId: []
      });
      onEventCreated();
      addToast('Event created successfully', ToastType.SUCCESS);
    } catch (error) {
      console.error('Failed to create event', error);
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
          <label className="block text-gray-700 text-sm font-bold mb-2">Assemblee generale</label>
          <input
                    type="checkbox"
                    checked={isAG}
                    onChange={e => setIsAG(e.target.checked)}
                    className="mr-2"
                />
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
