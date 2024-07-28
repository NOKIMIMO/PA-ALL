import { CustomError } from '../commons/Error';

interface CreateVoteBody {
    title: string;
    description: string;
    options: {
        name: string;
    }[];
    endDate: Date;
    secondRoundEnabled: boolean;
}

interface UpdateVoteBody {
    title?: string;
    description?: string;
    endDate?: Date;
    secondRoundEnabled?: boolean;
    options: VoteOption[];
}

interface VoteOption {
    id: number;
    name: string;
    voteCount: number;
}

export interface IVoteService {
    getVotes(): Promise<any>;
    getVoteById(voteId: number): Promise<any>;
    voteForOption(voteId: number, optionId: number): Promise<void>;
    createVote(body: CreateVoteBody): Promise<any>;
    getVoteStatistics(voteId: number): Promise<any>;
    deleteVoteById(voteId: string): Promise<void>;
    updateVote(voteId: number, body: UpdateVoteBody): Promise<any>;  // Ajout de la méthode updateVote
}

export class VoteService implements IVoteService {
    async getVotes(): Promise<any> {
        const response = await fetch('/api/v1/votes', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        const data = await response.json();
        if (!response.ok) {
            throw new CustomError(response.status, data.error || 'Something went wrong');
        }

        const now = new Date();
        const votesToCreate = [];
        const existingSecondRoundVotes = await this.getExistingSecondRoundVotes();

        for (const vote of data) {
            const endDate = new Date(vote.endDate);
            if (vote.secondRoundEnabled && endDate < now) {
                const totalVotes = vote.options.reduce((acc: number, option: VoteOption) => acc + option.voteCount, 0);
                const topTwoOptions = vote.options
                    .sort((a: VoteOption, b: VoteOption) => b.voteCount - a.voteCount)
                    .slice(0, 2);
                const hasMajority = topTwoOptions[0].voteCount > totalVotes / 2;

                if (!hasMajority && topTwoOptions.length > 1) {
                    const secondRoundTitle = `${vote.title} (second tour)`;
                    
                    // Vérifiez si un vote de second tour avec ce titre existe déjà
                    if (!existingSecondRoundVotes.some((existingVote: any) => existingVote.title === secondRoundTitle)) {
                        votesToCreate.push({
                            title: secondRoundTitle,
                            description: vote.description,
                            options: topTwoOptions.map((option: VoteOption) => ({ name: option.name })),
                            endDate: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000),
                            secondRoundEnabled: false
                        });
                    }
                }
            }
        }

        for (const newVote of votesToCreate) {
            await this.createVote(newVote);
        }

        return data;
    }

    // Méthode pour récupérer les votes de second tour existants
    private async getExistingSecondRoundVotes(): Promise<any[]> {
        const response = await fetch('/api/v1/votes?secondRound=true', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        const data = await response.json();
        if (!response.ok) {
            throw new CustomError(response.status, data.error || 'Something went wrong');
        }
        return data;
    }

    async getVoteById(voteId: number): Promise<any> {
        const response = await fetch(`/api/v1/votes/${voteId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${localStorage.getItem('token')}`,
            }
        });
        const data = await response.json();
        if (!response.ok) {
            throw new CustomError(response.status, data.error || 'Something went wrong');
        }
        return data;
    }

    async voteForOption(voteId: number, optionId: number): Promise<void> {
        const response = await fetch(`/api/v1/votes/${voteId}/option/${optionId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${localStorage.getItem('token')}`,
            }
        });
        const data = await response.json();
        if (!response.ok) {
            throw new CustomError(response.status, data.error || 'Something went wrong');
        }
    }

    async createVote(body: CreateVoteBody): Promise<any> {
        const response = await fetch('/api/v1/votes', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
            body: JSON.stringify(body)
        });
        const data = await response.json();
        if (!response.ok) {
            throw new CustomError(response.status, data.error || 'Something went wrong');
        }
        return data;
    }

    async getVoteStatistics(voteId: number): Promise<any> {
        const response = await fetch(`/api/v1/votes/${voteId}/statistics`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        const data = await response.json();
        if (!response.ok) {
            throw new CustomError(response.status, data.error || 'Something went wrong');
        }
        return data;
    }

    async deleteVoteById(voteId: string): Promise<void> {
        const response = await fetch(`/api/v1/votes/${voteId}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${localStorage.getItem('token')}`,
            }
        });
        if (!response.ok) {
            const data = await response.json();
            throw new CustomError(response.status, data.error || 'Something went wrong');
        }
    }

    async updateVote(voteId: number, body: UpdateVoteBody): Promise<void> {
        const response = await fetch(`/api/v1/votes/${voteId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify(body)
        });
        const data = await response.json();
        if (!response.ok) {
            throw new CustomError(response.status, data.error || 'Something went wrong');
        }
    }
    
    
    
}

export default new VoteService();
