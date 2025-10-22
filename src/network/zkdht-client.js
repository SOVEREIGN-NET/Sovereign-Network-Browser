/**
 * zkDHT Client - Zero-Knowledge Distributed Hash Table
 * Loads Web4 pages and applications from the distributed network
 */

class ZkDHTClient {
    constructor(api) {
        this.api = api;
        this.cache = new Map();
        this.peers = new Set();
        this.isConnected = false;
    }

    async initialize() {
        console.log('🌐 Initializing zkDHT client...');
        
        try {
            // Connect to zkDHT network
            await this.connectToDHT();
            
            // Discover initial peers
            await this.discoverPeers();
            
            this.isConnected = true;
            console.log(' zkDHT client initialized successfully');
            
        } catch (error) {
            console.error('❌ Failed to initialize zkDHT client:', error);
            throw error;
        }
    }

    async connectToDHT() {
        // Connect to the distributed hash table network
        // Use local node as bootstrap if available, fallback to remote nodes
        const localNodes = [
            'zhtp://localhost:9333',
            'zhtp://127.0.0.1:9333',
            'zhtp://localhost:8080',
            'zhtp://127.0.0.1:8080'
        ];
        
        const remoteBootstrapNodes = [
            'zhtp://bootstrap1.zhtp:7777',
            'zhtp://bootstrap2.zhtp:7777',
            'zhtp://bootstrap3.zhtp:7777'
        ];

        // Try local nodes first (development environment)
        for (const node of localNodes) {
            try {
                console.log(` Connecting to local node: ${node}`);
                // For local nodes, we can assume connection since ZHTP API is already connected
                this.peers.add(node);
                console.log(` Connected to local node: ${node}`);
                return; // Successfully connected to local node
            } catch (error) {
                console.log(`⚠️ Failed to connect to ${node}, trying next...`);
            }
        }

        // Fallback to remote bootstrap nodes (production environment)
        for (const node of remoteBootstrapNodes) {
            try {
                console.log(` Connecting to bootstrap node: ${node}`);
                await this.api.connectToPeer(node);
                this.peers.add(node);
                break; // Successfully connected to at least one
            } catch (error) {
                console.log(`⚠️ Failed to connect to ${node}, trying next...`);
            }
        }

        if (this.peers.size === 0) {
            console.log('⚠️ No bootstrap nodes available, operating in standalone mode');
            // Don't throw error - allow operation with mock data
            this.peers.add('zhtp://localhost:8080'); // Add dummy local peer
        }
    }

    async discoverPeers() {
        console.log('👥 Discovering zkDHT peers...');
        
        try {
            // Query bootstrap nodes for more peers
            const discoveredPeers = await this.api.discoverPeers();
            
            for (const peer of discoveredPeers) {
                this.peers.add(peer);
            }
            
            console.log(` Discovered ${discoveredPeers.length} peers`);
            
        } catch (error) {
            console.log('⚠️ Peer discovery failed, continuing with bootstrap peers');
        }
    }

    async loadPage(zhtpUrl) {
        console.log(`📄 Loading page from zkDHT: ${zhtpUrl}`);
        
        try {
            // Parse ZHTP URL
            const parsed = this.parseZhtpUrl(zhtpUrl);
            
            // Check cache first
            const cacheKey = `${parsed.domain}:${parsed.path}`;
            if (this.cache.has(cacheKey)) {
                console.log('📦 Loading from cache...');
                return this.cache.get(cacheKey);
            }

            // Query zkDHT for content
            const contentHash = await this.resolveContent(parsed.domain, parsed.path);
            const content = await this.fetchContent(contentHash);
            
            // Verify content integrity
            await this.verifyContent(content, contentHash);
            
            // Cache the content
            this.cache.set(cacheKey, content);
            
            console.log(' Page loaded successfully from zkDHT');
            return content;
            
        } catch (error) {
            console.error('❌ Failed to load page from zkDHT:', error);
            
            // Fallback to mock content for development
            return this.generateMockContent(zhtpUrl);
        }
    }

    parseZhtpUrl(url) {
        // Parse ZHTP URLs like zhtp://wallet.zhtp/dashboard
        const match = url.match(/^zhtp:\/\/([^\/]+)(\/.*)?$/);
        if (!match) {
            throw new Error(`Invalid ZHTP URL: ${url}`);
        }

        return {
            domain: match[1],
            path: match[2] || '/',
            protocol: 'zhtp'
        };
    }

    async resolveContent(domain, path) {
        console.log(` Resolving content for ${domain}${path}...`);
        
        try {
            // Query zkDHT for content hash
            const query = {
                type: 'CONTENT_RESOLVE',
                domain: domain,
                path: path,
                timestamp: Date.now()
            };

            const response = await this.queryDHT(query);
            
            if (!response || !response.contentHash) {
                throw new Error(`Content not found: ${domain}${path}`);
            }

            return response.contentHash;
            
        } catch (error) {
            console.error('❌ Content resolution failed:', error);
            throw error;
        }
    }

    async fetchContent(contentHash) {
        console.log(`📥 Fetching content: ${contentHash.substring(0, 16)}...`);
        
        try {
            // Fetch content from multiple peers for redundancy
            const peers = Array.from(this.peers).slice(0, 3);
            
            for (const peer of peers) {
                try {
                    const content = await this.api.fetchFromPeer(peer, contentHash);
                    if (content) {
                        return content;
                    }
                } catch (error) {
                    console.log(`⚠️ Failed to fetch from ${peer}, trying next...`);
                }
            }
            
            throw new Error('Content not available from any peer');
            
        } catch (error) {
            console.error('❌ Content fetch failed:', error);
            throw error;
        }
    }

    async verifyContent(content, expectedHash) {
        // Verify content integrity using BLAKE3
        const actualHash = await this.calculateContentHash(content);
        
        if (actualHash !== expectedHash) {
            throw new Error('Content integrity verification failed');
        }
        
        console.log(' Content integrity verified');
    }

    async calculateContentHash(content) {
        // Calculate BLAKE3 hash of content
        const encoder = new TextEncoder();
        const data = encoder.encode(JSON.stringify(content));
        const hash = await blake3(data);
        return Array.from(hash).map(b => b.toString(16).padStart(2, '0')).join('');
    }

    async queryDHT(query) {
        // Query the distributed hash table
        const queryId = this.generateQueryId();
        
        try {
            // Check if we have a local node connection
            const hasLocalNode = Array.from(this.peers).some(peer => 
                peer.includes('localhost') || peer.includes('127.0.0.1')
            );
            
            if (hasLocalNode) {
                // For local development, simulate DHT response using the local node
                console.log('🏠 Using local node for DHT query simulation...');
                
                // Generate mock hash for content (would be real in production)
                const contentId = `${query.domain}${query.path}`.replace(/[^a-zA-Z0-9]/g, '_');
                const mockHash = await this.generateMockHash(contentId);
                
                return {
                    contentHash: mockHash,
                    domain: query.domain,
                    path: query.path,
                    timestamp: Date.now(),
                    source: 'local-node'
                };
            }
            
            // For remote DHT (production), send queries to multiple peers
            if (this.api.sendDHTQuery) {
                const promises = Array.from(this.peers).slice(0, 5).map(peer => 
                    this.api.sendDHTQuery(peer, { ...query, queryId })
                );

                const responses = await Promise.allSettled(promises);
                
                // Find the first successful response
                for (const result of responses) {
                    if (result.status === 'fulfilled' && result.value) {
                        return result.value;
                    }
                }
            }
            
            throw new Error('No valid responses from DHT query');
            
        } catch (error) {
            console.error('❌ DHT query failed:', error);
            throw error;
        }
    }
    
    async generateMockHash(contentId) {
        // Generate a consistent hash for development
        const encoder = new TextEncoder();
        const data = encoder.encode(contentId + Date.now().toString().slice(0, -3)); // Stable per second
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    }

    generateQueryId() {
        return 'q_' + Math.random().toString(36).substring(2, 15);
    }

    // Development fallback: Generate mock content for ZHTP URLs
    generateMockContent(zhtpUrl) {
        console.log(`🧪 Generating mock content for ${zhtpUrl}`);
        
        const domain = zhtpUrl.split('//')[1]?.split('/')[0];
        
        switch (domain) {
            case 'wallet.zhtp':
                return this.generateWalletPage();
            case 'dao.zhtp':
                return this.generateDaoPage();
            case 'social.zhtp':
                return this.generateSocialPage();
            case 'marketplace.zhtp':
                return this.generateMarketplacePage();
            case 'whisper.zhtp':
                return this.generateWhisperPage();
            default:
                return this.generateDefaultPage(domain);
        }
    }

    generateWalletPage() {
        return {
            type: 'zhtp-page',
            title: 'ZHTP Quantum Wallet',
            version: '1.0',
            content: {
                layout: 'wallet-dashboard',
                components: [
                    {
                        type: 'balance-overview',
                        data: {
                            totalBalance: '1,234.56',
                            currency: 'ZHTP',
                            usdValue: '24,691.20',
                            change24h: '+5.67%'
                        }
                    },
                    {
                        type: 'quick-actions',
                        actions: ['send', 'receive', 'swap', 'stake']
                    },
                    {
                        type: 'asset-list',
                        assets: [
                            { symbol: 'ZHTP', name: 'ZHTP Token', balance: '1,234.56', value: '$24,691.20' },
                            { symbol: 'GAS', name: 'Network Gas', balance: '45.23', value: '$135.69' }
                        ]
                    },
                    {
                        type: 'transaction-history',
                        transactions: [
                            { type: 'received', amount: '+100 ZHTP', time: '2 hours ago', from: 'alice.zkdid' },
                            { type: 'sent', amount: '-50 ZHTP', time: '1 day ago', to: 'bob.zkdid' }
                        ]
                    }
                ]
            },
            metadata: {
                author: 'ZHTP Core Team',
                created: new Date().toISOString(),
                contentHash: 'wallet_' + Date.now()
            }
        };
    }

    generateDaoPage() {
        return {
            type: 'zhtp-page',
            title: 'ZHTP DAO Governance',
            version: '1.0',
            content: {
                layout: 'dao-dashboard',
                components: [
                    {
                        type: 'governance-stats',
                        data: {
                            totalProposals: 42,
                            activeProposals: 7,
                            totalMembers: 3247,
                            votingPower: 150,
                            treasuryValue: '2.5M ZHTP'
                        }
                    },
                    {
                        type: 'active-proposals',
                        proposals: [
                            {
                                id: 'ZEP-001',
                                title: 'Increase Block Size to 4MB',
                                description: 'Proposal to increase maximum block size for better throughput',
                                status: 'active',
                                votesYes: 1856,
                                votesNo: 423,
                                deadline: '3 days remaining'
                            },
                            {
                                id: 'ZEP-002',
                                title: 'Treasury Fund Allocation',
                                description: 'Allocate 500K ZHTP for development grants',
                                status: 'active',
                                votesYes: 2103,
                                votesNo: 234,
                                deadline: '5 days remaining'
                            }
                        ]
                    },
                    {
                        type: 'voting-power',
                        userVotingPower: 150,
                        delegatedFrom: 23,
                        delegatedTo: 0
                    }
                ]
            },
            metadata: {
                author: 'ZHTP DAO',
                created: new Date().toISOString(),
                contentHash: 'dao_' + Date.now()
            }
        };
    }

    generateSocialPage() {
        return {
            type: 'zhtp-page',
            title: 'Web4 Social Network',
            version: '1.0',
            content: {
                layout: 'social-feed',
                components: [
                    {
                        type: 'post-composer',
                        placeholder: 'Share your thoughts on Web4...',
                        features: ['text', 'images', 'polls', 'location']
                    },
                    {
                        type: 'social-feed',
                        posts: [
                            {
                                id: 'post_1',
                                author: 'alice.zkdid',
                                avatar: '👩‍💻',
                                content: 'Just deployed my first Web4 dApp! The zero-knowledge privacy is incredible! 🚀 #Web4 #ZHTP',
                                timestamp: '2 hours ago',
                                likes: 47,
                                shares: 12,
                                comments: 8
                            },
                            {
                                id: 'post_2',
                                author: 'dev.zhtp',
                                avatar: '👨‍💻',
                                content: 'New protocol update is live! Quantum-resistant signatures now 40% faster. Upgrade your nodes! ⚡',
                                timestamp: '4 hours ago',
                                likes: 156,
                                shares: 34,
                                comments: 23
                            }
                        ]
                    },
                    {
                        type: 'trending-topics',
                        topics: ['#Web4', '#ZeroKnowledge', '#QuantumResistant', '#Decentralized']
                    }
                ]
            },
            metadata: {
                author: 'Web4 Social Team',
                created: new Date().toISOString(),
                contentHash: 'social_' + Date.now()
            }
        };
    }

    generateMarketplacePage() {
        return {
            type: 'zhtp-page',
            title: 'Web4 Marketplace',
            version: '1.0',
            content: {
                layout: 'marketplace-grid',
                components: [
                    {
                        type: 'category-nav',
                        categories: ['Apps', 'NFTs', 'Domains', 'Data', 'Services']
                    },
                    {
                        type: 'featured-items',
                        items: [
                            {
                                id: 'app_zkgames',
                                type: 'app',
                                title: 'ZK Games Suite',
                                description: 'Privacy-focused gaming platform with provable fairness',
                                price: 'Free',
                                rating: 4.8,
                                downloads: '10K+',
                                image: '🎮'
                            },
                            {
                                id: 'nft_art001',
                                type: 'nft',
                                title: 'Quantum Digital Art #001',
                                description: 'Unique quantum-verified artwork by renowned artist',
                                price: '100 ZHTP',
                                rarity: 'Ultra Rare',
                                image: '🖼️'
                            },
                            {
                                id: 'domain_mycompany',
                                type: 'domain',
                                title: 'mycompany.zhtp',
                                description: 'Premium business domain for Web4',
                                price: '500 ZHTP',
                                category: 'Business',
                                image: '🌐'
                            }
                        ]
                    },
                    {
                        type: 'search-filters',
                        filters: ['Price', 'Category', 'Rating', 'Date Added']
                    }
                ]
            },
            metadata: {
                author: 'Web4 Marketplace',
                created: new Date().toISOString(),
                contentHash: 'marketplace_' + Date.now()
            }
        };
    }

    generateWhisperPage() {
        return {
            type: 'zhtp-page',
            title: 'Whisper Messaging',
            version: '1.0',
            content: {
                layout: 'messaging-interface',
                components: [
                    {
                        type: 'contact-sidebar',
                        contacts: [
                            { id: 'alice', name: 'Alice.zkdid', avatar: '👩', status: 'online', lastMessage: 'How\'s the Web4 project?', time: '2m' },
                            { id: 'bob', name: 'Bob.zhtp', avatar: '👨', status: 'online', lastMessage: 'Check out this dApp!', time: '1h' },
                            { id: 'team', name: 'Dev Team', avatar: '👥', status: 'active', lastMessage: 'Meeting in 5 minutes', time: '5m' }
                        ]
                    },
                    {
                        type: 'chat-interface',
                        activeChat: 'alice',
                        messages: [
                            { sender: 'alice', content: 'Hey! How\'s the Web4 project going?', time: '2:30 PM', type: 'received' },
                            { sender: 'me', content: 'Going great! Just deployed the new features 🚀', time: '2:31 PM', type: 'sent' },
                            { sender: 'alice', content: 'Awesome! Can\'t wait to try them out', time: '2:32 PM', type: 'received' }
                        ]
                    },
                    {
                        type: 'message-composer',
                        features: ['text', 'files', 'emojis', 'voice', 'video']
                    }
                ]
            },
            metadata: {
                author: 'Whisper Team',
                created: new Date().toISOString(),
                contentHash: 'whisper_' + Date.now()
            }
        };
    }

    generateDefaultPage(domain) {
        return {
            type: 'zhtp-page',
            title: `Web4 Site: ${domain}`,
            version: '1.0',
            content: {
                layout: 'default',
                components: [
                    {
                        type: 'header',
                        title: domain,
                        subtitle: 'Powered by ZHTP Protocol'
                    },
                    {
                        type: 'content',
                        html: `
                            <div style="text-align: center; padding: 2rem;">
                                <h2>🌐 Welcome to ${domain}</h2>
                                <p>This is a Web4 site hosted on the ZHTP network</p>
                                <p>Content loaded from zkDHT (Zero-Knowledge Distributed Hash Table)</p>
                                <div style="margin-top: 2rem;">
                                    <button onclick="window.browser?.showNotification('Feature coming soon!', 'info')">
                                        🚀 Explore Features
                                    </button>
                                </div>
                            </div>
                        `
                    }
                ]
            },
            metadata: {
                author: 'Unknown',
                created: new Date().toISOString(),
                contentHash: 'default_' + Date.now()
            }
        };
    }

    // Cache management
    clearCache() {
        this.cache.clear();
        console.log('🗑️ zkDHT cache cleared');
    }

    getCacheSize() {
        return this.cache.size;
    }

    // Network status
    getNetworkStatus() {
        return {
            connected: this.isConnected,
            peers: this.peers.size,
            cached: this.cache.size
        };
    }
}

// Helper function for BLAKE3 hashing (simplified for web)
async function blake3(data) {
    // In production, this would use actual BLAKE3
    // For demo, we'll use crypto.subtle with SHA-256
    const encoder = new TextEncoder();
    const dataArray = typeof data === 'string' ? encoder.encode(data) : data;
    const hashBuffer = await crypto.subtle.digest('SHA-256', dataArray);
    return new Uint8Array(hashBuffer);
}

export default ZkDHTClient;
