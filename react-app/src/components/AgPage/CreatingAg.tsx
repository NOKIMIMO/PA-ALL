import { useState } from "react";
import AGService from "../../services/AGService";
import { useToast } from '../../context/ToastManager';
import { ToastType } from '../../enum/toast';
import { ag_category } from "../../enum/ag-category";
import VotingModal from "./createVoteInAg";

interface CreateEventProps {
  onEventCreated: () => void;
  onCancel: () => void;
}

interface CreateAgRequest {
  title: string;
  description: string;
  ag_date: string;
  location: string;
  minimum_participants: number;
  category?: ag_category;
  vote_id?: number;
  ban_appeal_id?: number;
}

const CreateEvent: React.FC<CreateEventProps> = ({ onEventCreated, onCancel }) => {
  const [title, setTitle] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [ag_date, setAg_date] = useState<string>("");
  const [location, setLocation] = useState<string>("");
  const [minimum_participants, setMinimum_participants] = useState<number>(5);
  const [category, setCategory] = useState<ag_category>(ag_category.GENERAL);
  const [creatingVoting, setCreatingVoting] = useState<boolean>(false);
  const [request, setRequest] = useState<CreateAgRequest>();
  const { addToast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const createAgRequest: CreateAgRequest = {
      title,
      description,
      ag_date,
      location,
      minimum_participants,
      category,
    };

    try {
      if (createAgRequest.category === ag_category.VOTING) {
        // ask if want to create a voting event or use an existing
        // if create, create a new voting event
        // if use existing, show a list of voting events
        setRequest(createAgRequest);
        setCreatingVoting(true);
      } else {
        await AGService.createAg(createAgRequest);
        onEventCreated();
        addToast('Event created successfully', ToastType.SUCCESS);
      }
    } catch (error) {
      console.error('Failed to create event', error);
      addToast('Failed to create event', ToastType.ERROR);
    }
  };
  const handleAgSubmit = async (vote: any) => {
    console.log(vote);
    try {
      const createAgRequest: CreateAgRequest = {
        title,
        description,
        ag_date,
        location,
        minimum_participants,
        category,
        vote_id: vote.id
      };
      await AGService.createAg(createAgRequest);
      onEventCreated();
      addToast('Event created successfully', ToastType.SUCCESS);
    } catch (error) {
      console.error('Failed to create event', error);
      addToast('Failed to create event', ToastType.ERROR);
    }
  }

  return (
    <div>
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
              onChange={(e) => setAg_date(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md"
              min={new Date(Date.now() + 86400000 * 7).toISOString().split('T')[0]}
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
            <label className="block text-gray-700 text-sm font-bold mb-2">Minimum Participants</label>
            <input
              type="number"
              value={minimum_participants}
              onChange={(e) => setMinimum_participants(parseInt(e.target.value))}
              className="w-full p-2 border border-gray-300 rounded-md"
              min={5}
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as ag_category)}
              className="w-full p-2 border border-gray-300 rounded-md"
            >
              {Object.values(ag_category).map((cat) => (
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
      {/* modal for creating or choosing vote event  */}
      {creatingVoting && (
        <VotingModal onClose={() => 
          setCreatingVoting(false)} 
          handleAgSubmit={handleAgSubmit} 
          createAgRequest={request!}/>
      )}
    </div>
  );
};

export default CreateEvent;
