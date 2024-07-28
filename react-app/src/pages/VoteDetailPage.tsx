// VoteDetailPage.tsx

import React from 'react';
import { useParams } from 'react-router-dom';
import VoteDetail from '../components/VotePage/VoteDetail';

const VoteDetailPage: React.FC = () => {
    const { voteId } = useParams<{ voteId: string }>(); // Assurez-vous de récupérer voteId comme une chaîne

    return (
        <div>
            <h1>Vote Detail Page</h1>
            <VoteDetail voteId={voteId} />
        </div>
    );
};

export default VoteDetailPage;
