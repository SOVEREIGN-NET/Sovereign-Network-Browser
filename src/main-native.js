import { ZhtpApi } from './api/zhtp-api.js';
import { NativeZhtpApi } from './api/native-zhtp-api.js';
import { ZkDidManager } from './identity/zkdid-manager.js';
import { QuantumWallet } from './wallet/quantum-wallet.js';
import { DaoManager } from './dao/dao-manager.js';
import { NavigationManager } from './navigation/navigation-manager.js';
import { BiometricVerifier } from './identity/biometric-verifier.js';

class Web4Browser {
    constructor() {
        // Use native ZHTP API instead of HTTP bridge
        this.api = new NativeZhtpApi();
        this.legacyApi = new ZhtpApi(); // Keep as fallback
        this.zkDid = new ZkDidManager(this.api);
        this.wallet = new QuantumWallet(this.api);
        this.dao = new DaoManager(this.api);
        this.navigation = new NavigationManager(this.api);
        this.biometric = new BiometricVerifier();
        
        this.currentIdentity = null;
        this.isInitialized = false;
        this.useNativeProtocol = true; // Flag to control protocol usage
        
        this.initializeEventListeners();
    }

    async initialize() {
        console.log('🚀 Initializing ZHTP Web4 Desktop App with Native Protocol...');
        
        try {
            // Show loading screen
            this.updateLoadingProgress(0, 'Initializing native ZHTP protocol...');
            
            // Try to initialize native ZHTP client
            try {
                await this.api.initialize();
                console.log(' Native ZHTP protocol initialized successfully');
                this.updateLoadingProgress(20, 'Native ZHTP protocol connected');
            } catch (error) {
                console.warn('⚠️ Native ZHTP failed, falling back to legacy bridge:', error);
                this.useNativeProtocol = false;
                await this.legacyApi.initialize();
                this.api = this.legacyApi; // Switch to legacy API
                this.updateLoadingProgress(20, 'Legacy ZHTP bridge connected');
            }
            
            this.updateLoadingProgress(40, 'Establishing blockchain connection...');
            
            // Get real network status from ZHTP node using native protocol
            const networkStatus = await this.api.getNetworkStats();
            console.log('📊 ZHTP Network Status (Native):', networkStatus);
            this.updateLoadingProgress(50, `Connected to ZHTP network (${networkStatus.peers || networkStatus.connectedPeers || 0} peers)`);
            
            // Check for existing identity using native identity system
            const savedIdentity = await this.zkDid.loadSavedIdentity();
            if (savedIdentity) {
                this.currentIdentity = savedIdentity;
                this.updateIdentityIndicator();
                
                // Get real wallet balance using native protocol
                const balance = await this.api.getBalance();
                console.log('💰 ZHTP Wallet Balance (Native):', balance);
            }
            this.updateLoadingProgress(70, 'Loading identity system...');
            
            // Initialize wallet with native blockchain connection
            await this.wallet.initialize(this.currentIdentity);
            this.updateLoadingProgress(85, 'Preparing quantum wallet...');
            
            // Get real blockchain info using native protocol
            const blockchainInfo = await this.api.getBlockchainStatus();
            console.log('⛓️ ZHTP Blockchain Info (Native):', blockchainInfo);
            
            // Load dashboard with real data
            await this.loadDashboard();
            this.updateLoadingProgress(100, `Web4 browser ready! (${this.useNativeProtocol ? 'Native ZHTP' : 'Legacy Bridge'})`);
            
            // Hide loading screen and show browser
            setTimeout(() => {
                document.getElementById('loadingScreen').classList.add('hidden');
                document.getElementById('browserContainer').classList.add('active');
                this.isInitialized = true;
                
                // Start real-time updates from ZHTP network
                this.startNetworkUpdates();
            }, 1000);
            
        } catch (error) {
            console.error('❌ Initialization failed:', error);
            this.updateLoadingProgress(0, 'Failed to connect to ZHTP network');
            this.showInitializationError(error);
        }
    }

    async startNetworkUpdates() {
        // Poll for real-time updates from ZHTP network using native protocol
        setInterval(async () => {
            try {
                if (this.currentIdentity) {
                    // Update wallet balance using native protocol
                    const balance = await this.api.getBalance();
                    console.log('💰 Updated ZHTP balance (Native):', balance);
                    
                    // Update network stats using native protocol
                    const networkStats = await this.api.getNetworkStats();
                    console.log('📊 Network stats update (Native):', networkStats);
                    
                    // Trigger UI updates
                    this.updateNetworkIndicators(networkStats);
                    
                    // Show protocol status in UI
                    this.updateProtocolStatus();
                }
            } catch (error) {
                console.log('⚠️ Network update failed:', error.message);
                
                // If native protocol fails, try to reconnect or fallback
                if (this.useNativeProtocol && error.message.includes('Not connected')) {
                    console.log(' Attempting to reconnect native ZHTP...');
                    try {
                        await this.api.initialize();
                    } catch (reconnectError) {
                        console.warn('⚠️ Native reconnection failed, switching to legacy');
                        this.useNativeProtocol = false;
                        this.api = this.legacyApi;
                    }
                }
            }
        }, 30000); // Update every 30 seconds
    }

    updateProtocolStatus() {
        // Add protocol status indicator to UI
        const protocolIndicator = document.querySelector('.protocol-indicator');
        if (protocolIndicator) {
            const connectionInfo = this.api.getConnectionInfo();
            protocolIndicator.innerHTML = `
                <div class="protocol-status ${this.useNativeProtocol ? 'native' : 'legacy'}">
                    <span class="protocol-icon">${this.useNativeProtocol ? '🚀' : ''}</span>
                    <span class="protocol-text">
                        ${this.useNativeProtocol ? 'Native ZHTP' : 'Legacy Bridge'}
                    </span>
                    <span class="protocol-details">
                        ${connectionInfo.protocol || 'Unknown'} • 
                        ${connectionInfo.connected ? 'Connected' : 'Disconnected'}
                    </span>
                </div>
            `;
        }
    }

    updateNetworkIndicators(stats) {
        // Update any network status indicators in the UI
        const indicators = document.querySelectorAll('.network-indicator');
        indicators.forEach(indicator => {
            const peerCount = stats.peers || stats.connectedPeers || 0;
            indicator.textContent = `${peerCount} peers`;
            
            // Add native protocol badge
            const protocolBadge = indicator.querySelector('.protocol-badge') || document.createElement('span');
            protocolBadge.className = 'protocol-badge';
            protocolBadge.textContent = this.useNativeProtocol ? 'Native' : 'Bridge';
            protocolBadge.style.cssText = `
                background: ${this.useNativeProtocol ? '#4caf50' : '#ff9800'};
                color: white;
                padding: 2px 6px;
                border-radius: 10px;
                font-size: 0.7rem;
                margin-left: 8px;
            `;
            
            if (!indicator.querySelector('.protocol-badge')) {
                indicator.appendChild(protocolBadge);
            }
        });
    }

    updateLoadingProgress(percentage, message) {
        const progressBar = document.getElementById('loadingProgress');
        const loadingText = document.querySelector('.loading-text');
        
        if (progressBar) progressBar.style.width = `${percentage}%`;
        if (loadingText) loadingText.textContent = message;
    }

    showInitializationError(error) {
        const loadingScreen = document.getElementById('loadingScreen');
        if (loadingScreen) {
            loadingScreen.innerHTML = `
                <div class="zhtp-logo">ZHTP</div>
                <div class="loading-text" style="color: #ff6b6b;">
                    Failed to initialize Web4 browser
                </div>
                <div style="margin-top: 1rem; font-size: 0.9rem; color: #8a9ba8;">
                    ${error.message}
                </div>
                <button class="btn-primary" style="margin-top: 2rem; width: auto; padding: 0.75rem 2rem;" 
                        onclick="location.reload()">
                    Retry Connection
                </button>
            `;
        }
    }

    updateIdentityIndicator() {
        // Update UI to show current identity
        const identityIndicator = document.querySelector('.identity-indicator');
        if (identityIndicator && this.currentIdentity) {
            identityIndicator.innerHTML = `
                <span class="identity-icon"></span>
                <span class="identity-text">
                    ${this.currentIdentity.displayName || 'Authenticated'}
                </span>
            `;
        }
    }

    initializeEventListeners() {
        // Address bar navigation
        const addressBar = document.getElementById('addressBar');
        if (addressBar) {
            addressBar.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.navigateToAddress(addressBar.value);
                }
            });
        }

        // Global key shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey || e.metaKey) {
                switch (e.key) {
                    case 'l':
                        e.preventDefault();
                        if (addressBar) {
                            addressBar.focus();
                            addressBar.select();
                        }
                        break;
                    case 'r':
                        e.preventDefault();
                        this.refreshPage();
                        break;
                    case 'i':
                        e.preventDefault();
                        this.openIdentityModal();
                        break;
                    case 'w':
                        e.preventDefault();
                        this.openWalletModal();
                        break;
                }
            }
        });

        // Modal close on outside click
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                this.closeModal(e.target.id);
            }
        });
    }

    async loadDashboard() {
        const pageContent = document.getElementById('pageContent');
        if (!pageContent) return;
        
        pageContent.innerHTML = `
            <div class="welcome-section fade-in">
                <h1 class="welcome-title">Welcome to Web4</h1>
                <p class="welcome-subtitle">
                    The quantum-resistant, zero-knowledge future of the internet
                </p>
                <div class="protocol-indicator" style="margin: 1rem 0; padding: 1rem; background: #f0f0f0; border-radius: 10px;">
                    <div class="protocol-status">
                        <span class="protocol-icon"></span>
                        <span class="protocol-text">Loading...</span>
                    </div>
                </div>
                ${!this.currentIdentity ? `
                    <button class="btn-primary" onclick="browser.openIdentityModal()" 
                            style="width: auto; padding: 1rem 3rem; margin: 1rem;">
                         Create Your ZK-DID Identity
                    </button>
                ` : `
                    <div class="status-success" style="display: inline-block; padding: 0.5rem 2rem;">
                         Authenticated as ${this.currentIdentity.displayName || 'Citizen'}
                    </div>
                `}
            </div>

            <div class="dashboard-grid fade-in">
                ${this.generateDashboardCards()}
            </div>
        `;
        
        // Update protocol status after loading
        setTimeout(() => this.updateProtocolStatus(), 500);
    }

    generateDashboardCards() {
        const cards = [
            {
                icon: '🌐',
                title: 'Social Network',
                description: 'Connect with friends on social.zhtp - fully decentralized social media with zero-knowledge privacy',
                action: () => this.navigateToAddress('social.zhtp'),
                enabled: true
            },
            {
                icon: '💬',
                title: 'Whisper Messaging',
                description: 'Send end-to-end encrypted messages with whisper.zhtp - quantum-resistant communication',
                action: () => this.navigateToAddress('whisper.zhtp'),
                enabled: true
            },
            {
                icon: '🛒',
                title: 'Marketplace',
                description: 'Buy and sell on marketplace.zhtp - peer-to-peer commerce with automatic escrow',
                action: () => this.navigateToAddress('marketplace.zhtp'),
                enabled: true
            },
            {
                icon: '🏛️',
                title: 'DAO Governance',
                description: 'Participate in ZHTP DAO decisions - one citizen, one vote with zero-knowledge voting',
                action: () => this.openDaoModal(),
                enabled: true
            },
            {
                icon: '💰',
                title: 'Quantum Wallet',
                description: `Your quantum-resistant wallet - ${this.currentIdentity ? 'manage your ZHTP tokens and UBI' : 'create identity to access'}`,
                action: () => this.openWalletModal(),
                enabled: !!this.currentIdentity
            },
            {
                icon: '',
                title: 'Identity Manager',
                description: 'Manage your ZK-DID identity, privacy settings, and verifiable credentials',
                action: () => this.openIdentityModal(),
                enabled: true
            },
            {
                icon: '📊',
                title: 'Network Stats',
                description: 'View ZHTP network statistics, node performance, and economic metrics',
                action: () => this.navigateToAddress('stats.zhtp'),
                enabled: true
            },
            {
                icon: '🛠️',
                title: 'Developer Tools',
                description: 'Build dApps on ZHTP - smart contracts, ZK proofs, and mesh networking APIs',
                action: () => this.navigateToAddress('dev.zhtp'),
                enabled: true
            }
        ];

        return cards.map(card => `
            <div class="dashboard-card ${!card.enabled ? 'disabled' : ''}" 
                 onclick="${card.enabled ? 'this.action = ' + card.action.toString() + '; this.action()' : 'browser.showRequiresIdentity()'}">
                <div class="card-icon">${card.icon}</div>
                <h3 class="card-title">${card.title}</h3>
                <p class="card-description">${card.description}</p>
                ${!card.enabled ? '<p style="color: #ff6b6b; margin-top: 1rem; font-size: 0.9rem;">⚠️ Requires ZK-DID Identity</p>' : ''}
            </div>
        `).join('');
    }

    showRequiresIdentity() {
        this.showStatusMessage('Please create a ZK-DID identity first to access this feature.', 'info');
    }

    async navigateToAddress(address) {
        console.log(`🌐 Navigating to: ${address} via ${this.useNativeProtocol ? 'Native ZHTP' : 'Legacy Bridge'}`);
        
        // Update address bar
        const addressBar = document.getElementById('addressBar');
        if (addressBar) addressBar.value = address;
        
        try {
            if (address === 'dashboard.zhtp' || address === '') {
                await this.loadDashboard();
                return;
            }

            // Load the appropriate page based on address using native ZHTP
            const pageContent = document.getElementById('pageContent');
            if (pageContent) {
                pageContent.innerHTML = '<div style="text-align: center; padding: 4rem; color: #8a9ba8;">Loading via ZHTP...</div>';
            }

            switch (address) {
                case 'social.zhtp':
                    await this.loadSocialNetwork();
                    break;
                case 'whisper.zhtp':
                    await this.loadWhisperMessaging();
                    break;
                case 'marketplace.zhtp':
                    await this.loadMarketplace();
                    break;
                case 'stats.zhtp':
                    await this.loadNetworkStats();
                    break;
                case 'dev.zhtp':
                    await this.loadDeveloperTools();
                    break;
                default:
                    // Try to resolve via ZDNS using native ZHTP
                    try {
                        const resolution = await this.api.resolveDomain(address);
                        console.log(' ZDNS Resolution:', resolution);
                        
                        if (resolution.contentHash) {
                            const content = await this.api.getContent(resolution.contentHash);
                            if (pageContent) {
                                pageContent.innerHTML = content;
                            }
                        } else {
                            this.showErrorPage('Domain Not Found', new Error(`Domain ${address} not found in ZDNS`));
                        }
                    } catch (error) {
                        this.showErrorPage('Navigation Error', error);
                    }
                    break;
            }
        } catch (error) {
            console.error('❌ Navigation failed:', error);
            this.showErrorPage('Navigation Error', error);
        }
    }

    async loadSocialNetwork() {
        if (!this.currentIdentity) {
            this.showRequiresIdentityPage('Social Network');
            return;
        }

        try {
            // Get real social network data via native ZHTP
            const socialData = await this.api.sendZhtpRequest('GET', 'zhtp://social/feed', {
                did: this.currentIdentity.did
            });
            
            const pageContent = document.getElementById('pageContent');
            if (pageContent) {
                pageContent.innerHTML = `
                    <div class="social-network">
                        <h2>🌐 ZHTP Social Network</h2>
                        <p>Zero-knowledge social media powered by ZHTP</p>
                        <div class="feed">
                            ${JSON.stringify(socialData, null, 2)}
                        </div>
                    </div>
                `;
            }
        } catch (error) {
            this.showErrorPage('Social Network Error', error);
        }
    }

    async loadWhisperMessaging() {
        if (!this.currentIdentity) {
            this.showRequiresIdentityPage('Whisper Messaging');
            return;
        }

        try {
            const messages = await this.api.sendZhtpRequest('GET', 'zhtp://whisper/messages', {
                did: this.currentIdentity.did
            });
            
            const pageContent = document.getElementById('pageContent');
            if (pageContent) {
                pageContent.innerHTML = `
                    <div class="whisper-messaging">
                        <h2>💬 Whisper Messaging</h2>
                        <p>Quantum-resistant private messaging</p>
                        <div class="messages">
                            ${JSON.stringify(messages, null, 2)}
                        </div>
                    </div>
                `;
            }
        } catch (error) {
            this.showErrorPage('Whisper Error', error);
        }
    }

    async loadMarketplace() {
        try {
            const marketplace = await this.api.sendZhtpRequest('GET', 'zhtp://marketplace/listings');
            
            const pageContent = document.getElementById('pageContent');
            if (pageContent) {
                pageContent.innerHTML = `
                    <div class="marketplace">
                        <h2>🛒 ZHTP Marketplace</h2>
                        <p>Decentralized commerce with automatic escrow</p>
                        <div class="listings">
                            ${JSON.stringify(marketplace, null, 2)}
                        </div>
                    </div>
                `;
            }
        } catch (error) {
            this.showErrorPage('Marketplace Error', error);
        }
    }

    async loadNetworkStats() {
        try {
            const stats = await this.api.getNetworkStats();
            
            const pageContent = document.getElementById('pageContent');
            if (pageContent) {
                pageContent.innerHTML = `
                    <div class="network-stats">
                        <h2>📊 ZHTP Network Statistics</h2>
                        <p>Real-time network performance via ${this.useNativeProtocol ? 'Native ZHTP' : 'Legacy Bridge'}</p>
                        <pre>${JSON.stringify(stats, null, 2)}</pre>
                    </div>
                `;
            }
        } catch (error) {
            this.showErrorPage('Network Stats Error', error);
        }
    }

    async loadDeveloperTools() {
        const pageContent = document.getElementById('pageContent');
        if (pageContent) {
            pageContent.innerHTML = `
                <div class="developer-tools">
                    <h2>ZHTP Developer Tools</h2>
                    <p>Build the decentralized future with ZHTP</p>
                    <div class="tools-grid">
                        <div class="tool-card">
                            <h3>Smart Contracts</h3>
                            <p>Deploy ZK-enhanced smart contracts</p>
                        </div>
                        <div class="tool-card">
                            <h3> ZK Circuits</h3>
                            <p>Create custom zero-knowledge proofs</p>
                        </div>
                        <div class="tool-card">
                            <h3>🌐 Mesh APIs</h3>
                            <p>Integrate with ZHTP mesh network</p>
                        </div>
                    </div>
                </div>
            `;
        }
    }

    showRequiresIdentityPage(feature) {
        const pageContent = document.getElementById('pageContent');
        if (pageContent) {
            pageContent.innerHTML = `
                <div class="requires-identity">
                    <h2> Identity Required</h2>
                    <p>Please create a ZK-DID identity to access ${feature}</p>
                    <button class="btn-primary" onclick="browser.openIdentityModal()">
                        Create Identity
                    </button>
                </div>
            `;
        }
    }

    showErrorPage(title, error) {
        const pageContent = document.getElementById('pageContent');
        if (pageContent) {
            pageContent.innerHTML = `
                <div class="error-page">
                    <h2>❌ ${title}</h2>
                    <p>${error.message}</p>
                    <button class="btn-primary" onclick="browser.loadDashboard()">
                        Return to Dashboard
                    </button>
                </div>
            `;
        }
    }

    // Placeholder methods for modal functionality
    openIdentityModal() {
        console.log(' Opening identity modal...');
        // Implement modal opening logic
    }

    openWalletModal() {
        console.log('💰 Opening wallet modal...');
        // Implement modal opening logic
    }

    openDaoModal() {
        console.log('🏛️ Opening DAO modal...');
        // Implement modal opening logic
    }

    closeModal(modalId) {
        console.log(`❌ Closing modal: ${modalId}`);
        // Implement modal closing logic
    }

    refreshPage() {
        console.log(' Refreshing page...');
        // Implement page refresh logic
    }

    showStatusMessage(message, type = 'info') {
        console.log(`📢 ${type.toUpperCase()}: ${message}`);
        // Implement status message display
    }
}

// Create global browser instance
window.browser = new Web4Browser();

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.browser.initialize();
});

export default Web4Browser;
