import { DataSource } from 'typeorm';
import { Vote } from '../database/models/vote';
import { Option } from '../database/models/option';
import { UserVote } from '../database/models/userVote';
import { CreateVoteValidationRequest, ListVotesRequest, VoteResponse } from '../Validators/voteValidator';
import { CustomError } from '../common/error/customError';

export class VoteUseCase {
    constructor(private readonly db: DataSource) {}

    async listVotes(filter : ListVotesRequest): Promise<VoteResponse[]> {
        const query = this.db.getRepository(Vote).createQueryBuilder('vote');
        if (filter.start_date) {
            query.andWhere('vote.createdAt >= :start_date', { start_date: filter.start_date });
        }
        if (filter.end_date) {
            query.andWhere('vote.endDate <= :end_date', { end_date: filter.end_date });
        }
        if (filter.limit) {
            query.limit(filter.limit);
            if (filter.page) {
                query.offset((filter.page - 1) * filter.limit);
            }
        }
  
        //also get related options
        query.leftJoinAndSelect('vote.options', 'options'); 
        return await query.getMany();



        // const voteRepository = this.db.getRepository(Vote);
        // return await voteRepository.find({ relations: ['options'] });
    }

    async createVote(data: CreateVoteValidationRequest): Promise<Vote> {
        const voteRepository = this.db.getRepository(Vote);
        const optionRepository = this.db.getRepository(Option);
        const newVote = voteRepository.create({ 
            title: data.title, 
            description: data.description,
            endDate: data.endDate,
            secondRoundEnabled: data.secondRoundEnabled
        });
    
        const savedVote = await voteRepository.save(newVote);
    
        const options = data.options.map(optionData => {
            return optionRepository.create({ ...optionData, vote: savedVote });
        });
    
        await optionRepository.save(options);
    
        return savedVote;
    }
    
    async getVoteById(id: number, userId: number): Promise<any> {
        const voteRepository = this.db.getRepository(Vote);
        const userVoteRepository = this.db.getRepository(UserVote);

        const vote = await voteRepository.findOne({ where: { id }, relations: ['options'] });

        if (!vote) {
            throw new CustomError(404, 'Vote not found');
        }

        const userVote = await userVoteRepository.findOne({ where: { voteId: id, userId } });

        return {
            ...vote,
            userVoted: !!userVote // Ajouter un indicateur pour savoir si l'utilisateur a voté
        };
    }

    async voteForOption(voteId: number, optionId: number, userId: number): Promise<void> {
        const optionRepository = this.db.getRepository(Option);
        const userVoteRepository = this.db.getRepository(UserVote);

        const existingVote = await userVoteRepository.findOne({ where: { voteId, userId } });

        if (existingVote) {
            throw new CustomError(400, 'User has already voted');
        }

        const option = await optionRepository.findOne({ where: { id: optionId, vote: { id: voteId } } });

        if (!option) {
            throw new CustomError(404, 'Option not found');
        }

        option.voteCount += 1;
        await optionRepository.save(option);

        const userVote = userVoteRepository.create({ userId, voteId, optionId });
        await userVoteRepository.save(userVote);
    }

    async createSecondRound(voteId: number): Promise<Vote> {
        const voteRepository = this.db.getRepository(Vote);
        const optionRepository = this.db.getRepository(Option);
        const existingVote = await voteRepository.findOne({ where: { id: voteId }, relations: ['options'] });
    
        if (!existingVote) {
            throw new CustomError(404, 'Vote not found');
        }
    
        const sortedOptions = existingVote.options.sort((a, b) => b.voteCount - a.voteCount);
        const topTwoOptions = sortedOptions.slice(0, 2);
    
        const secondRoundVote = voteRepository.create({
            title: `${existingVote.title} - Second Round`,
            description: `Second round of voting for ${existingVote.title}`,
            endDate: new Date(existingVote.endDate.getTime() + 7 * 24 * 60 * 60 * 1000), // Adding 1 week
            secondRoundEnabled: false
        });
    
        const savedSecondRoundVote = await voteRepository.save(secondRoundVote);
    
        const options = topTwoOptions.map(option => {
            return optionRepository.create({ name: option.name, vote: savedSecondRoundVote });
        });
    
        await optionRepository.save(options);
    
        return savedSecondRoundVote;
    }

    async getVoteStatistics(id: number): Promise<any> {
        const voteRepository = this.db.getRepository(Vote);
        const vote = await voteRepository.findOne({ where: { id }, relations: ['options'] });
    
        if (!vote) {
            throw new CustomError(404, 'Vote not found');
        }
    
        const totalVotes = vote.options.reduce((sum, option) => sum + option.voteCount, 0);
    
        if (totalVotes > 0 && vote.secondRoundEnabled) {
            const highestVoteCount = vote.options.reduce((max, option) => Math.max(max, option.voteCount), 0);
            const majorityThreshold = Math.ceil(totalVotes / 2);
    
            if (highestVoteCount <= majorityThreshold) {
                await this.createSecondRound(id);
            }
        }
    
        return {
            title: vote.title,
            description: vote.description,
            options: vote.options.map(option => ({
                name: option.name,
                voteCount: option.voteCount,
            })),
        };
    }

    async deleteVoteById(voteId: number): Promise<void> {
        const voteRepository = this.db.getRepository(Vote);
        const optionRepository = this.db.getRepository(Option);

        const vote = await voteRepository.findOne({ where: { id: voteId }, relations: ['options'] });

        if (!vote) {
            throw new CustomError(404, 'Vote not found');
        }

        // Supprimer les options associées
        if (vote.options.length > 0) {
            await optionRepository.remove(vote.options);
        }

        // Supprimer le vote
        await voteRepository.remove(vote);
    }
    
    
    async updateVote(voteId: number, data: any): Promise<Vote> {
        const voteRepository = this.db.getRepository(Vote);
        const optionRepository = this.db.getRepository(Option);
    
        const existingVote = await voteRepository.findOne({ where: { id: voteId }, relations: ['options'] });
        if (!existingVote) {
            throw new CustomError(404, 'Vote not found');
        }
    
        existingVote.title = data.title || existingVote.title;
        existingVote.description = data.description || existingVote.description;
        existingVote.endDate = data.endDate || existingVote.endDate;
        existingVote.secondRoundEnabled = data.secondRoundEnabled ?? existingVote.secondRoundEnabled;
    
        await voteRepository.save(existingVote);
    
        // Update or create options
        if (data.options) {
            for (const optionData of data.options) {
                if (optionData.id) {
                    // Update existing option
                    const option = await optionRepository.findOne({ where: { id: optionData.id } });
                    if (option) {
                        option.name = optionData.name;
                        await optionRepository.save(option);
                    }
                } else {
                    // Create new option
                    const newOption = optionRepository.create({
                        name: optionData.name,
                        vote: existingVote,
                    });
                    await optionRepository.save(newOption);
                }
            }
    
            // Remove options that are no longer in the request
            const existingOptionsIds = data.options.map((opt: { id: any; }) => opt.id).filter((id: undefined) => id !== undefined) as number[];
            const optionsToRemove = existingVote.options.filter(opt => !existingOptionsIds.includes(opt.id));
            await optionRepository.remove(optionsToRemove);
        }
    
        return existingVote;
    }
    
}
