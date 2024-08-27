import { useEffect, useState } from "react";
import { VoteService } from "../../services/VoteService";
import VoteListDisplayAg from "./displayVoteForAg";
import { ag_category } from "../../enum/ag-category";
import CreateVote from "../VotePage/CreateVote";

interface ListVotesRequest {
  page?: number;
  limit?: number;
  start_date?: Date;
  end_date?: Date;
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

interface VotingModalProps {
  onClose: () => void;
  handleAgSubmit: (vote: any) => void;
  createAgRequest: CreateAgRequest;
}

const VotingModal: React.FC<VotingModalProps> = ({
  onClose,
  handleAgSubmit,
  createAgRequest
}) => {
  const [voteLoading, setVoteLoading] = useState<boolean>(false);
  const [voteError, setVoteError] = useState<string | null>(null);
  const [voteList, setVoteList] = useState<any[]>([]);
  const [selectedVote, setSelectedVote] = useState<any>();
  const [showCreateVote, setShowCreateVote] = useState<boolean>(false);

  const voteService = new VoteService();

  useEffect(() => {
    fetchVotes();
  }, []);

  const fetchVotes = async () => {
    setVoteLoading(true);

    const requestData: ListVotesRequest = {
      page: 1,
      limit: 10,
      end_date: new Date(),
    };

    try {
      const data = await voteService.getVotes(requestData);
      if (data) {
        setVoteList(data);
      } else {
        setVoteError("Invalid votes format");
      }
    } catch (err) {
      console.log(err);
      setVoteError("Something went wrong");
    } finally {
      setVoteLoading(false);
    }
  };

  const handleVoteSelect = (vote: any) => {
    setSelectedVote(vote);
  };

  const handleVoteCreated = (newVote: any) => {
    setVoteList((prevList) => [...prevList, newVote]); // Add the new vote to the list
    setSelectedVote(newVote); // Optionally select the new vote
    setShowCreateVote(false); // Close the creation form
    handleConfirm(); // Automatically confirm the new vote
  };

  const handleConfirm = () => {
    // Handle the final submit logic here
    if (selectedVote) {
      console.log("Confirmed Vote:", selectedVote);
      handleAgSubmit(selectedVote);
    }
    onClose(); // Close the modal after confirming
  };

  return (
    <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center z-50">
        <div className="bg-white w-full max-w-lg mx-4 rounded-lg shadow-lg p-6">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-2xl font-bold">Voting Event</h3>
                <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                    &times;
                </button>
            </div>
            {voteLoading && <p>Loading...</p>}
            {voteError && <p className="text-red-500">{voteError}</p>}
            {!voteLoading && !voteError && (
                <VoteListDisplayAg
                    votes={voteList}
                    selectedVote={selectedVote}
                    onSelect={handleVoteSelect}
                    onConfirm={handleConfirm}
                />
            )}
            <button
                onClick={() => setShowCreateVote(true)}
                className="mt-4 w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
            >
                Create Vote
            </button>
            {showCreateVote && (
                <CreateVote
                    onCreateVote={() => {}}
                    onVoteCreated={handleVoteCreated} // Pass the handler
                    voteDate={createAgRequest.ag_date} // Optional min date
                />
            )}
        </div>
    </div>
);
};

export default VotingModal;
