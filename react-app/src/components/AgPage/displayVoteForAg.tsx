import VoteCard from "./VoteCard";

interface Vote {
  id: number;
  title: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  endDate: string;
  secondRoundEnabled: boolean;
}

interface VoteListProps {
  votes: Vote[];
  selectedVote: Vote | null;
  onSelect: (vote: Vote) => void;
  onConfirm: () => void; 
}

const VoteListDisplayAg: React.FC<VoteListProps> = ({ votes, selectedVote, onSelect, onConfirm }) => {
    return (
      <div>
        <div className="max-h-96 overflow-y-auto space-y-4">
          {votes.map((vote) => (
            <VoteCard
              key={vote.id}
              vote={vote}
              selected={selectedVote?.id === vote.id}
              onSelect={onSelect}
            />
          ))}
        </div>
        <button
          onClick={onConfirm}
          className="mt-4 w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
          disabled={!selectedVote}  // Disable if no vote is selected
        >
          Confirm
        </button>
      </div>
    );
  };
  
  export default VoteListDisplayAg;