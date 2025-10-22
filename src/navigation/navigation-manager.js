/**
 * Navigation Manager - Web4 navigation and protocol handling
 * Manages ZHTP protocol navigation and dApp routing
 */

export class NavigationManager {
    constructor(api) {
        this.api = api;
        this.history = [];
        this.currentIndex = -1;
        this.maxHistorySize = 100;
        this.protocolHandlers = new Map();
        this.isInitialized = false;
        
        this.initializeProtocolHandlers();
    }

    // Simple HTTP helper for direct API calls
    async httpGet(endpoint) {
        const axios = require('axios').default;
        const url = `http://127.0.0.1:9333${endpoint}`;
        const response = await axios.get(url, { timeout: 10000 });
        return response.data;
    }

    initializeProtocolHandlers() {
        // Register ZHTP protocol handlers
        this.protocolHandlers.set('zhtp://', this.handleZhtpProtocol.bind(this));
        this.protocolHandlers.set('zk://', this.handleZkProtocol.bind(this));
        this.protocolHandlers.set('mesh://', this.handleMeshProtocol.bind(this));
        this.protocolHandlers.set('dao://', this.handleDaoProtocol.bind(this));
        
        this.isInitialized = true;
        console.log('🧭 Navigation manager initialized with protocol handlers');
    }

    async navigate(url) {
        console.log(`🌐 Navigating to: ${url}`);
        
        try {
            // Parse and validate URL
            const parsedUrl = this.parseUrl(url);
            
            // Add to history
            this.addToHistory(parsedUrl);
            
            // Handle different protocols
            if (parsedUrl.protocol && this.protocolHandlers.has(parsedUrl.protocol)) {
                return await this.protocolHandlers.get(parsedUrl.protocol)(parsedUrl);
            }
            
            // Handle ZHTP domains
            if (parsedUrl.domain && parsedUrl.domain.endsWith('.zhtp')) {
                return await this.handleZhtpDomain(parsedUrl);
            }
            
            // Default Web4 navigation
            return await this.handleWeb4Navigation(parsedUrl);
            
        } catch (error) {
            console.error('❌ Navigation failed:', error);
            throw error;
        }
    }

    parseUrl(url) {
        // Parse Web4 URL format
        const urlObj = {
            original: url,
            protocol: null,
            domain: null,
            path: '/',
            query: {},
            fragment: null,
            isContractId: false,
            isBlockchainHash: false
        };

        try {
            // Handle protocol URLs (zhtp://, zk://, etc.)
            if (url.includes('://')) {
                const [protocol, rest] = url.split('://');
                urlObj.protocol = protocol + '://';
                url = rest;
            }
            
            // Detect contract IDs (format: contract_XXXXXXXXXX)
            if (url.match(/^contract_\d+$/)) {
                urlObj.isContractId = true;
                urlObj.domain = url;
                console.log(` Detected contract ID: ${url}`);
                return urlObj;
            }
            
            // Detect blockchain hashes (64-character hex strings)
            if (url.match(/^[a-f0-9]{64}$/i)) {
                urlObj.isBlockchainHash = true;
                urlObj.domain = url;
                console.log(`⛓️ Detected blockchain hash: ${url}`);
                return urlObj;
            }

            // Split domain and path
            const [domainPart, ...pathParts] = url.split('/');
            urlObj.domain = domainPart;
            
            if (pathParts.length > 0) {
                urlObj.path = '/' + pathParts.join('/');
            }

            // Parse query parameters
            if (urlObj.path.includes('?')) {
                const [path, queryString] = urlObj.path.split('?');
                urlObj.path = path;
                
                queryString.split('&').forEach(param => {
                    const [key, value] = param.split('=');
                    if (key) {
                        urlObj.query[decodeURIComponent(key)] = decodeURIComponent(value || '');
                    }
                });
            }

            // Parse fragment
            if (urlObj.path.includes('#')) {
                const [path, fragment] = urlObj.path.split('#');
                urlObj.path = path;
                urlObj.fragment = fragment;
            }

        } catch (error) {
            console.error('❌ URL parsing failed:', error);
        }

        return urlObj;
    }

    async handleZhtpProtocol(parsedUrl) {
        // Handle zhtp:// protocol URLs
        const { domain, path, query } = parsedUrl;
        
        switch (domain) {
            case 'identity':
                return await this.handleIdentityProtocol(path, query);
            case 'wallet':
                return await this.handleWalletProtocol(path, query);
            case 'dao':
                return await this.handleDaoProtocol(path, query);
            case 'dapp':
                return await this.handleDappProtocol(path, query);
            default:
                // Try as a registered .zhtp domain
                if (domain.endsWith('.zhtp')) {
                    return await this.handleZhtpDomain(parsedUrl);
                }
                throw new Error(`Unknown ZHTP protocol domain: ${domain}`);
        }
    }

    async handleZkProtocol(parsedUrl) {
        // Handle zk:// protocol for zero-knowledge operations
        const { domain, path, query } = parsedUrl;
        
        switch (domain) {
            case 'proof':
                return await this.handleProofProtocol(path, query);
            case 'verify':
                return await this.handleVerifyProtocol(path, query);
            case 'private':
                return await this.handlePrivateProtocol(path, query);
            default:
                throw new Error(`Unknown ZK protocol domain: ${domain}`);
        }
    }

    async handleMeshProtocol(parsedUrl) {
        // Handle mesh:// protocol for mesh network operations
        const { domain, path, query } = parsedUrl;
        
        switch (domain) {
            case 'node':
                return await this.handleNodeProtocol(path, query);
            case 'peer':
                return await this.handlePeerProtocol(path, query);
            case 'route':
                return await this.handleRouteProtocol(path, query);
            default:
                throw new Error(`Unknown mesh protocol domain: ${domain}`);
        }
    }

    async handleDaoProtocol(parsedUrl) {
        // Handle dao:// protocol for governance operations
        const { path, query } = parsedUrl;
        
        if (path.startsWith('/proposal/')) {
            const proposalId = path.split('/')[2];
            return await this.loadProposalPage(proposalId);
        } else if (path === '/vote') {
            return await this.loadVotingPage(query);
        } else if (path === '/treasury') {
            return await this.loadTreasuryPage();
        }
        
        // Default to DAO overview
        return await this.loadDaoOverview();
    }

    async handleZhtpDomain(parsedUrl) {
        // Handle .zhtp domain names
        const { domain, path, query } = parsedUrl;
        
        console.log(`Loading ZHTP domain: ${domain}`);
        
        // First try Web4 registry (new system)
        try {
            console.log(` Checking Web4 registry for: ${domain}`);
            const domainData = await this.httpGet(`/api/v1/web4/domains/${domain}`);
            
            if (domainData && domainData.found) {
                console.log(`✅ Domain found in Web4 registry: ${domain}`);
                return await this.loadWeb4Site(domain, path || '/');
            }
        } catch (error) {
            console.log(` Web4 lookup failed, trying blockchain DNS: ${error.message}`);
        }
        
        // Fallback to blockchain DNS (legacy system)
        try {
            console.log(` Resolving blockchain DNS for: ${domain}`);
            const contractInfo = await this.api.resolveDomain(domain);
            
            if (contractInfo && contractInfo.contract_id) {
                console.log(` Domain resolved: ${domain} → ${contractInfo.contract_id}`);
                return await this.loadContractById(contractInfo.contract_id, path);
            }
            
            console.log(`❌ Domain not found in blockchain DNS: ${domain}`);
            throw new Error(`Domain not registered: ${domain}`);
        } catch (error) {
            console.error(`🚫 DNS resolution failed for ${domain}:`, error.message);
            throw new Error(`Failed to resolve domain: ${domain}`);
        }

        // Try to resolve as dApp
        return await this.loadDapp(domain, path, query);
    }

    async loadWeb4Site(domain, path = '/') {
        console.log(`🌐 Loading Web4 site: ${domain}${path}`);
        
        try {
            // Fetch content from Web4 serve endpoint using direct HTTP
            const axios = require('axios').default;
            const url = `http://127.0.0.1:9333/api/v1/web4/serve/${domain}${path}`;
            const response = await axios.get(url, { 
                timeout: 10000,
                responseType: 'text'
            });
            
            if (response.status !== 200) {
                throw new Error(`Failed to fetch content: ${response.status}`);
            }
            
            // Get the content
            let content = response.data;
            console.log(`✅ Received ${content.length} bytes of content`);
            
            // Determine content type
            const contentType = response.headers['content-type'] ||
                               (path.endsWith('.css') ? 'text/css' : 
                                path.endsWith('.js') ? 'application/javascript' :
                                'text/html');
            
            // If HTML, rewrite URLs to point to Web4 serve endpoint
            if (contentType.includes('text/html') && typeof content === 'string') {
                console.log('🔧 Rewriting URLs in HTML for Web4 resource loading');
                
                // Set base tag in the actual document head for proper URL resolution
                const baseUrl = `http://127.0.0.1:9333/api/v1/web4/serve/${domain}/`;
                let baseElement = document.querySelector('base');
                if (!baseElement) {
                    baseElement = document.createElement('base');
                    document.head.insertBefore(baseElement, document.head.firstChild);
                }
                baseElement.href = baseUrl;
                console.log(`📍 Set base URL to: ${baseUrl}`);
                
                // Also inject base tag into the HTML content for completeness
                const baseTag = `<base href="${baseUrl}">`;
                content = content.replace(/<head[^>]*>/i, match => match + baseTag);
            }
            
            return {
                type: 'web4_site',
                domain: domain,
                path: path,
                content: content,
                metadata: {
                    contentType: contentType,
                    accessMethod: 'web4_serve',
                    domain: domain,
                    path: path,
                    timestamp: Date.now()
                }
            };
        } catch (error) {
            console.error(`❌ Failed to load Web4 site ${domain}${path}:`, error);
            throw error;
        }
    }

    async handleWeb4Navigation(parsedUrl) {
        // Handle general Web4 navigation
        const { domain, path, isContractId, isBlockchainHash } = parsedUrl;
        
        if (!domain || domain === 'dashboard.zhtp' || domain === '') {
            return await this.loadDashboard();
        }
        
        // Handle direct contract ID access
        if (isContractId) {
            return await this.loadContractById(domain, path);
        }
        
        // Handle direct blockchain hash access
        if (isBlockchainHash) {
            return await this.loadContractByHash(domain, path);
        }
        
        // Try to load as Web4 resource
        return await this.loadWeb4Resource(parsedUrl);
    }
    
    async loadContractById(contractId, path = '/') {
        console.log(` Loading Web4 site by contract ID: ${contractId}`);
        
        try {
            // Query blockchain/DHT for contract information
            const contractInfo = await this.api.getContractById(contractId);
            
            if (!contractInfo) {
                throw new Error(`Contract not found on DHT/blockchain: ${contractId}`);
            }
            
            // Load content directly from contract (bypass domain resolution)
            const resourceData = await this.api.getContractContent(contractId, path);
            
            return {
                type: 'web4_contract',
                contractId: contractId,
                path: path,
                content: resourceData.content,
                metadata: {
                    ...resourceData.metadata,
                    accessMethod: 'contract_id',
                    contractId: contractId
                }
            };
            
        } catch (error) {
            console.error(`❌ Failed to load contract ${contractId}:`, error);
            throw error;
        }
    }
    
    async loadContractByHash(blockchainHash, path = '/') {
        console.log(`⛓️ Loading Web4 site by blockchain hash: ${blockchainHash}`);
        
        try {
            // Query blockchain for contract by hash
            const contractInfo = await this.api.getContractByHash(blockchainHash);
            
            if (!contractInfo) {
                throw new Error(`Contract not found on blockchain: ${blockchainHash}`);
            }
            
            // Load Web4 resource from the resolved contract
            const resourceUrl = `${contractInfo.contract_id}${path}`;
            const resourceData = await this.api.loadWeb4Resource(resourceUrl);
            
            return {
                type: 'web4_contract',
                contractId: contractInfo.contract_id,
                blockchainHash: blockchainHash,
                path: path,
                content: resourceData.content,
                metadata: {
                    ...resourceData.metadata,
                    accessMethod: 'blockchain_hash',
                    blockchainHash: blockchainHash,
                    contractId: contractInfo.contract_id
                }
            };
            
        } catch (error) {
            console.error(`❌ Failed to load contract by hash ${blockchainHash}:`, error);
            throw error;
        }
    }

    async loadDapp(domain, path, query) {
        console.log(` Loading dApp: ${domain}`);
        
        try {
            // Resolve dApp through ZHTP network
            const dappInfo = await this.api.resolveDapp(domain);
            
            if (!dappInfo) {
                throw new Error(`dApp not found: ${domain}`);
            }

            // Load dApp interface
            return {
                type: 'dapp',
                domain: domain,
                dappInfo: dappInfo,
                path: path,
                query: query,
                content: await this.generateDappInterface(dappInfo, path, query)
            };

        } catch (error) {
            console.error(`❌ Failed to load dApp ${domain}:`, error);
            throw error;
        }
    }

    async generateDappInterface(dappInfo, path, query) {
        // Generate dApp interface based on dApp metadata
        return `
            <div class="fade-in">
                <h1 style="color: #00d4ff; margin-bottom: 2rem;"> ${dappInfo.name}</h1>
                
                <div class="dashboard-grid">
                    <div class="dashboard-card">
                        <h3 class="card-title">dApp Information</h3>
                        <p><strong>Name:</strong> ${dappInfo.name}</p>
                        <p><strong>Version:</strong> ${dappInfo.version}</p>
                        <p><strong>Developer:</strong> ${dappInfo.developer}</p>
                        <p><strong>Category:</strong> ${dappInfo.category}</p>
                        <p><strong>Users:</strong> ${dappInfo.activeUsers || 0}</p>
                    </div>
                    
                    <div class="dashboard-card">
                        <h3 class="card-title">Description</h3>
                        <p>${dappInfo.description}</p>
                        
                        <div style="margin-top: 1rem;">
                            <button class="btn-primary" onclick="browser.launchDapp('${dappInfo.id}')">
                                🚀 Launch dApp
                            </button>
                        </div>
                    </div>
                    
                    <div class="dashboard-card">
                        <h3 class="card-title">Permissions</h3>
                        <ul style="list-style: none; padding: 0;">
                            ${(dappInfo.permissions || []).map(perm => 
                                `<li style="padding: 0.25rem 0;"> ${perm}</li>`
                            ).join('')}
                        </ul>
                    </div>
                    
                    <div class="dashboard-card">
                        <h3 class="card-title">Reviews</h3>
                        <div style="display: flex; align-items: center; margin-bottom: 1rem;">
                            <span style="font-size: 1.5rem; color: #d4ff00;">
                                ${'⭐'.repeat(Math.floor(dappInfo.rating || 0))}
                            </span>
                            <span style="margin-left: 0.5rem; color: #8a9ba8;">
                                ${dappInfo.rating || 0}/5 (${dappInfo.reviewCount || 0} reviews)
                            </span>
                        </div>
                        <p style="color: #8a9ba8; font-size: 0.9rem;">
                            Latest reviews and community feedback
                        </p>
                    </div>
                </div>
            </div>
        `;
    }

    addToHistory(parsedUrl) {
        // Remove any items after current index (for back/forward navigation)
        if (this.currentIndex < this.history.length - 1) {
            this.history = this.history.slice(0, this.currentIndex + 1);
        }

        // Add new URL to history
        this.history.push({
            url: parsedUrl,
            timestamp: Date.now(),
            title: this.generatePageTitle(parsedUrl)
        });

        // Update current index
        this.currentIndex = this.history.length - 1;

        // Limit history size
        if (this.history.length > this.maxHistorySize) {
            this.history = this.history.slice(-this.maxHistorySize);
            this.currentIndex = this.history.length - 1;
        }

        console.log(`📚 Added to history: ${parsedUrl.original} (${this.history.length} items)`);
    }

    generatePageTitle(parsedUrl) {
        if (parsedUrl.domain) {
            if (parsedUrl.domain.endsWith('.zhtp')) {
                return parsedUrl.domain.replace('.zhtp', '').toUpperCase() + ' - ZHTP';
            }
            return parsedUrl.domain;
        }
        return 'ZHTP Web4 Browser';
    }

    back() {
        if (this.canGoBack()) {
            this.currentIndex--;
            const historyItem = this.history[this.currentIndex];
            console.log(`⬅️ Going back to: ${historyItem.url.original}`);
            return this.navigate(historyItem.url.original);
        }
        throw new Error('Cannot go back - no previous page');
    }

    forward() {
        if (this.canGoForward()) {
            this.currentIndex++;
            const historyItem = this.history[this.currentIndex];
            console.log(`➡️ Going forward to: ${historyItem.url.original}`);
            return this.navigate(historyItem.url.original);
        }
        throw new Error('Cannot go forward - no next page');
    }

    canGoBack() {
        return this.currentIndex > 0;
    }

    canGoForward() {
        return this.currentIndex < this.history.length - 1;
    }

    getCurrentUrl() {
        if (this.currentIndex >= 0 && this.currentIndex < this.history.length) {
            return this.history[this.currentIndex].url;
        }
        return null;
    }

    getHistory() {
        return this.history.slice(); // Return copy
    }

    clearHistory() {
        this.history = [];
        this.currentIndex = -1;
        console.log('🗑️ Navigation history cleared');
    }

    // Protocol handler implementations
    async handleIdentityProtocol(path, query) {
        if (path === '/create') {
            return { action: 'open_identity_modal' };
        } else if (path === '/verify') {
            return { action: 'start_biometric_verification' };
        } else if (path.startsWith('/did/')) {
            const did = path.split('/')[2];
            return { action: 'view_identity', did: did };
        }
        
        return { action: 'open_identity_manager' };
    }

    async handleWalletProtocol(path, query) {
        if (path === '/send') {
            return { action: 'open_send_tokens', ...query };
        } else if (path === '/receive') {
            return { action: 'show_receive_address' };
        } else if (path === '/stake') {
            return { action: 'open_staking', ...query };
        }
        
        return { action: 'open_wallet_modal' };
    }

    async handleProofProtocol(path, query) {
        if (path.startsWith('/verify/')) {
            const proofId = path.split('/')[2];
            return { action: 'verify_proof', proofId: proofId };
        } else if (path === '/create') {
            return { action: 'create_proof', ...query };
        }
        
        return { action: 'show_proof_interface' };
    }

    async loadDashboard() {
        return {
            type: 'dashboard',
            content: 'dashboard' // Will be handled by main app
        };
    }

    async loadSocialNetwork(path, query) {
        return {
            type: 'social',
            path: path,
            query: query,
            content: 'social' // Will be handled by main app
        };
    }

    async loadWhisperMessaging(path, query) {
        return {
            type: 'whisper',
            path: path,
            query: query,
            content: 'whisper' // Will be handled by main app
        };
    }

    async loadMarketplace(path, query) {
        return {
            type: 'marketplace',
            path: path,
            query: query,
            content: 'marketplace' // Will be handled by main app
        };
    }

    async loadDaoPage(path, query) {
        return {
            type: 'dao',
            path: path,
            query: query,
            content: 'dao' // Will be handled by main app
        };
    }

    async loadNetworkStats(path, query) {
        return {
            type: 'stats',
            path: path,
            query: query,
            content: 'stats' // Will be handled by main app
        };
    }

    async loadDeveloperTools(path, query) {
        return {
            type: 'dev',
            path: path,
            query: query,
            content: `
                <div class="fade-in">
                    <h1 style="color: #00d4ff; margin-bottom: 2rem;">ZHTP Developer Tools</h1>
                    
                    <div class="dashboard-grid">
                        <div class="dashboard-card">
                            <h3 class="card-title">Smart Contract IDE</h3>
                            <p>Develop and deploy ZHTP smart contracts with built-in ZK proof generation.</p>
                            <button class="btn-primary" style="margin-top: 1rem;">
                                🧑‍💻 Open IDE
                            </button>
                        </div>
                        
                        <div class="dashboard-card">
                            <h3 class="card-title">dApp Builder</h3>
                            <p>Create Web4 decentralized applications with quantum-resistant security.</p>
                            <button class="btn-primary" style="margin-top: 1rem;">
                                 Build dApp
                            </button>
                        </div>
                        
                        <div class="dashboard-card">
                            <h3 class="card-title">Network Explorer</h3>
                            <p>Explore blocks, transactions, and network topology in real-time.</p>
                            <button class="btn-primary" style="margin-top: 1rem;">
                                 Explore Network
                            </button>
                        </div>
                        
                        <div class="dashboard-card">
                            <h3 class="card-title">API Documentation</h3>
                            <p>Complete ZHTP API reference with examples and tutorials.</p>
                            <button class="btn-primary" style="margin-top: 1rem;">
                                📚 View Docs
                            </button>
                        </div>
                    </div>
                </div>
            `
        };
    }

    async loadWeb4Resource(parsedUrl) {
        // Generic Web4 resource loader
        try {
            const resource = await this.api.loadWeb4Resource(parsedUrl.original);
            return {
                type: 'web4_resource',
                url: parsedUrl,
                content: resource.content,
                metadata: resource.metadata
            };
        } catch (error) {
            return {
                type: 'error',
                error: error.message,
                content: `
                    <div class="fade-in" style="text-align: center; padding: 4rem;">
                        <h1 style="color: #ff6b6b; margin-bottom: 2rem;">🚫 Resource Not Found</h1>
                        <p style="font-size: 1.2rem; margin-bottom: 3rem; color: #8a9ba8;">
                            The requested Web4 resource could not be found.
                        </p>
                        <p style="color: #8a9ba8; margin-bottom: 2rem;">
                            URL: ${parsedUrl.original}
                        </p>
                        <button class="btn-primary" onclick="browser.navigateToAddress('dashboard.zhtp')" 
                                style="width: auto; padding: 1rem 3rem;">
                            🏠 Return to Dashboard
                        </button>
                    </div>
                `
            };
        }
    }

    // Utility methods
    isValidZhtpUrl(url) {
        try {
            const parsed = this.parseUrl(url);
            return !!(parsed.domain || parsed.protocol);
        } catch (error) {
            return false;
        }
    }

    getPageTitle() {
        const current = this.getCurrentUrl();
        return current ? this.generatePageTitle(current) : 'ZHTP Web4 Browser';
    }

    getSuggestions(input) {
        // Return navigation suggestions based on input
        const suggestions = [];
        
        // System domains
        const systemDomains = [
            'dashboard.zhtp',
            'social.zhtp', 
            'whisper.zhtp',
            'marketplace.zhtp',
            'dao.zhtp',
            'stats.zhtp',
            'dev.zhtp',
            'wallet.zhtp',
            'identity.zhtp'
        ];
        
        // Filter matching domains
        systemDomains.forEach(domain => {
            if (domain.toLowerCase().includes(input.toLowerCase())) {
                suggestions.push({
                    type: 'domain',
                    value: domain,
                    title: domain.replace('.zhtp', '').toUpperCase(),
                    description: `ZHTP system domain`
                });
            }
        });
        
        // Protocol suggestions
        if (input.includes('://') || input.length < 5) {
            const protocols = ['zhtp://', 'zk://', 'mesh://', 'dao://'];
            protocols.forEach(protocol => {
                if (protocol.startsWith(input.toLowerCase())) {
                    suggestions.push({
                        type: 'protocol',
                        value: protocol,
                        title: protocol.replace('://', '').toUpperCase() + ' Protocol',
                        description: `${protocol} protocol navigation`
                    });
                }
            });
        }
        
        // History suggestions
        this.history.slice(-10).forEach(item => {
            if (item.url.original.toLowerCase().includes(input.toLowerCase())) {
                suggestions.push({
                    type: 'history',
                    value: item.url.original,
                    title: item.title,
                    description: `From history - ${new Date(item.timestamp).toLocaleDateString()}`
                });
            }
        });
        
        return suggestions.slice(0, 8); // Limit to 8 suggestions
    }

    isInitialized() {
        return this.isInitialized;
    }

    getMimeType(fileName) {
        const ext = fileName.split('.').pop().toLowerCase();
        const mimeTypes = {
            'html': 'text/html',
            'css': 'text/css',
            'js': 'application/javascript',
            'json': 'application/json',
            'png': 'image/png',
            'jpg': 'image/jpeg',
            'jpeg': 'image/jpeg',
            'gif': 'image/gif',
            'svg': 'image/svg+xml',
            'txt': 'text/plain',
            'xml': 'text/xml',
            'pdf': 'application/pdf'
        };
        return mimeTypes[ext] || 'application/octet-stream';
    }
}

export default NavigationManager;
