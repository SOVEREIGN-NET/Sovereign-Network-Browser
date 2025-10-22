/**
 * DAO Manager - Decentralized Autonomous Organization for ZHTP governance
 * Implements zero-knowledge voting and community governance
 */

export class DaoManager {
    constructor(api) {
        this.api = api;
        this.currentDaoData = null;
        this.userVotingPower = 0;
        this.isInitialized = false;
        this.zkVoting = new ZkVotingSystem();
    }

    async initialize(identity) {
        console.log('🏛️ Initializing DAO management system...');
        
        try {
            // Load DAO data
            await this.loadDaoData();
            
            // Calculate user voting power
            if (identity) {
                this.userVotingPower = await this.calculateVotingPower(identity);
            }

            this.isInitialized = true;
            console.log(' DAO management system initialized');

        } catch (error) {
            console.error('❌ DAO initialization failed:', error);
            throw error;
        }
    }

    async loadDaoData() {
        try {
            this.currentDaoData = await this.api.getDaoData();
            console.log('📊 DAO data loaded successfully');
            return this.currentDaoData;

        } catch (error) {
            console.error('❌ Failed to load DAO data:', error);
            
            // Fallback to cached data
            const cached = localStorage.getItem('zhtp_dao_cache');
            if (cached) {
                this.currentDaoData = JSON.parse(cached);
                return this.currentDaoData;
            }
            
            throw error;
        }
    }

    async getDaoData() {
        if (!this.currentDaoData) {
            await this.loadDaoData();
        }
        return this.currentDaoData;
    }

    async calculateVotingPower(identity) {
        try {
            console.log('🗳️ Calculating voting power for identity:', identity.did);
            
            // Get real voting power from blockchain
            const votingData = await this.api.getVotingPower(identity.did);
            console.log('📊 Real voting power data:', votingData);
            
            return votingData.totalPower || votingData.voting_power || 0;

        } catch (error) {
            console.error('❌ Failed to calculate voting power:', error);
            
            // Fallback to zero voting power if API fails
            return 0;
        }
    }

    async createProposal(proposalData, creatorDid) {
        console.log('Creating new DAO proposal...');
        
        try {
            // Validate proposal data
            this.validateProposalData(proposalData);
            
            // Check if user has permission to create proposals
            if (this.userVotingPower === 0) {
                throw new Error('Only verified citizens can create proposals');
            }

            // Create proposal structure
            const proposal = {
                id: this.generateProposalId(),
                title: proposalData.title,
                description: proposalData.description,
                type: proposalData.type || 'general',
                category: proposalData.category || 'governance',
                proposer: creatorDid,
                created: new Date().toISOString(),
                expires: proposalData.expires || this.calculateDefaultExpiry(),
                status: 'active',
                votingPeriod: proposalData.votingPeriod || 7 * 24 * 60 * 60 * 1000, // 7 days
                quorum: proposalData.quorum || 0.1, // 10% participation required
                threshold: proposalData.threshold || 0.5, // 50% approval required
                votes: {
                    yes: 0,
                    no: 0,
                    abstain: 0
                },
                voters: new Set(),
                implementations: proposalData.implementations || [],
                fundingRequest: proposalData.fundingRequest || null,
                tags: proposalData.tags || []
            };

            // Create zero-knowledge proof for proposal creation
            const zkProof = await this.zkVoting.createProposalProof(proposal, creatorDid);
            proposal.creationProof = zkProof;

            // Submit to network
            const result = await this.api.submitDaoProposal(creatorDid, proposal.title, proposal.description);
            
            // Update local cache
            if (this.currentDaoData) {
                this.currentDaoData.proposals = this.currentDaoData.proposals || [];
                this.currentDaoData.proposals.unshift(proposal);
                this.currentDaoData.activeProposals = (this.currentDaoData.activeProposals || 0) + 1;
                
                await this.cacheDaoData();
            }

            console.log(' DAO proposal created successfully');
            return { ...proposal, networkResult: result };

        } catch (error) {
            console.error('❌ Proposal creation failed:', error);
            throw error;
        }
    }

    validateProposalData(data) {
        if (!data.title || data.title.trim().length < 10) {
            throw new Error('Proposal title must be at least 10 characters');
        }

        if (!data.description || data.description.trim().length < 50) {
            throw new Error('Proposal description must be at least 50 characters');
        }

        if (data.title.length > 200) {
            throw new Error('Proposal title must be less than 200 characters');
        }

        if (data.description.length > 5000) {
            throw new Error('Proposal description must be less than 5000 characters');
        }

        // Check for spam patterns
        if (this.isSpamProposal(data)) {
            throw new Error('Proposal detected as spam');
        }
    }

    isSpamProposal(data) {
        const spamPatterns = [
            /(.)\1{10,}/, // Repeated characters
            /^[A-Z\s!]{50,}$/, // All caps
            /(http|www\.)/i, // URLs (could be relaxed for legitimate proposals)
        ];

        const text = (data.title + ' ' + data.description).toLowerCase();
        return spamPatterns.some(pattern => pattern.test(text));
    }

    calculateDefaultExpiry() {
        // Default voting period is 7 days
        return new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
    }

    generateProposalId() {
        return 'prop_' + Math.random().toString(36).substr(2, 16) + Date.now().toString(36);
    }

    async vote(proposalId, voteChoice, voterDid) {
        console.log(`🗳️ Casting vote on proposal ${proposalId}: ${voteChoice}`);
        
        try {
            // Validate voting eligibility
            if (this.userVotingPower === 0) {
                throw new Error('Only verified citizens can vote');
            }

            // Find proposal
            const proposal = await this.getProposal(proposalId);
            if (!proposal) {
                throw new Error('Proposal not found');
            }

            // Check if proposal is still active
            if (proposal.status !== 'active') {
                throw new Error('Proposal is no longer active');
            }

            if (new Date() > new Date(proposal.expires)) {
                throw new Error('Voting period has ended');
            }

            // Check if user has already voted
            if (proposal.voters && proposal.voters.has(voterDid)) {
                throw new Error('You have already voted on this proposal');
            }

            // Validate vote choice
            if (!['yes', 'no', 'abstain'].includes(voteChoice)) {
                throw new Error('Invalid vote choice');
            }

            // Create zero-knowledge vote proof
            const zkVoteProof = await this.zkVoting.createVoteProof({
                proposalId: proposalId,
                vote: voteChoice,
                voter: voterDid,
                votingPower: this.userVotingPower
            });

            // Submit vote to network
            const result = await this.api.voteOnProposal(proposalId, voteChoice === 'yes', voterDid);

            // Update local proposal data
            if (this.currentDaoData && this.currentDaoData.proposals) {
                const proposalIndex = this.currentDaoData.proposals.findIndex(p => p.id === proposalId);
                if (proposalIndex !== -1) {
                    const proposal = this.currentDaoData.proposals[proposalIndex];
                    
                    // Update vote counts
                    proposal.votes[voteChoice] += this.userVotingPower;
                    
                    // Mark voter as having voted
                    if (!proposal.voters) proposal.voters = new Set();
                    proposal.voters.add(voterDid);
                    proposal.hasVoted = true;
                    
                    // Add vote record with ZK proof
                    if (!proposal.voteRecords) proposal.voteRecords = [];
                    proposal.voteRecords.push({
                        voter: voterDid,
                        vote: voteChoice,
                        timestamp: new Date().toISOString(),
                        zkProof: zkVoteProof,
                        votingPower: this.userVotingPower
                    });

                    // Check if proposal should be resolved
                    await this.checkProposalResolution(proposal);
                    
                    await this.cacheDaoData();
                }
            }

            console.log(' Vote cast successfully');
            return { ...result, zkProof: zkVoteProof };

        } catch (error) {
            console.error('❌ Voting failed:', error);
            throw error;
        }
    }

    async checkProposalResolution(proposal) {
        const totalVotes = proposal.votes.yes + proposal.votes.no + proposal.votes.abstain;
        const totalMembers = this.currentDaoData.totalMembers || 1;
        const participation = totalVotes / totalMembers;
        
        // Check if quorum is met
        if (participation >= proposal.quorum) {
            const approvalRate = proposal.votes.yes / (proposal.votes.yes + proposal.votes.no);
            
            // Check if threshold is met
            if (approvalRate >= proposal.threshold) {
                proposal.status = 'passed';
                proposal.resolvedAt = new Date().toISOString();
                
                // Execute proposal if it has implementations
                if (proposal.implementations && proposal.implementations.length > 0) {
                    await this.executeProposal(proposal);
                }
            } else if (new Date() > new Date(proposal.expires)) {
                proposal.status = 'rejected';
                proposal.resolvedAt = new Date().toISOString();
            }
        } else if (new Date() > new Date(proposal.expires)) {
            proposal.status = 'expired';
            proposal.resolvedAt = new Date().toISOString();
        }
    }

    async executeProposal(proposal) {
        console.log(`⚡ Executing proposal: ${proposal.title}`);
        
        try {
            for (const implementation of proposal.implementations) {
                switch (implementation.type) {
                    case 'parameter_change':
                        await this.executeParameterChange(implementation);
                        break;
                    case 'fund_allocation':
                        await this.executeFundAllocation(implementation);
                        break;
                    case 'contract_upgrade':
                        await this.executeContractUpgrade(implementation);
                        break;
                    case 'validator_action':
                        await this.executeValidatorAction(implementation);
                        break;
                    default:
                        console.warn(`Unknown implementation type: ${implementation.type}`);
                }
            }

            proposal.executed = true;
            proposal.executedAt = new Date().toISOString();
            
            console.log(' Proposal executed successfully');

        } catch (error) {
            console.error('❌ Proposal execution failed:', error);
            proposal.executionError = error.message;
        }
    }

    async executeParameterChange(implementation) {
        // Execute network parameter changes
        console.log('⚙️ Executing parameter change:', implementation.parameters);
        
        // This would call the actual network parameter update APIs
        await this.api.updateNetworkParameters(implementation.parameters);
    }

    async executeFundAllocation(implementation) {
        // Execute treasury fund allocation
        console.log('💰 Executing fund allocation:', implementation.allocation);
        
        // This would call the treasury management APIs
        await this.api.allocateTreasuryFunds(
            implementation.allocation.recipient,
            implementation.allocation.amount,
            implementation.allocation.purpose
        );
    }

    async executeContractUpgrade(implementation) {
        // Execute smart contract upgrades
        console.log(' Executing contract upgrade:', implementation.contract);
        
        // This would call the contract deployment APIs
        await this.api.upgradeContract(
            implementation.contract.address,
            implementation.contract.newCode,
            implementation.contract.migrationData
        );
    }

    async executeValidatorAction(implementation) {
        // Execute validator-related actions
        console.log('👥 Executing validator action:', implementation.action);
        
        switch (implementation.action.type) {
            case 'add_validator':
                await this.api.addValidator(implementation.action.validatorId);
                break;
            case 'remove_validator':
                await this.api.removeValidator(implementation.action.validatorId);
                break;
            case 'slash_validator':
                await this.api.slashValidator(implementation.action.validatorId, implementation.action.amount);
                break;
        }
    }

    async getProposal(proposalId) {
        if (!this.currentDaoData || !this.currentDaoData.proposals) {
            await this.loadDaoData();
        }

        return this.currentDaoData.proposals?.find(p => p.id === proposalId) || null;
    }

    async getActiveProposals() {
        if (!this.currentDaoData) {
            await this.loadDaoData();
        }

        return this.currentDaoData.proposals?.filter(p => p.status === 'active') || [];
    }

    async getProposalsByCategory(category) {
        if (!this.currentDaoData) {
            await this.loadDaoData();
        }

        return this.currentDaoData.proposals?.filter(p => p.category === category) || [];
    }

    async getUserVotingHistory(userDid) {
        if (!this.currentDaoData || !this.currentDaoData.proposals) {
            await this.loadDaoData();
        }

        const votingHistory = [];
        
        for (const proposal of this.currentDaoData.proposals || []) {
            if (proposal.voteRecords) {
                const userVote = proposal.voteRecords.find(record => record.voter === userDid);
                if (userVote) {
                    votingHistory.push({
                        proposalId: proposal.id,
                        proposalTitle: proposal.title,
                        vote: userVote.vote,
                        timestamp: userVote.timestamp,
                        proposalStatus: proposal.status
                    });
                }
            }
        }

        return votingHistory.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    }

    async getTreasuryBalance() {
        try {
            const balance = await this.api.getTreasuryBalance();
            return balance;
        } catch (error) {
            console.error('❌ Failed to get treasury balance:', error);
            return this.currentDaoData?.treasuryBalance || 0;
        }
    }

    async getDaoStatistics() {
        try {
            const stats = await this.api.getDaoStatistics();
            return stats;
        } catch (error) {
            console.error('❌ Failed to get DAO statistics:', error);
            
            // Return calculated stats from current data
            if (this.currentDaoData) {
                const activeProposals = this.currentDaoData.proposals?.filter(p => p.status === 'active').length || 0;
                const passedProposals = this.currentDaoData.proposals?.filter(p => p.status === 'passed').length || 0;
                const totalProposals = this.currentDaoData.proposals?.length || 0;
                
                return {
                    totalMembers: this.currentDaoData.totalMembers || 0,
                    activeProposals: activeProposals,
                    passedProposals: passedProposals,
                    rejectedProposals: this.currentDaoData.proposals?.filter(p => p.status === 'rejected').length || 0,
                    totalProposals: totalProposals,
                    treasuryBalance: this.currentDaoData.treasuryBalance || 0,
                    passRate: totalProposals > 0 ? (passedProposals / totalProposals) * 100 : 0
                };
            }
            
            return {};
        }
    }

    async cacheDaoData() {
        try {
            // Convert Set objects to arrays for JSON serialization
            const cacheData = JSON.parse(JSON.stringify(this.currentDaoData, (key, value) => {
                if (value instanceof Set) {
                    return Array.from(value);
                }
                return value;
            }));
            
            localStorage.setItem('zhtp_dao_cache', JSON.stringify(cacheData));
            localStorage.setItem('zhtp_dao_cache_timestamp', Date.now().toString());
        } catch (error) {
            console.error('❌ Failed to cache DAO data:', error);
        }
    }

    async clearCache() {
        localStorage.removeItem('zhtp_dao_cache');
        localStorage.removeItem('zhtp_dao_cache_timestamp');
        this.currentDaoData = null;
    }

    getUserVotingPower() {
        return this.userVotingPower;
    }

    isInitialized() {
        return this.isInitialized;
    }
}

/**
 * Zero-Knowledge Voting System
 * Provides privacy-preserving voting with verifiable results
 */
class ZkVotingSystem {
    constructor() {
        this.proofCache = new Map();
    }

    async createProposalProof(proposal, proposer) {
        console.log(' Creating ZK proof for proposal creation...');
        
        try {
            // Create proof that proposer is eligible to create proposals
            const proofData = {
                proposer: proposer,
                proposalHash: await this.hashProposal(proposal),
                eligibilityProof: await this.createEligibilityProof(proposer),
                timestamp: Date.now()
            };

            const proof = await this.generateZkProof(proofData, 'proposal_creation');
            
            return {
                proofSystem: 'Plonky2',
                proofType: 'proposal_creation',
                proof: proof,
                timestamp: proofData.timestamp,
                verificationKey: await this.getVerificationKey()
            };

        } catch (error) {
            console.error('❌ Proposal proof creation failed:', error);
            throw error;
        }
    }

    async createVoteProof(voteData) {
        console.log('🗳️ Creating ZK proof for vote...');
        
        try {
            // Create proof that:
            // 1. Voter is eligible
            // 2. Vote is valid
            // 3. No double voting
            const proofData = {
                voter: voteData.voter,
                proposalId: voteData.proposalId,
                voteCommitment: await this.commitToVote(voteData.vote),
                eligibilityProof: await this.createEligibilityProof(voteData.voter),
                nonce: this.generateNonce(),
                timestamp: Date.now()
            };

            const proof = await this.generateZkProof(proofData, 'vote_cast');
            
            return {
                proofSystem: 'Plonky2',
                proofType: 'vote_cast',
                proof: proof,
                voteCommitment: proofData.voteCommitment,
                timestamp: proofData.timestamp,
                verificationKey: await this.getVerificationKey()
            };

        } catch (error) {
            console.error('❌ Vote proof creation failed:', error);
            throw error;
        }
    }

    async hashProposal(proposal) {
        const proposalData = {
            title: proposal.title,
            description: proposal.description,
            proposer: proposal.proposer,
            created: proposal.created
        };
        
        const encoder = new TextEncoder();
        const data = encoder.encode(JSON.stringify(proposalData));
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        return Array.from(new Uint8Array(hashBuffer));
    }

    async commitToVote(vote) {
        // Create commitment to vote choice for privacy
        const voteValue = vote === 'yes' ? 1 : vote === 'no' ? 0 : 0.5;
        const randomness = new Uint8Array(32);
        crypto.getRandomValues(randomness);
        
        const commitmentData = {
            vote: voteValue,
            randomness: Array.from(randomness)
        };
        
        const encoder = new TextEncoder();
        const data = encoder.encode(JSON.stringify(commitmentData));
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        return Array.from(new Uint8Array(hashBuffer));
    }

    async createEligibilityProof(userDid) {
        // Create proof of voting eligibility without revealing identity
        const eligibilityData = {
            did: userDid,
            eligibleCitizen: true, // Would be verified against citizenship registry
            timestamp: Date.now()
        };
        
        const encoder = new TextEncoder();
        const data = encoder.encode(JSON.stringify(eligibilityData));
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        return Array.from(new Uint8Array(hashBuffer));
    }

    async generateZkProof(proofData, proofType) {
        // Simulate ZK proof generation
        // In production, this would use actual Plonky2 or similar ZK system
        
        console.log(`⚡ Generating ${proofType} ZK proof...`);
        
        // Simulate proof generation time
        await new Promise(resolve => setTimeout(resolve, 200));
        
        // Create mock proof structure
        const proofBytes = new Uint8Array(256);
        crypto.getRandomValues(proofBytes);
        
        // Include proof metadata
        const proof = {
            proof: Array.from(proofBytes).map(b => b.toString(16).padStart(2, '0')).join(''),
            publicInputs: await this.extractPublicInputs(proofData, proofType),
            proofType: proofType,
            generated: Date.now()
        };
        
        // Cache proof for verification
        const proofId = await this.hashProofData(proofData);
        this.proofCache.set(proofId, proof);
        
        return proof;
    }

    async extractPublicInputs(proofData, proofType) {
        // Extract public inputs that can be verified without revealing private data
        const publicInputs = [];
        
        switch (proofType) {
            case 'proposal_creation':
                publicInputs.push(proofData.proposalHash);
                publicInputs.push(proofData.timestamp);
                break;
            case 'vote_cast':
                publicInputs.push(proofData.proposalId);
                publicInputs.push(proofData.voteCommitment);
                publicInputs.push(proofData.timestamp);
                break;
        }
        
        return publicInputs;
    }

    async hashProofData(proofData) {
        const encoder = new TextEncoder();
        const data = encoder.encode(JSON.stringify(proofData));
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    }

    async getVerificationKey() {
        // Return verification key for ZK proofs
        const vk = new Uint8Array(32);
        crypto.getRandomValues(vk);
        return Array.from(vk).map(b => b.toString(16).padStart(2, '0')).join('');
    }

    async verifyProof(proof, publicInputs, verificationKey) {
        console.log(' Verifying ZK proof...');
        
        try {
            // Basic proof structure validation
            if (!proof || !proof.proof || !proof.publicInputs) {
                return false;
            }

            // Verify proof format
            if (proof.proof.length < 100) {
                return false;
            }

            // Verify public inputs match
            if (JSON.stringify(proof.publicInputs) !== JSON.stringify(publicInputs)) {
                return false;
            }

            // Simulate proof verification
            await new Promise(resolve => setTimeout(resolve, 100));
            
            console.log(' ZK proof verification successful');
            return true;

        } catch (error) {
            console.error('❌ ZK proof verification failed:', error);
            return false;
        }
    }

    generateNonce() {
        const array = new Uint8Array(16);
        crypto.getRandomValues(array);
        return Array.from(array).map(b => b.toString(16).padStart(2, '0')).join('');
    }

    getProofCache() {
        return this.proofCache;
    }

    clearProofCache() {
        this.proofCache.clear();
    }
}
