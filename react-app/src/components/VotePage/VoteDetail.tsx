import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { IVoteService } from '../../services/VoteService';
import VoteService from '../../services/VoteService';
import { Bar } from 'react-chartjs-2';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

interface Props {
    voteId: any; // Définir voteId comme une chaîne (string)
}

interface Option {
    id: number;
    name: string;
    voteCount: number;
}

interface VoteData {
    labels: string[];
    datasets: {
        label: string;
        backgroundColor: string;
        borderColor: string;
        borderWidth: number;
        hoverBackgroundColor: string;
        hoverBorderColor: string;
        data: number[];
    }[];
}

const VoteDetail: React.FC<Props> = ({ voteId }) => {
    const [vote, setVote] = useState<any | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [userVoted, setUserVoted] = useState<boolean>(false); // State pour vérifier si l'utilisateur a voté
    const [voteData, setVoteData] = useState<VoteData | null>(null); // Données pour le graphique
    const [canVote, setCanVote] = useState<boolean>(true);

    useEffect(() => {
        if (!voteId) {
            setError('Vote ID is missing');
            setLoading(false);
            return;
        }
        fetchVote();
    }, [voteId]); // Assurez-vous que useEffect se déclenche lorsque voteId change

    const fetchVote = async () => {
        setLoading(true);
        try {
            const voteService: IVoteService = VoteService;
            const data = await voteService.getVoteById(parseInt(voteId));
            setVote(data);
            if (data.userVoted) {
                setUserVoted(true);
                setCanVote(false);
                generateChartData(data.options);
            } else if(new Date(data.endDate) < new Date()){
                setCanVote(false);
            } else {
                setUserVoted(false);
                setVoteData(null); // Réinitialiser les données du graphique si l'utilisateur n'a pas voté
            }
        } catch (error: any) {
            setError(error.message || 'An unknown error occurred');
        } finally {
            setLoading(false);
        }
    };

    const generateChartData = (options: Option[]) => {
        const labels = options.map((option) => option.name);
        const data = options.map((option) => option.voteCount);
        setVoteData({
            labels: labels,
            datasets: [
                {
                    label: 'Votes',
                    backgroundColor: '#3182CE',
                    borderColor: '#3182CE',
                    borderWidth: 1,
                    hoverBackgroundColor: '#2C5282',
                    hoverBorderColor: '#2C5282',
                    data: data,
                },
            ],
        });
    };

    const handleVote = async (optionId: number) => {
        try {
            const voteService: IVoteService = VoteService;
            await voteService.voteForOption(parseInt(voteId), optionId);
            fetchVote(); // Rafraîchir les détails du vote après le vote
        } catch (error: any) {
            setError(error.message || 'An unknown error occurred');
        }
    };

    if (!voteId) {
        return <div className="text-red-500 text-center mt-4">Error: Vote ID is missing</div>;
    }

    if (loading) {
        return <div className="flex justify-center items-center h-screen">Loading...</div>;
    }

    if (error) {
        return <div className="text-red-500 text-center mt-4">Error: {error}</div>;
    }

    if (!vote) {
        return <div className="text-center text-gray-500 mt-4">No vote found with ID: {voteId}</div>;
    }

    return (
        <div className="max-w-4xl mx-auto p-4 bg-white shadow-lg rounded-lg">
            <h1 className="text-3xl font-bold text-center mb-4">{vote.title}</h1>
            <p className="text-gray-700 text-center mb-6">{vote.description}</p>
            {!canVote && voteData && (
                <div className="mb-8">
                    <h2 className="text-2xl font-semibold mb-4">Results:</h2>
                    <div className="bg-white rounded-lg shadow-md">
                        <Bar data={voteData} options={{ maintainAspectRatio: false }} />
                    </div>
                </div>
            )}
            <h2 className="text-2xl font-semibold mb-4">Options:</h2>
            <div className="space-y-4">
                {vote.options.map((option: Option) => (
                    <div key={option.id} className="p-4 bg-gray-100 rounded-lg shadow-md">
                        <p className="text-lg font-medium">{option.name}</p>
                        {canVote && (
                            <button
                                className="mt-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-700 transition duration-300"
                                onClick={() => handleVote(option.id)}
                            >
                                Vote
                            </button>
                        )}
                        {userVoted && <p className="mt-2 text-gray-500">Votes: {option.voteCount}</p>}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default VoteDetail;
