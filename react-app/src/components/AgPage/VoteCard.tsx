
interface Vote {
  id: number;
  title: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  endDate: string;
  secondRoundEnabled: boolean;
}

interface VoteCardProps {
  vote: Vote;
  selected: boolean;
  onSelect: (vote: Vote) => void;
}

const VoteCard: React.FC<VoteCardProps> = ({ vote, selected, onSelect }) => {
  return (
    <div
      className={`border p-4 rounded shadow-sm cursor-pointer ${
        selected ? "bg-blue-100 border-blue-500" : ""
      }`}
      onClick={() => onSelect(vote)}
    >
      <h4 className="text-xl font-bold mb-2">{vote.title}</h4>
      <p className="text-gray-700 mb-2">{vote.description}</p>
      <p className="text-gray-500 text-sm">
        End Date: {new Date(vote.endDate).toLocaleString()}
      </p>
      <p className="text-gray-500 text-sm">
        Second Round Enabled: {vote.secondRoundEnabled ? "Yes" : "No"}
      </p>
    </div>
  );
};

export default VoteCard;
