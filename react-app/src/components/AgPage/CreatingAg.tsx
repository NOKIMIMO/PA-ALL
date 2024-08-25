import { useState } from "react";
import AGService from "../../services/AGService";
import { useToast } from '../../context/ToastManager';
import { ToastType } from '../../enum/toast';
import { ag_category } from "../../enum/ag-category";

interface CreateEventProps {
  onEventCreated: () => void;
  onCancel: () => void;
}


// interface CreateAgRequest {
//     title: string;
//     description: string;
//     ag_date: string;
//     location: string;
//     minimum_participants: number;
//     category?: ag_category;
// }

const CreateEvent: React.FC<CreateEventProps> = ({ onEventCreated, onCancel }) => {
  const [title, setTitle] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [minimum_participants, setMinimum_participants] = useState<number>(5);
  const [ag_date, setag_date] = useState<string>("");
  const [location, setLocation] = useState<string>("");
  const [category, setCategory] = useState<ag_category>(ag_category.GENERAL);
  const { addToast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await AGService.createAg({
        title, description, ag_date: ag_date, location, minimum_participants,
        category: ag_category.GENERAL});
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
            value={ag_date}
            onChange={(e) => setag_date(e.target.value)}
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
