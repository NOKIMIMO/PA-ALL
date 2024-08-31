// VoteDetailPage.tsx

import React from 'react';
import { useParams } from 'react-router-dom';
import VoteDetail from '../components/VotePage/VoteDetail';

//props
interface VoteDetailPageProps {
    voteId?: string;
}


const VoteDetailPage: React.FC<VoteDetailPageProps> = ({ voteId: propVoteId }) => {
    const { voteId: paramVoteId } = useParams<{ voteId: string }>();

    // Use the voteId from props if provided, otherwise use the one from URL params
    const voteId = propVoteId || paramVoteId;

    return (
        <div>
            {/* <h1>Vote Detail Page</h1> */}
            {voteId ? (
                <VoteDetail voteId={voteId} />
            ) : (
                <div className="text-red-500 text-center mt-4">Error: No vote ID provided</div>
            )}
        </div>
    );
};

export default VoteDetailPage;
