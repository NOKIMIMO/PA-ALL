import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import AGService from "../../services/AGService";
import UserService from "../../services/UserService";
import { useUser } from "../../context/UserContext";
import { user_access_type } from "../../commons/user_access_type";
import VoteDetail from "../VoteDetailPage"; // Import the VoteDetail component

export default function AGPage() {
  const { agId } = useParams<{ agId: string }>();
  const navigate = useNavigate();
  const [ag, setAg] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [participants, setParticipants] = useState<number>(0);
  const [isParticipating, setIsParticipating] = useState<boolean>(false);
  const [totalMembers, setTotalMembers] = useState<number>(0);
  const [minParticipants, setMinParticipants] = useState<number>(0);
  const { user } = useUser();

  const isAdmin =
    user?.role === user_access_type.ADMIN ||
    user?.role === user_access_type.SUPER_ADMIN;

  const fetchAg = async () => {
    try {
      const agData = await AGService.getAgById(parseInt(agId!));
      console.log(agData);
      setAg(agData);
      setIsParticipating(agData.joined)
      setTotalMembers(agData.numberOfParticipants)
      setMinParticipants(agData.minimum_participants)
      setParticipants(agData.numberOfParticipants);
      setLoading(false);
    } catch (error: any) {
      setError(error.message);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAg();
  }, [agId, user]);

  const handleJoinAg = async () => {
    try {
      await AGService.joinAg(parseInt(agId!));
      setIsParticipating(true);
      setParticipants((prev) => prev + 1);
    } catch (error: any) {
      setError(error.message);
    }
  };

  const handleLeaveAg = async () => {
    try {
      await AGService.leaveAg(parseInt(agId!));
      setIsParticipating(false);
      setParticipants((prev) => prev - 1);
    } catch (error: any) {
      setError(error.message);
    }
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  if (loading) {
    return <div className="text-center mt-5">Loading...</div>;
  }

  if (error) {
    return <div className="text-red-500 text-center mt-5">{error}</div>;
  }

  const isBelowMinParticipants = ag?.isAG && participants < minParticipants;

  return (
    <div className="container mx-auto mt-10 p-5">
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="p-5 bg-gray-100">
          <button
            onClick={handleGoBack}
            className="text-gray-500 hover:text-gray-700 mb-3 underline flex items-center"
          >
            ← Back
          </button>
          <h2 className="text-3xl font-bold text-gray-800 mb-3">{ag.title}</h2>

          <div className="text-red-500 font-semibold">
            <svg
              className="inline w-6 h-6 mr-2"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 15l5.657-5.657a4 4 0 10-5.657-5.657 4 4 0 10-5.657 5.657L10 15zm0 0l-5.657 5.657a4 4 0 105.657-5.657 4 4 0 105.657 5.657L10 15z"
                clipRule="evenodd"
              />
            </svg>
            Assemblée Générale
            {/* <p className="text-sm mt-2">
              Note: Au moins la moitié des membres de l'association doivent
              être présents sous peine que l'assemblée générale soit annulée.
            </p> */}
            {participants < minParticipants && (
              <p className="text-sm mt-2">
                Minimum de participants requis: {minParticipants}
              </p>
            )}
          </div>

        </div>
        <div className="p-5">
          <p className="text-gray-700">
            <strong>Description:</strong> {ag.description}
          </p>
          <p className="text-gray-700 mt-3">
            <strong>Location:</strong> {ag.location}
          </p>
          <p className="text-gray-700 mt-3">
            <strong>Date:</strong> {new Date(ag.ag_date).toLocaleDateString()}
          </p>
          {ag.data_access_type && (
            <p className="text-gray-700 mt-3">
              <strong>Data Access Type:</strong> {ag.data_access_type}
            </p>
          )}
          <p
            className={`text-gray-700 mt-3 flex items-center ${isBelowMinParticipants ? "text-red-500" : "text-gray-700"
              }`}
          >
            <strong>Participants:</strong>
            <svg
              className="w-5 h-5 text-gray-500 ml-2"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M13 7a4 4 0 11-8 0 4 4 0 018 0zm2 7a7 7 0 00-14 0h14z" />
            </svg>
            {participants}
          </p>
        </div>

        <div className="p-5">
          {!isParticipating ? (
            <button
              onClick={handleJoinAg}
              className="bg-green-500 text-white px-4 py-2 rounded-md"
            >
              Participer à l'AG
            </button>
          ) : (
            <button
              onClick={handleLeaveAg}
              className="bg-red-500 text-white px-4 py-2 rounded-md"
            >
              Annuler ma participation
            </button>
          )}
        </div>
      </div>
      {isParticipating &&
        <div className="p-5">
          {/* Conditionally render the VoteDetail component */}
          {ag.vote_info && <VoteDetail voteId={ag.vote_info.vote.id} />}
        </div>
      }
    </div>
  );
}
