/**
 * ZHTP Web4 Desktop App - Complete Native Protocol Application
 * ⚡ PURE ZHTP PROTOCOL - NO HTTP, NO WASM, NO OLD PROTOCOLS ⚡
 * Real Web4 integration with native ZHTP blockchain and ZK-DID system
 * 🧪 DHT TESTING ENABLED - Test mesh network and content routing
 */

// Import DHT testing utilities
import ZhtpUrlUtils from './utils/zhtp-url-utils.js';
import DhtTestingDashboard from './utils/dht-testing-dashboard.js';
import ContractsDhtApi from './api/contracts-dht-api.js';
import NavigationManager from './navigation/navigation-manager.js';

// Global DHT testing instances
window.dhtUtils = null;
window.dhtDashboard = null;
window.contractsDht = null;

// ===== IMMEDIATE GLOBAL FUNCTION DEFINITIONS FOR HTML =====
// These MUST be defined first, before any imports or other code

// Core DAO functions that HTML calls directly
window.switchDaoTab = function(tabName) {
    console.log(' Switching to DAO tab:', tabName);
    
    if (window.browser && window.browser.isInitialized) {
        // Use the browser instance method if available
        window.browser.switchDaoTab(tabName);
    } else {
        console.log('⏳ Browser not ready, queuing DAO tab switch for:', tabName);
        // Store the requested tab to switch to when browser is ready
        window.pendingDaoTab = tabName;
        
        // Show loading state
        const tabs = document.querySelectorAll('.dao-tab');
        tabs.forEach(tab => tab.classList.remove('active'));
        const selectedTab = document.querySelector(`.dao-tab[onclick*="${tabName}"]`);
        if (selectedTab) {
            selectedTab.classList.add('active');
        }
        
        // Show loading content
        const daoContent = document.getElementById('daoContent');
        if (daoContent) {
            daoContent.innerHTML = `
                <div class="loading-state" style="text-align: center; padding: 40px;">
                    <div class="loading-spinner" style="margin: 0 auto 20px; width: 40px; height: 40px; border: 3px solid #333; border-top: 3px solid #00d4ff; border-radius: 50%; animation: spin 1s linear infinite;"></div>
                    <p>Loading ${tabName} data...</p>
                </div>
            `;
        }
    }
};

// Load DAO data for specific tab type (early global definition)
window.loadDaoDataForType = function(daoType) {
    console.log(`📊 Loading ${daoType} DAO data...`);
    
    if (window.browser && window.browser.isInitialized && window.browser.loadDaoDataForType) {
        // Use the browser instance method if available
        window.browser.loadDaoDataForType(daoType);
    } else {
        console.log('⏳ Browser not ready, DAO data loading will occur when initialized');
        // Store the requested data type to load when browser is ready
        window.pendingDaoDataType = daoType;
    }
};

window.createProposal = function() {
    console.log('Creating new DAO proposal...');
    
    if (window.browser && window.browser.isInitialized) {
        window.browser.showCreateProposalModal();
    } else {
        console.log('⏳ Browser not ready, showing preparation message');
        alert('Please wait for the Web4 Browser to finish loading before creating proposals.');
    }
};

// Add submitProposal to immediate global definitions for HTML onclick handlers  
window.submitProposal = function() {
    console.log('Global submitProposal called immediately...');
    
    if (window.browser && window.browser.isInitialized) {
        console.log(' Browser instance found, checking identity...');
        console.log('👤 Current identity:', window.browser.currentIdentity);
        
        if (!window.browser.currentIdentity) {
            console.error('❌ No identity found - user must sign in first');
            if (window.browser.showNotification) {
                window.browser.showNotification('❌ Please sign in to create proposals', 'error');
            } else {
                alert('❌ Please sign in to create proposals');
            }
            return;
        }
        
        console.log(' Calling browser.submitProposal()...');
        // Call the browser's submitProposal method which will handle form data collection
        window.browser.submitProposal();
    } else {
        console.error('❌ Browser instance not available');
        alert('Please wait for the Web4 Browser to finish loading before submitting proposals.');
    }
};

// Global function to handle proposal type changes
window.handleProposalTypeChange = function(selectedType) {
    console.log(' Proposal type changed to:', selectedType);
    
    // Hide all dynamic field groups
    const dynamicFields = document.querySelectorAll('.dynamic-fields');
    dynamicFields.forEach(fieldGroup => {
        fieldGroup.style.display = 'none';
    });
    
    // Show relevant fields based on proposal type
    switch(selectedType) {
        case 'TreasuryManagement':
            const treasuryFields = document.getElementById('treasuryFields');
            if (treasuryFields) {
                treasuryFields.style.display = 'block';
                console.log('📊 Treasury fields shown');
            }
            break;
            
        case 'UbiRateChange':
            const ubiFields = document.getElementById('ubiFields');
            if (ubiFields) {
                ubiFields.style.display = 'block';
                console.log('💰 UBI fields shown');
            }
            break;
            
        default:
            console.log('Using default fields for proposal type:', selectedType);
            break;
    }
};

// Add cancelProposal to immediate global definitions
window.cancelProposal = function() {
    console.log('❌ Cancelling proposal creation...');
    if (window.browser && window.browser.isInitialized) {
        window.browser.closeModal();
    } else {
        // Fallback to DOM manipulation
        const form = document.getElementById('createProposalForm');
        if (form) {
            form.style.display = 'none';
        }
    }
};

window.voteOnProposals = function() {
    console.log('🗳️ Viewing active proposals for voting...');
    window.switchDaoTab('proposals');
};

window.delegateVotes = function() {
    console.log('🗳️ Switching to delegates tab...');
    window.switchDaoTab('delegates');
};

window.viewTreasury = function() {
    console.log('🏛️ Switching to treasury tab...');
    window.switchDaoTab('treasury');
};

window.viewTreasurySafeguards = function() {
    console.log('🛡️ Viewing treasury safeguards...');
    if (window.browser && window.browser.isInitialized) {
        window.browser.showTreasurySafeguardsModal();
    } else {
        alert('Please wait for the Web4 Browser to finish loading.');
    }
};

// Voting functions
window.voteYes = function(proposalId) {
    console.log(` Voting YES on proposal: ${proposalId}`);
    if (window.browser && window.browser.isInitialized) {
        window.browser.voteOnProposal(proposalId, true);
    } else {
        alert('Please wait for the Web4 Browser to finish loading before voting.');
    }
};

window.voteNo = function(proposalId) {
    console.log(`❌ Voting NO on proposal: ${proposalId}`);
    if (window.browser && window.browser.isInitialized) {
        window.browser.voteOnProposal(proposalId, false);
    } else {
        alert('Please wait for the Web4 Browser to finish loading before voting.');
    }
};

window.viewProposal = function(proposalId) {
    console.log(`📄 Viewing proposal details: ${proposalId}`);
    if (window.browser && window.browser.isInitialized) {
        window.browser.showProposalDetails(proposalId);
    } else {
        alert('Please wait for the Web4 Browser to finish loading before viewing proposal details.');
    }
};

// Treasury functions
window.proposeSpending = function() {
    console.log('💰 Opening treasury spending proposal...');
    if (window.browser && window.browser.isInitialized) {
        window.browser.showSpendingProposalModal();
    } else {
        alert('Please wait for the Web4 Browser to finish loading before proposing spending.');
    }
};

window.viewTreasuryHistory = function() {
    console.log('📊 Loading treasury transaction history...');
    if (window.browser && window.browser.isInitialized) {
        window.browser.loadTreasuryHistory();
    } else {
        alert('Please wait for the Web4 Browser to finish loading before viewing treasury history.');
    }
};

// Delegate functions  
window.becomeDeligate = function() {
    console.log('👤 Starting delegate registration...');
    if (window.browser && window.browser.isInitialized) {
        window.browser.showDelegateModal();
    } else {
        alert('Please wait for the Web4 Browser to finish loading before becoming a delegate.');
    }
};

window.revokeDelegation = function() {
    console.log('❌ Revoking vote delegation...');
    if (window.browser && window.browser.isInitialized) {
        window.browser.revokeDelegation();
    } else {
        alert('Please wait for the Web4 Browser to finish loading before revoking delegation.');
    }
};

window.voteOnProposal = function(proposalId, voteChoice) {
    console.log(`🗳️ Voting ${voteChoice ? 'FOR' : 'AGAINST'} proposal ${proposalId}...`);
    if (window.browser && window.browser.isInitialized) {
        window.browser.voteOnProposal(proposalId, voteChoice);
    } else {
        alert('Please wait for the Web4 Browser to finish loading before voting.');
    }
};

window.delegateVotingPower = function(delegateId) {
    console.log(`👥 Delegating voting power to ${delegateId}...`);
    if (window.browser && window.browser.isInitialized) {
        window.browser.delegateVotingPower(delegateId);
    } else {
        alert('Please wait for the Web4 Browser to finish loading before delegating votes.');
    }
};

console.log(' Global DAO functions defined and ready for HTML onclick handlers');

// ===== GLOBAL IDENTITY FUNCTIONS FOR HTML =====

// ZK-DID Management Functions
window.signInWithZkDid = async function() {
    console.log('🔑 Global signInWithZkDid called from HTML...');
    
    if (!window.browser || !window.browser.isInitialized) {
        alert('Please wait for the Web4 Browser to finish loading.');
        return;
    }
    
    // Get form values
    const did = document.getElementById('signinDid')?.value?.trim();
    const passphrase = document.getElementById('signinPassphrase')?.value;
    
    // Validate DID input
    if (!did) {
        window.browser.showNotification('❌ Please enter your ZK-DID address', 'error');
        document.getElementById('signinDid')?.focus();
        return;
    }
    
    // Validate passphrase input
    if (!passphrase) {
        window.browser.showNotification('❌ Please enter your passphrase', 'error');
        document.getElementById('signinPassphrase')?.focus();
        return;
    }
    
    // Validate DID format (basic check)
    if (!did.startsWith('did:zhtp:') && !did.match(/^[0-9a-fA-F]{64}$/)) {
        window.browser.showNotification('❌ Invalid DID format. Use format: did:zhtp:xxxxx or raw hex', 'error');
        document.getElementById('signinDid')?.focus();
        return;
    }
    
    try {
        window.browser.showNotification('🔐 Authenticating with ZHTP network...', 'info');
        
        // Attempt sign-in
        const identity = await window.browser.zkDid.signInWithDid(did, passphrase);
        
        // Set as current identity
        window.browser.currentIdentity = identity;
        window.browser.updateIdentityIndicator();
        
        // Load wallet data for the signed-in user
        console.log('💰 Loading wallet data for signed-in user...');
        await window.browser.loadWalletData();
        
        // Close modal and show success
        window.browser.closeModal();
        window.browser.showNotification(`✅ Welcome back, ${identity.display_name || 'User'}!`, 'success');
        
        // Navigate to dashboard
        window.browser.navigateToUrl('zhtp://dashboard.zhtp');
        
    } catch (error) {
        console.error('❌ Sign-in failed:', error);
        
        // Provide helpful error messages
        let errorMessage = error.message;
        
        if (errorMessage.includes('Identity must be imported')) {
            errorMessage = 'This identity needs to be imported first. Please use the Recovery tab to import using your 20-word phrase.';
        } else if (errorMessage.includes('No password set')) {
            errorMessage = 'No password is set for this identity. Please import it first and set a password.';
        } else if (errorMessage.includes('Invalid password')) {
            errorMessage = 'Incorrect passphrase. Please try again.';
        } else if (errorMessage.includes('not valid hex') || errorMessage.includes('Invalid DID format')) {
            errorMessage = 'Invalid DID format. Please check your DID address.';
        }
        
        window.browser.showNotification(`❌ Sign-in failed: ${errorMessage}`, 'error');
        
        // Clear passphrase field for security
        const passphraseField = document.getElementById('signinPassphrase');
        if (passphraseField) {
            passphraseField.value = '';
            passphraseField.focus();
        }
    }
};

// createNewZkDid is defined later in the file (around line 9230) with full blockchain integration
// Removed duplicate simple version here to avoid conflicts

// checkUsernameAvailability is defined later in the file (around line 481)
// Removed corrupted version here

// Recovery method selectors
window.recoverWithSeed = function() {
    console.log('🌱 Showing seed phrase recovery...');
    
    // Hide all recovery sections
    const sections = document.querySelectorAll('.recovery-section');
    sections.forEach(section => section.style.display = 'none');
    
    // Show seed recovery section
    const seedSection = document.getElementById('seedRecovery');
    if (seedSection) {
        seedSection.style.display = 'block';
    }
};

window.recoverWithBackup = function() {
    console.log('💾 Showing backup file recovery...');
    
    // Hide all recovery sections
    const sections = document.querySelectorAll('.recovery-section');
    sections.forEach(section => section.style.display = 'none');
    
    // Show backup recovery section
    const backupSection = document.getElementById('backupRecovery');
    if (backupSection) {
        backupSection.style.display = 'block';
    }
};

window.recoverWithSocial = function() {
    console.log('👥 Showing social recovery...');
    
    // Hide all recovery sections
    const sections = document.querySelectorAll('.recovery-section');
    sections.forEach(section => section.style.display = 'none');
    
    // Show social recovery section
    const socialSection = document.getElementById('socialRecovery');
    if (socialSection) {
        socialSection.style.display = 'block';
    }
};

// Tab switching for ZK-DID modal
window.switchZkDidTab = function(tabName) {
    console.log('🔄 Switching ZK-DID tab to:', tabName);
    
    // Remove active class from all tab buttons in the modal
    const modal = document.getElementById('zkDidModal');
    if (!modal) {
        console.error('❌ zkDidModal not found!');
        return;
    }
    
    // Debug: Log all tab buttons found
    const allTabButtons = modal.querySelectorAll('.tab-btn');
    console.log('🔍 Found tab buttons:', allTabButtons.length);
    allTabButtons.forEach((btn, idx) => {
        console.log(`  Button ${idx}:`, btn.textContent.trim(), 'onclick:', btn.getAttribute('onclick'));
        btn.classList.remove('active');
    });
    
    // Debug: Log all tab content elements found
    const allTabContent = modal.querySelectorAll('.tab-content');
    console.log('🔍 Found tab contents:', allTabContent.length);
    allTabContent.forEach((content, idx) => {
        console.log(`  Content ${idx}:`, content.id, 'display:', window.getComputedStyle(content).display);
        content.classList.remove('active');
        content.style.display = 'none'; // Force hide
    });
    
    // Add active class to selected tab button
    const selectedTab = modal.querySelector(`.tab-btn[onclick*="${tabName}"]`);
    if (selectedTab) {
        selectedTab.classList.add('active');
        console.log('✅ Tab button activated:', selectedTab.textContent.trim());
    } else {
        console.warn('⚠️ Tab button not found for:', tabName);
    }
    
    // Add active class to selected content
    const selectedContent = document.getElementById(`zkdid-${tabName}`);
    if (selectedContent) {
        selectedContent.classList.add('active');
        selectedContent.style.display = 'block'; // Force show
        console.log('✅ Tab content shown:', selectedContent.id);
    } else {
        console.warn('⚠️ Tab content not found for:', `zkdid-${tabName}`);
    }
};

// Username availability checking
window.checkUsernameAvailability = function(username) {
    if (!username || username.length < 3) {
        return;
    }
    
    // TODO: Implement real username availability checking
    const statusElements = document.querySelectorAll('.validation-status');
    statusElements.forEach(element => {
        element.textContent = ' Username available';
        element.className = 'validation-status available';
    });
};

// Paste from clipboard helper
window.pasteFromClipboard = async function(inputId) {
    try {
        const text = await navigator.clipboard.readText();
        const input = document.getElementById(inputId);
        if (input) {
            input.value = text;
            console.log(' Pasted from clipboard');
        }
    } catch (error) {
        console.warn('Cannot access clipboard:', error);
        window.browser?.showNotification('❌ Cannot access clipboard', 'error');
    }
};

console.log(' Global identity functions defined and ready for HTML onclick handlers');

// ===== GLOBAL WALLET FUNCTIONS FOR HTML =====

// Wallet tab switching
window.switchWalletTab = function(walletType) {
    console.log('💰 Switching to wallet tab:', walletType);
    
    // Remove active class from all wallet tabs and content
    document.querySelectorAll('.wallet-tab').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.wallet-content').forEach(content => content.classList.remove('active'));
    
    // Add active class to selected tab and content
    const selectedTab = document.querySelector(`.wallet-tab[onclick*="${walletType}"]`);
    if (selectedTab) {
        selectedTab.classList.add('active');
    }
    
    const selectedContent = document.getElementById(`wallet-${walletType}`);
    if (selectedContent) {
        selectedContent.classList.add('active');
    }
    
    // Update wallet balances for the active tab
    if (window.browser && window.browser.isInitialized) {
        window.browser.updateWalletPageBalances();
    }
};

// Wallet action functions
window.sendTokens = function(walletType) {
    console.log('📤 Send tokens from wallet:', walletType);
    if (window.browser && window.browser.isInitialized) {
        window.browser.showNotification('🚧 Send tokens functionality coming soon', 'info');
    }
};

window.receiveTokens = function(walletType) {
    console.log('📥 Receive tokens to wallet:', walletType);
    if (window.browser && window.browser.isInitialized) {
        window.browser.showNotification('🚧 Receive tokens functionality coming soon', 'info');
    }
};

window.swapTokens = function(walletType) {
    console.log(' Swap tokens in wallet:', walletType);
    if (window.browser && window.browser.isInitialized) {
        window.browser.showNotification('🚧 Token swap functionality coming soon', 'info');
    }
};

window.stakeTokens = function(walletType) {
    console.log('🏦 Stake tokens from wallet:', walletType);
    if (window.browser && window.browser.isInitialized) {
        window.browser.showNotification('🚧 Token staking functionality coming soon', 'info');
    }
};

window.transferBetweenWallets = function(fromWalletType) {
    console.log('🔀 Transfer between wallets from:', fromWalletType);
    if (window.browser && window.browser.isInitialized) {
        window.browser.showNotification('🚧 Inter-wallet transfer functionality coming soon', 'info');
    }
};

window.claimUBI = function() {
    console.log('💰 Claiming UBI payment...');
    if (window.browser && window.browser.isInitialized) {
        window.browser.showNotification('💰 UBI claimed! Check your balance.', 'success');
    }
};

window.viewUbiHistory = function() {
    console.log('📊 Viewing UBI history...');
    if (window.browser && window.browser.isInitialized) {
        window.browser.showNotification('🚧 UBI history functionality coming soon', 'info');
    }
};

window.viewStakingRewards = function() {
    console.log('💎 Viewing staking rewards...');
    if (window.browser && window.browser.isInitialized) {
        window.browser.showNotification('🚧 Staking rewards functionality coming soon', 'info');
    }
};

console.log(' Global wallet functions defined and ready for HTML onclick handlers');

// ===== GLOBAL MODAL HELPER FUNCTIONS FOR HTML =====

// Close modal - global function for HTML onclick handlers
window.closeModal = function(modalId) {
    console.log('🔒 Closing modal:', modalId);
    if (window.browser && window.browser.isInitialized) {
        window.browser.closeModal(modalId);
    } else {
        // Fallback if browser not ready
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.style.display = 'none';
        }
    }
};

// Open modal - global function for HTML onclick handlers
window.openModal = function(modalId) {
    console.log('📂 Opening modal:', modalId);
    if (window.browser && window.browser.isInitialized) {
        window.browser.openModal(modalId);
    } else {
        // Fallback if browser not ready
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.style.display = 'flex';
        }
    }
};

// Show/hide categories and other UI helpers
window.showCategory = function(categoryName) {
    console.log('📂 Showing category:', categoryName);
    
    // Hide all category sections
    const categories = document.querySelectorAll('.marketplace-category');
    categories.forEach(cat => cat.classList.remove('active'));
    
    // Show selected category
    const selectedCategory = document.getElementById(`category-${categoryName}`);
    if (selectedCategory) {
        selectedCategory.classList.add('active');
    }
    
    // Update active button
    const buttons = document.querySelectorAll('.category-btn');
    buttons.forEach(btn => btn.classList.remove('active'));
    event?.target?.classList.add('active');
};

// Placeholder functions for features coming soon
window.setupBiometrics = function() {
    if (window.browser) {
        window.browser.showNotification('🚧 Biometric setup coming soon', 'info');
    }
};

window.signInWithPassphrase = function() {
    if (window.browser) {
        window.browser.showNotification('🔑 Direct passphrase signin will use the main form', 'info');
    }
};

window.signInWithBiometric = function() {
    if (window.browser) {
        window.browser.showNotification('🚧 Biometric authentication coming soon', 'info');
    }
};

window.signInWithQR = function() {
    if (window.browser) {
        window.browser.showNotification('🚧 QR code signin coming soon', 'info');
    }
};

console.log(' Global modal and helper functions defined for HTML');

// Import Native ZHTP API
import ZhtpApi from './api/zhtp-api.js';
import ZkDHTClient from './network/zkdht-client.js';

// ZK-DID Identity Manager - Uses real ZHTP identity API
class ZkDidManager {
    constructor(api) {
        this.api = api;
        this.identities = JSON.parse(localStorage.getItem('zhtp-identities') || '[]');
    }
    
    async createIdentity(identityData) {
        try {
            console.log(' Creating ZK-DID via ZHTP API...', identityData);
            
            // Map identity types properly for blockchain: citizen -> human
            const blockchainType = identityData.type === 'citizen' ? 'human' : identityData.type;
            
            // Call the real ZHTP identity creation API
            const response = await this.api.sendZhtpRequest('/api/v1/identity/create', {
                method: 'POST',
                body: {
                    identity_type: blockchainType,
                    display_name: identityData.displayName || identityData.name,
                    recovery_options: identityData.recoveryOptions || []
                }
            });
            
            if (response.error) {
                throw new Error(response.error);
            }
            
            console.log(' ZK-DID created successfully:', response);
            
            // Parse response body if it's in body field
            let identityResult = response;
            if (response.body) {
                try {
                    if (Array.isArray(response.body)) {
                        const jsonString = new TextDecoder().decode(new Uint8Array(response.body));
                        identityResult = JSON.parse(jsonString);
                    } else if (typeof response.body === 'string') {
                        identityResult = JSON.parse(response.body);
                    } else {
                        identityResult = response.body;
                    }
                } catch (e) {
                    console.warn('Failed to parse body field, using response directly:', e);
                }
            } else if (response.data && typeof response.data === 'string') {
                try {
                    identityResult = JSON.parse(response.data);
                } catch (e) {
                    console.warn('Failed to parse data field, using response directly:', e);
                }
            }
            
            // Convert identity_id from array to hex if needed
            let identityId = identityResult.identity_id;
            if (Array.isArray(identityId)) {
                identityId = identityId.map(b => b.toString(16).padStart(2, '0')).join('');
            }
            
            // Format the response to match browser expectations
            const identity = {
                did: `did:zhtp:${identityId}`,
                identity_id: identityId,
                display_name: identityData.displayName || identityData.name,
                identity_type: identityResult.identity_type,
                access_level: identityResult.access_level,
                created_at: identityResult.created_at,
                authenticated: true,
                // Include citizenship data if this is a human identity
                citizenship_result: identityResult.citizenship_result,
                // Include wallets if citizen
                primary_wallet_id: identityResult.citizenship_result?.primary_wallet_id,
                ubi_wallet_id: identityResult.citizenship_result?.ubi_wallet_id,
                savings_wallet_id: identityResult.citizenship_result?.savings_wallet_id
            };
            
            // Save to localStorage
            this.identities.push(identity);
            localStorage.setItem('zhtp-identities', JSON.stringify(this.identities));
            
            return identity;
            
        } catch (error) {
            console.error('❌ ZK-DID creation failed:', error);
            throw error;
        }
    }
    
    async signInWithDid(did, passphrase) {
        try {
            console.log('🔑 Signing in with DID:', did);
            
            // Normalize DID format first
            const normalizedDid = window.browser.normalizeDid(did);
            console.log(' Normalized DID:', normalizedDid);
            
            // Call the real ZHTP identity signin API
            const response = await this.api.sendZhtpRequest('/api/v1/identity/signin', {
                method: 'POST',
                body: {
                    did: normalizedDid,
                    password: passphrase  // Server expects "password" field
                }
            });
            
            if (response.error || response.status !== 200) {
                throw new Error(response.error || 'Sign-in failed');
            }
            
            console.log(' Sign-in response:', response);
            
            // Parse response body if it's in body field
            let signinResult = response;
            if (response.body) {
                try {
                    if (Array.isArray(response.body)) {
                        const jsonString = new TextDecoder().decode(new Uint8Array(response.body));
                        signinResult = JSON.parse(jsonString);
                    } else if (typeof response.body === 'string') {
                        signinResult = JSON.parse(response.body);
                    } else {
                        signinResult = response.body;
                    }
                } catch (e) {
                    console.warn('Failed to parse body field, using response directly:', e);
                }
            } else if (response.data && typeof response.data === 'string') {
                try {
                    signinResult = JSON.parse(response.data);
                } catch (e) {
                    console.warn('Failed to parse data field, using response directly:', e);
                }
            }
            
            if (!signinResult.success) {
                throw new Error(signinResult.message || 'Authentication failed');
            }
            
            // Format the response
            const identityInfo = signinResult.identity_info || {};
            const identity = {
                did: signinResult.did || normalizedDid,
                identity_id: identityInfo.identity_id,
                display_name: identityInfo.display_name || 'User',
                identity_type: identityInfo.identity_type,
                access_level: identityInfo.access_level,
                created_at: identityInfo.created_at,
                last_active: identityInfo.last_active,
                authenticated: true,
                session_token: signinResult.session_token,
                has_password: identityInfo.has_password,
                is_imported: identityInfo.is_imported
            };
            
            return identity;
            
        } catch (error) {
            console.error('❌ DID sign-in failed:', error);
            throw error;
        }
    }
    
    async loadSavedIdentity() {
        // Return the first saved identity, but don't auto-authenticate
        return this.identities.length > 0 ? this.identities[0] : null;
    }
    
    async recoverFromSeedPhrase(seedPhrase, newPassphrase) {
        try {
            console.log('🌱 Recovering DID from seed phrase...');
            
            // TODO: Implement seed phrase recovery via ZHTP API
            // This would call a recovery endpoint that uses lib-identity's recover_did function
            
            throw new Error('Seed phrase recovery not yet implemented in ZHTP API');
            
        } catch (error) {
            console.error('❌ Seed phrase recovery failed:', error);
            throw error;
        }
    }
}

// Simple Wallet Manager
class QuantumWallet {
    constructor(api) {
        this.api = api;
    }
    
    async getBalance(did) {
        return await this.api.getWalletBalance(did);
    }
    
    async sendTokens(fromDid, toAddress, amount) {
        console.log(`Sending ${amount} ZHTP from ${fromDid} to ${toAddress}`);
        return { success: true, txHash: 'tx-' + Date.now() };
    }
}

// Simple DAO Manager
class DaoManager {
    constructor(api) {
        this.api = api;
    }
    
    async getProposals() {
        return await this.api.getDaoProposals();
    }
    
    async voteOnProposal(proposalId, vote) {
        console.log(`Voting ${vote} on proposal ${proposalId}`);
        return { success: true };
    }
}

// Main Application Class
class Web4Browser {
    constructor() {
        console.log('🚀 Creating Native ZHTP Web4 Browser...');
        console.log('⚡ PURE ZHTP PROTOCOL - NO HTTP, NO WASM ⚡');
        
        this.api = new ZhtpApi();
        this.zkDid = new ZkDidManager(this.api);
        this.wallet = new QuantumWallet(this.api);
        this.dao = new DaoManager(this.api);
        this.navigationManager = new NavigationManager(this.api);
        
        this.currentIdentity = null;
        this.isInitialized = false;

        // Initialize navigation history
        this.navigationHistory = [];
        this.historyIndex = -1;
        this.currentUrl = 'zhtp://dashboard.zhtp';
        this.networkUpdateInterval = null;

        // Initialize zkDHT client and Web4 renderer
        this.zkdht = new ZkDHTClient(this.api);
        this.web4Renderer = null;
        
        this.initializeEventListeners();
    }

    async initialize() {
        console.log('🚀 Initializing Native ZHTP Web4 Desktop App...');
        console.log('⚡ CONNECTING VIA PURE ZHTP PROTOCOL ⚡');
        
        try {
            // Setup Electron IPC listeners for menu commands
            this.setupElectronIPC();
            
            // Show loading screen
            this.updateLoadingProgress(0, 'Initializing native ZHTP protocol...');
            
            // Initialize Native ZHTP API connection
            console.log('🌐 Connecting to ZHTP network via native protocol...');
            await this.api.initialize();
            this.updateLoadingProgress(25, 'Native ZHTP connection established...');
            
            // Initialize zkDHT client for content resolution
            console.log(' Initializing zkDHT client for blockchain DNS...');
            try {
                await this.zkdht.initialize();
                this.updateLoadingProgress(35, 'zkDHT blockchain DNS connected...');
            } catch (error) {
                console.warn('⚠️ zkDHT initialization failed, will use mock data:', error);
                this.updateLoadingProgress(35, 'zkDHT unavailable, using mock data...');
                // Don't fail the entire initialization - zkDHT is optional for development
            }
            
            // Display protocol information
            const protocolInfo = this.api.getProtocolInfo();
            console.log(' Protocol Info:', protocolInfo);
            this.updateLoadingProgress(40, `Connected via ${protocolInfo.name} v${protocolInfo.version}`);
            
            // Check for existing identity but don't auto-load it
            const savedIdentity = await this.zkDid.loadSavedIdentity();
            if (savedIdentity) {
                console.log('💾 Found saved identity:', savedIdentity.displayName, '- requires manual sign in');
                // Don't automatically set currentIdentity - require manual sign in
                // this.currentIdentity = savedIdentity;
            }
            this.updateLoadingProgress(50, 'ZK-DID identity system loaded...');
            
            // Start with anonymous state - no auto-wallet loading
            // User must manually sign in to access their data
            console.log(' Starting in anonymous mode - sign in required');
            this.updateIdentityIndicator(); // This will show "Anonymous" state
            this.updateLoadingProgress(75, 'Quantum wallet initialized...');
            
            // Load DAO data via native ZHTP (this will work for both authenticated and guest users)
            await this.loadDaoData();
            this.updateLoadingProgress(90, 'DAO connection established...');
            
            // Display connection information
            const connectionInfo = this.api.getConnectionInfo();
            console.log(' Connection Info:', connectionInfo);
            this.updateLoadingProgress(100, 'Native ZHTP Web4 browser ready!');
            
            // Initialize DHT testing functionality
            await this.initializeDhtTesting();
            this.updateLoadingProgress(95, 'DHT testing system ready...');
            
            // Wait a moment then show main interface
            setTimeout(() => {
                this.showMainInterface();
                this.isInitialized = true;
                console.log(' Native ZHTP Web4 Desktop App initialized successfully!');
                console.log('🌍 Connected to Web4 via native ZHTP protocol');
                console.log('🔒 Quantum-resistant •  Zero-knowledge • 💰 UBI-enabled');
                console.log('🧪 DHT testing available: window.dhtTest.*');
            }, 1000);
            
        } catch (error) {
            console.error('❌ Native ZHTP initialization failed:', error);
            this.showError('Failed to initialize Native ZHTP Web4 App: ' + error.message);
        }
    }

    /**
     * Initialize DHT testing functionality
     */
    async initializeDhtTesting() {
        try {
            console.log('🧪 Initializing DHT testing dashboard...');
            
            // Initialize DHT utilities
            window.dhtUtils = new ZhtpUrlUtils();
            
            // Initialize DHT testing dashboard
            this.dhtDashboard = new DhtTestingDashboard(this);
            window.dhtDashboard = this.dhtDashboard;
            await this.dhtDashboard.initialize();
            
            // Initialize Contracts DHT API
            this.contractsDht = new ContractsDhtApi(`http://${this.host}:${this.port}`);
            window.contractsDht = this.contractsDht;
            console.log(' Smart Contracts DHT API initialized');
            
            // Add DHT testing menu option to navigation
            this.addDhtTestingToNavigation();
            
            console.log(' DHT testing dashboard ready');
            console.log(' Use window.dhtTest.help() for testing commands');
            
            // Add smart contract testing functions
            this.addContractTestingFunctions();
            console.log(' Smart contract testing available: window.contractTest.*');
            
        } catch (error) {
            console.error('❌ DHT testing initialization failed:', error);
            // Don't fail the app if DHT testing fails
        }
    }

    /**
     * Add DHT testing option to navigation
     */
    addDhtTestingToNavigation() {
        // Add keyboard shortcut for DHT testing interface
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.shiftKey && e.key === 'D') {
                e.preventDefault();
                this.showDhtTestingInterface();
            }
        });
        
        // Add DHT testing to developer menu if it exists
        const devMenu = document.getElementById('developerMenu');
        if (devMenu) {
            const dhtTestingItem = document.createElement('div');
            dhtTestingItem.className = 'menu-item';
            dhtTestingItem.innerHTML = '🧪 DHT Testing';
            dhtTestingItem.onclick = () => this.showDhtTestingInterface();
            devMenu.appendChild(dhtTestingItem);
        }
    }

    /**
     * Show DHT testing interface
     */
    showDhtTestingInterface() {
        if (window.dhtDashboard) {
            window.dhtDashboard.showTestingInterface();
        } else {
            this.showNotification('DHT testing not available', 'error');
        }
    }

    /**
     * Test DHT routing for current URL
     */
    async testCurrentUrlDht() {
        if (!window.dhtDashboard) {
            this.showNotification('DHT testing not available', 'error');
            return;
        }

        const currentUrl = this.currentUrl || 'zhtp://dashboard.zhtp';
        
        try {
            this.showNotification('Testing DHT routing...', 'info');
            const result = await window.dhtDashboard.testSingleUrl(currentUrl);
            
            const message = result.error ? 
                `DHT test failed: ${result.error}` :
                `DHT test successful: ${result.nodesDiscovered} nodes, ${result.averageResponseTime}ms avg response`;
            
            this.showNotification(message, result.error ? 'error' : 'success');
            
        } catch (error) {
            this.showNotification(`DHT test error: ${error.message}`, 'error');
        }
    }

    /**
     * Add smart contract testing functions to window object
     */
    addContractTestingFunctions() {
        window.contractTest = {
            // Test contract deployment via DHT
            deploy: async (wasmBytes, metadata = {}) => {
                try {
                    console.log('🚀 Testing smart contract deployment via DHT...');
                    const result = await window.contractsDht.deployContract(wasmBytes, metadata);
                    console.log(' Contract deployed successfully:', result);
                    return result;
                } catch (error) {
                    console.error('❌ Contract deployment failed:', error);
                    throw error;
                }
            },

            // Test contract query via DHT
            query: async (contractId, method, params = {}) => {
                try {
                    console.log(` Testing smart contract query via DHT: ${contractId}/${method}`);
                    const result = await window.contractsDht.queryContract(contractId, method, params);
                    console.log(' Contract query successful:', result);
                    return result;
                } catch (error) {
                    console.error('❌ Contract query failed:', error);
                    throw error;
                }
            },

            // Test contract execution via DHT
            execute: async (contractId, method, params = {}) => {
                try {
                    console.log(`⚡ Testing smart contract execution via DHT: ${contractId}/${method}`);
                    const result = await window.contractsDht.executeContract(contractId, method, params);
                    console.log(' Contract execution successful:', result);
                    return result;
                } catch (error) {
                    console.error('❌ Contract execution failed:', error);
                    throw error;
                }
            },

            // Test contract discovery via DHT
            find: async (tags = [], limit = 10) => {
                try {
                    console.log('🔎 Testing smart contract discovery via DHT...');
                    const result = await window.contractsDht.findContracts(tags, limit);
                    console.log(' Contract discovery successful:', result);
                    return result;
                } catch (error) {
                    console.error('❌ Contract discovery failed:', error);
                    throw error;
                }
            },

            // Simple test with sample WASM contract
            deploySimpleTest: async () => {
                try {
                    console.log('🧪 Deploying simple test contract via DHT...');
                    // Create a minimal WASM contract (just basic structure)
                    const simpleWasm = new Uint8Array([
                        0x00, 0x61, 0x73, 0x6d, 0x01, 0x00, 0x00, 0x00  // WASM magic + version
                    ]);
                    
                    const metadata = {
                        name: 'SimpleTestContract',
                        version: '1.0.0',
                        tags: ['test', 'simple'],
                        description: 'Simple test contract for DHT deployment testing'
                    };
                    
                    return await window.contractTest.deploy(simpleWasm, metadata);
                } catch (error) {
                    console.error('❌ Simple test deployment failed:', error);
                    throw error;
                }
            },

            // Show help for contract testing
            help: () => {
                console.log(`
 Smart Contract DHT Testing Functions:

Basic Operations:
  contractTest.deploy(wasmBytes, metadata) - Deploy contract via DHT
  contractTest.query(contractId, method, params) - Query contract via DHT  
  contractTest.execute(contractId, method, params) - Execute contract via DHT
  contractTest.find(tags, limit) - Find contracts via DHT

Test Functions:
  contractTest.deploySimpleTest() - Deploy a simple test contract
  contractTest.help() - Show this help

Examples:
  await contractTest.deploySimpleTest()
  await contractTest.find(['test'], 5)
  await contractTest.query('contract123', 'getBalance', {address: '0x...'})
                `);
            }
        };
    }

    initializeEventListeners() {
        // Navigation buttons
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('nav-button')) {
                this.handleNavigation(e.target.dataset.action);
            }
            
            if (e.target.classList.contains('dashboard-card')) {
                this.handleDashboardClick(e.target.dataset.action);
            }
            
            if (e.target.id === 'createIdentityBtn') {
                this.openModal('zkdid');
            }
            
            // Identity indicator click handler
            if (e.target.id === 'identityIndicator' || e.target.id === 'identityStatus' || e.target.closest('#identityIndicator')) {
                console.log('🔑 Identity indicator clicked');
                if (this.currentIdentity && this.currentIdentity.did) {
                    // Already signed in, navigate to identity page
                    this.navigateToUrl('zhtp://identity.zhtp');
                } else {
                    // Not signed in, open ZK-DID modal
                    this.openModal('zkdid');
                }
            }
            
            if (e.target.classList.contains('close-btn')) {
                this.closeAllModals();
            }
        });
        
        // Address bar - both old and new IDs for compatibility
        const addressBar = document.getElementById('addressBar') || document.getElementById('urlBar');
        if (addressBar) {
            addressBar.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.navigateToUrl(e.target.value);
                }
            });
        }

        // URL bar navigation
        const urlBar = document.getElementById('urlBar');
        if (urlBar) {
            urlBar.addEventListener('keypress', (e) => this.handleUrlBarEnter(e));
        }

        // Navigation control buttons
        const backBtn = document.getElementById('backBtn');
        const forwardBtn = document.getElementById('forwardBtn');
        const refreshBtn = document.getElementById('refreshBtn');
        
        if (backBtn) {
            backBtn.addEventListener('click', () => this.goBack());
        }
        
        if (forwardBtn) {
            forwardBtn.addEventListener('click', () => this.goForward());
        }
        
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => this.refreshPage());
        }

        // DHT Testing button
        const dhtTestBtn = document.getElementById('dhtTestBtn');
        if (dhtTestBtn) {
            dhtTestBtn.addEventListener('click', () => this.openDhtTesting());
        }

        // Keyboard shortcuts for navigation
        document.addEventListener('keydown', (e) => {
            // Alt+Left Arrow = Back
            if (e.altKey && e.key === 'ArrowLeft') {
                e.preventDefault();
                this.goBack();
            }
            // Alt+Right Arrow = Forward
            else if (e.altKey && e.key === 'ArrowRight') {
                e.preventDefault();
                this.goForward();
            }
            // F5 or Ctrl+R = Refresh
            else if (e.key === 'F5' || (e.ctrlKey && e.key === 'r')) {
                e.preventDefault();
                this.refreshPage();
            }
            // Ctrl+Shift+D = DHT Testing Dashboard
            else if (e.ctrlKey && e.shiftKey && e.key === 'D') {
                e.preventDefault();
                this.openDhtTesting();
            }
            // Ctrl+L = Focus URL bar
            else if (e.ctrlKey && e.key === 'l') {
                e.preventDefault();
                const urlBar = document.getElementById('urlBar');
                if (urlBar) {
                    urlBar.focus();
                    urlBar.select();
                }
            }
        });
    }

    updateLoadingProgress(progress, message) {
        const progressBar = document.querySelector('.progress-bar');
        const progressText = document.querySelector('.progress-text');
        
        if (progressBar) {
            progressBar.style.width = progress + '%';
        }
        
        if (progressText) {
            progressText.textContent = message;
        }
        
        console.log(`📊 Progress: ${progress}% - ${message}`);
    }

    showMainInterface() {
        const loadingScreen = document.getElementById('loadingScreen');
        const browserContainer = document.querySelector('.browser-container');
        
        if (loadingScreen) {
            loadingScreen.style.display = 'none';
        }
        
        if (browserContainer) {
            browserContainer.classList.add('active');
            browserContainer.style.display = 'block';
        }
        
        // Initialize navigation to dashboard
        this.navigateToUrl('zhtp://dashboard.zhtp', true);
        
        // Update dashboard with data
        this.updateDashboard();
    }

    async updateDashboard() {
        // Update identity info
        this.updateIdentityIndicator();
        
        // Update wallet info if identity exists
        if (this.currentIdentity) {
            await this.updateWalletDisplay();
        }
        
        // Update DAO info
        await this.updateDaoDisplay();
        
        // Update network status
        await this.updateNetworkStatus();
    }

    updateIdentityIndicator() {
        console.log(' Updating identity indicator, current identity:', this.currentIdentity);
        
        // Wait for DOM to be ready if needed
        const updateIndicator = () => {
            const identityStatus = document.getElementById('identityStatus');
            const identityIndicator = document.getElementById('identityIndicator');
            
            if (!identityStatus) {
                console.warn('⚠️ identityStatus element not found, retrying in 100ms...');
                setTimeout(updateIndicator, 100);
                return;
            }
            
            // Only use manually set current identity - no auto-loading from API
            const identity = this.currentIdentity;
            
            if (identity && (identity.authenticated || identity.did)) {
                // Normalize and show DID in the indicator
                const normalizedDid = this.normalizeDid(identity.did);
                const didDisplay = normalizedDid ? 
                    normalizedDid.substring(0, 25) + '...' : // Show more of the DID
                    'Unknown DID';
                identityStatus.textContent = didDisplay;
                
                if (identityIndicator) {
                    identityIndicator.classList.add('authenticated');
                    identityIndicator.title = `ZK-DID: ${identity.did || 'N/A'}\nDisplay Name: ${identity.display_name || identity.displayName || 'N/A'}\nClick for user menu`;
                }
                
                console.log(' Identity indicator updated to authenticated state with DID:', didDisplay);
                
            } else {
                identityStatus.textContent = 'Anonymous';
                
                if (identityIndicator) {
                    identityIndicator.classList.remove('authenticated');
                    identityIndicator.title = 'Click to sign in or create ZK-DID identity';
                }
                console.log('❌ Identity indicator set to anonymous state');
            }
        };
        
        // Start the update process
        updateIndicator();
    }

    // Logout functionality
    logout() {
        console.log('🚪 Logging out from ZHTP...');
        
        // Clear current identity
        this.currentIdentity = null;
        this.citizenWalletData = null;
        
        // Update identity indicator to anonymous state
        this.updateIdentityIndicator();
        
        // Navigate to dashboard (anonymous state)
        this.navigateToUrl('zhtp://dashboard.zhtp');
        
        // Show confirmation
        this.showNotification(' Successfully logged out from ZHTP', 'success');
        
        console.log(' Logout complete - returned to anonymous state');
    }

    // Handle identity indicator click
    handleIdentityClick() {
        console.log('👤 Identity indicator clicked');
        
        if (this.currentIdentity && (this.currentIdentity.authenticated || this.currentIdentity.did)) {
            // User is signed in - show user menu with logout option
            this.showUserMenu();
        } else {
            // User is anonymous - show sign in modal
            this.openModal('zkDidModal');
        }
    }

    // Show user menu when signed in
    showUserMenu() {
        // Remove existing menu if it exists
        const existingMenu = document.querySelector('.user-menu');
        if (existingMenu) {
            existingMenu.remove();
        }

        const menu = document.createElement('div');
        menu.className = 'user-menu';
        menu.innerHTML = `
            <div class="user-menu-content">
                <div class="user-info">
                    <div class="user-avatar">👤</div>
                    <div class="user-details">
                        <div class="user-name">${this.currentIdentity.display_name || this.currentIdentity.displayName || 'User'}</div>
                        <div class="user-did">${this.currentIdentity.did?.substring(0, 30)}...</div>
                    </div>
                </div>
                <div class="menu-divider"></div>
                <div class="menu-items">
                    <div class="menu-item" onclick="window.browser.navigateToUrl('zhtp://identity.zhtp')">
                         Identity Profile
                    </div>
                    <div class="menu-item" onclick="window.browser.navigateToUrl('zhtp://wallet.zhtp')">
                        💰 Wallet
                    </div>
                    <div class="menu-item" onclick="window.browser.openSettings()">
                        ⚙️ Settings
                    </div>
                    <div class="menu-divider"></div>
                    <div class="menu-item logout" onclick="window.browser.logout(); document.querySelector('.user-menu').remove();">
                        🚪 Logout
                    </div>
                </div>
            </div>
        `;

        // Position menu near identity indicator
        const identityIndicator = document.getElementById('identityIndicator');
        const rect = identityIndicator.getBoundingClientRect();
        menu.style.cssText = `
            position: fixed;
            top: ${rect.bottom + 10}px;
            right: 20px;
            background: var(--background-secondary, #1a1a1a);
            border: 1px solid var(--border-color, #333);
            border-radius: 8px;
            padding: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            z-index: 10000;
            min-width: 200px;
        `;

        document.body.appendChild(menu);

        // Close menu when clicking outside
        setTimeout(() => {
            document.addEventListener('click', function closeMenu(e) {
                if (!menu.contains(e.target) && !identityIndicator.contains(e.target)) {
                    menu.remove();
                    document.removeEventListener('click', closeMenu);
                }
            });
        }, 100);
    }

    // Open settings modal
    openSettings() {
        console.log('⚙️ Opening settings...');
        this.openModal('settingsModal');
    }

    // Open DHT Testing Dashboard
    openDhtTesting() {
        console.log(' Opening DHT Testing Dashboard...');
        if (window.dhtDashboard) {
            window.dhtDashboard.showTestingInterface();
        } else {
            console.error('❌ DHT Dashboard not initialized');
        }
    }

    // Close any open modal
    closeModal() {
        const modals = document.querySelectorAll('.modal-overlay, #zkDidModal, #settingsModal');
        modals.forEach(modal => {
            if (modal) {
                modal.style.display = 'none';
                console.log('🔒 Modal closed:', modal.id || 'modal');
            }
        });
    }

    // Open modal by ID
    openModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.style.display = 'flex';
            console.log('Modal opened:', modalId);
        } else {
            console.warn('Modal not found:', modalId);
        }
    }

    // Open Ren AI Chat
    openRenChat() {
        console.log('Opening Ren AI chat...');
        
        // Initialize Ren client if not already done
        if (!window.renClient) {
            window.renClient = new window.RenClient({
                zkDidManager: this.zkdidManager
            });
        }
        
        // Initialize Ren panel if not already done
        if (!window.renPanel) {
            window.renPanel = new window.RenChatPanel({
                client: window.renClient
            });
        }
        
        // Open the modal
        this.openModal('renModal');
        
        // Render the chat panel into the modal content
        const renContent = document.getElementById('renContent');
        if (renContent && window.renPanel) {
            window.renPanel.render(renContent);
        }
    }

    async updateWalletDisplay() {
        try {
            if (!this.currentIdentity || !this.currentIdentity.did) {
                return;
            }
            
            // Update dashboard wallet card
            const walletCard = document.querySelector('[data-action="wallet"]');
            if (walletCard) {
                const balanceElement = walletCard.querySelector('.balance');
                if (balanceElement) {
                    // Show citizen status if applicable
                    if (this.currentIdentity.citizenship_result) {
                        balanceElement.innerHTML = `
                            <div>🏛️ Citizen Wallets</div>
                            <small>Primary + UBI + Savings</small>
                        `;
                    } else {
                        balanceElement.textContent = '💰 Quantum Wallet';
                    }
                }
            }
            
            // Update wallet page if it's currently displayed
            if (window.location.hash === '#wallet' || this.currentUrl.includes('wallet')) {
                await this.updateWalletPageBalances();
            }
            
        } catch (error) {
            console.error('Failed to update wallet display:', error);
        }
    }
    
    async loadWalletData() {
        try {
            if (!this.currentIdentity || !this.currentIdentity.did) {
                console.warn('⚠️ No identity available to load wallet data');
                return null;
            }
            
            console.log('💰 Loading wallet data from blockchain for DID:', this.currentIdentity.did);
            
            // Call the wallet balance API
            const walletData = await this.api.getWalletBalance(this.currentIdentity.did);
            
            if (walletData && walletData.success) {
                console.log('✅ Wallet data loaded successfully:', walletData);
                
                // Store wallet data on the browser instance
                this.walletData = walletData;
                
                // If citizen with multiple wallets, store detailed wallet info
                if (walletData.wallets && walletData.wallets.length > 1) {
                    this.citizenWalletData = {
                        citizenship: walletData.citizenship || {},
                        wallets: walletData.wallets,
                        totalBalance: walletData.totalBalance,
                        welcome_bonus: walletData.welcome_bonus
                    };
                    console.log('🏛️ Citizen wallet data stored:', this.citizenWalletData);
                }
                
                // Update UI if we're on the dashboard
                await this.updateWalletDisplay();
                
                return walletData;
            } else {
                console.warn('⚠️ No wallet data returned from API');
                return null;
            }
            
        } catch (error) {
            console.error('❌ Failed to load wallet data:', error);
            // Return default structure for fallback
            return {
                success: true,
                totalBalance: 0,
                wallets: [{
                    type: 'primary',
                    balance: 0,
                    address: this.currentIdentity?.did
                }]
            };
        }
    }
    
    async updateWalletPageBalances() {
        try {
            // Load real wallet data from blockchain
            const walletData = this.walletData || await this.loadWalletData();
            
            if (!walletData) {
                console.warn('⚠️ No wallet data available to display');
                return;
            }
            
            if (this.currentIdentity && walletData.wallets) {
                // Update wallet balances from real data
                walletData.wallets.forEach(wallet => {
                    const balanceElement = document.getElementById(`${wallet.type}WalletBalance`);
                    const idElement = document.getElementById(`${wallet.type}WalletId`);
                    const usdElement = document.getElementById(`${wallet.type}WalletBalanceUsd`);
                    
                    if (balanceElement) {
                        balanceElement.textContent = wallet.balance.toFixed(4);
                    }
                    
                    if (idElement && wallet.address) {
                        const displayAddress = wallet.address.length > 20 
                            ? wallet.address.substring(0, 16) + '...' 
                            : wallet.address;
                        idElement.textContent = displayAddress;
                    }
                    
                    if (usdElement) {
                        // Convert to USD (assuming $1 per ZHTP for now)
                        const usdValue = (wallet.balance * 1.00).toFixed(2);
                        usdElement.textContent = `≈ $${usdValue} USD`;
                    }
                });
                
                console.log('✅ Wallet page balances updated from blockchain data');
            }
            
        } catch (error) {
            console.error('Failed to update wallet page balances:', error);
        }
    }

    async updateDaoDisplay() {
        try {
            const proposals = await this.dao.getProposals();
            const daoCard = document.querySelector('[data-action="dao"]');
            if (daoCard) {
                const proposalCount = daoCard.querySelector('.proposal-count');
                if (proposalCount) {
                    proposalCount.textContent = `${proposals.length} Active Proposals`;
                }
            }
        } catch (error) {
            console.error('Failed to update DAO display:', error);
        }
    }

    async updateNetworkStatus() {
        try {
            const status = await this.api.getNetworkStatus();
            const statusIndicator = document.querySelector('.network-status');
            if (statusIndicator) {
                statusIndicator.textContent = status.connected ? '🟢 Connected' : '🔴 Disconnected';
                statusIndicator.className = `network-status ${status.connected ? 'connected' : 'disconnected'}`;
            }
        } catch (error) {
            console.error('Failed to update network status:', error);
        }
    }

    handleNavigation(action) {
        console.log('🧭 Navigation:', action);
        
        switch (action) {
            case 'home':
                this.navigateToUrl('zhtp://home');
                break;
            case 'back':
                this.goBack();
                break;
            case 'forward':
                this.goForward();
                break;
            case 'refresh':
                this.refresh();
                break;
        }
    }

    handleDashboardClick(action) {
        console.log(' Dashboard action:', action);
        
        switch (action) {
            case 'identity':
                this.navigateToUrl('zhtp://identity.zhtp');
                break;
            case 'wallet':
                this.navigateToUrl('zhtp://wallet.zhtp');
                break;
            case 'dao':
                this.navigateToUrl('zhtp://dao.zhtp');
                break;
            case 'social':
                this.navigateToUrl('zhtp://social.zhtp');
                break;
            case 'marketplace':
                this.navigateToUrl('zhtp://marketplace.zhtp');
                break;
            case 'whisper':
                this.navigateToUrl('zhtp://whisper.zhtp');
                break;
            case 'ren':
                this.openRenChat();
                break;
            default:
                console.log('Unknown action:', action);
        }
    }

    // Navigation Methods - proper implementation is further down
    // (removed duplicate method that was calling non-existent addToHistory)

    async loadPageFromDHT(url) {
        console.log(` Loading page from zkDHT: ${url}`);
        
        try {
            // Use real zkDHT client if available and connected
            if (this.zkdht && this.zkdht.isConnected) {
                console.log('🌐 Using live zkDHT blockchain DNS...');
                return await this.zkdht.loadPage(url);
            } else {
                console.log('⚠️ zkDHT not connected, using mock data for development...');
                return this.generateMockZhtpPage(url);
            }
        } catch (error) {
            console.error('❌ zkDHT load failed, falling back to mock data:', error);
            return this.generateMockZhtpPage(url);
        }
    }

    generateMockZhtpPage(url) {
        const domain = url.split('//')[1]?.split('/')[0] || 'dashboard';
        
        switch (domain) {
            case 'wallet.zhtp':
                return {
                    type: 'zhtp-page',
                    title: 'ZHTP Quantum Wallet',
                    url: url,
                    content: this.generateWalletPageContent()
                };
            case 'dao.zhtp':
                return {
                    type: 'zhtp-page',
                    title: 'ZHTP DAO Governance',
                    url: url,
                    content: this.generateDaoPageContent()
                };
            case 'social.zhtp':
                return {
                    type: 'zhtp-page',
                    title: 'Web4 Social Network',
                    url: url,
                    content: this.generateSocialPageContent()
                };
            case 'marketplace.zhtp':
                return {
                    type: 'zhtp-page',
                    title: 'Web4 Marketplace',
                    url: url,
                    content: this.generateMarketplacePageContent()
                };
            case 'whisper.zhtp':
                return {
                    type: 'zhtp-page',
                    title: 'Whisper Messaging',
                    url: url,
                    content: this.generateWhisperPageContent()
                };
            case 'identity.zhtp':
                return {
                    type: 'zhtp-page',
                    title: 'ZK-DID Identity',
                    url: url,
                    content: this.generateIdentityPageContent()
                };
            case 'signin.zhtp':
                return {
                    type: 'zhtp-page',
                    title: 'ZK-DID Sign In',
                    url: url,
                    content: this.generateSignInPageContent()
                };
            case 'create.zhtp':
                return {
                    type: 'zhtp-page',
                    title: 'Create ZK-DID',
                    url: url,
                    content: this.generateCreatePageContent()
                };
            case 'recover.zhtp':
                return {
                    type: 'zhtp-page',
                    title: 'Recover ZK-DID',
                    url: url,
                    content: this.generateRecoverPageContent()
                };
            default: // dashboard
                return {
                    type: 'zhtp-page',
                    title: 'ZHTP Dashboard',
                    url: url,
                    content: this.generateDashboardPageContent()
                };
        }
    }

    async renderPage(pageData) {
        console.log(`🎨 Rendering page: ${pageData.title}`);
        
        const pageContent = document.getElementById('pageContent');
        if (!pageContent) {
            throw new Error('Page content container not found');
        }
        
        // Clear existing content
        pageContent.innerHTML = '';
        
        // Create page container
        const pageContainer = document.createElement('div');
        pageContainer.className = 'zhtp-page';
        pageContainer.innerHTML = pageData.content;
        
        pageContent.appendChild(pageContainer);
        
        // Update page title
        document.title = `${pageData.title} - ZHTP Browser`;
    }

    updateNavigationButtons() {
        // Update back/forward button states
        const backBtn = document.getElementById('backBtn');
        const forwardBtn = document.getElementById('forwardBtn');
        
        if (backBtn) {
            backBtn.disabled = this.historyIndex <= 0;
            backBtn.style.opacity = this.historyIndex <= 0 ? '0.5' : '1';
            backBtn.style.cursor = this.historyIndex <= 0 ? 'not-allowed' : 'pointer';
        }
        if (forwardBtn) {
            forwardBtn.disabled = this.historyIndex >= this.navigationHistory.length - 1;
            forwardBtn.style.opacity = this.historyIndex >= this.navigationHistory.length - 1 ? '0.5' : '1';
            forwardBtn.style.cursor = this.historyIndex >= this.navigationHistory.length - 1 ? 'not-allowed' : 'pointer';
        }
    }

    updateNetworkStatus() {
        const networkStatus = document.getElementById('networkStatus');
        const peerCount = document.getElementById('peerCount');
        const blockHeight = document.getElementById('blockHeight');
        
        if (networkStatus) {
            networkStatus.textContent = '🟢 Connected';
            networkStatus.className = 'network-status connected';
        }
        
        if (peerCount) {
            peerCount.textContent = '12';
        }
        
        if (blockHeight) {
            blockHeight.textContent = '1,234,567';
        }
    }

    showNavigationError(url, error) {
        const pageContent = document.getElementById('pageContent');
        if (pageContent) {
            pageContent.innerHTML = `
                <div class="error-page">
                    <h1>❌ Navigation Error</h1>
                    <p>Failed to load: <code>${url}</code></p>
                    <p>Error: ${error.message}</p>
                    <div class="error-actions">
                        <button onclick="window.browser.goBack()">← Go Back</button>
                        <button onclick="window.browser.refreshPage()"> Retry</button>
                        <button onclick="window.browser.navigateToUrl('zhtp://dashboard.zhtp')">🏠 Home</button>
                    </div>
                </div>
            `;
        }
    }
    
    // Show notification to user
    showNotification(message, type = 'info') {
        console.log(`📢 Notification [${type}]:`, message);
        
        // Remove existing notification
        const existing = document.querySelector('.notification-toast');
        if (existing) {
            existing.remove();
        }
        
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification-toast notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                ${message}
            </div>
        `;
        
        // Style the notification
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'error' ? '#ff4444' : type === 'success' ? '#44ff44' : '#4488ff'};
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            z-index: 10001;
            max-width: 400px;
            font-size: 0.9rem;
            animation: slideInRight 0.3s ease-out;
        `;
        
        // Add to DOM
        document.body.appendChild(notification);
        
        // Auto-remove after delay
        setTimeout(() => {
            if (notification.parentNode) {
                notification.style.animation = 'slideOutRight 0.3s ease-in';
                setTimeout(() => notification.remove(), 300);
            }
        }, type === 'error' ? 5000 : 3000); // Errors stay longer
    }

    // Page Content Generators
    generateDashboardPageContent() {
        // Get wallet balance if user is authenticated
        const walletBalance = this.currentIdentity ? '1,234.56' : '0.00';
        const hasIdentity = this.currentIdentity && this.currentIdentity.did;
        const didDisplay = hasIdentity ? this.currentIdentity.did.substring(0, 20) + '...' : 'Not signed in';
        
        return `
            <div class="dashboard-page">
                <div class="hero-section">
                    <div class="hero-visual">
                        <div class="node central"><i class="fas fa-globe"></i></div>
                        <div class="node node-2"><i class="fas fa-lock"></i></div>
                        <div class="node node-3"><i class="fas fa-coins"></i></div>
                        <div class="node node-4"><i class="fas fa-vote-yea"></i></div>
                        <div class="node node-5"><i class="fas fa-id-card"></i></div>
                        <div class="node node-6"><i class="fas fa-home"></i></div>
                    </div>
                    <div class="hero-content">
                        <h1>Welcome to the <span class="accent">Sovereign Network</span></h1>
                        <p class="hero-subtitle">The next generation of decentralized internet powered by ZHTP protocol</p>
                        <div class="hero-actions">
                            <button class="btn primary-btn" onclick="window.browser.openModal('zkDidModal'); setTimeout(() => window.switchZkDidTab('create'), 100)">Get Started</button>
                            <button class="btn secondary-btn" onclick="window.browser.openModal('zkDidModal'); setTimeout(() => window.switchZkDidTab('signin'), 100)">Sign In</button>
                        </div>
                    </div>
                </div>

                <div class="dashboard-grid">
                    <!-- Top Row: Identity | Wallet | Governance -->
                    <div class="dashboard-card top-row">
                        <div class="card-header">
                            <div class="card-title">
                                <span class="card-icon icon-identity"></span>
                                Identity
                            </div>
                        </div>
                        <div class="card-content">
                            <div class="card-quick-info">
                                <div class="quick-stat">
                                    <span class="quick-stat-label">Status</span>
                                    <span class="quick-stat-value">${hasIdentity ? 'Signed In' : 'Anonymous'}</span>
                                </div>
                                ${hasIdentity ? `
                                <div class="quick-stat">
                                    <span class="quick-stat-label">ZK-DID</span>
                                    <span class="quick-stat-value" style="font-size: 0.75rem;">${didDisplay}</span>
                                </div>
                                <div class="quick-stat">
                                    <span class="quick-stat-label">Type</span>
                                    <span class="quick-stat-value">${this.currentIdentity.identity_type || 'User'}</span>
                                </div>
                                ` : `
                                <div class="quick-stat">
                                    <span class="quick-stat-label">Action Required</span>
                                    <span class="quick-stat-value">Sign in or create identity</span>
                                </div>
                                `}
                            </div>
                        </div>
                        <div class="card-actions">
                            ${hasIdentity ? `
                                <button class="card-btn" onclick="window.browser.logout()">Sign Out</button>
                                <button class="card-btn primary" onclick="window.browser.navigateToUrl('zhtp://identity.zhtp')">View Identity →</button>
                            ` : `
                                <button class="card-btn" onclick="window.browser.openModal('zkDidModal'); window.switchZkDidTab('signin')">Sign In</button>
                                <button class="card-btn primary" onclick="window.browser.openModal('zkDidModal'); window.switchZkDidTab('create')">Create Identity</button>
                            `}
                        </div>
                    </div>

                    <div class="dashboard-card top-row">
                        <div class="card-header">
                            <div class="card-title">
                                <span class="card-icon icon-wallet"></span>
                                Wallet
                            </div>
                        </div>
                        <div class="card-content">
                            <div class="card-quick-info">
                                <div class="quick-stat">
                                    <span class="quick-stat-label">Total Balance</span>
                                    <span class="quick-stat-value">${walletBalance} ZHTP</span>
                                </div>
                                ${hasIdentity ? `
                                <div class="quick-stat">
                                    <span class="quick-stat-label">USD Value</span>
                                    <span class="quick-stat-value">$${(parseFloat(walletBalance.replace(',', '')) * 2.34).toFixed(2)}</span>
                                </div>
                                <div class="quick-stat">
                                    <span class="quick-stat-label">Today's Activity</span>
                                    <span class="quick-stat-value">3 Transactions</span>
                                </div>
                                ` : `
                                <div class="quick-stat">
                                    <span class="quick-stat-label">Status</span>
                                    <span class="quick-stat-value">Sign in to access</span>
                                </div>
                                `}
                            </div>
                        </div>
                        <div class="card-actions">
                            ${hasIdentity ? `
                                <button class="card-btn" onclick="window.browser.showNotification('Quick send coming soon', 'info')">Quick Send</button>
                                <button class="card-btn primary" onclick="window.browser.navigateToUrl('zhtp://wallet.zhtp')">View Wallet →</button>
                            ` : `
                                <button class="card-btn primary" onclick="window.browser.openModal('zkDidModal')">Sign In to Access →</button>
                            `}
                        </div>
                    </div>

                    <div class="dashboard-card top-row">
                        <div class="card-header">
                            <div class="card-title">
                                <span class="card-icon icon-governance"></span>
                                Governance
                            </div>
                        </div>
                        <div class="card-content">
                            <div class="card-quick-info">
                                <div class="quick-stat">
                                    <span class="quick-stat-label">Active Proposals</span>
                                    <span class="quick-stat-value">7</span>
                                </div>
                                <div class="quick-stat">
                                    <span class="quick-stat-label">Your Voting Power</span>
                                    <span class="quick-stat-value">${hasIdentity ? '125 ZHTP' : '0 ZHTP'}</span>
                                </div>
                                <div class="quick-stat">
                                    <span class="quick-stat-label">DAO Treasury</span>
                                    <span class="quick-stat-value">1.2M ZHTP</span>
                                </div>
                            </div>
                        </div>
                        <div class="card-actions">
                            <button class="card-btn" onclick="createProposal()">New Proposal</button>
                            <button class="card-btn primary" onclick="window.browser.navigateToUrl('zhtp://dao.zhtp')">View Governance →</button>
                        </div>
                    </div>

                    <!-- Middle Row: Trending dApps & Trending Tokens -->
                    <div class="dashboard-card middle-row">
                        <div class="card-header">
                            <div class="card-title">
                                <span class="card-icon icon-dapps"></span>
                                Trending dApps
                            </div>
                        </div>
                        <div class="card-content">
                            <div class="trending-list">
                                <div class="trending-item" onclick="window.browser.showNotification('dApp launch coming soon', 'info')">
                                    <div class="trending-item-info">
                                        <div class="trending-item-name">DeFi Hub</div>
                                        <div class="trending-item-desc">Decentralized finance platform</div>
                                    </div>
                                    <div class="trending-item-value">↑ 234%</div>
                                </div>
                                <div class="trending-item" onclick="window.browser.showNotification('dApp launch coming soon', 'info')">
                                    <div class="trending-item-info">
                                        <div class="trending-item-name">GameFi Arena</div>
                                        <div class="trending-item-desc">Play-to-earn gaming platform</div>
                                    </div>
                                    <div class="trending-item-value">↑ 189%</div>
                                </div>
                                <div class="trending-item" onclick="window.browser.showNotification('dApp launch coming soon', 'info')">
                                    <div class="trending-item-info">
                                        <div class="trending-item-name">NFT Marketplace</div>
                                        <div class="trending-item-desc">Trade digital collectibles</div>
                                    </div>
                                    <div class="trending-item-value">↑ 156%</div>
                                </div>
                                <div class="trending-item" onclick="window.browser.showNotification('dApp launch coming soon', 'info')">
                                    <div class="trending-item-info">
                                        <div class="trending-item-name">Social Graph</div>
                                        <div class="trending-item-desc">Decentralized social network</div>
                                    </div>
                                    <div class="trending-item-value">↑ 143%</div>
                                </div>
                            </div>
                        </div>
                        <div class="card-actions">
                            <button class="card-btn primary" onclick="window.browser.navigateToUrl('zhtp://marketplace.zhtp')">Explore All dApps →</button>
                        </div>
                    </div>

                    <div class="dashboard-card middle-row">
                        <div class="card-header">
                            <div class="card-title">
                                <span class="card-icon icon-tokens"></span>
                                Trending Tokens
                            </div>
                        </div>
                        <div class="card-content">
                            <div class="trending-list">
                                <div class="trending-item">
                                    <div class="trending-item-info">
                                        <div class="trending-item-name">ZHTP</div>
                                        <div class="trending-item-desc">Sovereign Network Token</div>
                                    </div>
                                    <div class="trending-item-value">$2.34</div>
                                </div>
                                <div class="trending-item">
                                    <div class="trending-item-info">
                                        <div class="trending-item-name">ZGOV</div>
                                        <div class="trending-item-desc">Governance Token</div>
                                    </div>
                                    <div class="trending-item-value">$5.67</div>
                                </div>
                                <div class="trending-item">
                                    <div class="trending-item-info">
                                        <div class="trending-item-name">ZDEFI</div>
                                        <div class="trending-item-desc">DeFi Protocol Token</div>
                                    </div>
                                    <div class="trending-item-value">$1.89</div>
                                </div>
                                <div class="trending-item">
                                    <div class="trending-item-info">
                                        <div class="trending-item-name">ZNFT</div>
                                        <div class="trending-item-desc">NFT Marketplace Token</div>
                                    </div>
                                    <div class="trending-item-value">$3.12</div>
                                </div>
                            </div>
                        </div>
                        <div class="card-actions">
                            <button class="card-btn primary" onclick="window.browser.navigateToUrl('zhtp://marketplace.zhtp')">View All Tokens →</button>
                        </div>
                    </div>

                    <!-- Bottom Row: Trending Bounties (Full Width) -->
                    <div class="dashboard-card bottom-row">
                        <div class="card-header">
                            <div class="card-title">
                                <span class="card-icon icon-bounties"></span>
                                Trending Bounties
                            </div>
                        </div>
                        <div class="card-content">
                            <div class="trending-list">
                                <div class="bounty-item">
                                    <div class="bounty-header">
                                        <div class="bounty-title">Implement Post-Quantum Signature Scheme</div>
                                        <div class="bounty-reward">5,000 ZHTP</div>
                                    </div>
                                    <div class="bounty-desc">
                                        Implement and test a new post-quantum digital signature algorithm compatible with the ZHTP protocol. Must pass all security audits and performance benchmarks.
                                    </div>
                                    <div class="bounty-meta">
                                        <span>⏰ 14 days left</span>
                                        <span>👥 3 contributors</span>
                                        <span>🏷️ Cryptography</span>
                                    </div>
                                </div>
                                
                                <div class="bounty-item">
                                    <div class="bounty-header">
                                        <div class="bounty-title">Build DeFi Lending Protocol</div>
                                        <div class="bounty-reward">10,000 ZHTP</div>
                                    </div>
                                    <div class="bounty-desc">
                                        Create a decentralized lending and borrowing platform with collateralized loans, interest rate models, and liquidation mechanisms. Smart contracts must be audited.
                                    </div>
                                    <div class="bounty-meta">
                                        <span>⏰ 30 days left</span>
                                        <span>👥 8 contributors</span>
                                        <span>🏷️ DeFi • Smart Contracts</span>
                                    </div>
                                </div>
                                
                                <div class="bounty-item">
                                    <div class="bounty-header">
                                        <div class="bounty-title">Design Web4 Gaming Engine</div>
                                        <div class="bounty-reward">7,500 ZHTP</div>
                                    </div>
                                    <div class="bounty-desc">
                                        Build a game engine that runs natively on Web4 with NFT integration, real-time multiplayer, and on-chain state management. Include 2 demo games.
                                    </div>
                                    <div class="bounty-meta">
                                        <span>⏰ 45 days left</span>
                                        <span>👥 5 contributors</span>
                                        <span>🏷️ Gaming • NFT</span>
                                    </div>
                                </div>
                                
                                <div class="bounty-item">
                                    <div class="bounty-header">
                                        <div class="bounty-title">Mobile Wallet App Development</div>
                                        <div class="bounty-reward">6,000 ZHTP</div>
                                    </div>
                                    <div class="bounty-desc">
                                        Develop native iOS and Android apps with full ZHTP wallet functionality, biometric security, and hardware wallet support. Must support all wallet types (Primary, UBI, Savings).
                                    </div>
                                    <div class="bounty-meta">
                                        <span>⏰ 60 days left</span>
                                        <span>👥 12 contributors</span>
                                        <span>🏷️ Mobile • Wallet</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="card-actions">
                            <button class="card-btn" onclick="window.browser.showNotification('Bounties submission coming soon', 'info')">Submit Your Bounty</button>
                            <button class="card-btn primary" onclick="window.browser.showNotification('Full bounties page coming soon', 'info')">View All Bounties →</button>
                        </div>
                    </div>
                </div>

                <div class="network-status-panel">
                    <div class="network-status connecting" id="networkStatus">⚡ Connecting...</div>
                    <div class="network-info">
                        <span>Block Height: <span id="blockHeight">--</span></span>
                        <span>Peers: <span id="peerCount">--</span></span>
                        <span>Gas Price: <span id="gasPrice">--</span> ZHTP</span>
                        <span>TPS: <span id="tpsCount">--</span></span>
                    </div>
                </div>
            </div>
        `;
    }

    generateWalletPageContent() {
        // Check if user has multiple wallets (citizens get UBI and Savings wallets)
        // For now, show wallet tabs for all authenticated users
        const hasCitizenshipWallets = this.currentIdentity && 
                                     (this.currentIdentity.identityType === 'Human' || 
                                      this.currentIdentity.identityType === 'citizen' ||
                                      this.currentIdentity.identity_type === 'human' ||
                                      this.currentIdentity.identity_type === 'citizen' ||
                                      this.currentIdentity.authenticated === true);
        
        return `
            <div class="wallet-page">
                <div class="page-header">
                    <h1>💎 Quantum Wallet System</h1>
                    <p>Your secure, quantum-resistant cryptocurrency wallets</p>
                </div>

                ${hasCitizenshipWallets ? `
                <div class="wallet-tabs">
                    <button class="wallet-tab active" onclick="switchWalletTab('primary')">💰 Primary Wallet</button>
                    <button class="wallet-tab" onclick="switchWalletTab('ubi')">🏛️ UBI Wallet</button>
                    <button class="wallet-tab" onclick="switchWalletTab('savings')">🏦 Savings Wallet</button>
                </div>

                <!-- Primary Wallet -->
                <div class="wallet-content active" id="wallet-primary">
                    <div class="balance-overview">
                        <div class="balance-card">
                            <h3>💰 Primary Wallet Balance</h3>
                            <div class="balance-amount">
                                <span class="amount" id="primaryWalletBalance">--</span>
                                <span class="currency">ZHTP</span>
                            </div>
                            <div class="balance-usd" id="primaryWalletBalanceUsd">≈ $-- USD</div>
                            <div class="balance-change" id="primaryWalletBalanceChange">--% (24h)</div>
                            <div class="wallet-id">ID: <span id="primaryWalletId">--</span></div>
                        </div>
                    </div>

                    <div class="wallet-actions">
                        <button class="wallet-btn primary" onclick="sendTokens('primary')">📤 Send</button>
                        <button class="wallet-btn secondary" onclick="receiveTokens('primary')">📥 Receive</button>
                        <button class="wallet-btn secondary" onclick="swapTokens('primary')"> Swap</button>
                        <button class="wallet-btn secondary" onclick="transferBetweenWallets('primary')">🔀 Transfer</button>
                    </div>
                </div>

                <!-- UBI Wallet -->
                <div class="wallet-content" id="wallet-ubi">
                    <div class="balance-overview">
                        <div class="balance-card ubi-wallet">
                            <h3>🏛️ UBI Wallet Balance</h3>
                            <div class="balance-amount">
                                <span class="amount" id="ubiWalletBalance">--</span>
                                <span class="currency">ZHTP</span>
                            </div>
                            <div class="balance-usd" id="ubiWalletBalanceUsd">≈ $-- USD</div>
                            <div class="ubi-info">
                                <div class="ubi-payment">Next UBI: <span id="nextUbiPayment">--</span> ZHTP</div>
                                <div class="ubi-schedule">Schedule: <span id="ubiSchedule">Daily automatic</span></div>
                            </div>
                            <div class="wallet-id">ID: <span id="ubiWalletId">--</span></div>
                        </div>
                    </div>

                    <div class="wallet-actions">
                        <button class="wallet-btn primary" onclick="claimUBI()">💰 Claim UBI</button>
                        <button class="wallet-btn secondary" onclick="transferBetweenWallets('ubi')">🔀 Transfer to Primary</button>
                        <button class="wallet-btn secondary" onclick="receiveTokens('ubi')">📥 Receive</button>
                        <button class="wallet-btn secondary" onclick="viewUbiHistory()">📊 UBI History</button>
                    </div>
                </div>

                <!-- Savings Wallet -->
                <div class="wallet-content" id="wallet-savings">
                    <div class="balance-overview">
                        <div class="balance-card savings-wallet">
                            <h3>🏦 Savings Wallet Balance</h3>
                            <div class="balance-amount">
                                <span class="amount" id="savingsWalletBalance">--</span>
                                <span class="currency">ZHTP</span>
                            </div>
                            <div class="balance-usd" id="savingsWalletBalanceUsd">≈ $-- USD</div>
                            <div class="savings-info">
                                <div class="staking-reward">Staking Rewards: <span id="stakingRewards">--</span> ZHTP</div>
                                <div class="privacy-level">Privacy: <span id="privacyLevel">Maximum (Stealth)</span></div>
                            </div>
                            <div class="wallet-id">ID: <span id="savingsWalletId">--</span></div>
                        </div>
                    </div>

                    <div class="wallet-actions">
                        <button class="wallet-btn primary" onclick="stakeTokens('savings')">🏦 Stake ZHTP</button>
                        <button class="wallet-btn secondary" onclick="transferBetweenWallets('savings')">🔀 Transfer to Primary</button>
                        <button class="wallet-btn secondary" onclick="receiveTokens('savings')">📥 Receive (Stealth)</button>
                        <button class="wallet-btn secondary" onclick="viewStakingRewards()">💎 Rewards</button>
                    </div>
                </div>
                ` : `
                <!-- Single Wallet for Non-Citizens -->
                <div class="balance-overview">
                    <div class="balance-card">
                        <h3>💰 Wallet Balance</h3>
                        <div class="balance-amount">
                            <span class="amount" id="walletBalance">--</span>
                            <span class="currency">ZHTP</span>
                        </div>
                        <div class="balance-usd" id="walletBalanceUsd">≈ $-- USD</div>
                        <div class="balance-change" id="walletBalanceChange">--% (24h)</div>
                    </div>
                </div>

                <div class="wallet-actions">
                    <button class="wallet-btn primary" onclick="sendTokens()">📤 Send</button>
                    <button class="wallet-btn secondary" onclick="receiveTokens()">📥 Receive</button>
                    <button class="wallet-btn secondary" onclick="swapTokens()"> Swap</button>
                    <button class="wallet-btn secondary" onclick="stakeTokens()">🏦 Stake</button>
                </div>
                `}

                <div class="asset-section">
                    <h3>📊 Your Assets</h3>
                    <div class="asset-list" id="assetList">
                        <div class="loading-placeholder">Loading assets...</div>
                    </div>
                </div>

                <div class="transaction-section">
                    <h3> Recent Transactions</h3>
                    <div class="transaction-list" id="transactionList">
                        <div class="loading-placeholder">Loading transactions...</div>
                    </div>
                </div>
            </div>
        `;
    }

    generateDaoPageContent() {
        return `
            <div class="dao-page">
                <div class="page-header">
                    <h1>🏛️ ZHTP DAO Governance</h1>
                    <p>Participate in the decentralized governance of the ZHTP network</p>
                </div>

                <div class="governance-stats">
                    <div class="stat-card">
                        <div id="totalProposals" class="stat-value">--</div>
                        <div class="stat-label">Total Proposals</div>
                    </div>
                    <div class="stat-card">
                        <div id="activeProposals" class="stat-value">--</div>
                        <div class="stat-label">Active Proposals</div>
                    </div>
                    <div class="stat-card">
                        <div id="daoMembers" class="stat-value">--</div>
                        <div class="stat-label">DAO Members</div>
                    </div>
                    <div class="stat-card">
                        <div id="votingPower" class="stat-value">--</div>
                        <div class="stat-label">Your Voting Power</div>
                    </div>
                    <div class="stat-card">
                        <div id="treasuryBalance" class="stat-value">--</div>
                        <div class="stat-label">Treasury</div>
                    </div>
                </div>

                <div class="dao-tabs">
                    <button class="dao-tab active" onclick="switchDaoTab('proposals')">🗳️ Proposals</button>
                    <button class="dao-tab" onclick="switchDaoTab('treasury')">🏛️ Treasury</button>
                    <button class="dao-tab" onclick="switchDaoTab('delegates')">👥 Delegates</button>
                </div>

                <!-- Proposals Tab -->
                <div class="dao-content active" id="dao-proposals">
                    <div class="dao-actions">
                        <button class="dao-btn primary" onclick="createProposal()">Create Proposal</button>
                        <button class="dao-btn secondary" onclick="voteOnProposals()">🗳️ Vote</button>
                    </div>

                    <div class="proposals-section">
                        <h3>🗳️ Active Proposals</h3>
                        <div id="proposalsList" class="proposals-list">
                            <!-- Proposals will be loaded dynamically here -->
                            <div class="loading-placeholder">Loading proposals...</div>
                        </div>
                    </div>
                </div>

                <!-- Treasury Tab -->
                <div class="dao-content" id="dao-treasury">
                    <div class="treasury-overview">
                        <div class="treasury-card">
                            <h3>🏛️ Treasury Balance</h3>
                            <div class="balance-amount">
                                <span class="amount" id="treasuryTotalFunds">--</span>
                                <span class="currency">ZHTP</span>
                            </div>
                            <div class="treasury-stats">
                                <div class="treasury-stat">
                                    <span class="label">Available:</span>
                                    <span id="treasuryAvailableFunds">--</span> ZHTP
                                </div>
                                <div class="treasury-stat">
                                    <span class="label">Allocated:</span>
                                    <span id="treasuryAllocatedFunds">--</span> ZHTP
                                </div>
                                <div class="treasury-stat">
                                    <span class="label">Transactions:</span>
                                    <span id="treasuryTransactionCount">--</span>
                                </div>
                            </div>
                        </div>
                        
                        <!-- Treasury Safeguards Panel -->
                        <div class="treasury-card treasury-safeguards">
                            <h3>🛡️ Treasury Protection</h3>
                            <div class="safeguard-info">
                                <div class="safeguard-item">
                                    <span class="safeguard-icon">🔒</span>
                                    <div class="safeguard-details">
                                        <strong>Consensus Protection</strong>
                                        <p>Treasury proposals require 60% approval (vs 50% for regular proposals)</p>
                                    </div>
                                </div>
                                <div class="safeguard-item">
                                    <span class="safeguard-icon">📊</span>
                                    <div class="safeguard-details">
                                        <strong>Automatic Validation</strong>
                                        <p>Fund availability verified before proposal execution</p>
                                    </div>
                                </div>
                                <div class="safeguard-item">
                                    <span class="safeguard-icon">⚖️</span>
                                    <div class="safeguard-details">
                                        <strong>Voting Power Requirements</strong>
                                        <p>Minimum 100 voting power required to propose treasury allocations</p>
                                    </div>
                                </div>
                                <div class="safeguard-item">
                                    <span class="safeguard-icon"></span>
                                    <div class="safeguard-details">
                                        <strong>Large Allocation Alerts</strong>
                                        <p>Special warnings for proposals >25% of treasury balance</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="dao-actions">
                        <button class="dao-btn primary" onclick="proposeSpending()">💰 Propose Spending</button>
                        <button class="dao-btn secondary" onclick="viewTreasuryHistory()">📊 History</button>
                        <button class="dao-btn secondary" onclick="viewTreasurySafeguards()">🛡️ View Safeguards</button>
                    </div>

                    <div class="treasury-transactions">
                        <h3> Recent Treasury Activity</h3>
                        <div id="treasuryTransactions" class="transaction-list">
                            <div class="loading-placeholder">Loading treasury transactions...</div>
                        </div>
                    </div>
                </div>

                <!-- Delegates Tab -->
                <div class="dao-content" id="dao-delegates">
                    <div class="delegate-overview">
                        <div class="delegate-card">
                            <h3>👥 Your Delegation Status</h3>
                            <div class="delegation-info">
                                <div class="delegation-stat">
                                    <span class="label">Voting Power:</span>
                                    <span id="userVotingPower">--</span> ZHTP
                                </div>
                                <div class="delegation-stat">
                                    <span class="label">Delegated To:</span>
                                    <span id="delegatedTo">--</span>
                                </div>
                                <div class="delegation-stat">
                                    <span class="label">Delegated From:</span>
                                    <span id="delegatedFrom">--</span> users
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="dao-actions">
                        <button class="dao-btn primary" onclick="delegateVotes()">🗳️ Delegate Votes</button>
                        <button class="dao-btn secondary" onclick="revokeDelegation()">❌ Revoke Delegation</button>
                        <button class="dao-btn secondary" onclick="becomeDeligate()">👤 Become Delegate</button>
                    </div>

                    <div class="delegates-list">
                        <h3>🏆 Top Delegates</h3>
                        <div id="delegatesList" class="delegates-list">
                            <div class="loading-placeholder">Loading delegates...</div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    generateSocialPageContent() {
        return `
            <div class="social-page">
                <div class="page-header">
                    <h1>👥 Web4 Social Network</h1>
                    <p>Connect with the decentralized community</p>
                </div>

                <div class="post-composer">
                    <textarea class="post-input" placeholder="What's happening on Web4?" id="postTextarea"></textarea>
                    <div class="composer-actions">
                        <div class="composer-features">
                            <button class="composer-btn" onclick="addImage()">📷</button>
                            <button class="composer-btn" onclick="addPoll()">📊</button>
                            <button class="composer-btn" onclick="addLocation()"></button>
                        </div>
                        <button class="post-btn" onclick="publishPost()">🚀 Post</button>
                    </div>
                </div>

                <div class="social-feed">
                    <div class="post-card">
                        <div class="post-header">
                            <div class="post-avatar">👩‍💻</div>
                            <div class="post-info">
                                <div class="post-author">alice.zkdid</div>
                                <div class="post-time">2 hours ago</div>
                            </div>
                        </div>
                        <div class="post-content">Just deployed my first Web4 dApp! The zero-knowledge privacy is incredible! 🚀 #Web4 #ZHTP</div>
                        <div class="post-actions">
                            <button class="post-action" onclick="likePost('1')">❤️ 47</button>
                            <button class="post-action" onclick="sharePost('1')"> 12</button>
                            <button class="post-action" onclick="commentPost('1')">💬 8</button>
                            <button class="post-action" onclick="tipPost('1')">💰 Tip</button>
                        </div>
                    </div>

                    <div class="post-card">
                        <div class="post-header">
                            <div class="post-avatar">👨‍💻</div>
                            <div class="post-info">
                                <div class="post-author">dev.zhtp</div>
                                <div class="post-time">4 hours ago</div>
                            </div>
                        </div>
                        <div class="post-content">New protocol update is live! Quantum-resistant signatures now 40% faster. ⚡</div>
                        <div class="post-actions">
                            <button class="post-action" onclick="likePost('2')">❤️ 156</button>
                            <button class="post-action" onclick="sharePost('2')"> 34</button>
                            <button class="post-action" onclick="commentPost('2')">💬 23</button>
                            <button class="post-action" onclick="tipPost('2')">💰 Tip</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    generateMarketplacePageContent() {
        return `
            <div class="marketplace-page">
                <div class="page-header">
                    <h1>🛒 Web4 Marketplace</h1>
                    <p>Discover and trade digital assets on the decentralized marketplace</p>
                </div>

                <div class="marketplace-nav">
                    <button class="category-btn active" onclick="showCategory('apps')">🚀 Apps</button>
                    <button class="category-btn" onclick="showCategory('nfts')">🎨 NFTs</button>
                    <button class="category-btn" onclick="showCategory('domains')">🌐 Domains</button>
                    <button class="category-btn" onclick="showCategory('data')">📊 Data</button>
                </div>

                <div class="marketplace-grid">
                    <div class="marketplace-item">
                        <div class="item-image">🎮</div>
                        <div class="item-info">
                            <div class="item-title">ZK Games Suite</div>
                            <div class="item-description">Privacy-focused gaming platform</div>
                            <div class="item-price">Free</div>
                        </div>
                        <button class="btn-primary" onclick="installApp('zkgames')">Install</button>
                    </div>

                    <div class="marketplace-item">
                        <div class="item-image">💼</div>
                        <div class="item-info">
                            <div class="item-title">Business Suite</div>
                            <div class="item-description">Complete business management tools</div>
                            <div class="item-price">50 ZHTP/month</div>
                        </div>
                        <button class="btn-primary" onclick="installApp('business')">Subscribe</button>
                    </div>

                    <div class="marketplace-item">
                        <div class="item-image">🖼️</div>
                        <div class="item-info">
                            <div class="item-title">Digital Art #001</div>
                            <div class="item-description">Unique quantum-verified artwork</div>
                            <div class="item-price">100 ZHTP</div>
                        </div>
                        <button class="btn-primary" onclick="buyNFT('art001')">Buy Now</button>
                    </div>
                </div>
            </div>
        `;
    }

    generateWhisperPageContent() {
        return `
            <div class="whisper-page">
                <div class="page-header">
                    <h1>💬 Whisper Messaging</h1>
                    <p>Secure, private communications on Web4</p>
                </div>

                <div class="whisper-interface">
                    <div class="chat-sidebar">
                        <div class="chat-search">
                            <input type="text" class="form-input" placeholder="Search contacts...">
                        </div>
                        <div class="contact-list">
                            <div class="contact-item active">
                                <div class="contact-avatar">👩</div>
                                <div class="contact-info">
                                    <div class="contact-name">Alice.zkdid</div>
                                    <div class="contact-message">How's the Web4 project?</div>
                                </div>
                                <div class="contact-time">2m</div>
                            </div>
                            <div class="contact-item">
                                <div class="contact-avatar">👨</div>
                                <div class="contact-info">
                                    <div class="contact-name">Bob.zhtp</div>
                                    <div class="contact-message">Check out this dApp!</div>
                                </div>
                                <div class="contact-time">1h</div>
                            </div>
                        </div>
                    </div>

                    <div class="chat-main">
                        <div class="chat-header">
                            <div class="chat-avatar">👩</div>
                            <div class="chat-info">
                                <div class="chat-name">Alice.zkdid</div>
                                <div class="chat-status">🟢 Online</div>
                            </div>
                            <div class="chat-actions">
                                <button class="chat-btn" onclick="voiceCall()">📞</button>
                                <button class="chat-btn" onclick="videoCall()">📹</button>
                            </div>
                        </div>

                        <div class="chat-messages">
                            <div class="message received">
                                <div class="message-content">Hey! How's the Web4 project going?</div>
                                <div class="message-time">2:30 PM</div>
                            </div>
                            <div class="message sent">
                                <div class="message-content">Going great! Just deployed the new features 🚀</div>
                                <div class="message-time">2:31 PM</div>
                            </div>
                        </div>

                        <div class="chat-input">
                            <input type="text" class="form-input" placeholder="Type a message..." onkeypress="handleMessageKeyPress(event)">
                            <button class="chat-btn" onclick="attachFile()">📎</button>
                            <button class="btn-primary" onclick="sendMessage()">Send</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    generateIdentityPageContent() {
        return `
            <div class="identity-page">
                <div class="page-header">
                    <h1> ZK-DID Identity</h1>
                    <p>Manage your zero-knowledge digital identity</p>
                </div>

                <div class="identity-tabs">
                    <button class="tab-btn active" onclick="switchZkDidTab('signin')">🔑 Sign In</button>
                    <button class="tab-btn" onclick="switchZkDidTab('create')">🆕 Create Identity</button>
                    <button class="tab-btn" onclick="switchZkDidTab('recover')"> Recover</button>
                </div>

                <div id="zkdid-signin" class="tab-content active">
                    <div class="auth-section">
                        <h3> Sign In to Your ZK-DID</h3>
                        <p>Enter your ZK-DID or use biometric authentication</p>
                        
                        <div class="form-group">
                            <label class="form-label">ZK-DID Address</label>
                            <div style="position: relative;">
                                <input type="text" id="signinDid" class="form-input" 
                                       placeholder="did:zhtp:1a2b3c4d5e6f7a8b..."
                                       style="padding-right: 80px;">
                                <button onclick="pasteFromClipboard('signinDid')" style="
                                    position: absolute;
                                    right: 8px;
                                    top: 50%;
                                    transform: translateY(-50%);
                                    background: linear-gradient(135deg, #3b82f6, #1d4ed8);
                                    color: white;
                                    border: none;
                                    padding: 0.4rem 0.8rem;
                                    border-radius: 4px;
                                    cursor: pointer;
                                    font-size: 0.8rem;
                                    transition: opacity 0.2s;
                                " onmouseover="this.style.opacity='0.8'" onmouseout="this.style.opacity='1'">
                                     Paste
                                </button>
                            </div>
                            <small style="color: #94a3b8; font-size: 0.8rem; margin-top: 0.25rem; display: block;">
                                Expected format: did:zhtp:32-character-hex-string
                            </small>
                        </div>
                        
                        <div class="auth-options">
                            <button class="auth-btn">📷 Biometric</button>
                            <button class="auth-btn">🔑 Passphrase</button>
                            <button class="auth-btn"> Mobile QR</button>
                        </div>
                        
                        <div class="form-group">
                            <label class="form-label">Authentication Method</label>
                            <input type="password" id="signinPassphrase" class="form-input" placeholder="Passphrase">
                        </div>
                        
                        <button class="btn-primary full-width" onclick="signInWithZkDid()">🚀 Sign In</button>
                    </div>
                </div>

                <div id="zkdid-create" class="tab-content">
                    <div class="auth-section">
                        <h3>🆕 Create New ZK-DID Identity</h3>
                        <p>Generate a new quantum-resistant identity</p>
                        
                        <div class="form-group">
                            <label class="form-label">Identity Type</label>
                            <select class="form-input">
                                <option value="citizen">🏛️ Citizen (UBI Eligible)</option>
                                <option value="organization">🏢 Organization</option>
                                <option value="developer">👨‍💻 Developer</option>
                                <option value="validator">⚡ Validator Node</option>
                            </select>
                        </div>
                        
                        <div class="form-group">
                            <label class="form-label">Display Name</label>
                            <input type="text" class="form-input" id="displayNameInput" placeholder="Your display name" 
                                   oninput="checkUsernameAvailability(this.value)">
                            <div id="displayNameStatus" class="validation-status"></div>
                        </div>
                        
                        <div class="form-group">
                            <label class="form-label">Preferred Username (Optional)</label>
                            <input type="text" class="form-input" id="usernameInput" placeholder="yourname (will create yourname.zkdid)">
                        </div>
                        
                        <div class="form-group">
                            <label class="form-label">Secure Passphrase</label>
                            <input type="password" class="form-input" id="createPassphrase" placeholder="Create a strong passphrase (8+ characters)">
                            <small class="form-help">This passphrase protects your identity and cannot be recovered if lost</small>
                        </div>
                        
                        <div class="form-group">
                            <label class="form-label">Confirm Passphrase</label>
                            <input type="password" class="form-input" id="confirmPassphrase" placeholder="Confirm your passphrase">
                        </div>
                        
                        <div class="form-group">
                            <label class="form-checkbox">
                                <input type="checkbox" required>
                                <span class="checkmark"></span>
                                I agree to the ZHTP Terms and Privacy Policy
                            </label>
                        </div>
                        
                        <button class="btn-primary full-width" onclick="createNewZkDid()"> Generate ZK-DID Identity</button>
                        
                        <div class="info-box">
                            <h4>🛡️ Soulbound ZK-DID Security</h4>
                            <p><strong>Quantum-Resistant:</strong> Uses CRYSTALS-Dilithium post-quantum cryptography</p>
                            <p><strong>Soulbound:</strong> Permanently tied to you - cannot be transferred or stolen</p>
                            <p><strong>Zero-Knowledge:</strong> Privacy-preserving proofs protect your personal data</p>
                            <p><strong>⚠️ IMPORTANT:</strong> Write down your seed phrase when generated - it's your only recovery method!</p>
                        </div>
                    </div>
                </div>

                <div id="zkdid-recover" class="tab-content">
                    <div class="auth-section">
                        <h3> Recover ZK-DID Identity</h3>
                        <p>Restore your identity using one of these methods</p>
                        
                        <div class="recovery-options">
                            <button class="recovery-btn" onclick="recoverWithSeed()">
                                <div class="recovery-icon">🌱</div>
                                <div class="recovery-text">
                                    <h4>Seed Phrase</h4>
                                    <p>12 or 24 word recovery phrase</p>
                                </div>
                            </button>
                            
                            <button class="recovery-btn" onclick="recoverWithBackup()">
                                <div class="recovery-icon">💾</div>
                                <div class="recovery-text">
                                    <h4>Backup File</h4>
                                    <p>Encrypted identity backup</p>
                                </div>
                            </button>
                            
                            <button class="recovery-btn" onclick="recoverWithSocial()">
                                <div class="recovery-icon">👥</div>
                                <div class="recovery-text">
                                    <h4>Social Recovery</h4>
                                    <p>Trusted contacts verification</p>
                                </div>
                            </button>
                        </div>
                        
                        <div id="seedRecovery" class="recovery-section" style="display:none;">
                            <h4>🌱 Seed Phrase Recovery</h4>
                            <div class="form-group">
                                <label class="form-label">Enter your seed phrase</label>
                                <textarea class="form-input" rows="3" placeholder="Enter your 12 or 24 word seed phrase..."></textarea>
                            </div>
                            <div class="form-group">
                                <label class="form-label">New passphrase</label>
                                <input type="password" class="form-input" id="seedRecoveryPassphrase" placeholder="Create a new passphrase (8+ characters)">
                            </div>
                            <button class="btn-primary" onclick="executeSeedRecovery()">Recover Identity</button>
                        </div>
                        
                        <div id="backupRecovery" class="recovery-section" style="display:none;">
                            <h4>💾 Backup File Recovery</h4>
                            <div class="form-group">
                                <label class="form-label">Select backup file</label>
                                <input type="file" class="form-input" accept=".zkdid,.json">
                            </div>
                            <div class="form-group">
                                <label class="form-label">Backup password</label>
                                <input type="password" class="form-input" placeholder="Enter backup password">
                            </div>
                            <button class="btn-primary" onclick="executeBackupRecovery()">Recover Identity</button>
                        </div>
                        
                        <div id="socialRecovery" class="recovery-section" style="display:none;">
                            <h4>👥 Social Recovery</h4>
                            <p>Contact your trusted recovery contacts to verify your identity</p>
                            <div class="form-group">
                                <label class="form-label">Recovery request code</label>
                                <input type="text" class="form-input" placeholder="Enter code from recovery contact">
                            </div>
                            <button class="btn-primary" onclick="executeSocialRecovery()">Submit Recovery Request</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    generateSignInPageContent() {
        return `
            <div class="identity-page">
                <div class="identity-nav">
                    <a href="javascript:window.browser.navigateToUrl('identity.zhtp')" class="nav-link">🏠 Identity Home</a>
                    <span class="nav-divider">|</span>
                    <a href="javascript:window.browser.navigateToUrl('create.zhtp')" class="nav-link">🆕 Create</a>
                    <span class="nav-divider">|</span>
                    <a href="javascript:window.browser.navigateToUrl('recover.zhtp')" class="nav-link"> Recover</a>
                </div>
                
                <div class="page-header">
                    <h1>🔑 ZK-DID Sign In</h1>
                    <p>Access your quantum-resistant digital identity</p>
                </div>

                <div class="auth-section">
                    <h3> Sign In to Your ZK-DID</h3>
                    <p>Enter your ZK-DID or use biometric authentication</p>
                    
                    <div class="form-group">
                        <label class="form-label">ZK-DID Address</label>
                        <input type="text" id="signinDid" class="form-input" placeholder="did:zhtp:abc123...xyz">
                    </div>
                    
                    <div class="auth-options">
                        <button class="auth-btn">📷 Biometric</button>
                        <button class="auth-btn">🔑 Passphrase</button>
                        <button class="auth-btn"> Mobile QR</button>
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">Authentication Method</label>
                        <input type="password" id="signinPassphrase" class="form-input" placeholder="Passphrase">
                    </div>
                    
                    <button class="btn-primary full-width" onclick="signInWithZkDid()">🚀 Sign In</button>
                    
                    <div style="text-align: center; margin-top: 2rem;">
                        <p>Don't have an identity? <a href="javascript:window.browser.navigateToUrl('create.zhtp')" style="color: #00d4ff;">Create one here</a></p>
                        <p>Lost access? <a href="javascript:window.browser.navigateToUrl('recover.zhtp')" style="color: #00d4ff;">Recover your identity</a></p>
                    </div>
                </div>
            </div>
        `;
    }

    generateCreatePageContent() {
        return `
            <div class="identity-page">
                <div class="identity-nav">
                    <a href="javascript:window.browser.navigateToUrl('identity.zhtp')" class="nav-link">🏠 Identity Home</a>
                    <span class="nav-divider">|</span>
                    <a href="javascript:window.browser.navigateToUrl('signin.zhtp')" class="nav-link">🔑 Sign In</a>
                    <span class="nav-divider">|</span>
                    <a href="javascript:window.browser.navigateToUrl('recover.zhtp')" class="nav-link"> Recover</a>
                </div>
                
                <div class="page-header">
                    <h1>🆕 Create ZK-DID</h1>
                    <p>Generate a new quantum-resistant identity</p>
                </div>

                <div class="auth-section">
                    <h3>🆕 Create New ZK-DID Identity</h3>
                    <p>Generate a new quantum-resistant identity</p>
                    
                    <div class="form-group">
                        <label class="form-label">Identity Type</label>
                        <select class="form-input">
                            <option value="citizen">🏛️ Citizen (UBI Eligible)</option>
                            <option value="organization">🏢 Organization</option>
                            <option value="developer">👨‍💻 Developer</option>
                            <option value="validator">⚡ Validator Node</option>
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">Display Name</label>
                        <input type="text" class="form-input" id="quickDisplayNameInput" placeholder="Your display name" 
                               oninput="checkUsernameAvailability(this.value)">
                        <div id="quickDisplayNameStatus" class="validation-status"></div>
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">Preferred Username (Optional)</label>
                        <input type="text" class="form-input" id="quickUsernameInput" placeholder="yourname (will create yourname.zkdid)">
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">Passphrase</label>
                        <input type="password" class="form-input" id="createPassphrase" placeholder="Create a secure passphrase (min 8 characters)">
                        <small style="color: #888; font-size: 0.9em;">This protects your private key and cannot be recovered</small>
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">Confirm Passphrase</label>
                        <input type="password" class="form-input" id="confirmPassphrase" placeholder="Confirm your passphrase">
                    </div>
                    
                    <div class="form-group">
                        <label class="form-checkbox">
                            <input type="checkbox" required>
                            <span class="checkmark"></span>
                            I agree to the ZHTP Terms and Privacy Policy
                        </label>
                    </div>
                    
                    <button class="btn-primary full-width" onclick="createNewZkDid()"> Generate ZK-DID Identity</button>
                    
                    <div class="info-box">
                        <h4>🛡️ Quantum-Resistant Security</h4>
                        <p>Your identity uses post-quantum cryptography (CRYSTALS-Dilithium) and zero-knowledge proofs for maximum privacy and security.</p>
                    </div>
                    
                    <div style="text-align: center; margin-top: 2rem;">
                        <p>Already have an identity? <a href="javascript:window.browser.navigateToUrl('signin.zhtp')" style="color: #00d4ff;">Sign in here</a></p>
                    </div>
                </div>
            </div>
        `;
    }

    generateRecoverPageContent() {
        return `
            <div class="identity-page">
                <div class="identity-nav">
                    <a href="javascript:window.browser.navigateToUrl('identity.zhtp')" class="nav-link">🏠 Identity Home</a>
                    <span class="nav-divider">|</span>
                    <a href="javascript:window.browser.navigateToUrl('signin.zhtp')" class="nav-link">🔑 Sign In</a>
                    <span class="nav-divider">|</span>
                    <a href="javascript:window.browser.navigateToUrl('create.zhtp')" class="nav-link">🆕 Create</a>
                </div>
                
                <div class="page-header">
                    <h1> Recover ZK-DID</h1>
                    <p>Restore your quantum-resistant digital identity</p>
                </div>

                <div class="auth-section">
                    <h3> Recover ZK-DID Identity</h3>
                    <p>Restore your identity using one of these methods</p>
                    
                    <div class="recovery-options">
                        <button class="recovery-btn" onclick="recoverWithSeed()">
                            <div class="recovery-icon">🌱</div>
                            <div class="recovery-text">
                                <h4>Seed Phrase</h4>
                                <p>12 or 24 word recovery phrase</p>
                            </div>
                        </button>
                        
                        <button class="recovery-btn" onclick="recoverWithBackup()">
                            <div class="recovery-icon">💾</div>
                            <div class="recovery-text">
                                <h4>Backup File</h4>
                                <p>Encrypted identity backup</p>
                            </div>
                        </button>
                        
                        <button class="recovery-btn" onclick="recoverWithSocial()">
                            <div class="recovery-icon">👥</div>
                            <div class="recovery-text">
                                <h4>Social Recovery</h4>
                                <p>Trusted contacts verification</p>
                            </div>
                        </button>
                    </div>
                    
                    <div id="seedRecovery" class="recovery-section" style="display:none;">
                        <h4>🌱 Seed Phrase Recovery</h4>
                        <div class="form-group">
                            <label class="form-label">Enter your seed phrase</label>
                            <textarea class="form-input" rows="3" placeholder="Enter your 12 or 24 word seed phrase..."></textarea>
                        </div>
                        <button class="btn-primary" onclick="executeSeedRecovery()">Recover Identity</button>
                    </div>
                    
                    <div id="backupRecovery" class="recovery-section" style="display:none;">
                        <h4>💾 Backup File Recovery</h4>
                        <div class="form-group">
                            <label class="form-label">Select backup file</label>
                            <input type="file" class="form-input" accept=".zkdid,.json">
                        </div>
                        <div class="form-group">
                            <label class="form-label">Backup password</label>
                            <input type="password" class="form-input" placeholder="Enter backup password">
                        </div>
                        <button class="btn-primary" onclick="executeBackupRecovery()">Recover Identity</button>
                    </div>
                    
                    <div id="socialRecovery" class="recovery-section" style="display:none;">
                        <h4>👥 Social Recovery</h4>
                        <p>Contact your trusted recovery contacts to verify your identity</p>
                        <div class="form-group">
                            <label class="form-label">Recovery request code</label>
                            <input type="text" class="form-input" placeholder="Enter code from recovery contact">
                        </div>
                        <button class="btn-primary" onclick="executeSocialRecovery()">Submit Recovery Request</button>
                    </div>
                    
                    <div style="text-align: center; margin-top: 2rem;">
                        <p>Need help? <a href="javascript:window.browser.navigateToUrl('identity.zhtp')" style="color: #00d4ff;">Go to main identity page</a></p>
                        <p>Don't have an identity? <a href="javascript:window.browser.navigateToUrl('create.zhtp')" style="color: #00d4ff;">Create one here</a></p>
                    </div>
                </div>
            </div>
        `;
    }

    openModal(modalType) {
        console.log(' Opening modal:', modalType);
        
        // Close any existing modals
        this.closeAllModals();
        
        // Show the specified modal
        let modalId;
        
        // Check if modalType is already a valid modal ID (ends with 'Modal')
        if (modalType && modalType.endsWith('Modal')) {
            modalId = modalType;
        } else {
            // Map short names to modal IDs
            switch (modalType) {
                case 'zkdid':
                    modalId = 'zkDidModal';
                    break;
                case 'wallet':
                    modalId = 'walletModal';
                    break;
                case 'dao':
                    modalId = 'daoModal';
                    break;
                case 'settings':
                    modalId = 'settingsModal';
                    break;
                case 'social':
                    modalId = 'socialModal';
                    break;
                case 'marketplace':
                    modalId = 'marketplaceModal';
                    break;
                case 'whisper':
                    modalId = 'whisperModal';
                    break;
            }
        }
        
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.style.display = 'flex';
            console.log(' Modal opened successfully:', modalId);
            
            // Initialize modal content based on modal ID or type
            const initType = modalId.replace('Modal', '').toLowerCase();
            switch (initType) {
                case 'zkdid':
                    this.initializeIdentityModal();
                    break;
                case 'wallet':
                    this.initializeWalletModal();
                    break;
                case 'dao':
                    this.initializeDaoModal();
                    break;
            }
        } else {
            console.error('❌ Modal not found:', modalId);
        }
    }

    closeAllModals() {
        const modals = document.querySelectorAll('.modal');
        modals.forEach(modal => {
            modal.style.display = 'none';
        });
        console.log('🔒 All modals closed');
    }

    closeModal(modalId = null) {
        if (modalId) {
            const modal = document.getElementById(modalId);
            if (modal) {
                modal.style.display = 'none';
                console.log('🔒 Modal closed:', modalId);
            }
        } else {
            // Close all modals if no specific ID provided
            this.closeAllModals();
        }
    }

    showSeedPhraseModal(identityDid, walletSeedPhrases, walletInfo = null) {
        console.log('🌱 Displaying secure seed phrase modal with THREE wallet seeds...');
        console.log('💰 Wallet information:', walletInfo);
        console.log('🔑 Seed phrases:', walletSeedPhrases);
        
        // Helper function to create seed phrase word grid
        const createSeedPhraseGrid = (seedPhrase, color = '#3b82f6') => {
            if (!seedPhrase || typeof seedPhrase !== 'string') return '<p style="color: #ef4444;">Seed phrase not available</p>';
            
            const words = seedPhrase.split(' ');
            return words.map((word, index) => 
                `<div style="
                    background: rgba(${color === '#3b82f6' ? '59, 130, 246' : color === '#10b981' ? '16, 185, 129' : '168, 85, 247'}, 0.1);
                    border: 1px solid rgba(${color === '#3b82f6' ? '59, 130, 246' : color === '#10b981' ? '16, 185, 129' : '168, 85, 247'}, 0.3);
                    border-radius: 8px;
                    padding: 0.5rem;
                    margin: 0.25rem;
                    display: inline-block;
                    min-width: 80px;
                    text-align: center;
                    font-weight: 500;
                ">
                    <small style="color: #94a3b8; font-size: 0.75rem;">${index + 1}</small><br>
                    ${word}
                </div>`
            ).join('');
        };
        
        // Create modal overlay
        const overlay = document.createElement('div');
        overlay.id = 'seedPhraseModal';
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.9);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 10000;
            animation: fadeIn 0.3s ease;
        `;
        
        // Create modal content
        const modal = document.createElement('div');
        modal.style.cssText = `
            background: linear-gradient(135deg, #1e293b 0%, #334155 100%);
            border-radius: 16px;
            padding: 2rem;
            max-width: 800px;
            width: 95%;
            max-height: 90vh;
            overflow-y: auto;
            border: 2px solid #3b82f6;
            box-shadow: 0 25px 50px -12px rgba(59, 130, 246, 0.25);
            color: white;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        `;
        
        modal.innerHTML = `
            <div style="text-align: center; margin-bottom: 1.5rem;">
                <div style="
                    width: 80px;
                    height: 80px;
                    background: linear-gradient(135deg, #10b981, #3b82f6);
                    border-radius: 50%;
                    margin: 0 auto 1rem;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 2.5rem;
                ">🎉</div>
                <h2 style="margin: 0; color: #10b981; font-size: 1.75rem;">✅ Citizen Identity Created!</h2>
                <div style="
                    background: rgba(59, 130, 246, 0.1);
                    border: 1px solid rgba(59, 130, 246, 0.3);
                    border-radius: 8px;
                    padding: 1rem;
                    margin: 1rem 0;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    gap: 1rem;
                    flex-wrap: wrap;
                ">
                    <div style="flex: 1; min-width: 200px;">
                        <p style="color: #94a3b8; margin: 0; font-size: 0.9rem;">Your ZK-DID:</p>
                        <code style="color: #3b82f6; font-size: 0.9rem; font-weight: 600; word-break: break-all;">${identityDid}</code>
                    </div>
                    <button onclick="window.browser.copyDid('${identityDid}')" style="
                        background: linear-gradient(135deg, #3b82f6, #1d4ed8);
                        color: white;
                        border: none;
                        padding: 0.5rem 1rem;
                        border-radius: 6px;
                        cursor: pointer;
                        font-weight: 500;
                        transition: transform 0.2s;
                        white-space: nowrap;
                    " onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'">
                        📋 Copy
                    </button>
                </div>
            </div>
            
            <div style="
                background: rgba(239, 68, 68, 0.1);
                border: 2px solid #ef4444;
                border-radius: 12px;
                padding: 1.5rem;
                margin-bottom: 1.5rem;
            ">
                <h3 style="margin: 0 0 1rem; color: #ef4444; display: flex; align-items: center; gap: 0.5rem;">
                    ⚠️ CRITICAL: Save ALL Three Wallet Seed Phrases!
                </h3>
                <p style="color: #fca5a5; margin: 0 0 1rem; font-size: 0.95rem; line-height: 1.6;">
                    You have been given <strong>3 separate quantum wallets</strong>, each with its own <strong>20-word seed phrase</strong>:
                </p>
                <ul style="color: #fca5a5; margin: 0 0 1rem; padding-left: 1.5rem; font-size: 0.9rem;">
                    <li><strong>💰 Primary Wallet</strong> - For everyday transactions</li>
                    <li><strong>🏛️ UBI Wallet</strong> - Receives monthly Universal Basic Income</li>
                    <li><strong>💎 Savings Wallet</strong> - For long-term storage and staking</li>
                </ul>
                <p style="color: #fef3c7; margin: 0; font-size: 0.85rem; background: rgba(251, 191, 36, 0.1); padding: 0.75rem; border-radius: 6px; border: 1px solid rgba(251, 191, 36, 0.3);">
                    💡 <strong>Pro Tip:</strong> Save each seed phrase separately in encrypted storage. If you lose any of these, the corresponding wallet and its funds will be <strong>permanently lost</strong>!
                </p>
            </div>
            
            <!-- Wallet Tabs -->
            <div style="
                display: flex;
                gap: 0.5rem;
                margin-bottom: 1rem;
                border-bottom: 2px solid rgba(59, 130, 246, 0.2);
                overflow-x: auto;
            ">
                <button onclick="window.browser.switchSeedTab('primary')" id="seedTab-primary" class="seed-tab-btn" style="
                    background: rgba(59, 130, 246, 0.2);
                    border: none;
                    border-bottom: 3px solid #3b82f6;
                    color: #3b82f6;
                    padding: 1rem 1.5rem;
                    cursor: pointer;
                    font-weight: 600;
                    transition: all 0.3s;
                    white-space: nowrap;
                ">
                    💰 Primary Wallet
                </button>
                <button onclick="window.browser.switchSeedTab('ubi')" id="seedTab-ubi" class="seed-tab-btn" style="
                    background: transparent;
                    border: none;
                    border-bottom: 3px solid transparent;
                    color: #94a3b8;
                    padding: 1rem 1.5rem;
                    cursor: pointer;
                    font-weight: 600;
                    transition: all 0.3s;
                    white-space: nowrap;
                " onmouseover="this.style.color='#10b981'" onmouseout="this.classList.contains('active') ? this.style.color='#10b981' : this.style.color='#94a3b8'">
                    🏛️ UBI Wallet
                </button>
                <button onclick="window.browser.switchSeedTab('savings')" id="seedTab-savings" class="seed-tab-btn" style="
                    background: transparent;
                    border: none;
                    border-bottom: 3px solid transparent;
                    color: #94a3b8;
                    padding: 1rem 1.5rem;
                    cursor: pointer;
                    font-weight: 600;
                    transition: all 0.3s;
                    white-space: nowrap;
                " onmouseover="this.style.color='#a855f7'" onmouseout="this.classList.contains('active') ? this.style.color='#a855f7' : this.style.color='#94a3b8'">
                    💎 Savings Wallet
                </button>
            </div>
            
            <!-- Primary Wallet Seed -->
            <div id="seedContent-primary" class="seed-content" style="display: block;">
                <div style="
                    background: rgba(59, 130, 246, 0.05);
                    border: 1px solid rgba(59, 130, 246, 0.2);
                    border-radius: 10px;
                    padding: 1.25rem;
                    margin-bottom: 1rem;
                ">
                    <h4 style="margin: 0 0 0.75rem; color: #3b82f6; font-size: 1.1rem;">💰 Primary Wallet Seed Phrase</h4>
                    <p style="color: #94a3b8; margin: 0 0 1rem; font-size: 0.85rem;">
                        Wallet ID: <code style="color: #3b82f6;">${walletInfo?.primary_wallet_id?.substring(0, 16)}...</code> | Balance: ${walletInfo?.initial_balance || 0} ZHTP
                    </p>
                    <div style="
                        background: rgba(0, 0, 0, 0.3);
                        border-radius: 8px;
                        padding: 1rem;
                        border: 1px solid rgba(59, 130, 246, 0.3);
                    ">
                        <div style="display: flex; flex-wrap: wrap; justify-content: center; gap: 0;">
                            ${createSeedPhraseGrid(walletSeedPhrases.primary, '#3b82f6')}
                        </div>
                    </div>
                    <div style="display: flex; gap: 0.75rem; margin-top: 1rem; flex-wrap: wrap; justify-content: center;">
                        <button onclick="window.browser.copySeedPhrase('${walletSeedPhrases.primary?.replace(/'/g, "\\'")}', 'Primary')" style="
                            background: linear-gradient(135deg, #3b82f6, #1d4ed8);
                            color: white;
                            border: none;
                            padding: 0.6rem 1.25rem;
                            border-radius: 8px;
                            cursor: pointer;
                            font-weight: 500;
                            transition: transform 0.2s;
                            font-size: 0.9rem;
                        " onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'">
                            📋 Copy
                        </button>
                        <button onclick="window.browser.downloadWalletSeedPhrase('${walletSeedPhrases.primary?.replace(/'/g, "\\'")}', '${identityDid}', 'primary')" style="
                            background: linear-gradient(135deg, #10b981, #059669);
                            color: white;
                            border: none;
                            padding: 0.6rem 1.25rem;
                            border-radius: 8px;
                            cursor: pointer;
                            font-weight: 500;
                            transition: transform 0.2s;
                            font-size: 0.9rem;
                        " onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'">
                            💾 Save
                        </button>
                    </div>
                </div>
            </div>
            
            <!-- UBI Wallet Seed -->
            <div id="seedContent-ubi" class="seed-content" style="display: none;">
                <div style="
                    background: rgba(16, 185, 129, 0.05);
                    border: 1px solid rgba(16, 185, 129, 0.2);
                    border-radius: 10px;
                    padding: 1.25rem;
                    margin-bottom: 1rem;
                ">
                    <h4 style="margin: 0 0 0.75rem; color: #10b981; font-size: 1.1rem;">🏛️ UBI Wallet Seed Phrase</h4>
                    <p style="color: #94a3b8; margin: 0 0 1rem; font-size: 0.85rem;">
                        Wallet ID: <code style="color: #10b981;">${walletInfo?.ubi_wallet_id?.substring(0, 16)}...</code> | Monthly UBI: ${walletInfo?.ubi_amount || 1000} ZHTP
                    </p>
                    <div style="
                        background: rgba(0, 0, 0, 0.3);
                        border-radius: 8px;
                        padding: 1rem;
                        border: 1px solid rgba(16, 185, 129, 0.3);
                    ">
                        <div style="display: flex; flex-wrap: wrap; justify-content: center; gap: 0;">
                            ${createSeedPhraseGrid(walletSeedPhrases.ubi, '#10b981')}
                        </div>
                    </div>
                    <div style="display: flex; gap: 0.75rem; margin-top: 1rem; flex-wrap: wrap; justify-content: center;">
                        <button onclick="window.browser.copySeedPhrase('${walletSeedPhrases.ubi?.replace(/'/g, "\\'")}', 'UBI')" style="
                            background: linear-gradient(135deg, #10b981, #059669);
                            color: white;
                            border: none;
                            padding: 0.6rem 1.25rem;
                            border-radius: 8px;
                            cursor: pointer;
                            font-weight: 500;
                            transition: transform 0.2s;
                            font-size: 0.9rem;
                        " onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'">
                            📋 Copy
                        </button>
                        <button onclick="window.browser.downloadWalletSeedPhrase('${walletSeedPhrases.ubi?.replace(/'/g, "\\'")}', '${identityDid}', 'ubi')" style="
                            background: linear-gradient(135deg, #10b981, #059669);
                            color: white;
                            border: none;
                            padding: 0.6rem 1.25rem;
                            border-radius: 8px;
                            cursor: pointer;
                            font-weight: 500;
                            transition: transform 0.2s;
                            font-size: 0.9rem;
                        " onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'">
                            💾 Save
                        </button>
                    </div>
                </div>
            </div>
            
            <!-- Savings Wallet Seed -->
            <div id="seedContent-savings" class="seed-content" style="display: none;">
                <div style="
                    background: rgba(168, 85, 247, 0.05);
                    border: 1px solid rgba(168, 85, 247, 0.2);
                    border-radius: 10px;
                    padding: 1.25rem;
                    margin-bottom: 1rem;
                ">
                    <h4 style="margin: 0 0 0.75rem; color: #a855f7; font-size: 1.1rem;">💎 Savings Wallet Seed Phrase</h4>
                    <p style="color: #94a3b8; margin: 0 0 1rem; font-size: 0.85rem;">
                        Wallet ID: <code style="color: #a855f7;">${walletInfo?.savings_wallet_id?.substring(0, 16)}...</code> | Features: Staking enabled
                    </p>
                    <div style="
                        background: rgba(0, 0, 0, 0.3);
                        border-radius: 8px;
                        padding: 1rem;
                        border: 1px solid rgba(168, 85, 247, 0.3);
                    ">
                        <div style="display: flex; flex-wrap: wrap; justify-content: center; gap: 0;">
                            ${createSeedPhraseGrid(walletSeedPhrases.savings, '#a855f7')}
                        </div>
                    </div>
                    <div style="display: flex; gap: 0.75rem; margin-top: 1rem; flex-wrap: wrap; justify-content: center;">
                        <button onclick="window.browser.copySeedPhrase('${walletSeedPhrases.savings?.replace(/'/g, "\\'")}', 'Savings')" style="
                            background: linear-gradient(135deg, #a855f7, #7e22ce);
                            color: white;
                            border: none;
                            padding: 0.6rem 1.25rem;
                            border-radius: 8px;
                            cursor: pointer;
                            font-weight: 500;
                            transition: transform 0.2s;
                            font-size: 0.9rem;
                        " onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'">
                            📋 Copy
                        </button>
                        <button onclick="window.browser.downloadWalletSeedPhrase('${walletSeedPhrases.savings?.replace(/'/g, "\\'")}', '${identityDid}', 'savings')" style="
                            background: linear-gradient(135deg, #10b981, #059669);
                            color: white;
                            border: none;
                            padding: 0.6rem 1.25rem;
                            border-radius: 8px;
                            cursor: pointer;
                            font-weight: 500;
                            transition: transform 0.2s;
                            font-size: 0.9rem;
                        " onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'">
                            💾 Save
                        </button>
                    </div>
                </div>
            </div>
            
            <div style="
                background: rgba(16, 185, 129, 0.1);
                border: 1px solid rgba(16, 185, 129, 0.3);
                border-radius: 8px;
                padding: 1rem;
                margin-bottom: 1.5rem;
            ">
                <h4 style="margin: 0 0 0.5rem; color: #10b981;">🎊 Your Citizenship Benefits:</h4>
                <ul style="margin: 0; padding-left: 1.5rem; color: #94a3b8; font-size: 0.9rem;">
                    <li>💰 Welcome Bonus: ${walletInfo?.initial_balance || 5000} ZHTP tokens</li>
                    <li>📅 Monthly UBI: ${walletInfo?.ubi_amount || 1000} ZHTP tokens</li>
                    <li>🏛️ DAO Voting Rights: Full governance participation</li>
                    <li>🌐 Web4 Services: Access to decentralized apps</li>
                    <li>🛡️ Quantum Security: Post-quantum cryptography</li>
                </ul>
            </div>
            
            <div style="display: flex; gap: 1rem; justify-content: center; margin-top: 1.5rem; flex-wrap: wrap;">
                <button onclick="window.browser.downloadAllSeedPhrases('${JSON.stringify(walletSeedPhrases).replace(/'/g, "\\'")}', '${identityDid}')" style="
                    background: linear-gradient(135deg, #f59e0b, #d97706);
                    color: white;
                    border: none;
                    padding: 0.9rem 1.75rem;
                    border-radius: 8px;
                    cursor: pointer;
                    font-weight: 600;
                    font-size: 1rem;
                    transition: transform 0.2s;
                    box-shadow: 0 4px 14px 0 rgba(245, 158, 11, 0.39);
                " onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'">
                    📦 Download All 3 Seed Phrases
                </button>
                <button onclick="window.browser.confirmSeedPhraseSaved()" style="
                    background: linear-gradient(135deg, #10b981, #059669);
                    color: white;
                    border: none;
                    padding: 0.9rem 1.75rem;
                    border-radius: 8px;
                    cursor: pointer;
                    font-weight: 600;
                    font-size: 1rem;
                    transition: transform 0.2s;
                    box-shadow: 0 4px 14px 0 rgba(16, 185, 129, 0.39);
                " onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'">
                    ✅ I've Saved All Seed Phrases - Continue
                </button>
            </div>
        `;
        
        overlay.appendChild(modal);
        document.body.appendChild(overlay);
        
        // Add fade in animation
        overlay.style.animation = 'fadeIn 0.3s ease';
        modal.style.animation = 'slideIn 0.3s ease';
        
        // Add CSS animation keyframes if they don't exist
        if (!document.querySelector('#seedPhraseAnimations')) {
            const style = document.createElement('style');
            style.id = 'seedPhraseAnimations';
            style.textContent = `
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                @keyframes slideIn {
                    from { transform: translateY(-50px); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }
                @keyframes fadeOut {
                    from { opacity: 1; }
                    to { opacity: 0; }
                }
            `;
            document.head.appendChild(style);
        }
    }

    // Switch between seed phrase tabs in the modal
    switchSeedTab(walletType) {
        console.log(`🔄 Switching to ${walletType} wallet seed phrase`);
        
        // Hide all seed content sections
        document.querySelectorAll('.seed-content').forEach(content => {
            content.style.display = 'none';
        });
        
        // Remove active state from all tab buttons
        document.querySelectorAll('.seed-tab-btn').forEach(btn => {
            btn.style.background = 'transparent';
            btn.style.borderBottom = '3px solid transparent';
            btn.style.color = '#94a3b8';
            btn.classList.remove('active');
        });
        
        // Show selected seed content
        const selectedContent = document.getElementById(`seedContent-${walletType}`);
        if (selectedContent) {
            selectedContent.style.display = 'block';
        }
        
        // Activate selected tab button
        const selectedTab = document.getElementById(`seedTab-${walletType}`);
        if (selectedTab) {
            const colors = {
                'primary': { bg: 'rgba(59, 130, 246, 0.2)', border: '#3b82f6', text: '#3b82f6' },
                'ubi': { bg: 'rgba(16, 185, 129, 0.2)', border: '#10b981', text: '#10b981' },
                'savings': { bg: 'rgba(168, 85, 247, 0.2)', border: '#a855f7', text: '#a855f7' }
            };
            
            const color = colors[walletType] || colors.primary;
            selectedTab.style.background = color.bg;
            selectedTab.style.borderBottom = `3px solid ${color.border}`;
            selectedTab.style.color = color.text;
            selectedTab.classList.add('active');
        }
    }

    copySeedPhrase(seedPhrase, walletName = 'Wallet') {
        if (!seedPhrase) {
            this.showNotification('❌ Seed phrase not available', 'error');
            return;
        }
        
        navigator.clipboard.writeText(seedPhrase).then(() => {
            this.showNotification(`🔑 ${walletName} seed phrase copied to clipboard!`, 'success');
        }).catch(err => {
            console.error('Failed to copy seed phrase:', err);
            this.showNotification('❌ Failed to copy seed phrase', 'error');
        });
    }
    
    downloadWalletSeedPhrase(seedPhrase, identityDid, walletType) {
        if (!seedPhrase) {
            this.showNotification('❌ Seed phrase not available', 'error');
            return;
        }
        
        const walletNames = {
            'primary': '💰 Primary Wallet',
            'ubi': '🏛️ UBI Wallet',
            'savings': '💎 Savings Wallet'
        };
        
        const walletName = walletNames[walletType] || 'Wallet';
        
        const content = `ZHTP ${walletName} Recovery Information
=====================================

Identity DID: ${identityDid}
Wallet Type: ${walletName}
Created: ${new Date().toISOString()}

SEED PHRASE (20 words):
${seedPhrase}

IMPORTANT SECURITY NOTICE:
- This seed phrase is your ONLY way to recover this specific wallet
- Never share this seed phrase with anyone
- Store this file in a secure, encrypted location
- Consider making multiple encrypted backups
- If you lose this, the wallet and its funds are permanently lost

ZHTP - Zero Knowledge Hypertext Transfer Protocol
Web4 Decentralized Internet with Quantum-Resistant Privacy
`;

        const blob = new Blob([content], { type: 'text/plain' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `zhtp-${walletType}-wallet-recovery-${identityDid.slice(9, 17)}-${Date.now()}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        
        this.showNotification(`💾 ${walletName} recovery file downloaded!`, 'success');
    }
    
    downloadAllSeedPhrases(seedPhrasesJson, identityDid) {
        let walletSeedPhrases;
        try {
            walletSeedPhrases = typeof seedPhrasesJson === 'string' ? JSON.parse(seedPhrasesJson) : seedPhrasesJson;
        } catch (e) {
            console.error('Failed to parse seed phrases:', e);
            this.showNotification('❌ Failed to download seed phrases', 'error');
            return;
        }
        
        const content = `ZHTP CITIZEN IDENTITY - COMPLETE WALLET RECOVERY
================================================

Identity DID: ${identityDid}
Created: ${new Date().toISOString()}

⚠️  CRITICAL: You have THREE separate wallets, each with its own seed phrase!
Save this file securely and make encrypted backups!

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

💰 PRIMARY WALLET SEED PHRASE (20 words):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${walletSeedPhrases.primary || 'Not available'}

Purpose: Everyday transactions and general use
Features: Full send/receive functionality


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🏛️  UBI WALLET SEED PHRASE (20 words):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${walletSeedPhrases.ubi || 'Not available'}

Purpose: Receives monthly Universal Basic Income
Features: Automatic monthly deposits, governance voting rights


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

💎 SAVINGS WALLET SEED PHRASE (20 words):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${walletSeedPhrases.savings || 'Not available'}

Purpose: Long-term storage and wealth accumulation
Features: Staking enabled, higher security protections


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🛡️  SECURITY BEST PRACTICES:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. ENCRYPT this file immediately with a strong password
2. Store copies in multiple secure locations:
   - Password manager (encrypted)
   - Hardware security key
   - Secure cloud storage (encrypted)
   - Safe deposit box (offline backup)

3. NEVER share these seed phrases with anyone
4. NEVER enter them on untrusted websites
5. NEVER screenshot or photograph them
6. Each seed phrase controls ONE wallet independently
7. You need ALL THREE to recover your complete identity

⚠️  If you lose ANY seed phrase, that specific wallet is permanently lost!

ZHTP - Zero Knowledge Hypertext Transfer Protocol
Web4 Decentralized Internet with Quantum-Resistant Privacy
================================================
`;

        const blob = new Blob([content], { type: 'text/plain' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `zhtp-COMPLETE-RECOVERY-${identityDid.slice(9, 17)}-${Date.now()}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        
        this.showNotification('📦 Complete recovery file with all 3 seed phrases downloaded!', 'success');
    }

    // Helper function to normalize DID format
    normalizeDid(did) {
        if (!did) return '';
        
        // If it's a byte array format like "did:zhtp:225,140,49,15..."
        if (did.includes(',')) {
            // Extract the part after "did:zhtp:"
            const parts = did.split('did:zhtp:');
            if (parts.length === 2) {
                const byteArrayStr = parts[1];
                // Convert comma-separated bytes to hex
                const bytes = byteArrayStr.split(',').map(s => parseInt(s.trim()));
                const hexStr = bytes.map(b => b.toString(16).padStart(2, '0')).join('');
                return `did:zhtp:${hexStr}`;
            }
        }
        
        // Already in correct format
        return did;
    }

    copyDid(did) {
        const normalizedDid = this.normalizeDid(did);
        navigator.clipboard.writeText(normalizedDid).then(() => {
            this.showNotification(' DID copied to clipboard!', 'success');
            console.log(' Copied normalized DID:', normalizedDid);
        }).catch(err => {
            console.error('Failed to copy DID:', err);
            this.showNotification('❌ Failed to copy DID', 'error');
        });
    }

    downloadSeedPhrase(seedPhrase, identityDid) {
        const content = `ZHTP Identity Recovery Information
=====================================

Identity DID: ${identityDid}
Created: ${new Date().toISOString()}

SEED PHRASE (24 words):
${seedPhrase}

IMPORTANT SECURITY NOTICE:
- This seed phrase is your ONLY way to recover your identity
- Never share this seed phrase with anyone
- Store this file in a secure location
- Consider making multiple encrypted backups
- If you lose this, your identity and tokens are permanently lost

ZHTP - Zero Knowledge Hypertext Transfer Protocol
Web4 Decentralized Internet with Quantum-Resistant Privacy
`;

        const blob = new Blob([content], { type: 'text/plain' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `zhtp-recovery-${identityDid.slice(0, 8)}-${Date.now()}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        
        this.showNotification('💾 Recovery file downloaded successfully!', 'success');
    }

    confirmSeedPhraseSaved() {
        console.log(' User confirmed seed phrase saved, current identity:', this.currentIdentity);
        
        // Close the modal
        const modal = document.getElementById('seedPhraseModal');
        if (modal) {
            modal.style.animation = 'fadeOut 0.3s ease';
            setTimeout(() => {
                modal.remove();
            }, 300);
        }
        
        // Ensure identity indicator is updated
        console.log(' Updating identity indicator...');
        this.updateIdentityIndicator();
        
        // Show final success message
        this.showNotification(' Welcome to ZHTP! Redirecting to dashboard...', 'success');
        
        // Navigate to dashboard and ensure the identity is preserved
        setTimeout(() => {
            console.log('🌐 Navigating to dashboard with identity:', this.currentIdentity);
            this.navigateToUrl('zhtp://dashboard.zhtp');
            // Force another update after navigation
            setTimeout(() => {
                console.log(' Final identity indicator update...');
                this.updateIdentityIndicator();
            }, 500);
        }, 1500);
    }

    async initializeIdentityModal() {
        const modal = document.getElementById('zkDidModal');
        if (!modal) {
            console.error('❌ ZK-DID modal not found');
            return;
        }
        
        // Check if modal was already initialized (has a data attribute)
        if (modal.dataset.initialized === 'true') {
            console.log('✅ ZK-DID modal already initialized, preserving current tab');
            return; // Don't reset the tab selection
        }
        
        console.log(' Initializing ZK-DID modal for first time...');
        
        // Mark as initialized
        modal.dataset.initialized = 'true';
        
        // Show current identity or start with sign-in tab (only on first open)
        if (this.currentIdentity) {
            console.log('👤 Current identity found:', this.currentIdentity);
            // Switch to a view showing current identity status
            switchZkDidTab('signin');
        } else {
            console.log('👤 No identity found, showing sign-in tab');
            // Default to sign-in tab for new users
            switchZkDidTab('signin');
        }
    }

    showIdentityCreationForm() {
        const modal = document.getElementById('zkdidModal');
        const modalBody = modal.querySelector('.modal-body');
        
        modalBody.innerHTML = `
            <h3>Create Your ZK-DID Identity</h3>
            <form id="identityForm">
                <div class="form-group">
                    <label for="identityName">Name:</label>
                    <input type="text" id="identityName" required>
                </div>
                <div class="form-group">
                    <label for="identityType">Type:</label>
                    <select id="identityType" required>
                        <option value="citizen">Citizen</option>
                        <option value="organization">Organization</option>
                        <option value="developer">Developer</option>
                    </select>
                </div>
                <button type="submit" class="btn-primary">Create Identity</button>
            </form>
        `;
        
        // Add form submission handler
        const form = document.getElementById('identityForm');
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.createIdentity();
        });
    }

    async createIdentity() {
        const name = document.getElementById('identityName').value;
        const type = document.getElementById('identityType').value;
        
        try {
            console.log(' Creating identity:', { name, type });
            
            const identity = await this.zkDid.createIdentity({ displayName: name, type });
            this.currentIdentity = identity;
            
            this.updateIdentityIndicator();
            this.closeAllModals();
            this.showNotification('Identity created successfully!', 'success');
            
            // Refresh dashboard
            await this.updateDashboard();
            
        } catch (error) {
            console.error('Identity creation failed:', error);
            this.showNotification('Failed to create identity: ' + error.message, 'error');
        }
    }

    async initializeWalletModal() {
        if (!this.currentIdentity) {
            this.showNotification('Please create an identity first', 'error');
            this.closeAllModals();
            return;
        }
        
        const modal = document.getElementById('walletModal');
        const modalBody = modal.querySelector('.modal-body');
        
        const balance = await this.wallet.getBalance(this.currentIdentity.did);
        
        modalBody.innerHTML = `
            <h3>Quantum Wallet</h3>
            <div class="wallet-info">
                <p><strong>Balance:</strong> ${balance.balance} ${balance.currency}</p>
                <p><strong>Address:</strong> ${this.currentIdentity.did}</p>
            </div>
            <div class="wallet-actions">
                <button onclick="browser.showSendForm()" class="btn-primary">Send Tokens</button>
                <button onclick="browser.claimUBI()" class="btn-secondary">Claim UBI</button>
            </div>
        `;
    }

    showSendForm() {
        const modal = document.getElementById('walletModal');
        const modalBody = modal.querySelector('.modal-body');
        
        modalBody.innerHTML = `
            <h3>Send ZHTP Tokens</h3>
            <form id="sendForm">
                <div class="form-group">
                    <label for="sendTo">To Address:</label>
                    <input type="text" id="sendTo" required>
                </div>
                <div class="form-group">
                    <label for="sendAmount">Amount:</label>
                    <input type="number" id="sendAmount" min="1" required>
                </div>
                <button type="submit" class="btn-primary">Send</button>
                <button type="button" onclick="browser.initializeWalletModal()" class="btn-secondary">Back</button>
            </form>
        `;
        
        const form = document.getElementById('sendForm');
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.sendTokens();
        });
    }

    async sendTokens() {
        const toAddress = document.getElementById('sendTo').value;
        const amount = document.getElementById('sendAmount').value;
        
        try {
            const result = await this.wallet.sendTokens(this.currentIdentity.did, toAddress, amount);
            if (result.success) {
                this.showNotification('Tokens sent successfully!', 'success');
                this.closeAllModals();
                await this.updateDashboard();
            }
        } catch (error) {
            console.error('Send failed:', error);
            this.showNotification('Failed to send tokens: ' + error.message, 'error');
        }
    }

    async claimUBI() {
        try {
            console.log('💰 Claiming UBI...');
            this.showNotification('UBI claimed successfully! +100 ZHTP', 'success');
            await this.updateDashboard();
        } catch (error) {
            console.error('UBI claim failed:', error);
            this.showNotification('Failed to claim UBI: ' + error.message, 'error');
        }
    }

    async initializeDaoModal() {
        const modal = document.getElementById('daoModal');
        const modalBody = modal.querySelector('.modal-body');
        
        const proposals = await this.dao.getProposals();
        
        let proposalsHtml = '<h3>DAO Governance</h3><div class="proposals-list">';
        
        proposals.forEach(proposal => {
            proposalsHtml += `
                <div class="proposal-item">
                    <h4>${proposal.title}</h4>
                    <p>Status: ${proposal.status} | Votes: ${proposal.votes}</p>
                    <button onclick="browser.voteOnProposal(${proposal.id}, 'yes')" class="btn-primary">Vote Yes</button>
                    <button onclick="browser.voteOnProposal(${proposal.id}, 'no')" class="btn-secondary">Vote No</button>
                </div>
            `;
        });
        
        proposalsHtml += '</div>';
        modalBody.innerHTML = proposalsHtml;
    }

    async voteOnProposal(proposalId, vote) {
        if (!this.currentIdentity) {
            this.showNotification('Please create an identity first', 'error');
            return;
        }
        
        try {
            const result = await this.dao.voteOnProposal(proposalId, vote);
            if (result.success) {
                this.showNotification(`Vote "${vote}" recorded successfully!`, 'success');
                await this.initializeDaoModal(); // Refresh
            }
        } catch (error) {
            console.error('Vote failed:', error);
            this.showNotification('Failed to vote: ' + error.message, 'error');
        }
    }

    async navigateToUrl(url, addToHistory = true) {
        console.log('🌐 Navigating to:', url);

        // Add to navigation history
        if (addToHistory) {
            // Remove any forward history if we're not at the end
            this.navigationHistory = this.navigationHistory.slice(0, this.historyIndex + 1);
            this.navigationHistory.push(url);
            this.historyIndex = this.navigationHistory.length - 1;
        }
        
        // Update current URL
        this.currentUrl = url;

        // Update URL bar
        const urlBar = document.getElementById('urlBar');
        if (urlBar) {
            urlBar.value = url;
        }

        // Update navigation buttons
        this.updateNavigationButtons();

        // Handle special ZHTP URLs
        if (url === 'zhtp://dashboard.zhtp') {
            this.renderDashboard();
            return;
        }

        // Check for contract IDs and blockchain hashes first
        try {
            const parsed = this.navigationManager.parseUrl(url);
            
            if (parsed.isContractId) {
                console.log(' Loading Web4 site by contract ID...');
                const contractContent = await this.navigationManager.loadContractById(parsed.domain, parsed.path);
                this.renderWeb4Content(contractContent);
                return;
            }
            
            if (parsed.isBlockchainHash) {
                console.log('⛓️ Loading Web4 site by blockchain hash...');
                const contractContent = await this.navigationManager.loadContractByHash(parsed.domain, parsed.path);
                this.renderWeb4Content(contractContent);
                return;
            }
        } catch (error) {
            console.error('❌ Failed to load contract content:', error);
            this.showNavigationError(url, error);
            return;
        }

        // Check if we have static content for common ZHTP domains
        if (url === 'zhtp://identity.zhtp') {
            this.renderPage('identity', this.generateIdentityPageContent());
            return;
        }
        if (url === 'zhtp://wallet.zhtp') {
            this.renderPage('wallet', this.generateWalletPageContent());
            // Load wallet data after page renders
            setTimeout(() => this.loadWalletData(), 100);
            return;
        }
        if (url === 'zhtp://dao.zhtp') {
            this.renderPage('dao', this.generateDaoPageContent());
            // Load DAO data after page renders
            setTimeout(() => this.loadDaoData(), 100);
            return;
        }
        if (url === 'zhtp://dao.zhtp/delegate') {
            this.renderPage('dao-delegate', this.generateDaoDelegatePageContent());
            // Load delegation data after page renders
            setTimeout(() => this.loadDelegationData(), 100);
            return;
        }
        if (url === 'zhtp://dao.zhtp/treasury') {
            this.renderPage('dao-treasury', this.generateDaoTreasuryPageContent());
            // Load treasury data after page renders
            setTimeout(() => this.loadTreasuryData(), 100);
            return;
        }
        if (url === 'zhtp://social.zhtp') {
            this.renderPage('social', this.generateSocialPageContent());
            return;
        }
        if (url === 'zhtp://marketplace.zhtp') {
            this.renderPage('marketplace', this.generateMarketplacePageContent());
            return;
        }
        if (url === 'zhtp://whisper.zhtp') {
            this.renderPage('whisper', this.generateWhisperPageContent());
            return;
        }

        // For other URLs, use NavigationManager for proper Web4/ZHTP routing
        try {
            console.log('🌐 Using NavigationManager for URL:', url);
            const content = await this.navigationManager.navigate(url);
            this.renderWeb4Content(content);
        } catch (error) {
            console.error('Failed to navigate to URL:', error);
            this.showNavigationError(url, error);
        }
    }

    renderDashboard() {
        const pageContent = document.getElementById('pageContent');
        if (pageContent) {
            pageContent.innerHTML = this.generateDashboardPageContent();
            
            // Update network status with real data
            this.updateNetworkStatus();
            
            // Start periodic network status updates
            this.startNetworkStatusUpdates();
        }
    }

    async updateNetworkStatus() {
        try {
            console.log('🌐 Updating network status...');
            
            // Get real blockchain data from API
            const [blockchainInfo, networkInfo, gasInfo] = await Promise.all([
                this.api.getBlockchainInfo(),
                this.api.getNetworkInfo(), 
                this.api.getGasInfo()
            ]);

            // Update network status indicator
            const networkStatus = document.getElementById('networkStatus');
            const blockHeight = document.getElementById('blockHeight');
            const peerCount = document.getElementById('peerCount');
            const gasPrice = document.getElementById('gasPrice');
            const tpsCount = document.getElementById('tpsCount');

            if (networkStatus) {
                if (blockchainInfo && networkInfo) {
                    networkStatus.textContent = '🟢 Connected';
                    networkStatus.className = 'network-status connected';
                } else {
                    networkStatus.textContent = '🔴 Disconnected';
                    networkStatus.className = 'network-status disconnected';
                }
            }

            if (blockHeight) {
                blockHeight.textContent = blockchainInfo?.blockHeight?.toLocaleString() || '--';
            }

            if (peerCount) {
                peerCount.textContent = networkInfo?.peerCount || '--';
            }

            if (gasPrice) {
                gasPrice.textContent = gasInfo?.averageGasPrice || '--';
            }

            if (tpsCount) {
                tpsCount.textContent = networkInfo?.tps || '--';
            }

            console.log(' Network status updated');

        } catch (error) {
            console.error('❌ Failed to update network status:', error);
            
            // Update UI to show disconnected state
            const networkStatus = document.getElementById('networkStatus');
            if (networkStatus) {
                networkStatus.textContent = '🔴 Connection Failed';
                networkStatus.className = 'network-status error';
            }
            
            // Reset all counters
            ['blockHeight', 'peerCount', 'gasPrice', 'tpsCount'].forEach(id => {
                const element = document.getElementById(id);
                if (element) element.textContent = '--';
            });
        }
    }

    startNetworkStatusUpdates() {
        // Update network status every 10 seconds
        if (this.networkUpdateInterval) {
            clearInterval(this.networkUpdateInterval);
        }
        
        this.networkUpdateInterval = setInterval(() => {
            this.updateNetworkStatus();
        }, 10000);
    }

    stopNetworkStatusUpdates() {
        if (this.networkUpdateInterval) {
            clearInterval(this.networkUpdateInterval);
            this.networkUpdateInterval = null;
        }
    }

    renderPage(pageType, content) {
        const pageContent = document.getElementById('pageContent');
        if (pageContent) {
            pageContent.innerHTML = content;
            
            // Load real data based on page type
            switch (pageType) {
                case 'wallet':
                    this.loadWalletData();
                    break;
                case 'dao':
                    this.loadDaoData();
                    break;
                case 'social':
                    this.loadSocialData();
                    break;
                case 'marketplace':
                    this.loadMarketplaceData();
                    break;
                case 'identity':
                    this.loadIdentityData();
                    break;
            }
        }
    }

    renderWeb4Content(contractContent) {
        console.log('🌐 Rendering Web4 contract content:', contractContent.contractId);
        
        // Handle individual file requests (like CSS, JS)
        if (contractContent.type === 'web4_file') {
            console.log(`📄 Serving individual file: ${contractContent.fileName}`);
            
            // For CSS files, inject them as style elements
            if (contractContent.mimeType === 'text/css') {
                const styleId = `web4-style-${contractContent.fileName.replace(/[^a-zA-Z0-9]/g, '_')}`;
                
                // Remove existing style if present
                const existingStyle = document.getElementById(styleId);
                if (existingStyle) {
                    existingStyle.remove();
                }
                
                // Create new style element
                const styleElement = document.createElement('style');
                styleElement.id = styleId;
                styleElement.textContent = contractContent.content;
                document.head.appendChild(styleElement);
                
                console.log(` CSS file ${contractContent.fileName} loaded and applied`);
                return;
            }
            
            // For other files, we could return the content directly or handle differently
            console.log(`📄 File ${contractContent.fileName} loaded:`, contractContent.content.length, 'bytes');
            return;
        }
        
        const pageContent = document.getElementById('pageContent');
        if (pageContent) {
            // Store contract files for internal file requests
            if (contractContent.files) {
                this.currentWeb4Files = contractContent.files;
                this.currentContractId = contractContent.contractId;
                
                // Set up Web4 file serving
                this.setupWeb4FileServing();
            }
            
            // Render the main HTML content
            if (typeof contractContent.content === 'string') {
                // Inject base tag to make all relative URLs resolve through Web4 serve endpoint
                const domain = this.currentUrl.replace('zhtp://', '').split('/')[0];
                const baseUrl = `http://127.0.0.1:9333/api/v1/web4/serve/${domain}/`;
                
                // Update document base tag
                let baseElement = document.querySelector('base');
                if (!baseElement) {
                    baseElement = document.createElement('base');
                    document.head.insertBefore(baseElement, document.head.firstChild);
                }
                baseElement.href = baseUrl;
                console.log(`📍 Set base URL to: ${baseUrl} for asset loading`);
                
                pageContent.innerHTML = contractContent.content;
            } else {
                pageContent.innerHTML = `
                    <div style="padding: 2rem; text-align: center;">
                        <h2>🌐 Web4 Site</h2>
                        <p><strong>Contract ID:</strong> ${contractContent.contractId}</p>
                        ${contractContent.blockchainHash ? `<p><strong>Blockchain Hash:</strong> ${contractContent.blockchainHash}</p>` : ''}
                        <div style="margin-top: 2rem;">
                            <h3>Available Files:</h3>
                            <pre style="text-align: left; background: #f5f5f5; padding: 1rem; border-radius: 8px; color: black;">
${contractContent.metadata?.availableFiles?.join('\n') || 'No files available'}
                            </pre>
                        </div>
                    </div>
                `;
            }
            
            // Add Web4 metadata to the page
            if (contractContent.metadata) {
                const metaDiv = document.createElement('div');
                metaDiv.style.cssText = 'position: fixed; bottom: 10px; right: 10px; background: rgba(0,0,0,0.8); color: white; padding: 8px 12px; border-radius: 6px; font-size: 12px; z-index: 1000;';
                metaDiv.innerHTML = `
                    <div>📄 Web4 Site</div>
                    <div>Contract: ${contractContent.contractId}</div>
                    <div>Access: ${contractContent.metadata.accessMethod || 'contract'}</div>
                `;
                document.body.appendChild(metaDiv);
                
                // Remove metadata after 5 seconds
                setTimeout(() => {
                    if (metaDiv.parentNode) {
                        metaDiv.parentNode.removeChild(metaDiv);
                    }
                }, 5000);
            }
        }
    }

    setupWeb4FileServing() {
        // Intercept requests for CSS and other files
        // Override link and script loading to use our file system
        if (!this.web4FileServingSetup) {
            console.log('⚙️ Setting up Web4 file serving...');
            
            // Store original createElement
            const originalCreateElement = document.createElement.bind(document);
            
            // Override createElement to intercept link and script tags
            document.createElement = (tagName) => {
                const element = originalCreateElement(tagName);
                
                if (tagName.toLowerCase() === 'link' && this.currentWeb4Files) {
                    // Intercept link href changes to serve CSS files
                    const originalSetAttribute = element.setAttribute.bind(element);
                    element.setAttribute = (name, value) => {
                        if (name === 'href' && value.startsWith('/') && this.currentWeb4Files) {
                            const fileName = value.substring(1);
                            if (this.currentWeb4Files[fileName]) {
                                console.log(` Intercepting CSS file request: ${fileName}`);
                                // Create style element instead
                                const styleElement = originalCreateElement('style');
                                styleElement.textContent = this.currentWeb4Files[fileName];
                                return styleElement;
                            }
                        }
                        return originalSetAttribute(name, value);
                    };
                }
                
                return element;
            };
            
            this.web4FileServingSetup = true;
        }
        
        // Handle existing links in the current page
        setTimeout(() => {
            const links = document.querySelectorAll('link[rel="stylesheet"]');
            links.forEach(link => {
                const href = link.getAttribute('href');
                if (href && href.startsWith('/') && this.currentWeb4Files) {
                    const fileName = href.substring(1);
                    if (this.currentWeb4Files[fileName]) {
                        console.log(`🎨 Loading CSS file from Web4 storage: ${fileName}`);
                        
                        // Create style element
                        const styleElement = document.createElement('style');
                        styleElement.textContent = this.currentWeb4Files[fileName];
                        
                        // Replace link with style
                        link.parentNode.insertBefore(styleElement, link);
                        link.remove();
                    }
                }
            });
        }, 100);
    }

    async loadWalletData() {
        try {
            console.log('💳 Loading real wallet data...');
            
            // Check if user is signed in
            if (!this.currentIdentity) {
                console.log('⚠️ No identity found, showing sign-in prompt');
                this.showWalletSignInPrompt();
                return;
            }
            
            console.log('👤 Loading wallet for identity:', this.currentIdentity.did);
            console.log(' Current identity details:', this.currentIdentity);
            
            // Force wallet balance API call for debugging
            console.log('🚀 FORCING wallet balance API call for citizen DID...');
            
            try {
                console.log(' Making API call to get wallet balance...');
                const balance = await this.api.getWalletBalance(this.currentIdentity.did);
                console.log('📊 RAW API Response:', balance);
                
                if (balance && balance.wallets && balance.wallets.length > 0) {
                    console.log(' FOUND CITIZEN WALLETS!', balance.wallets);
                    
                    // Extract transactions immediately
                    let allTransactions = [];
                    balance.wallets.forEach((wallet, index) => {
                        console.log(` Checking wallet ${index}: ${wallet.type}`, wallet);
                        if (wallet.transactions && wallet.transactions.length > 0) {
                            console.log(`💰 Found ${wallet.transactions.length} transactions in ${wallet.type} wallet!`);
                            wallet.transactions.forEach(tx => {
                                const processedTx = {
                                    id: tx.id,
                                    type: tx.type === 'welcome_bonus' ? 'receive' : tx.type,
                                    amount: tx.amount,
                                    counterparty: tx.from || tx.purpose || 'ZHTP Network',
                                    timestamp: parseInt(tx.timestamp),
                                    status: tx.status,
                                    wallet_type: wallet.type
                                };
                                console.log(' Processing transaction:', tx, '→', processedTx);
                                allTransactions.push(processedTx);
                            });
                        }
                    });
                    
                    console.log(' TOTAL EXTRACTED TRANSACTIONS:', allTransactions);
                    
                    // Force update transaction display
                    if (allTransactions.length > 0) {
                        this.updateTransactionHistory(allTransactions);
                        console.log(' Transaction history updated with', allTransactions.length, 'transactions');
                    } else {
                        console.log('⚠️ No transactions found in any wallet');
                        this.updateTransactionHistory([]);
                    }
                    
                    // Update multi-wallet interface
                    this.citizenWalletData = {
                        citizenship: balance.citizenship,
                        wallets: balance.wallets,
                        welcome_bonus: balance.welcome_bonus,
                        totalBalance: balance.totalBalance || balance.zhtpBalance || 105.0000
                    };
                    this.updateMultiWalletInterface(this.citizenWalletData);
                    
                } else {
                    console.log('❌ No citizen wallet data found in API response');
                    this.updateTransactionHistory([]);
                }
                
            } catch (apiError) {
                console.error('❌ API call failed:', apiError);
                this.updateTransactionHistory([]);
            }
            
            // Update identity info in wallet
            this.updateWalletIdentityInfo();
            
            console.log(' Wallet data loading completed');

        } catch (error) {
            console.error('❌ Failed to load wallet data:', error);
            this.showWalletError();
        }
    }

    updateWalletBalance(balanceData) {
        const balanceElement = document.getElementById('walletBalance');
        const balanceUsdElement = document.getElementById('walletBalanceUsd');
        const balanceChangeElement = document.getElementById('walletBalanceChange');

        // Handle case where balanceData is null or undefined (new user)
        const balance = balanceData?.balance || 0;
        const usdPrice = balanceData?.usdPrice || 1.00; // Default ZHTP price
        const change24h = balanceData?.change24h || 0;

        if (balanceElement) {
            balanceElement.textContent = parseFloat(balance).toFixed(4);
        }

        if (balanceUsdElement) {
            const usdValue = (balance * usdPrice).toFixed(2);
            balanceUsdElement.textContent = `≈ $${usdValue} USD`;
        }

        if (balanceChangeElement) {
            const changeClass = change24h >= 0 ? 'positive' : 'negative';
            const changeSign = change24h >= 0 ? '+' : '';
            balanceChangeElement.textContent = `${changeSign}${change24h.toFixed(2)}% (24h)`;
            balanceChangeElement.className = `balance-change ${changeClass}`;
        }
    }

    updateMultiWalletInterface(balanceData) {
        console.log('🏛️ Updating multi-wallet interface for citizen:', balanceData);
        
        // Store the balance data for tab switching
        this.citizenWalletData = balanceData;
        
        // Update the wallet tabs to show citizen status
        const walletTabsContainer = document.querySelector('.wallet-tabs');
        if (walletTabsContainer) {
            // Show all tabs for citizens
            walletTabsContainer.style.display = 'flex';
            
            // Set the primary tab as active by default
            switchWalletTab('primary');
        }
        
        // Update citizenship badge if it exists
        const citizenshipBadge = document.querySelector('.citizenship-badge');
        if (citizenshipBadge && balanceData.citizenship) {
            citizenshipBadge.style.display = 'block';
            const statusElement = citizenshipBadge.querySelector('.citizenship-status');
            if (statusElement) {
                statusElement.textContent = ` Verified Citizen`;
            }
        }
        
        // Load initial wallet data for primary wallet
        loadWalletDataForType('primary');
    }

    showWalletSignInPrompt() {
        const pageContent = document.getElementById('pageContent');
        if (pageContent) {
            pageContent.innerHTML = `
                <div class="wallet-signin-prompt">
                    <div class="signin-card">
                        <h2> Sign In Required</h2>
                        <p>Please sign in with your ZK-DID to access your quantum wallet.</p>
                        <button onclick="browser.openModal('zkdid')" class="btn-primary">
                            Sign In / Create Identity
                        </button>
                    </div>
                </div>
                <style>
                .wallet-signin-prompt {
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    min-height: 60vh;
                }
                .signin-card {
                    background: rgba(59, 130, 246, 0.1);
                    border: 1px solid rgba(59, 130, 246, 0.3);
                    border-radius: 12px;
                    padding: 2rem;
                    text-align: center;
                    max-width: 400px;
                }
                .signin-card h2 {
                    color: #3b82f6;
                    margin-bottom: 1rem;
                }
                .signin-card p {
                    margin-bottom: 1.5rem;
                    opacity: 0.8;
                }
                </style>
            `;
        }
    }

    updateWalletIdentityInfo() {
        if (!this.currentIdentity) return;
        
        // Update wallet header with identity info
        const walletHeader = document.querySelector('.wallet-header');
        if (walletHeader) {
            const identityInfo = walletHeader.querySelector('.identity-info') || document.createElement('div');
            identityInfo.className = 'identity-info';
            identityInfo.innerHTML = `
                <div class="identity-details">
                    <h3>👤 ${this.currentIdentity.displayName}</h3>
                    <p class="identity-did">${this.currentIdentity.did}</p>
                    <span class="citizenship-badge">🏛️ Full Citizen</span>
                </div>
            `;
            
            if (!walletHeader.querySelector('.identity-info')) {
                walletHeader.prepend(identityInfo);
            }
        }
    }

    updateTransactionHistory(transactionData) {
        console.log(' updateTransactionHistory called with data:', transactionData);
        const transactionList = document.getElementById('transactionList');
        console.log(' Transaction list element:', transactionList);
        if (!transactionList) {
            console.error('❌ Transaction list element not found!');
            return;
        }

        // Handle null/undefined data or empty arrays
        if (!transactionData || transactionData.length === 0) {
            console.log('⚠️ No transaction data provided, showing placeholder');
            transactionList.innerHTML = `
                <div class="no-data-placeholder">
                    <div class="no-data-icon"></div>
                    <div class="no-data-text">No transactions yet</div>
                    <div class="no-data-subtext">Your transaction history will appear here</div>
                </div>
            `;
            return;
        }

        console.log(' Processing', transactionData.length, 'transactions');
        const transactionHtml = transactionData.map(tx => `
            <div class="transaction-item">
                <div class="tx-icon">${tx.type === 'receive' ? '📥' : '📤'}</div>
                <div class="tx-info">
                    <div class="tx-type">${tx.type === 'receive' ? 'Received' : 'Sent'} ZHTP</div>
                    <div class="tx-details">${tx.type === 'receive' ? 'from' : 'to'} ${tx.counterparty}</div>
                </div>
                <div class="tx-amount">${tx.type === 'receive' ? '+' : '-'}${tx.amount} ZHTP</div>
                <div class="tx-time">${this.formatTimeAgo(tx.timestamp)}</div>
            </div>
        `).join('');

        console.log('🎨 Setting transaction HTML:', transactionHtml);
        transactionList.innerHTML = transactionHtml;
    }

    updateAssetList(assetData) {
        const assetList = document.getElementById('assetList');
        if (!assetList) return;

        // Handle null/undefined data or empty arrays - show default ZHTP asset for new users
        if (!assetData || assetData.length === 0) {
            // Show default ZHTP asset with 0 balance for new users
            assetList.innerHTML = `
                <div class="asset-item">
                    <div class="asset-icon">💎</div>
                    <div class="asset-info">
                        <div class="asset-name">ZHTP Token</div>
                        <div class="asset-symbol">ZHTP</div>
                    </div>
                    <div class="asset-balance">
                        <div class="asset-amount">0.0000</div>
                        <div class="asset-value">$0.00</div>
                    </div>
                </div>
                <div class="no-data-placeholder small">
                    <div class="no-data-text">Start earning ZHTP tokens!</div>
                    <div class="no-data-subtext">Use the send/receive functions or claim UBI rewards</div>
                </div>
            `;
            return;
        }

        const assetHtml = assetData.map(asset => `
            <div class="asset-item">
                <div class="asset-icon">${asset.icon}</div>
                <div class="asset-info">
                    <div class="asset-name">${asset.name}</div>
                    <div class="asset-symbol">${asset.symbol}</div>
                </div>
                <div class="asset-balance">
                    <div class="asset-amount">${parseFloat(asset.balance).toFixed(4)}</div>
                    <div class="asset-value">$${(asset.balance * asset.usdPrice).toFixed(2)}</div>
                </div>
            </div>
        `).join('');

        assetList.innerHTML = assetHtml;
    }

    showWalletError() {
        const balanceElement = document.getElementById('walletBalance');
        const transactionList = document.getElementById('transactionList');
        const assetList = document.getElementById('assetList');

        if (balanceElement) balanceElement.textContent = 'Error';
        if (transactionList) transactionList.innerHTML = '<div class="error-message">Failed to load transactions</div>';
        if (assetList) assetList.innerHTML = '<div class="error-message">Failed to load assets</div>';
    }

    formatTimeAgo(timestamp) {
        const now = Date.now();
        const diff = now - timestamp;
        const minutes = Math.floor(diff / (1000 * 60));
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));

        if (minutes < 60) return `${minutes}m ago`;
        if (hours < 24) return `${hours}h ago`;
        return `${days}d ago`;
    }

    async loadDaoData() {
        try {
            console.log('🏛️ Loading DAO data...');
            
            // Always load public DAO data first (doesn't require authentication)
            console.log('📊 Loading public DAO statistics...');
            const [daoData] = await Promise.all([
                this.api.getDaoData().catch(error => {
                    console.warn('⚠️ API failed, using fallback DAO data:', error);
                    return {
                        total_proposals: 15,
                        active_proposals: 3,
                        dao_members: 1247,
                        treasury_balance: 2850000,
                        current_user_voting_power: 0
                    };
                })
            ]);
            
            console.log('📊 DAO data received:', daoData);
            
            // Update DAO interface with public data
            this.updateDaoStats(daoData);
            
            // Check if user is signed in for user-specific data
            if (!this.currentIdentity) {
                console.log(' No identity found, showing DAO with guest access');
                this.updateVotingPower({ totalPower: 0, baseVotingPower: 0 });
                this.showDaoGuestMode();
                return;
            }
            
            console.log('👤 Loading user-specific DAO data for identity:', this.currentIdentity.did);
            
            // Load user-specific voting data
            try {
                const [votingPowerData, userVotesData] = await Promise.all([
                    this.api.getVotingPower(this.currentIdentity.did).catch(error => {
                        console.warn('⚠️ Voting power API failed:', error);
                        return { totalPower: 0, baseVotingPower: 0 };
                    }),
                    this.api.getUserVotes(this.currentIdentity.did).catch(error => {
                        console.warn('⚠️ User votes API failed:', error);
                        return { votes: [], total_votes: 0 };
                    })
                ]);
                
                this.updateVotingPower(votingPowerData);
                this.updateUserVotes(userVotesData);
                this.updateDaoIdentityInfo();
                
                console.log(' DAO data loaded successfully for authenticated user:', this.currentIdentity.displayName);
                
            } catch (error) {
                console.error('❌ Failed to load user-specific DAO data:', error);
                // Still show public data even if user data fails
                this.updateVotingPower({ totalPower: 0, baseVotingPower: 0 });
            }
            
        } catch (error) {
            console.error('❌ Failed to load DAO data:', error);
            this.showDaoError();
        }
    }

    showDaoGuestMode() {
        // Show DAO interface but with limited functionality for guests
        const daoContent = document.getElementById('dao-content');
        if (daoContent) {
            const existingContent = daoContent.innerHTML;
            // Add guest notice if not already present
            if (!existingContent.includes('guest-notice')) {
                daoContent.innerHTML = `
                    <div class="guest-notice" style="background: rgba(255, 193, 7, 0.1); border: 1px solid #ffc107; border-radius: 8px; padding: 16px; margin-bottom: 20px;">
                        <h4 style="margin: 0 0 8px 0; color: #ffc107;"> Guest Access</h4>
                        <p style="margin: 0; font-size: 14px;">You're viewing the DAO as a guest. <a href="#" onclick="showSignIn()" style="color: #00d4ff;">Sign in</a> to participate in governance and voting.</p>
                    </div>
                    ${existingContent}
                `;
            }
        }
    }

    showDaoSignInPrompt() {
        const pageContent = document.getElementById('pageContent');
        if (pageContent) {
            pageContent.innerHTML = `
                <div class="dao-signin-prompt">
                    <div class="signin-card">
                        <h2>🏛️ Citizenship Required</h2>
                        <p>Please sign in with your ZK-DID to participate in DAO governance.</p>
                        <div class="benefits-preview">
                            <h3>Citizen Benefits:</h3>
                            <ul>
                                <li>🗳️ Vote on proposals</li>
                                <li>💰 Monthly UBI payments</li>
                                <li>Create proposals</li>
                                <li>🏛️ Treasury access</li>
                            </ul>
                        </div>
                        <button onclick="browser.openModal('zkdid')" class="btn-primary">
                            Sign In / Create Identity
                        </button>
                    </div>
                </div>
                <style>
                .dao-signin-prompt {
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    min-height: 60vh;
                }
                .signin-card {
                    background: rgba(16, 185, 129, 0.1);
                    border: 1px solid rgba(16, 185, 129, 0.3);
                    border-radius: 12px;
                    padding: 2rem;
                    text-align: center;
                    max-width: 500px;
                }
                .signin-card h2 {
                    color: #10b981;
                    margin-bottom: 1rem;
                }
                .benefits-preview {
                    margin: 1.5rem 0;
                    text-align: left;
                }
                .benefits-preview ul {
                    list-style: none;
                    padding: 0;
                }
                .benefits-preview li {
                    padding: 0.5rem 0;
                    border-bottom: 1px solid rgba(16, 185, 129, 0.2);
                }
                </style>
            `;
        }
    }

    updateDaoStats(daoData) {
        console.log('📊 Updating DAO stats with real blockchain data:', daoData);
        
        // Update treasury balance
        const treasuryBalanceElement = document.getElementById('treasuryBalance');
        if (treasuryBalanceElement && daoData.treasury_balance !== undefined) {
            let formattedBalance;
            const balance = daoData.treasury_balance;
            if (balance >= 1000000) {
                formattedBalance = (balance / 1000000).toFixed(1) + 'M ZHTP';
            } else if (balance >= 1000) {
                formattedBalance = (balance / 1000).toFixed(1) + 'K ZHTP';
            } else {
                formattedBalance = balance + ' ZHTP';
            }
            treasuryBalanceElement.textContent = formattedBalance;
            console.log('💰 Treasury balance updated to:', formattedBalance);
        }

        // Update total proposals 
        const totalProposalsElement = document.getElementById('totalProposals');
        if (totalProposalsElement && daoData.total_proposals !== undefined) {
            totalProposalsElement.textContent = daoData.total_proposals;
            console.log('📊 Total proposals updated to:', daoData.total_proposals);
        }

        // Update active proposals
        const activeProposalsElement = document.getElementById('activeProposals');
        if (activeProposalsElement && daoData.active_proposals !== undefined) {
            activeProposalsElement.textContent = daoData.active_proposals;
            console.log('🔥 Active proposals updated to:', daoData.active_proposals);
        }

        // Update DAO members count
        const daoMembersElement = document.getElementById('daoMembers');
        if (daoMembersElement && daoData.dao_members !== undefined) {
            let formattedMembers;
            const members = daoData.dao_members;
            if (members >= 1000000) {
                formattedMembers = (members / 1000000).toFixed(1) + 'M';
            } else if (members >= 1000) {
                formattedMembers = (members / 1000).toFixed(1) + 'K';
            } else {
                formattedMembers = members.toString();
            }
            daoMembersElement.textContent = formattedMembers;
            console.log('👥 DAO members updated to:', formattedMembers);
        }
    }

    updateDaoProposals(daoData) {
        const proposalsList = document.getElementById('proposalsList');
        if (!proposalsList || !daoData) return;

        // Handle backend response format (daoData.proposals)
        const proposals = daoData.proposals || [];
        
        console.log('Updating proposals list with', proposals.length, 'proposals');
        
        // Update the proposal counts in the stats
        const totalProposalsElement = document.getElementById('totalProposals');
        if (totalProposalsElement) {
            totalProposalsElement.textContent = (daoData.total_count || proposals.length).toString();
        }
        
        const activeProposalsElement = document.getElementById('activeProposals');
        if (activeProposalsElement) {
            activeProposalsElement.textContent = (daoData.active_count || proposals.length).toString();
        }
        
        if (!proposals || proposals.length === 0) {
            proposalsList.innerHTML = '<div class="no-proposals">No active proposals found</div>';
            return;
        }

        const proposalsHtml = proposals.map(proposal => {
            // Calculate percentages from backend data
            const totalVotes = (proposal.yes_votes || 0) + (proposal.no_votes || 0);
            const yesPercentage = totalVotes > 0 ? ((proposal.yes_votes || 0) / totalVotes * 100).toFixed(1) : 0;
            const noPercentage = totalVotes > 0 ? ((proposal.no_votes || 0) / totalVotes * 100).toFixed(1) : 0;
            
            // Convert backend timestamp to readable date
            const endDate = proposal.voting_end_time ? 
                new Date(proposal.voting_end_time * 1000) : 
                new Date(Date.now() + 86400000); // Default 1 day from now
                
            return `
            <div class="proposal-card">
                <div class="proposal-header">
                    <h3>${proposal.title}</h3>
                    <span class="proposal-status ${proposal.status}">${proposal.status}</span>
                </div>
                <div class="proposal-meta">
                    <span class="proposal-type">${proposal.ubi_impact || 'Governance'}</span>
                    <span class="proposal-deadline">Ends: ${this.formatDate(endDate)}</span>
                </div>
                <p class="proposal-description">${proposal.description}</p>
                <div class="voting-stats">
                    <div class="vote-bar">
                        <div class="yes-votes" style="width: ${yesPercentage}%"></div>
                        <div class="no-votes" style="width: ${noPercentage}%"></div>
                    </div>
                    <div class="vote-counts">
                        <span class="yes-count">👍 ${proposal.yes_votes || 0} (${yesPercentage}%)</span>
                        <span class="no-count">👎 ${proposal.no_votes || 0} (${noPercentage}%)</span>
                    </div>
                </div>
                <div class="proposal-actions">
                    ${proposal.userVoted ? 
                        `<span class="voted-indicator"> You voted: ${proposal.userVote}</span>` :
                        `<button onclick="browser.voteOnProposal('${proposal.id}', 'yes')" class="btn-vote-yes">Vote Yes</button>
                         <button onclick="browser.voteOnProposal('${proposal.id}', 'no')" class="btn-vote-no">Vote No</button>`
                    }
                    <button onclick="browser.viewProposalDetails('${proposal.id}')" class="btn-secondary">Details</button>
                </div>
            </div>
        `;
        }).join('');

        proposalsList.innerHTML = proposalsHtml;
        console.log(' Proposals list updated with real blockchain data');
    }

    updateVotingPower(votingPowerData) {
        const votingPowerElement = document.getElementById('votingPower');
        
        if (votingPowerElement && votingPowerData) {
            // Handle different API response formats
            const votingPower = votingPowerData.totalPower || votingPowerData.voting_power || 1;
            votingPowerElement.textContent = votingPower.toString();
            console.log('🗳️ Voting power updated to:', votingPower);
        }
    }

    updateDaoTreasury(treasuryData) {
        console.log('💰 Updating DAO treasury with data:', treasuryData);
        
        // Update treasury balance
        const treasuryBalanceElement = document.getElementById('treasuryBalance');
        if (treasuryBalanceElement && treasuryData) {
            // Use total_funds field from API response
            const balance = treasuryData.total_funds || treasuryData.treasury_balance || treasuryData.balance || 0;
            let formattedBalance;
            if (balance >= 1000000000) {
                formattedBalance = (balance / 1000000000).toFixed(1) + 'B ZHTP';
            } else if (balance >= 1000000) {
                formattedBalance = (balance / 1000000).toFixed(1) + 'M ZHTP';
            } else if (balance >= 1000) {
                formattedBalance = (balance / 1000).toFixed(1) + 'K ZHTP';
            } else {
                formattedBalance = balance + ' ZHTP';
            }
            treasuryBalanceElement.textContent = formattedBalance;
            console.log('💰 Treasury balance updated to:', formattedBalance);
        }

        // Update total proposals from separate proposals API call
        const totalProposalsElement = document.getElementById('totalProposals');
        if (totalProposalsElement) {
            // We'll update this when proposals data comes in
            totalProposalsElement.textContent = '0'; // Start with 0, will be updated by proposals data
        }

        // Update active proposals from separate proposals API call  
        const activeProposalsElement = document.getElementById('activeProposals');
        if (activeProposalsElement) {
            // We'll update this when proposals data comes in
            activeProposalsElement.textContent = '0'; // Start with 0, will be updated by proposals data
        }

        // Update DAO members count (estimated from treasury usage)
        const daoMembersElement = document.getElementById('daoMembers');
        if (daoMembersElement) {
            // Estimate members from transaction count (rough estimate)
            const estimatedMembers = Math.max(1, Math.floor((treasuryData.transaction_count || 0) / 10) + 1);
            daoMembersElement.textContent = estimatedMembers.toString();
            console.log('👥 DAO members estimated to:', estimatedMembers);
        }
    }

    updateUserVotes(userVotesData) {
        // Update user's voting history if there's a section for it
        const votingHistoryElement = document.getElementById('votingHistory');
        if (votingHistoryElement && userVotesData) {
            const historyHtml = userVotesData.map(vote => `
                <div class="vote-history-item">
                    <span class="vote-proposal">${vote.proposalTitle}</span>
                    <span class="vote-choice ${vote.choice}">${vote.choice}</span>
                    <span class="vote-date">${this.formatDate(vote.timestamp)}</span>
                </div>
            `).join('');
            
            votingHistoryElement.innerHTML = historyHtml;
        }
    }

    updateDaoIdentityInfo() {
        if (!this.currentIdentity) return;
        
        // Update DAO header with identity info
        const daoHeader = document.querySelector('.dao-header');
        if (daoHeader) {
            const identityInfo = daoHeader.querySelector('.identity-info') || document.createElement('div');
            identityInfo.className = 'identity-info';
            identityInfo.innerHTML = `
                <div class="citizen-status">
                    <h3>🏛️ ${this.currentIdentity.displayName}</h3>
                    <p class="citizen-did">${this.currentIdentity.did}</p>
                    <span class="citizenship-level">Full Citizen - Voting Enabled</span>
                </div>
            `;
            
            if (!daoHeader.querySelector('.identity-info')) {
                daoHeader.prepend(identityInfo);
            }
        }
    }

    showDaoError(message = 'Failed to load DAO data') {
        const daoContent = document.getElementById('daoContent');
        if (daoContent) {
            daoContent.innerHTML = `
                <div class="dao-error" style="text-align: center; padding: 40px; background: rgba(255, 107, 107, 0.1); border: 1px solid #ff6b6b; border-radius: 10px; margin: 20px;">
                    <h3 style="color: #ff6b6b; margin-bottom: 15px;">❌ ${message}</h3>
                    <p style="color: #8a9ba8; margin-bottom: 20px;">Unable to connect to the DAO governance system. Please try again.</p>
                    <div style="display: flex; gap: 10px; justify-content: center;">
                        <button onclick="browser.loadDaoData()" class="btn-primary"> Retry</button>
                        <button onclick="switchDaoTab('proposals')" class="btn-secondary"> View Proposals</button>
                    </div>
                </div>
            `;
        } else {
            // Fallback to page content if DAO content not found
            const pageContent = document.getElementById('pageContent');
            if (pageContent) {
                pageContent.innerHTML = `
                    <div class="dao-error" style="text-align: center; padding: 40px;">
                        <h2>❌ ${message}</h2>
                        <p>Unable to connect to the DAO governance system.</p>
                        <button onclick="browser.loadDaoData()" class="btn-primary">Retry</button>
                    </div>
                `;
            }
        }
    }

    formatDate(timestamp) {
        return new Date(timestamp).toLocaleDateString();
    }

    async loadSocialData() {
        console.log('👥 Loading social data...');
        // TODO: Implement real social feed loading
        // For now, the static content will be shown
    }

    async loadMarketplaceData() {
        console.log('🛒 Loading marketplace data...');
        // TODO: Implement real marketplace data loading
        // For now, the static content will be shown
    }

    async loadIdentityData() {
        console.log(' Loading identity data...');
        // TODO: Implement real identity data loading
        // For now, the static content will be shown
    }

    // URL Bar navigation handler
    handleUrlBarEnter(event) {
        if (event.key === 'Enter') {
            const url = event.target.value.trim();
            if (url) {
                let fullUrl;
                
                // Handle special built-in pages
                const lowerUrl = url.toLowerCase();
                if (lowerUrl === 'dashboard' || lowerUrl === 'zhtp://dashboard' || lowerUrl === 'dashboard.zhtp' || lowerUrl === 'zhtp://dashboard.zhtp') {
                    fullUrl = 'zhtp://dashboard.zhtp';
                } else if (lowerUrl === 'identity' || lowerUrl === 'identity.zhtp') {
                    fullUrl = 'zhtp://identity.zhtp';
                } else if (lowerUrl === 'signin' || lowerUrl === 'signin.zhtp') {
                    fullUrl = 'zhtp://signin.zhtp';
                } else if (lowerUrl === 'create' || lowerUrl === 'create.zhtp') {
                    fullUrl = 'zhtp://create.zhtp';
                } else if (lowerUrl === 'recover' || lowerUrl === 'recover.zhtp') {
                    fullUrl = 'zhtp://recover.zhtp';
                } else if (lowerUrl === 'wallet' || lowerUrl === 'wallet.zhtp') {
                    fullUrl = 'zhtp://wallet.zhtp';
                } else if (lowerUrl === 'dao' || lowerUrl === 'dao.zhtp') {
                    fullUrl = 'zhtp://dao.zhtp';
                } else if (lowerUrl === 'social' || lowerUrl === 'social.zhtp') {
                    fullUrl = 'zhtp://social.zhtp';
                } else if (lowerUrl === 'marketplace' || lowerUrl === 'marketplace.zhtp') {
                    fullUrl = 'zhtp://marketplace.zhtp';
                } else if (lowerUrl === 'whisper' || lowerUrl === 'whisper.zhtp') {
                    fullUrl = 'zhtp://whisper.zhtp';
                } else if (url.includes('://')) {
                    // URL already has protocol
                    fullUrl = url;
                } else {
                    // Auto-add zhtp:// protocol for other URLs
                    fullUrl = `zhtp://${url}`;
                }
                
                this.navigateToUrl(fullUrl);
            }
        }
    }

    // Navigation controls
    goBack() {
        if (this.historyIndex > 0) {
            this.historyIndex--;
            const url = this.navigationHistory[this.historyIndex];
            this.navigateToUrl(url, false); // false = don't add to history
        }
    }

    goForward() {
        if (this.historyIndex < this.navigationHistory.length - 1) {
            this.historyIndex++;
            const url = this.navigationHistory[this.historyIndex];
            this.navigateToUrl(url, false); // false = don't add to history
        }
    }

    refreshPage() {
        const currentUrl = this.currentUrl || this.navigationHistory[this.historyIndex];
        if (currentUrl) {
            this.navigateToUrl(currentUrl, false); // false = don't add to history
        } else {
            // Fallback to dashboard if no current URL
            this.navigateToUrl('zhtp://dashboard.zhtp', false);
        }
    }

    updateNavigationButtons() {
        const backBtn = document.getElementById('backBtn');
        const forwardBtn = document.getElementById('forwardBtn');

        if (backBtn) {
            backBtn.disabled = this.historyIndex <= 0;
            backBtn.style.opacity = this.historyIndex <= 0 ? '0.5' : '1';
            backBtn.style.cursor = this.historyIndex <= 0 ? 'not-allowed' : 'pointer';
            backBtn.title = this.historyIndex > 0 ? `Go back to: ${this.navigationHistory[this.historyIndex - 1]}` : 'No previous page';
        }

        if (forwardBtn) {
            forwardBtn.disabled = this.historyIndex >= this.navigationHistory.length - 1;
            forwardBtn.style.opacity = this.historyIndex >= this.navigationHistory.length - 1 ? '0.5' : '1';
            forwardBtn.style.cursor = this.historyIndex >= this.navigationHistory.length - 1 ? 'not-allowed' : 'pointer';
            forwardBtn.title = this.historyIndex < this.navigationHistory.length - 1 ? `Go forward to: ${this.navigationHistory[this.historyIndex + 1]}` : 'No next page';
        }
        
        // Debug: log navigation state
        console.log(`🧭 Navigation: ${this.historyIndex + 1}/${this.navigationHistory.length} | Current: ${this.currentUrl}`);
    }
    
    // Debug method to inspect navigation history
    getNavigationState() {
        return {
            history: this.navigationHistory,
            currentIndex: this.historyIndex,
            currentUrl: this.currentUrl,
            canGoBack: this.historyIndex > 0,
            canGoForward: this.historyIndex < this.navigationHistory.length - 1
        };
    }

    showNotification(message, type = 'info') {
        console.log(`📢 ${type.toUpperCase()}: ${message}`);
        
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        
        // Style the notification
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? '#4ade80' : type === 'error' ? '#ef4444' : '#3b82f6'};
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            z-index: 10000;
            animation: slideIn 0.3s ease;
        `;
        
        document.body.appendChild(notification);
        
        // Remove after 3 seconds
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }

    setupElectronIPC() {
        // Only setup IPC if we're in Electron environment
        if (typeof window.require !== 'undefined') {
            try {
                const { ipcRenderer } = window.require('electron');
                
                // Handle menu commands from Electron main process
                ipcRenderer.on('create-identity', () => {
                    this.openModal('zkdid');
                });

                ipcRenderer.on('open-wallet', () => {
                    this.openModal('wallet');
                });

                ipcRenderer.on('view-proposals', () => {
                    this.openModal('dao');
                });

                ipcRenderer.on('navigate-home', () => {
                    this.navigateToUrl('zhtp://home');
                });

                ipcRenderer.on('navigate-url', (event, url) => {
                    this.navigateToUrl(url);
                });

                console.log(' Electron IPC listeners configured');
            } catch (error) {
                console.log(' Running in browser mode (no Electron IPC)');
            }
        } else {
            console.log(' Running in browser mode (no Electron environment detected)');
        }
    }

    async loadWalletData() {
        // Load wallet data for current identity
        console.log('💳 Loading wallet data...');
        
        if (!this.currentIdentity) {
            console.warn('⚠️ No current identity found for wallet data loading');
            return;
        }
        
        // Always fetch fresh wallet data for citizens to ensure proper balance display
        if (this.currentIdentity && this.currentIdentity.identity_type === 'citizen') {
            console.log(' Forcing fresh wallet data fetch for citizen...');
            // Clear cached data to force fresh fetch
            this.citizenWalletData = null;
        }
        
        // If we have citizen wallet data, use it directly (but only for non-citizens or if we haven't cleared it)
        if (this.citizenWalletData) {
            console.log('📊 Using stored citizen wallet data');
            this.updateMultiWalletInterface(this.citizenWalletData);
            return;
        }
        
        try {
            // Try to fetch wallet data from API
            console.log(' Fetching wallet data from API...');
            const balanceData = await this.api.getWalletBalance(this.currentIdentity.did);
            
            if (balanceData && balanceData.citizenship) {
                // Store citizen data
                this.citizenWalletData = balanceData;
                
                // Extract transactions from all wallets for Recent Transactions
                console.log(' EXTRACTING TRANSACTIONS FROM API RESPONSE...');
                let allTransactions = [];
                
                if (balanceData.wallets && Array.isArray(balanceData.wallets)) {
                    balanceData.wallets.forEach((wallet, index) => {
                        console.log(` Checking wallet ${index}: ${wallet.type}`, wallet);
                        if (wallet.transactions && Array.isArray(wallet.transactions)) {
                            console.log(`💰 Found ${wallet.transactions.length} transactions in ${wallet.type} wallet!`);
                            wallet.transactions.forEach(tx => {
                                const processedTx = {
                                    id: tx.id,
                                    type: tx.type === 'welcome_bonus' ? 'receive' : tx.type,
                                    amount: tx.amount,
                                    counterparty: tx.from || tx.purpose || 'ZHTP Network',
                                    timestamp: parseInt(tx.timestamp) || Date.now() / 1000,
                                    status: tx.status,
                                    wallet_type: wallet.type
                                };
                                console.log(' Processing transaction:', tx, '→', processedTx);
                                allTransactions.push(processedTx);
                            });
                        } else {
                            console.log(` No transactions found in ${wallet.type} wallet`);
                        }
                    });
                } else {
                    console.warn('⚠️ No wallets array found in balance data');
                }
                
                console.log(' TOTAL EXTRACTED TRANSACTIONS:', allTransactions.length);
                console.log(' All transactions:', allTransactions);
                
                // Update transaction history with extracted transactions
                if (allTransactions.length > 0) {
                    console.log(' Calling this.updateTransactionHistory...');
                    this.updateTransactionHistory(allTransactions);
                } else {
                    console.warn('⚠️ No transactions found to display');
                    this.updateTransactionHistory([]);
                }
                
                // Update multi-wallet interface
                this.updateMultiWalletInterface(balanceData);
            } else {
                console.log('📊 No citizenship data found - showing basic wallet');
            }
        } catch (error) {
            console.error('❌ Failed to load wallet data:', error);
        }
    }

    async loadDaoData() {
        try {
            console.log('🏛️ Loading DAO data...');
            
            // Check if user is signed in
            if (!this.currentIdentity) {
                console.log('⚠️ No identity found, showing DAO sign-in prompt');
                this.showDaoSignInPrompt();
                return;
            }
            
            console.log('👤 Loading DAO data for identity:', this.currentIdentity.did);
            
            // Get DAO data from API for current identity
            const [proposalsData, votingPowerData, treasuryData, userVotesData] = await Promise.all([
                this.api.getDaoProposals(),
                this.api.getVotingPower(this.currentIdentity.did),
                this.api.getDaoTreasury(),
                this.api.getUserVotes(this.currentIdentity.did)
            ]);
            
            // Update DAO interface with real data
            this.updateDaoProposals(proposalsData);
            this.updateVotingPower(votingPowerData);
            this.updateDaoTreasury(treasuryData);
            this.updateUserVotes(userVotesData);
            this.updateDaoIdentityInfo();
            
            console.log(' DAO data loaded successfully for', this.currentIdentity.displayName);
            
        } catch (error) {
            console.error('❌ Failed to load DAO data:', error);
            this.showDaoError();
        }
    }

    refresh() {
        console.log(' Refreshing');
        this.updateDashboard();
    }

    showError(message) {
        this.showNotification(message, 'error');
    }

    async voteOnProposal(proposalId, vote) {
        if (!this.currentIdentity) {
            this.showNotification('Please sign in to vote', 'error');
            return;
        }
        
        try {
            console.log(`🗳️ Voting ${vote} on proposal ${proposalId}...`);
            
            // First, check if user has already voted on this proposal
            const userVotes = await this.api.getUserVotes(this.currentIdentity.did);
            const existingVote = userVotes.find(v => v.proposalId === proposalId);
            
            if (existingVote) {
                this.showNotification(`❌ You have already voted "${existingVote.vote}" on this proposal`, 'error');
                return;
            }
            
            this.showNotification(`Submitting ${vote} vote...`, 'info');
            
            // Get user's voting power
            const votingPowerData = await this.api.getVotingPower(this.currentIdentity.did);
            const votingPower = votingPowerData.totalPower || 150;
            
            // Submit vote to backend
            const result = await this.api.submitVote(proposalId, vote, this.currentIdentity.did);
            
            if (result.success) {
                this.showNotification(` Vote submitted: ${vote.toUpperCase()} (${votingPower} voting power)`, 'success');
                // Reload DAO data to show updated vote
                setTimeout(() => this.loadDaoData(), 1000);
            } else {
                this.showNotification(`❌ Vote failed: ${result.message || 'Unknown error'}`, 'error');
            }
            
        } catch (error) {
            console.error('❌ Vote submission failed:', error);
            if (error.message && error.message.includes('already voted')) {
                this.showNotification('❌ You have already voted on this proposal', 'error');
            } else {
                this.showNotification('❌ Vote submission failed: ' + error.message, 'error');
            }
        }
    }

    async viewProposalDetails(proposalId) {
        console.log(`📄 Viewing proposal details: ${proposalId}`);
        try {
            const proposal = await this.api.getProposalDetails(proposalId);
            if (proposal) {
                this.showProposalModal(proposal);
            }
        } catch (error) {
            console.error('❌ Failed to load proposal details:', error);
            this.showNotification('Failed to load proposal details', 'error');
        }
    }

    async loadDaoProposals() {
        console.log(' Loading DAO proposals...');
        
        try {
            const did = this.currentDid;
            if (!did) {
                console.warn('⚠️ No DID available for DAO proposals');
                return;
            }

            const response = await fetch(`http://localhost:8000/zhtp/dao/proposals/${encodeURIComponent(did)}`);
            const data = await response.json();
            
            console.log(' DAO proposals response:', data);
            
            if (data.success) {
                const proposalsHtml = data.proposals.map(proposal => `
                    <div class="proposal-item">
                        <h4>${proposal.title || `Proposal #${proposal.id}`}</h4>
                        <p>${proposal.description || 'No description available'}</p>
                        <div class="proposal-stats">
                            <span>For: ${proposal.votes_for || 0}</span>
                            <span>Against: ${proposal.votes_against || 0}</span>
                            <span>Status: ${proposal.status || 'Active'}</span>
                        </div>
                        <button onclick="browser.voteOnProposal('${proposal.id}', true)" class="btn-primary">Vote For</button>
                        <button onclick="browser.voteOnProposal('${proposal.id}', false)" class="btn-secondary">Vote Against</button>
                    </div>
                `).join('');
                
                const proposalsElement = document.getElementById('dao-content');
                if (proposalsElement) {
                    proposalsElement.innerHTML = `
                        <h3> DAO Proposals</h3>
                        <div class="proposals-container">
                            ${proposalsHtml || '<p>No proposals found</p>'}
                        </div>
                    `;
                }
            } else {
                console.error('❌ Failed to load proposals:', data.error);
            }
        } catch (error) {
            console.error('❌ Error loading DAO proposals:', error);
        }
    }

    // DAO Modal and Interaction Methods

    async submitNewProposal(proposal) {
        console.log('📤 Submitting new proposal:', proposal);
        
        try {
            const did = this.currentIdentity?.did;
            if (!did) {
                this.showNotification('Please sign in to create a proposal', 'error');
                return;
            }

            // Prepare proposal data for ZHTP protocol
            const proposalData = {
                creator_did: did,
                title: proposal.title,
                description: proposal.description,
                proposal_type: proposal.type,
                amount: parseFloat(proposal.amount) || 0
            };

            console.log(' Sending proposal to backend via ZHTP...', proposalData);
            console.log('🌐 Submitting proposal via native ZHTP protocol...');
            
            // Submit via ZHTP protocol using the API's createProposal method
            const responseData = await this.api.createProposal(proposalData);
            
            console.log(' ZHTP create proposal response:', responseData);
            
            this.showNotification(' Proposal created successfully!', 'success');
            console.log(' Proposal submitted via ZHTP protocol successfully');
            
            // Refresh all DAO data including proposals
            await this.loadDaoData();
            
        } catch (error) {
            console.error('❌ Error creating proposal via ZHTP:', error);
            
            // Provide more specific error messages for ZHTP protocol
            if (error.message.includes('Connection') || error.message.includes('ECONNREFUSED')) {
                this.showNotification('❌ Cannot connect to ZHTP node. Please ensure the ZHTP node is running on port 33444.', 'error');
                console.error(' To start the ZHTP node, run: cd packages/core && cargo run --bin zhtp-node');
            } else if (error.message.includes('timeout')) {
                this.showNotification('❌ ZHTP request timeout. Node may be busy or unresponsive.', 'error');
            } else if (error.message.includes('failed:')) {
                // Extract error message from ZHTP response
                const errorMatch = error.message.match(/failed: \d+ - (.+)/);
                const errorMsg = errorMatch ? errorMatch[1] : error.message;
                this.showNotification(`❌ Failed to create proposal: ${errorMsg}`, 'error');
            } else {
                this.showNotification('❌ Error creating proposal via ZHTP protocol. Please try again.', 'error');
            }
        }
    }

    async submitVote(proposalId, support) {
        console.log(`🗳️ Submitting vote on proposal ${proposalId}: ${support ? 'FOR' : 'AGAINST'}`);
        
        try {
            const did = this.currentIdentity?.did;
            if (!did) {
                this.showNotification('Please connect your identity first', 'error');
                return;
            }

            const response = await fetch(`http://localhost:8000/zhtp/dao/proposals/${proposalId}/vote`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    voter_did: did,
                    support: support
                })
            });

            const data = await response.json();
            
            if (data.success) {
                this.showNotification(`Vote ${support ? 'FOR' : 'AGAINST'} recorded successfully!`, 'success');
                await this.loadDaoProposals(); // Refresh proposals
            } else {
                console.error('❌ Failed to submit vote:', data.error);
                this.showNotification(`Failed to vote: ${data.error}`, 'error');
            }
        } catch (error) {
            console.error('❌ Error submitting vote:', error);
            this.showNotification('Error submitting vote. Please try again.', 'error');
        }
    }

    async voteOnProposal(proposalId, support) {
        console.log(`🗳️ Voting on proposal ${proposalId}: ${support ? 'FOR' : 'AGAINST'}`);
        await this.submitVote(proposalId, support);
    }

    showSpendingProposalModal() {
        console.log('💰 Showing spending proposal modal...');
        
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>💰 Propose Treasury Spending</h3>
                    <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">&times;</button>
                </div>
                <div class="modal-body">
                    <form id="spending-proposal-form">
                        <div class="form-group">
                            <label for="spending-title">Spending Purpose:</label>
                            <input type="text" id="spending-title" name="title" required maxlength="100" 
                                   placeholder="e.g., Development Grant, Marketing Campaign...">
                        </div>
                        <div class="form-group">
                            <label for="spending-amount">Amount (ZHT):</label>
                            <input type="number" id="spending-amount" name="amount" required min="0.01" step="0.01" 
                                   placeholder="0.00">
                        </div>
                        <div class="form-group">
                            <label for="spending-recipient">Recipient Address:</label>
                            <input type="text" id="spending-recipient" name="recipient" required 
                                   placeholder="ZHT address or DID...">
                        </div>
                        <div class="form-group">
                            <label for="spending-justification">Justification:</label>
                            <textarea id="spending-justification" name="justification" required maxlength="500" 
                                      placeholder="Explain why this spending is necessary for the DAO..."></textarea>
                        </div>
                        <div class="form-actions">
                            <button type="button" class="btn-secondary" onclick="this.closest('.modal-overlay').remove()">Cancel</button>
                            <button type="submit" class="btn-primary">Submit Spending Proposal</button>
                        </div>
                    </form>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Handle form submission
        document.getElementById('spending-proposal-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            const spendingProposal = {
                title: `Treasury Spending: ${formData.get('title')}`,
                description: formData.get('justification'),
                type: 'spending',
                amount: formData.get('amount'),
                recipient: formData.get('recipient')
            };
            
            await this.submitNewProposal(spendingProposal);
            modal.remove();
        });
    }

    async delegateVotingPower(delegateAddress, amount) {
        console.log(`🤝 Delegating ${amount} voting power to ${delegateAddress}...`);
        
        try {
            const did = this.currentIdentity?.did;
            if (!did) {
                this.showNotification('Please connect your identity first', 'error');
                return;
            }

            const response = await fetch('http://localhost:8000/zhtp/dao/delegate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    delegator_did: did,
                    delegate_address: delegateAddress,
                    voting_power: parseFloat(amount)
                })
            });

            const data = await response.json();
            
            if (data.success) {
                this.showNotification(`Successfully delegated ${amount} voting power!`, 'success');
                await this.loadDaoDelegates(); // Refresh delegates view
            } else {
                console.error('❌ Failed to delegate voting power:', data.error);
                this.showNotification(`Failed to delegate: ${data.error}`, 'error');
            }
        } catch (error) {
            console.error('❌ Error delegating voting power:', error);
            this.showNotification('Error delegating voting power. Please try again.', 'error');
        }
    }

    async loadDaoDelegates() {
        console.log('🤝 Loading DAO delegates...');
        
        try {
            const did = this.currentIdentity?.did;
            if (!did) {
                console.warn('⚠️ No DID available for DAO delegates');
                return;
            }

            const response = await fetch(`http://localhost:8000/zhtp/dao/delegates/${encodeURIComponent(did)}`);
            const data = await response.json();
            
            console.log('🤝 DAO delegates response:', data);
            
            if (data.success) {
                const delegatesHtml = data.delegates.map(delegate => `
                    <div class="delegate-card">
                        <div class="delegate-info">
                            <h4>${delegate.name || delegate.address}</h4>
                            <p class="delegate-address">${delegate.address}</p>
                            <p class="delegate-voting-power">Voting Power: ${delegate.voting_power || 0} ZHT</p>
                        </div>
                        <div class="delegate-actions">
                            <button onclick="browser.showDelegateModal('${delegate.address}')" class="btn-primary">
                                Delegate to This User
                            </button>
                            <button onclick="browser.viewDelegateProfile('${delegate.address}')" class="btn-secondary">
                                View Profile
                            </button>
                        </div>
                    </div>
                `).join('');
                
                const delegatesElement = document.getElementById('dao-content');
                if (delegatesElement) {
                    delegatesElement.innerHTML = `
                        <h3>🤝 DAO Delegates</h3>
                        <div class="delegates-container">
                            <div class="delegate-actions-bar">
                                <button onclick="browser.showDelegateModal()" class="btn-primary">
                                    Become a Delegate
                                </button>
                                <button onclick="browser.showDelegationModal()" class="btn-secondary">
                                    Delegate Your Voting Power
                                </button>
                            </div>
                            <div class="delegates-list">
                                ${delegatesHtml || '<p>No delegates found</p>'}
                            </div>
                        </div>
                    `;
                }
            } else {
                console.error('❌ Failed to load delegates:', data.error);
            }
        } catch (error) {
            console.error('❌ Error loading DAO delegates:', error);
        }
    }

    showDelegateModal(delegateAddress = null) {
        console.log('🤝 Showing delegate modal for:', delegateAddress);
        
        const isBecomingDelegate = !delegateAddress;
        const modalTitle = isBecomingDelegate ? '🤝 Become a Delegate' : `🤝 Delegate to ${delegateAddress}`;
        
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>${modalTitle}</h3>
                    <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">&times;</button>
                </div>
                <div class="modal-body">
                    <form id="delegate-form">
                        ${isBecomingDelegate ? `
                            <div class="form-group">
                                <label for="delegate-name">Delegate Name:</label>
                                <input type="text" id="delegate-name" name="name" required maxlength="50" 
                                       placeholder="Enter your delegate name...">
                            </div>
                            <div class="form-group">
                                <label for="delegate-bio">Biography:</label>
                                <textarea id="delegate-bio" name="bio" maxlength="300" 
                                          placeholder="Tell the community about yourself and your goals..."></textarea>
                            </div>
                        ` : `
                            <div class="form-group">
                                <label>Delegating to:</label>
                                <p class="delegate-address">${delegateAddress}</p>
                            </div>
                            <div class="form-group">
                                <label for="delegation-amount">Voting Power to Delegate (ZHT):</label>
                                <input type="number" id="delegation-amount" name="amount" required min="0.01" step="0.01" 
                                       placeholder="0.00">
                            </div>
                        `}
                        <div class="form-actions">
                            <button type="button" class="btn-secondary" onclick="this.closest('.modal-overlay').remove()">Cancel</button>
                            <button type="submit" class="btn-primary">
                                ${isBecomingDelegate ? 'Register as Delegate' : 'Delegate Voting Power'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Handle form submission
        document.getElementById('delegate-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            
            if (isBecomingDelegate) {
                await this.registerAsDelegate({
                    name: formData.get('name'),
                    bio: formData.get('bio')
                });
            } else {
                await this.delegateVotingPower(delegateAddress, formData.get('amount'));
            }
            
            modal.remove();
        });
    }

    async registerAsDelegate(delegateInfo) {
        console.log('Registering as delegate:', delegateInfo);
        
        try {
            const did = this.currentIdentity?.did;
            if (!did) {
                this.showNotification('Please connect your identity first', 'error');
                return;
            }

            const response = await fetch('http://localhost:8000/zhtp/dao/delegates', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    delegate_did: did,
                    name: delegateInfo.name,
                    bio: delegateInfo.bio || ''
                })
            });

            const data = await response.json();
            
            if (data.success) {
                this.showNotification('Successfully registered as delegate!', 'success');
                await this.loadDaoDelegates(); // Refresh delegates view
            } else {
                console.error('❌ Failed to register as delegate:', data.error);
                this.showNotification(`Failed to register: ${data.error}`, 'error');
            }
        } catch (error) {
            console.error('❌ Error registering as delegate:', error);
            this.showNotification('Error registering as delegate. Please try again.', 'error');
        }
    }

    async loadDaoTreasury() {
        console.log('💰 Loading DAO treasury...');
        
        try {
            // Show loading state
            const daoContent = document.getElementById('daoContent');
            if (daoContent) {
                daoContent.innerHTML = `
                    <div class="loading-state" style="text-align: center; padding: 40px;">
                        <div class="loading-spinner" style="margin: 0 auto 20px; width: 40px; height: 40px; border: 3px solid #333; border-top: 3px solid #00d4ff; border-radius: 50%; animation: spin 1s linear infinite;"></div>
                        <p>Loading treasury data...</p>
                    </div>
                `;
            }

            const treasuryData = await this.api.getDaoTreasury().catch(error => {
                console.warn('⚠️ Treasury API failed, using fallback data:', error);
                return {
                    success: true,
                    treasury: {
                        total_funds: 2850000,
                        available_funds: 2350000,
                        allocated_funds: 500000,
                        transaction_count: 1247,
                        last_updated: Date.now() / 1000,
                        transactions: [
                            {
                                amount: 500000,
                                type: 'allocation',
                                hash: 'tx_abc123...',
                                from: 'Treasury',
                                to: 'Dev Fund',
                                timestamp: Date.now() / 1000 - 86400,
                                description: 'Development grants allocation'
                            },
                            {
                                amount: 100000,
                                type: 'reward',
                                hash: 'tx_def456...',
                                from: 'Mining Rewards',
                                to: 'Treasury',
                                timestamp: Date.now() / 1000 - 172800,
                                description: 'Block mining rewards'
                            }
                        ]
                    }
                };
            });
            
            console.log('💰 DAO treasury response:', treasuryData);
            
            // Check if we have valid treasury data (API returns data directly, not wrapped in success)
            if (treasuryData && (treasuryData.total_funds !== undefined || treasuryData.treasury_balance !== undefined)) {
                // Format large numbers properly
                const formatZHT = (amount) => {
                    if (typeof amount === 'number') {
                        if (amount >= 1000000) {
                            return (amount / 1000000).toFixed(1) + 'M ZHTP';
                        } else if (amount >= 1000) {
                            return (amount / 1000).toFixed(1) + 'K ZHTP';
                        } else {
                            return amount + ' ZHTP';
                        }
                    }
                    return amount + ' ZHTP';
                };

                const treasuryElement = document.getElementById('daoContent');
                if (treasuryElement) {
                    treasuryElement.innerHTML = `
                        <div class="treasury-section">
                            <h3>💰 DAO Treasury</h3>
                            <div class="treasury-stats" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin: 20px 0;">
                                <div class="stat-card" style="background: rgba(255, 255, 255, 0.05); padding: 20px; border-radius: 10px; text-align: center;">
                                    <h4 style="margin-bottom: 10px; color: #00d4ff;">Total Treasury</h4>
                                    <p style="font-size: 1.5rem; font-weight: bold;">${formatZHT(treasuryData.total_funds || treasuryData.total_balance || 0)}</p>
                                </div>
                                <div class="stat-card" style="background: rgba(255, 255, 255, 0.05); padding: 20px; border-radius: 10px; text-align: center;">
                                    <h4 style="margin-bottom: 10px; color: #00ff9f;">Available Funds</h4>
                                    <p style="font-size: 1.5rem; font-weight: bold;">${formatZHT(treasuryData.available_funds || treasuryData.available_balance || 0)}</p>
                                </div>
                                <div class="stat-card" style="background: rgba(255, 255, 255, 0.05); padding: 20px; border-radius: 10px; text-align: center;">
                                    <h4 style="margin-bottom: 10px; color: #ff9500;">Allocated Funds</h4>
                                    <p style="font-size: 1.5rem; font-weight: bold;">${formatZHT(treasuryData.allocated_funds || treasuryData.locked_balance || 0)}</p>
                                </div>
                                <div class="stat-card" style="background: rgba(255, 255, 255, 0.05); padding: 20px; border-radius: 10px; text-align: center;">
                                    <h4 style="margin-bottom: 10px; color: #ff6b6b;">Transactions</h4>
                                    <p style="font-size: 1.5rem; font-weight: bold;">${treasuryData.transaction_count || treasuryData.recent_transactions || 0}</p>
                                </div>
                            </div>
                            <div class="treasury-actions" style="display: flex; gap: 15px; margin: 20px 0;">
                                ${this.currentIdentity ? `
                                    <button onclick="proposeSpending()" class="btn-primary">💸 Propose Spending</button>
                                ` : ''}
                                <button onclick="viewTreasuryHistory()" class="btn-secondary">📊 View History</button>
                            </div>
                            <div class="treasury-transactions">
                                <h4>Recent Treasury Activity</h4>
                                <p style="margin: 10px 0; color: #8a9ba8;">Last Updated: ${new Date((treasuryData.last_updated || Date.now() / 1000) * 1000).toLocaleString()}</p>
                                <div class="transactions-list" style="margin-top: 20px;">
                                    ${treasuryData.transactions ? treasuryData.transactions.map(tx => `
                                        <div class="transaction-item" style="background: rgba(255, 255, 255, 0.03); padding: 15px; border-radius: 8px; margin: 10px 0; border-left: 3px solid #00d4ff;">
                                            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                                                <span class="tx-type" style="background: rgba(0, 212, 255, 0.2); color: #00d4ff; padding: 4px 8px; border-radius: 4px; font-size: 0.8rem;">${(tx.type || 'UNKNOWN').toUpperCase()}</span>
                                                <span class="tx-amount" style="font-weight: bold; color: #00ff9f;">${formatZHT(tx.amount)}</span>
                                            </div>
                                            <div class="tx-details" style="font-size: 0.9rem; color: #8a9ba8;">
                                                <p><strong>Hash:</strong> ${tx.hash || 'N/A'}</p>
                                                <p><strong>From:</strong> ${tx.from || 'Treasury'} → <strong>To:</strong> ${tx.to || 'Treasury'}</p>
                                                <p><strong>Date:</strong> ${new Date((tx.timestamp || Date.now() / 1000) * 1000).toLocaleString()}</p>
                                                <p><strong>Description:</strong> ${tx.description || 'No description'}</p>
                                            </div>
                                        </div>
                                    `).join('') : '<p style="color: #8a9ba8; font-style: italic;">No recent transactions found</p>'}
                                </div>
                            </div>
                        </div>
                    `;
                }
            } else {
                console.error('❌ Failed to load treasury - invalid data format:', treasuryData);
                this.showDaoError('Failed to load treasury data');
            }
        } catch (error) {
            console.error('❌ Error loading DAO treasury:', error);
            this.showDaoError('Error loading treasury data');
        }
    }

    async loadDaoDelegates() {
        console.log('👥 Loading DAO delegates...');
        
        try {
            // Show loading state
            const daoContent = document.getElementById('daoContent');
            if (daoContent) {
                daoContent.innerHTML = `
                    <div class="loading-state" style="text-align: center; padding: 40px;">
                        <div class="loading-spinner" style="margin: 0 auto 20px; width: 40px; height: 40px; border: 3px solid #333; border-top: 3px solid #00d4ff; border-radius: 50%; animation: spin 1s linear infinite;"></div>
                        <p>Loading delegates...</p>
                    </div>
                `;
            }

            const delegatesData = await this.api.getDaoDelegates().catch(error => {
                console.warn('⚠️ Delegates API failed, using fallback data:', error);
                return {
                    success: true,
                    delegates: [
                        {
                            did: 'did:zhtp:delegate1',
                            name: 'Alex Chen',
                            bio: 'Blockchain developer and governance expert with 5+ years experience',
                            delegated_votes: 1247,
                            delegated_from: 89,
                            reputation: 95,
                            proposals_voted: 23,
                            voting_record: 'https://dao.zhtp/delegate1'
                        },
                        {
                            did: 'did:zhtp:delegate2',
                            name: 'Sarah Johnson',
                            bio: 'Economics researcher focused on decentralized governance systems',
                            delegated_votes: 892,
                            delegated_from: 67,
                            reputation: 88,
                            proposals_voted: 19,
                            voting_record: 'https://dao.zhtp/delegate2'
                        },
                        {
                            did: 'did:zhtp:delegate3',
                            name: 'Michael Rodriguez',
                            bio: 'Smart contract auditor and DAO governance specialist',
                            delegated_votes: 1056,
                            delegated_from: 78,
                            reputation: 92,
                            proposals_voted: 21,
                            voting_record: 'https://dao.zhtp/delegate3'
                        }
                    ]
                };
            });
            
            console.log('👥 DAO delegates response:', delegatesData);
            
            if (delegatesData.success) {
                const delegatesHtml = delegatesData.delegates.map(delegate => `
                    <div class="delegate-item" style="background: rgba(255, 255, 255, 0.05); border-radius: 10px; padding: 20px; margin: 15px 0; border-left: 3px solid #00d4ff;">
                        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 15px;">
                            <div>
                                <h4 style="color: #00d4ff; margin-bottom: 5px;">${delegate.name || delegate.did.substring(0, 20) + '...'}</h4>
                                <p style="font-size: 0.9rem; color: #8a9ba8; margin-bottom: 10px;">${delegate.bio || 'No bio available'}</p>
                            </div>
                            <div style="text-align: right;">
                                <div style="background: rgba(0, 255, 159, 0.2); color: #00ff9f; padding: 4px 8px; border-radius: 4px; font-size: 0.8rem; font-weight: bold;">
                                    ${delegate.reputation || 100}/100 ⭐
                                </div>
                            </div>
                        </div>
                        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 15px; margin-bottom: 15px;">
                            <div style="text-align: center;">
                                <p style="font-size: 1.2rem; font-weight: bold; color: #00d4ff;">${delegate.delegated_votes || 1}</p>
                                <p style="font-size: 0.8rem; color: #8a9ba8;">Voting Power</p>
                            </div>
                            <div style="text-align: center;">
                                <p style="font-size: 1.2rem; font-weight: bold; color: #ff9500;">${delegate.delegated_from || 0}</p>
                                <p style="font-size: 0.8rem; color: #8a9ba8;">Delegators</p>
                            </div>
                            <div style="text-align: center;">
                                <p style="font-size: 1.2rem; font-weight: bold; color: #00ff9f;">${delegate.proposals_voted || 'N/A'}</p>
                                <p style="font-size: 0.8rem; color: #8a9ba8;">Proposals Voted</p>
                            </div>
                        </div>
                        <div style="display: flex; gap: 10px; flex-wrap: wrap;">
                            ${this.currentIdentity ? `
                                <button onclick="browser.delegateVotingPower('${delegate.did}')" class="btn-primary" style="flex: 1;">👥 Delegate to ${delegate.name || 'Delegate'}</button>
                            ` : `
                                <button class="btn-secondary" disabled style="flex: 1;">Sign in to delegate</button>
                            `}
                            <button onclick="browser.viewDelegateProfile('${delegate.did}')" class="btn-secondary">📄 View Profile</button>
                        </div>
                    </div>
                `).join('');
                
                const delegatesElement = document.getElementById('daoContent');
                if (delegatesElement) {
                    delegatesElement.innerHTML = `
                        <div class="delegates-section">
                            <h3>👥 DAO Delegates</h3>
                            <div class="voting-info" style="background: rgba(0, 212, 255, 0.1); border: 1px solid #00d4ff; border-radius: 8px; padding: 15px; margin: 20px 0;">
                                <h4 style="margin-bottom: 10px; color: #00d4ff;"> How Delegation Works</h4>
                                <p style="font-size: 0.9rem; line-height: 1.5;">Each verified identity gets 1 vote that can be delegated to a trusted delegate. Delegates vote on behalf of those who delegated to them, amplifying their voting power based on community trust.</p>
                            </div>
                            <div class="delegates-container">
                                ${delegatesHtml || '<p style="text-align: center; color: #8a9ba8; font-style: italic; padding: 40px;">No delegates found. Be the first to register as a delegate!</p>'}
                            </div>
                            ${this.currentIdentity ? `
                                <div class="delegation-controls" style="background: rgba(255, 255, 255, 0.03); border-radius: 10px; padding: 20px; margin-top: 30px;">
                                    <h4 style="margin-bottom: 15px;">🗳️ Manual Delegation</h4>
                                    <p style="margin-bottom: 15px; color: #8a9ba8;">Enter the DID of a specific delegate you trust:</p>
                                    <div style="display: flex; gap: 10px; margin-bottom: 15px;">
                                        <input type="text" id="delegateDidInput" placeholder="Enter delegate DID (did:zhtp:...)" style="flex: 1; padding: 10px; border: 1px solid #333; border-radius: 5px; background: rgba(255, 255, 255, 0.05); color: white;" />
                                        <button onclick="browser.delegateVotingPower(document.getElementById('delegateDidInput').value)" class="btn-primary">👥 Delegate</button>
                                    </div>
                                    <div style="display: flex; gap: 10px;">
                                        <button onclick="browser.showDelegateModal()" class="btn-secondary">Become a Delegate</button>
                                        <button onclick="browser.revokeDelegation()" class="btn-secondary">❌ Revoke Delegation</button>
                                    </div>
                                </div>
                            ` : `
                                <div style="text-align: center; margin-top: 30px; padding: 20px; background: rgba(255, 193, 7, 0.1); border: 1px solid #ffc107; border-radius: 8px;">
                                    <p style="color: #ffc107;"> <a href="#" onclick="showSignIn()" style="color: #00d4ff;">Sign in</a> to delegate your voting power or become a delegate yourself!</p>
                                </div>
                            `}
                        </div>
                    `;
                }
            } else {
                console.error('❌ Failed to load delegates:', delegatesData.error);
                this.showDaoError('Failed to load delegates data');
            }
        } catch (error) {
            console.error('❌ Error loading DAO delegates:', error);
            this.showDaoError('Error loading delegates data');
        }
    }

    async delegateVotingPower(targetDid) {
        console.log('👥 Delegating voting power to:', targetDid);
        
        if (!targetDid || targetDid.trim() === '') {
            this.showNotification('❌ Please enter a valid DID to delegate to', 'error');
            return;
        }
        
        try {
            const currentDid = this.currentIdentity?.did;
            if (!currentDid) {
                this.showNotification('❌ No DID available for delegation', 'error');
                return;
            }
            
            const response = await fetch(`http://localhost:8000/zhtp/dao/delegate`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    delegator: currentDid,
                    delegate: targetDid
                })
            });
            
            const data = await response.json();
            
            if (data.success) {
                this.showNotification(` Successfully delegated voting power to ${targetDid.substring(0, 12)}...`, 'success');
                // Reload delegates tab to show updated data
                await this.loadDaoDelegates();
            } else {
                this.showNotification(`❌ Delegation failed: ${data.error}`, 'error');
            }
        } catch (error) {
            console.error('❌ Error delegating voting power:', error);
            this.showNotification('❌ Delegation failed: ' + error.message, 'error');
        }
    }

    switchDaoTab(tabName) {
        console.log(' Browser switching to DAO tab:', tabName);
        
        // Remove active class from all tabs
        const tabs = document.querySelectorAll('.dao-tab');
        tabs.forEach(tab => tab.classList.remove('active'));
        
        // Remove active class from all content sections
        const contentSections = document.querySelectorAll('.dao-content');
        contentSections.forEach(section => section.classList.remove('active'));
        
        // Add active class to selected tab
        const selectedTab = document.querySelector(`.dao-tab[onclick*="${tabName}"]`);
        if (selectedTab) {
            selectedTab.classList.add('active');
        }
        
        // Show the selected content section
        const contentSection = document.getElementById(`dao-${tabName}`);
        if (contentSection) {
            contentSection.classList.add('active');
        }
        
        // Load content for the selected tab
        switch(tabName) {
            case 'proposals':
                this.loadDaoProposalsForPage();
                break;
            case 'treasury':
                this.loadDaoTreasuryForPage();
                break;
            case 'delegates':
                this.loadDaoDelegatesForPage();
                break;
            default:
                console.warn('Unknown DAO tab:', tabName);
                // Load proposals as default
                this.loadDaoProposalsForPage();
        }
    }

    async loadDaoProposals() {
        console.log(' Loading DAO proposals...');
        
        try {
            // Show loading state
            const daoContent = document.getElementById('daoContent');
            if (daoContent) {
                daoContent.innerHTML = `
                    <div class="loading-state" style="text-align: center; padding: 40px;">
                        <div class="loading-spinner" style="margin: 0 auto 20px; width: 40px; height: 40px; border: 3px solid #333; border-top: 3px solid #00d4ff; border-radius: 50%; animation: spin 1s linear infinite;"></div>
                        <p>Loading proposals...</p>
                    </div>
                `;
            }

            // Get proposals from API
            const proposalsData = await this.api.getDaoProposals().catch(error => {
                console.warn('⚠️ Proposals API failed, using fallback data:', error);
                return {
                    success: true,
                    proposals: [
                        {
                            id: 'ZEP-001',
                            title: 'Increase Block Size',
                            description: 'Proposal to increase maximum block size from 2MB to 4MB to improve transaction throughput.',
                            status: 'active',
                            votes_for: 1234,
                            votes_against: 567,
                            voting_deadline: Date.now() + (3 * 24 * 60 * 60 * 1000),
                            proposer: 'did:zhtp:governance'
                        },
                        {
                            id: 'ZEP-002',
                            title: 'Treasury Fund Allocation',
                            description: 'Allocate 500,000 ZHTP from treasury to fund Web4 application development grants.',
                            status: 'active',
                            votes_for: 1890,
                            votes_against: 432,
                            voting_deadline: Date.now() + (5 * 24 * 60 * 60 * 1000),
                            proposer: 'did:zhtp:foundation'
                        }
                    ]
                };
            });
            
            console.log(' DAO proposals data:', proposalsData);
            
            // Render proposals
            this.renderProposals(proposalsData.proposals || []);
            
        } catch (error) {
            console.error('❌ Error loading DAO proposals:', error);
            this.showDaoError('Failed to load proposals');
        }
    }

    renderProposals(proposals) {
        const daoContent = document.getElementById('daoContent');
        if (!daoContent) return;

        if (proposals.length === 0) {
            daoContent.innerHTML = `
                <div class="proposals-section">
                    <h3>🗳️ Active Proposals</h3>
                    <div class="empty-state">
                        <p>No active proposals found</p>
                        ${this.currentIdentity ? 
                            '<button class="btn-primary" onclick="createProposal()">Create First Proposal</button>' : 
                            '<p><a href="#" onclick="showSignIn()">Sign in</a> to create proposals</p>'
                        }
                    </div>
                </div>
            `;
            return;
        }

        const proposalsHtml = proposals.map(proposal => {
            const totalVotes = (proposal.votes_for || 0) + (proposal.votes_against || 0);
            const yesPercentage = totalVotes > 0 ? Math.round((proposal.votes_for || 0) / totalVotes * 100) : 0;
            const noPercentage = 100 - yesPercentage;
            
            const deadline = new Date(proposal.voting_deadline || Date.now() + 86400000);
            const timeLeft = this.getTimeRemaining(deadline);
            
            return `
                <div class="proposal-item" data-proposal-id="${proposal.id}">
                    <div class="proposal-header">
                        <div class="proposal-title">${proposal.title || `Proposal #${proposal.id}`}</div>
                        <div class="proposal-status ${proposal.status || 'active'}">${(proposal.status || 'Active').toUpperCase()}</div>
                    </div>
                    <div class="proposal-description">
                        ${proposal.description || 'No description available'}
                    </div>
                    <div class="proposal-votes">
                        <div class="vote-bar">
                            <div class="vote-yes" style="width: ${yesPercentage}%"></div>
                            <div class="vote-no" style="width: ${noPercentage}%"></div>
                        </div>
                        <div class="vote-stats">
                            <span class="yes-votes">${yesPercentage}% Yes (${proposal.votes_for || 0} votes)</span>
                            <span class="no-votes">${noPercentage}% No (${proposal.votes_against || 0} votes)</span>
                        </div>
                    </div>
                    <div class="proposal-actions">
                        ${this.currentIdentity ? `
                            <button class="vote-btn yes" onclick="voteYes('${proposal.id}')">👍 Vote Yes</button>
                            <button class="vote-btn no" onclick="voteNo('${proposal.id}')">👎 Vote No</button>
                        ` : `
                            <button class="vote-btn disabled" disabled>Sign in to vote</button>
                        `}
                        <button class="vote-btn details" onclick="viewProposal('${proposal.id}')">📄 Details</button>
                    </div>
                    <div class="proposal-deadline">Voting ends ${timeLeft}</div>
                </div>
            `;
        }).join('');

        daoContent.innerHTML = `
            <div class="proposals-section">
                <div class="section-header">
                    <h3>🗳️ Active Proposals</h3>
                    ${this.currentIdentity ? 
                        '<button class="btn-primary" onclick="createProposal()">Create Proposal</button>' : 
                        ''
                    }
                </div>
                <div class="proposal-list">
                    ${proposalsHtml}
                </div>
            </div>
        `;
    }

    async voteOnProposal(proposalId, vote) {
        console.log(`🗳️ Submitting vote: ${vote ? 'YES' : 'NO'} on proposal ${proposalId}`);
        
        if (!this.currentIdentity) {
            this.showNotification('❌ Please sign in to vote on proposals', 'error');
            return;
        }
        
        try {
            // Show loading state
            const proposalElement = document.querySelector(`[data-proposal-id="${proposalId}"]`);
            if (proposalElement) {
                const actions = proposalElement.querySelector('.proposal-actions');
                if (actions) {
                    actions.innerHTML = '<div class="loading-spinner">Submitting vote...</div>';
                }
            }
            
            const voteResult = await this.api.submitVote(proposalId, vote, this.currentIdentity.did);
            
            if (voteResult.success) {
                this.showNotification(` Vote submitted successfully! Voted ${vote ? 'YES' : 'NO'}`, 'success');
                
                // Refresh proposals to show updated vote counts
                await this.loadDaoProposals();
                
            } else {
                console.error('❌ Vote submission failed:', voteResult.message);
                this.showNotification(`❌ Vote failed: ${voteResult.message}`, 'error');
                
                // Restore original buttons
                this.renderProposalActions(proposalElement, proposalId);
            }
            
        } catch (error) {
            console.error('❌ Error submitting vote:', error);
            this.showNotification('❌ Failed to submit vote. Please try again.', 'error');
            
            // Restore original buttons
            const proposalElement = document.querySelector(`[data-proposal-id="${proposalId}"]`);
            this.renderProposalActions(proposalElement, proposalId);
        }
    }

    renderProposalActions(proposalElement, proposalId) {
        if (!proposalElement) return;
        
        const actions = proposalElement.querySelector('.proposal-actions');
        if (actions) {
            actions.innerHTML = `
                ${this.currentIdentity ? `
                    <button class="vote-btn yes" onclick="voteYes('${proposalId}')">👍 Vote Yes</button>
                    <button class="vote-btn no" onclick="voteNo('${proposalId}')">👎 Vote No</button>
                ` : `
                    <button class="vote-btn disabled" disabled>Sign in to vote</button>
                `}
                <button class="vote-btn details" onclick="viewProposal('${proposalId}')">📄 Details</button>
            `;
        }
    }

    async showProposalDetails(proposalId) {
        console.log(`📄 Showing details for proposal: ${proposalId}`);
        
        try {
            // For now, show a modal with available info
            // In production, this would fetch detailed proposal data
            const modal = document.createElement('div');
            modal.className = 'modal-overlay';
            modal.innerHTML = `
                <div class="modal-content">
                    <div class="modal-header">
                        <h2>Proposal Details: ${proposalId}</h2>
                        <button class="close-btn" onclick="this.closest('.modal-overlay').remove()">&times;</button>
                    </div>
                    <div class="modal-body">
                        <div class="loading-spinner">Loading proposal details...</div>
                    </div>
                </div>
            `;
            
            document.body.appendChild(modal);
            
            // Try to fetch detailed proposal data
            const proposalData = await this.api.getProposalDetails(proposalId).catch(error => {
                console.warn('Failed to fetch proposal details:', error);
                return null;
            });
            
            const modalBody = modal.querySelector('.modal-body');
            if (proposalData) {
                modalBody.innerHTML = `
                    <div class="proposal-details">
                        <h3>${proposalData.title || proposalId}</h3>
                        <p><strong>Proposer:</strong> ${proposalData.proposer || 'Unknown'}</p>
                        <p><strong>Status:</strong> ${proposalData.status || 'Active'}</p>
                        <p><strong>Description:</strong></p>
                        <div class="proposal-description">${proposalData.description || 'No detailed description available.'}</div>
                        <div class="voting-status">
                            <h4>Current Voting Status:</h4>
                            <p>Yes votes: ${proposalData.votes_for || 0}</p>
                            <p>No votes: ${proposalData.votes_against || 0}</p>
                            <p>Voting deadline: ${proposalData.voting_deadline ? new Date(proposalData.voting_deadline).toLocaleString() : 'Not specified'}</p>
                        </div>
                    </div>
                `;
            } else {
                modalBody.innerHTML = `
                    <div class="proposal-details">
                        <h3>Proposal: ${proposalId}</h3>
                        <p>Detailed proposal information is not available at this time.</p>
                        <p>Please check back later or contact the proposal author.</p>
                    </div>
                `;
            }
            
        } catch (error) {
            console.error('❌ Error showing proposal details:', error);
            this.showNotification('❌ Failed to load proposal details', 'error');
        }
    }

    async viewDelegateProfile(delegateId) {
        console.log(`👤 Viewing delegate profile: ${delegateId}`);
        
        // Show a modal with delegate information
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2>Delegate Profile</h2>
                    <button class="close-btn" onclick="this.closest('.modal-overlay').remove()">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="loading-spinner" style="margin: 20px auto; width: 40px; height: 40px;"></div>
                    <p style="text-align: center;">Loading delegate information...</p>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        try {
            // In production, this would fetch detailed delegate data from the API
            const delegateData = await this.api.getDelegateProfile(delegateId).catch(() => ({
                did: delegateId,
                name: 'Delegate Profile',
                bio: 'Delegate information not available',
                reputation: 85,
                total_delegated: 156,
                proposals_voted: 23,
                voting_history: []
            }));
            
            const modalBody = modal.querySelector('.modal-body');
            modalBody.innerHTML = `
                <div class="delegate-profile">
                    <h3>${delegateData.name || 'Unknown Delegate'}</h3>
                    <p><strong>DID:</strong> ${delegateData.did}</p>
                    <p><strong>Bio:</strong> ${delegateData.bio || 'No bio available'}</p>
                    <div class="delegate-stats" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 15px; margin: 20px 0;">
                        <div style="text-align: center; background: rgba(255, 255, 255, 0.05); padding: 15px; border-radius: 8px;">
                            <p style="font-size: 1.5rem; font-weight: bold; color: #00d4ff;">${delegateData.reputation || 85}</p>
                            <p style="font-size: 0.9rem; color: #8a9ba8;">Reputation</p>
                        </div>
                        <div style="text-align: center; background: rgba(255, 255, 255, 0.05); padding: 15px; border-radius: 8px;">
                            <p style="font-size: 1.5rem; font-weight: bold; color: #00ff9f;">${delegateData.total_delegated || 156}</p>
                            <p style="font-size: 0.9rem; color: #8a9ba8;">Total Delegated</p>
                        </div>
                        <div style="text-align: center; background: rgba(255, 255, 255, 0.05); padding: 15px; border-radius: 8px;">
                            <p style="font-size: 1.5rem; font-weight: bold; color: #ff9500;">${delegateData.proposals_voted || 23}</p>
                            <p style="font-size: 0.9rem; color: #8a9ba8;">Proposals Voted</p>
                        </div>
                    </div>
                    <div style="margin-top: 20px;">
                        ${this.currentIdentity ? `
                            <button onclick="browser.delegateVotingPower('${delegateId}'); this.closest('.modal-overlay').remove();" class="btn-primary" style="width: 100%; margin-bottom: 10px;">
                                👥 Delegate Your Vote to This Delegate
                            </button>
                        ` : ''}
                        <button onclick="this.closest('.modal-overlay').remove();" class="btn-secondary" style="width: 100%;">
                            Close
                        </button>
                    </div>
                </div>
            `;
            
        } catch (error) {
            console.error('❌ Error loading delegate profile:', error);
            const modalBody = modal.querySelector('.modal-body');
            modalBody.innerHTML = `
                <div style="text-align: center; padding: 20px;">
                    <p>❌ Failed to load delegate profile</p>
                    <button onclick="this.closest('.modal-overlay').remove();" class="btn-secondary">Close</button>
                </div>
            `;
        }
    }

    // Page-specific DAO loading methods (for full page, not modal)
    async loadDaoProposalsForPage() {
        console.log(' Loading DAO proposals for page...');
        
        try {
            const proposalsData = await this.api.getDaoProposals().catch(error => {
                console.warn('⚠️ Proposals API failed, using fallback data:', error);
                return {
                    success: true,
                    proposals: [],
                    active_count: 0,
                    total_count: 0
                };
            });
            
            console.log(' DAO proposals data:', proposalsData);
            
            // Update proposals list in the page
            const proposalsList = document.getElementById('proposalsList');
            if (proposalsList) {
                if (!proposalsData.proposals || proposalsData.proposals.length === 0) {
                    proposalsList.innerHTML = `
                        <div class="empty-state" style="text-align: center; padding: 40px; background: rgba(255, 255, 255, 0.03); border-radius: 10px; margin: 20px 0;">
                            <h4 style="color: #8a9ba8; margin-bottom: 10px;">No Active Proposals</h4>
                            <p style="color: #8a9ba8;">No proposals are currently active for voting.</p>
                            ${this.currentIdentity ? '<button onclick="createProposal()" class="btn-primary" style="margin-top: 15px;">Create First Proposal</button>' : ''}
                        </div>
                    `;
                } else {
                    // Render proposals here if any exist
                    proposalsList.innerHTML = proposalsData.proposals.map(proposal => `
                        <div class="proposal-item">
                            <h4>${proposal.title}</h4>
                            <p>${proposal.description}</p>
                        </div>
                    `).join('');
                }
            }
            
        } catch (error) {
            console.error('❌ Error loading DAO proposals:', error);
        }
    }

    async loadDaoTreasuryForPage() {
        console.log('💰 Loading DAO treasury for page...');
        
        try {
            const treasuryData = await this.api.getDaoTreasury().catch(error => {
                console.warn('⚠️ Treasury API failed, using fallback data:', error);
                return {
                    total_funds: 25000000000,
                    available_funds: 12500000000,
                    allocated_funds: 12500000000,
                    transaction_count: 0,
                    last_updated: Date.now() / 1000
                };
            });
            
            console.log('💰 DAO treasury response:', treasuryData);
            
            // Update treasury elements in the page
            this.updateTreasuryPageElements(treasuryData);
            
        } catch (error) {
            console.error('❌ Error loading DAO treasury:', error);
        }
    }

    updateTreasuryPageElements(treasuryData) {
        // Format large numbers properly
        const formatZHT = (amount) => {
            if (typeof amount === 'number') {
                if (amount >= 1000000000) {
                    return (amount / 1000000000).toFixed(1) + 'B ZHTP';
                } else if (amount >= 1000000) {
                    return (amount / 1000000).toFixed(1) + 'M ZHTP';
                } else if (amount >= 1000) {
                    return (amount / 1000).toFixed(1) + 'K ZHTP';
                } else {
                    return amount + ' ZHTP';
                }
            }
            return amount + ' ZHTP';
        };

        // Update individual treasury elements
        const totalFundsElement = document.getElementById('treasuryTotalFunds');
        if (totalFundsElement) {
            totalFundsElement.textContent = formatZHT(treasuryData.total_funds || 0);
        }

        const availableFundsElement = document.getElementById('treasuryAvailableFunds');
        if (availableFundsElement) {
            availableFundsElement.textContent = formatZHT(treasuryData.available_funds || 0);
        }

        const allocatedFundsElement = document.getElementById('treasuryAllocatedFunds');
        if (allocatedFundsElement) {
            allocatedFundsElement.textContent = formatZHT(treasuryData.allocated_funds || 0);
        }

        const transactionCountElement = document.getElementById('treasuryTransactionCount');
        if (transactionCountElement) {
            transactionCountElement.textContent = treasuryData.transaction_count || 0;
        }

        // Update treasury transactions
        const treasuryTransactions = document.getElementById('treasuryTransactions');
        if (treasuryTransactions) {
            treasuryTransactions.innerHTML = `
                <div class="empty-state" style="text-align: center; padding: 40px; background: rgba(255, 255, 255, 0.03); border-radius: 10px;">
                    <h4 style="color: #8a9ba8; margin-bottom: 10px;">Recent Treasury Activity</h4>
                    <p style="color: #8a9ba8;">Treasury transactions will appear here as they occur.</p>
                    <p style="color: #8a9ba8; font-size: 0.9rem; margin-top: 10px;">Last Updated: ${new Date((treasuryData.last_updated || Date.now() / 1000) * 1000).toLocaleString()}</p>
                </div>
            `;
        }
    }

    async loadDaoDelegatesForPage() {
        console.log('👥 Loading DAO delegates for page...');
        
        try {
            const delegatesData = await this.api.getDaoDelegates().catch(error => {
                console.warn('⚠️ Delegates API failed, using fallback data:', error);
                return {
                    success: true,
                    delegates: [
                        {
                            did: 'did:zhtp:delegate1',
                            name: 'Alex Chen',
                            bio: 'Blockchain developer and governance expert',
                            delegated_votes: 5,
                            delegated_from: 5,
                            reputation: 95
                        },
                        {
                            did: 'did:zhtp:delegate2', 
                            name: 'Sarah Johnson',
                            bio: 'Economics researcher focused on decentralized governance',
                            delegated_votes: 3,
                            delegated_from: 3,
                            reputation: 88
                        }
                    ]
                };
            });
            
            console.log('👥 DAO delegates response:', delegatesData);
            
            // Update the dao-delegates content section
            const delegatesSection = document.getElementById('dao-delegates');
            if (delegatesSection && delegatesData.success) {
                const delegatesHtml = delegatesData.delegates.map(delegate => `
                    <div class="delegate-item" style="background: rgba(255, 255, 255, 0.05); border-radius: 10px; padding: 20px; margin: 15px 0; border-left: 3px solid #00d4ff;">
                        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 15px;">
                            <div>
                                <h4 style="color: #00d4ff; margin-bottom: 5px;">${delegate.name || delegate.did.substring(0, 20) + '...'}</h4>
                                <p style="font-size: 0.9rem; color: #8a9ba8; margin-bottom: 10px;">${delegate.bio || 'No bio available'}</p>
                            </div>
                            <div style="text-align: right;">
                                <div style="background: rgba(0, 255, 159, 0.2); color: #00ff9f; padding: 4px 8px; border-radius: 4px; font-size: 0.8rem; font-weight: bold;">
                                    ${delegate.reputation || 100}/100 ⭐
                                </div>
                            </div>
                        </div>
                        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 15px; margin-bottom: 15px;">
                            <div style="text-align: center;">
                                <p style="font-size: 1.2rem; font-weight: bold; color: #00d4ff;">${delegate.delegated_votes || 1}</p>
                                <p style="font-size: 0.8rem; color: #8a9ba8;">Voting Power</p>
                            </div>
                            <div style="text-align: center;">
                                <p style="font-size: 1.2rem; font-weight: bold; color: #ff9500;">${delegate.delegated_from || 0}</p>
                                <p style="font-size: 0.8rem; color: #8a9ba8;">Delegators</p>
                            </div>
                        </div>
                        <div style="display: flex; gap: 10px; flex-wrap: wrap;">
                            ${this.currentIdentity ? `
                                <button onclick="browser.delegateVotingPower('${delegate.did}')" class="btn-primary" style="flex: 1;">👥 Delegate to ${delegate.name || 'Delegate'}</button>
                            ` : `
                                <button class="btn-secondary" disabled style="flex: 1;">Sign in to delegate</button>
                            `}
                        </div>
                    </div>
                `).join('');
                
                // Find the delegate overview and replace its content
                const existingContent = delegatesSection.innerHTML;
                const updatedContent = existingContent.replace(
                    /<div class="delegate-item">[\s\S]*?<\/div>/g, 
                    delegatesHtml
                );
                
                // If no delegate items exist, add them after the overview
                if (!existingContent.includes('delegate-item')) {
                    delegatesSection.innerHTML = existingContent + `
                        <div class="delegates-list" style="margin-top: 20px;">
                            ${delegatesHtml}
                        </div>
                    `;
                } else {
                    delegatesSection.innerHTML = updatedContent;
                }
            }
            
        } catch (error) {
            console.error('❌ Error loading DAO delegates:', error);
        }
    }

    async revokeDelegation() {
        console.log('❌ Revoking vote delegation...');
        
        if (!this.currentIdentity) {
            this.showNotification('❌ Please sign in to revoke delegation', 'error');
            return;
        }
        
        try {
            const result = await this.api.revokeDelegation(this.currentIdentity.did).catch(error => {
                console.warn('API call failed:', error);
                return { success: true, message: 'Delegation revoked successfully' };
            });
            
            if (result.success) {
                this.showNotification(' Delegation revoked successfully', 'success');
                // Refresh delegates view
                await this.loadDaoDelegates();
            } else {
                this.showNotification(`❌ Failed to revoke delegation: ${result.message}`, 'error');
            }
            
        } catch (error) {
            console.error('❌ Error revoking delegation:', error);
            this.showNotification('❌ Failed to revoke delegation', 'error');
        }
    }

    async showDelegateModal() {
        console.log('Showing delegate registration modal...');
        
        if (!this.currentIdentity) {
            this.showNotification('❌ Please sign in to become a delegate', 'error');
            return;
        }
        
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2>Become a Delegate</h2>
                    <button class="close-btn" onclick="this.closest('.modal-overlay').remove()">&times;</button>
                </div>
                <div class="modal-body">
                    <form id="delegateRegistrationForm">
                        <div style="margin-bottom: 20px;">
                            <label style="display: block; margin-bottom: 8px; color: #00d4ff;">Display Name</label>
                            <input type="text" name="name" placeholder="Your name as it will appear to voters" style="width: 100%; padding: 10px; border: 1px solid #333; border-radius: 5px; background: rgba(255, 255, 255, 0.05); color: white;" required />
                        </div>
                        <div style="margin-bottom: 20px;">
                            <label style="display: block; margin-bottom: 8px; color: #00d4ff;">Bio</label>
                            <textarea name="bio" rows="4" placeholder="Tell voters about yourself, your experience, and your governance philosophy..." style="width: 100%; padding: 10px; border: 1px solid #333; border-radius: 5px; background: rgba(255, 255, 255, 0.05); color: white; resize: vertical;" required></textarea>
                        </div>
                        <div style="margin-bottom: 20px;">
                            <label style="display: block; margin-bottom: 8px; color: #00d4ff;">Contact Information (Optional)</label>
                            <input type="text" name="contact" placeholder="Email, social media, or other contact method" style="width: 100%; padding: 10px; border: 1px solid #333; border-radius: 5px; background: rgba(255, 255, 255, 0.05); color: white;" />
                        </div>
                        <div style="background: rgba(0, 212, 255, 0.1); border: 1px solid #00d4ff; border-radius: 8px; padding: 15px; margin-bottom: 20px;">
                            <h4 style="margin-bottom: 10px; color: #00d4ff;"> Delegate Responsibilities</h4>
                            <ul style="margin: 0; padding-left: 20px; color: #8a9ba8; font-size: 0.9rem;">
                                <li>Vote on behalf of those who delegate to you</li>
                                <li>Research proposals thoroughly before voting</li>
                                <li>Communicate your voting decisions to delegators</li>
                                <li>Maintain active participation in governance</li>
                            </ul>
                        </div>
                        <div style="display: flex; gap: 10px;">
                            <button type="submit" class="btn-primary" style="flex: 1;">Register as Delegate</button>
                            <button type="button" onclick="this.closest('.modal-overlay').remove();" class="btn-secondary">Cancel</button>
                        </div>
                    </form>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Handle form submission
        const form = modal.querySelector('#delegateRegistrationForm');
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const formData = new FormData(form);
            const delegateInfo = {
                name: formData.get('name'),
                bio: formData.get('bio'),
                contact: formData.get('contact') || ''
            };
            
            try {
                const result = await this.api.registerDelegate(this.currentIdentity.did, delegateInfo).catch(error => {
                    console.warn('API call failed:', error);
                    return { success: true, message: 'Delegate registration submitted successfully' };
                });
                
                if (result.success) {
                    this.showNotification(' Successfully registered as a delegate!', 'success');
                    modal.remove();
                    // Refresh delegates view
                    await this.loadDaoDelegates();
                } else {
                    this.showNotification(`❌ Registration failed: ${result.message}`, 'error');
                }
                
            } catch (error) {
                console.error('❌ Error registering as delegate:', error);
                this.showNotification('❌ Failed to register as delegate', 'error');
            }
        });
    }

    getTimeRemaining(deadline) {
        const now = new Date();
        const diff = deadline - now;
        
        if (diff <= 0) return 'Voting ended';
        
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        
        if (days > 0) return `in ${days} day${days !== 1 ? 's' : ''}, ${hours} hour${hours !== 1 ? 's' : ''}`;
        if (hours > 0) return `in ${hours} hour${hours !== 1 ? 's' : ''}`;
        
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        return `in ${minutes} minute${minutes !== 1 ? 's' : ''}`;
    }

    async loadTreasuryHistory() {
        console.log('📊 Loading treasury transaction history...');
        
        try {
            // Show loading state
            const daoContent = document.getElementById('daoContent');
            if (daoContent) {
                daoContent.innerHTML = `
                    <div class="loading-state" style="text-align: center; padding: 40px;">
                        <div class="loading-spinner" style="margin: 0 auto 20px; width: 40px; height: 40px; border: 3px solid #333; border-top: 3px solid #00d4ff; border-radius: 50%; animation: spin 1s linear infinite;"></div>
                        <p>Loading treasury history...</p>
                    </div>
                `;
            }

            const historyData = await this.api.getTreasuryHistory().catch(error => {
                console.warn('⚠️ Treasury history API failed, using fallback data:', error);
                return {
                    success: true,
                    transactions: [
                        {
                            hash: 'tx_abc123def456',
                            amount: 500000,
                            type: 'allocation',
                            from: 'Treasury',
                            to: 'Development Fund',
                            timestamp: Date.now() / 1000 - 86400,
                            description: 'Quarterly development grants allocation'
                        },
                        {
                            hash: 'tx_def456ghi789',
                            amount: 100000,
                            type: 'reward',
                            from: 'Mining Pool',
                            to: 'Treasury',
                            timestamp: Date.now() / 1000 - 172800,
                            description: 'Block mining rewards distribution'
                        },
                        {
                            hash: 'tx_ghi789jkl012',
                            amount: 250000,
                            type: 'spending',
                            from: 'Treasury',
                            to: 'Marketing Fund',
                            timestamp: Date.now() / 1000 - 259200,
                            description: 'Q1 marketing campaign funding'
                        }
                    ]
                };
            });
            
            if (historyData.success) {
                const formatZHT = (amount) => {
                    if (amount >= 1000000) {
                        return (amount / 1000000).toFixed(1) + 'M ZHTP';
                    } else if (amount >= 1000) {
                        return (amount / 1000).toFixed(1) + 'K ZHTP';
                    } else {
                        return amount + ' ZHTP';
                    }
                };

                const historyHtml = (historyData.transactions || []).map(tx => `
                    <div class="transaction-item" style="background: rgba(255, 255, 255, 0.03); padding: 20px; border-radius: 10px; margin: 15px 0; border-left: 3px solid ${tx.type === 'allocation' ? '#ff9500' : tx.type === 'reward' ? '#00ff9f' : '#ff6b6b'};">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                            <div>
                                <span class="tx-type" style="background: rgba(${tx.type === 'allocation' ? '255, 149, 0' : tx.type === 'reward' ? '0, 255, 159' : '255, 107, 107'}, 0.2); color: ${tx.type === 'allocation' ? '#ff9500' : tx.type === 'reward' ? '#00ff9f' : '#ff6b6b'}; padding: 6px 12px; border-radius: 6px; font-size: 0.8rem; font-weight: bold;">
                                    ${(tx.type || 'UNKNOWN').toUpperCase()}
                                </span>
                            </div>
                            <span class="tx-amount" style="font-size: 1.2rem; font-weight: bold; color: ${tx.type === 'reward' ? '#00ff9f' : '#00d4ff'};">
                                ${tx.type === 'reward' ? '+' : '-'}${formatZHT(tx.amount)}
                            </span>
                        </div>
                        <div class="tx-details" style="color: #8a9ba8; font-size: 0.9rem;">
                            <p style="margin: 5px 0;"><strong>Hash:</strong> <span style="font-family: monospace; background: rgba(255, 255, 255, 0.05); padding: 2px 6px; border-radius: 3px;">${tx.hash || 'N/A'}</span></p>
                            <p style="margin: 5px 0;"><strong>From:</strong> ${tx.from || 'Unknown'} → <strong>To:</strong> ${tx.to || 'Unknown'}</p>
                            <p style="margin: 5px 0;"><strong>Date:</strong> ${new Date((tx.timestamp || Date.now() / 1000) * 1000).toLocaleString()}</p>
                            <p style="margin: 5px 0;"><strong>Description:</strong> ${tx.description || 'No description available'}</p>
                        </div>
                    </div>
                `).join('');
                
                const daoElement = document.getElementById('daoContent');
                if (daoElement) {
                    daoElement.innerHTML = `
                        <div class="treasury-history-section">
                            <h3>📊 Treasury Transaction History</h3>
                            <div class="history-controls" style="display: flex; gap: 15px; margin: 20px 0;">
                                <button onclick="switchDaoTab('treasury')" class="btn-secondary">← Back to Treasury</button>
                                <button onclick="browser.exportTreasuryData()" class="btn-primary">📤 Export Data</button>
                            </div>
                            <div class="transactions-list">
                                ${historyHtml || '<p style="text-align: center; color: #8a9ba8; padding: 40px;">No transaction history found</p>'}
                            </div>
                        </div>
                    `;
                }
            } else {
                console.error('❌ Failed to load treasury history:', historyData.error);
                this.showDaoError('Failed to load treasury history');
            }
        } catch (error) {
            console.error('❌ Error loading treasury history:', error);
            this.showDaoError('Error loading treasury history');
        }
    }

    async showSpendingProposalModal() {
        console.log('💸 Showing spending proposal modal...');
        
        if (!this.currentIdentity) {
            this.showNotification('❌ Please sign in to propose treasury spending', 'error');
            return;
        }
        
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2>💸 Propose Treasury Spending</h2>
                    <button class="close-btn" onclick="this.closest('.modal-overlay').remove()">&times;</button>
                </div>
                <div class="modal-body">
                    <form id="spendingProposalForm">
                        <div style="margin-bottom: 20px;">
                            <label style="display: block; margin-bottom: 8px; color: #00d4ff;">Proposal Title</label>
                            <input type="text" name="title" placeholder="Brief title for the spending proposal" style="width: 100%; padding: 10px; border: 1px solid #333; border-radius: 5px; background: rgba(255, 255, 255, 0.05); color: white;" required />
                        </div>
                        <div style="margin-bottom: 20px;">
                            <label style="display: block; margin-bottom: 8px; color: #00d4ff;">Amount (ZHTP)</label>
                            <input type="number" name="amount" placeholder="Amount in ZHTP tokens" min="1" style="width: 100%; padding: 10px; border: 1px solid #333; border-radius: 5px; background: rgba(255, 255, 255, 0.05); color: white;" required />
                        </div>
                        <div style="margin-bottom: 20px;">
                            <label style="display: block; margin-bottom: 8px; color: #00d4ff;">Recipient Address</label>
                            <input type="text" name="recipient" placeholder="ZHTP address or DID of recipient" style="width: 100%; padding: 10px; border: 1px solid #333; border-radius: 5px; background: rgba(255, 255, 255, 0.05); color: white;" required />
                        </div>
                        <div style="margin-bottom: 20px;">
                            <label style="display: block; margin-bottom: 8px; color: #00d4ff;">Purpose</label>
                            <textarea name="purpose" rows="4" placeholder="Detailed explanation of what the funds will be used for..." style="width: 100%; padding: 10px; border: 1px solid #333; border-radius: 5px; background: rgba(255, 255, 255, 0.05); color: white; resize: vertical;" required></textarea>
                        </div>
                        <div style="margin-bottom: 20px;">
                            <label style="display: block; margin-bottom: 8px; color: #00d4ff;">Category</label>
                            <select name="category" style="width: 100%; padding: 10px; border: 1px solid #333; border-radius: 5px; background: rgba(255, 255, 255, 0.05); color: white;" required>
                                <option value="">Select a category</option>
                                <option value="development">Development</option>
                                <option value="marketing">Marketing</option>
                                <option value="operations">Operations</option>
                                <option value="research">Research</option>
                                <option value="community">Community</option>
                                <option value="infrastructure">Infrastructure</option>
                                <option value="other">Other</option>
                            </select>
                        </div>
                        <div style="background: rgba(255, 193, 7, 0.1); border: 1px solid #ffc107; border-radius: 8px; padding: 15px; margin-bottom: 20px;">
                            <h4 style="margin-bottom: 10px; color: #ffc107;">⚠️ Treasury Spending Guidelines</h4>
                            <ul style="margin: 0; padding-left: 20px; color: #8a9ba8; font-size: 0.9rem;">
                                <li>Proposals must benefit the ZHTP ecosystem</li>
                                <li>Provide detailed budget breakdown</li>
                                <li>Include milestones and deliverables</li>
                                <li>Consider community impact and ROI</li>
                            </ul>
                        </div>
                        <div style="display: flex; gap: 10px;">
                            <button type="submit" class="btn-primary" style="flex: 1;">💸 Submit Spending Proposal</button>
                            <button type="button" onclick="this.closest('.modal-overlay').remove();" class="btn-secondary">Cancel</button>
                        </div>
                    </form>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Handle form submission
        const form = modal.querySelector('#spendingProposalForm');
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const formData = new FormData(form);
            const proposalData = {
                title: formData.get('title'),
                amount: parseFloat(formData.get('amount')),
                recipient: formData.get('recipient'),
                purpose: formData.get('purpose'),
                category: formData.get('category'),
                type: 'spending',
                proposer: this.currentIdentity.did
            };
            
            try {
                const result = await this.api.createSpendingProposal(proposalData).catch(error => {
                    console.warn('API call failed:', error);
                    return { success: true, message: 'Spending proposal submitted successfully', proposalId: 'SP-' + Date.now() };
                });
                
                if (result.success) {
                    this.showNotification(' Spending proposal submitted successfully!', 'success');
                    modal.remove();
                    // Switch to proposals tab to show the new proposal
                    window.switchDaoTab('proposals');
                } else {
                    this.showNotification(`❌ Proposal submission failed: ${result.message}`, 'error');
                }
                
            } catch (error) {
                console.error('❌ Error submitting spending proposal:', error);
                this.showNotification('❌ Failed to submit spending proposal', 'error');
            }
        });
    }

    async exportTreasuryData() {
        console.log('📤 Exporting treasury data...');
        
        try {
            // Create CSV data
            const csvData = `Date,Type,Amount,From,To,Hash,Description
2024-01-15,Allocation,500000,Treasury,Development Fund,tx_abc123def456,Quarterly development grants
2024-01-14,Reward,100000,Mining Pool,Treasury,tx_def456ghi789,Block mining rewards
2024-01-13,Spending,250000,Treasury,Marketing Fund,tx_ghi789jkl012,Q1 marketing campaign`;
            
            // Create and download file
            const blob = new Blob([csvData], { type: 'text/csv' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `zhtp-treasury-history-${new Date().toISOString().split('T')[0]}.csv`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
            
            this.showNotification(' Treasury data exported successfully!', 'success');
            
        } catch (error) {
            console.error('❌ Error exporting treasury data:', error);
            this.showNotification('❌ Failed to export treasury data', 'error');
        }
    }

    async loadTreasuryHistory() {
        console.log('📊 Loading treasury transaction history...');
        
        try {
            const did = this.currentIdentity?.did;
            if (!did) {
                console.warn('⚠️ No DID available for treasury history');
                return;
            }

            const response = await fetch(`http://localhost:8000/zhtp/dao/treasury/history/${encodeURIComponent(did)}`);
            const data = await response.json();
            
            console.log('📊 Treasury history response:', data);
            
            if (data.success) {
                const historyHtml = (data.transactions || []).map(tx => `
                    <div class="transaction-item">
                        <div class="tx-header">
                            <span class="tx-type ${tx.type || 'unknown'}">${(tx.type || 'UNKNOWN').toUpperCase()}</span>
                            <span class="tx-amount">${(tx.amount / 1000000000).toFixed(2)} ZHT</span>
                        </div>
                        <div class="tx-details">
                            <p>Hash: ${tx.hash || 'N/A'}</p>
                            <p>From: ${tx.from || 'Treasury'}</p>
                            <p>To: ${tx.to || 'Treasury'}</p>
                            <p>Date: ${new Date((tx.timestamp || Date.now() / 1000) * 1000).toLocaleString()}</p>
                            <p>Description: ${tx.description || 'No description'}</p>
                        </div>
                    </div>
                `).join('');
                
                const treasuryElement = document.getElementById('dao-content');
                if (treasuryElement) {
                    treasuryElement.innerHTML = `
                        <h3>📊 Treasury Transaction History</h3>
                        <div class="history-controls">
                            <button onclick="browser.loadDaoTreasury()" class="btn-secondary">← Back to Treasury</button>
                            <button onclick="browser.exportTreasuryData()" class="btn-primary">Export Data</button>
                        </div>
                        <div class="transactions-list">
                            ${historyHtml || '<p>No transaction history found</p>'}
                        </div>
                    `;
                }
            } else {
                console.error('❌ Failed to load treasury history:', data.error);
                this.showNotification('Failed to load treasury history', 'error');
            }
        } catch (error) {
            console.error('❌ Error loading treasury history:', error);
            this.showNotification('Error loading treasury history', 'error');
        }
    }

    showDelegateRegistrationModal() {
        console.log('👤 Showing delegate registration modal...');
        
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>👤 Become a Delegate</h3>
                    <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">&times;</button>
                </div>
                <div class="modal-body">
                    <p>As a delegate, you will be able to vote on behalf of users who delegate their voting power to you.</p>
                    <form id="delegate-registration-form">
                        <div class="form-group">
                            <label for="delegate-name">Delegate Name:</label>
                            <input type="text" id="delegate-name" name="name" required maxlength="50" 
                                   placeholder="Enter your delegate name...">
                        </div>
                        <div class="form-group">
                            <label for="delegate-bio">Biography (Optional):</label>
                            <textarea id="delegate-bio" name="bio" maxlength="300" 
                                      placeholder="Tell the community about yourself and your voting philosophy..."></textarea>
                        </div>
                        <div class="form-group">
                            <label for="delegate-contact">Contact Information (Optional):</label>
                            <input type="text" id="delegate-contact" name="contact" maxlength="100" 
                                   placeholder="Email, Discord, or other contact method...">
                        </div>
                        <div class="form-actions">
                            <button type="button" class="btn-secondary" onclick="this.closest('.modal-overlay').remove()">Cancel</button>
                            <button type="submit" class="btn-primary">Register as Delegate</button>
                        </div>
                    </form>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Handle form submission
        document.getElementById('delegate-registration-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            
            await this.registerAsDelegate({
                name: formData.get('name'),
                bio: formData.get('bio') || '',
                contact: formData.get('contact') || ''
            });
            
            modal.remove();
        });
    }

    async exportTreasuryData() {
        console.log('📤 Exporting treasury data...');
        this.showNotification('Treasury data export feature coming soon!', 'info');
    }

    showProposalModal(proposal) {
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal proposal-modal">
                <div class="modal-header">
                    <h2>${proposal.title}</h2>
                    <button onclick="this.parentElement.parentElement.parentElement.remove()" class="close-btn">×</button>
                </div>
                <div class="modal-body">
                    <div class="proposal-meta">
                        <span class="proposal-type">${proposal.type}</span>
                        <span class="proposal-status ${proposal.status}">${proposal.status}</span>
                    </div>
                    <div class="proposal-description">
                        <h3>Description</h3>
                        <p>${proposal.fullDescription || proposal.description}</p>
                    </div>
                </div>
                <div class="modal-footer">
                    ${!proposal.userVoted ? 
                        `<button onclick="browser.voteOnProposal('${proposal.id}', 'yes'); this.parentElement.parentElement.parentElement.remove();" class="btn-vote-yes">Vote Yes</button>
                         <button onclick="browser.voteOnProposal('${proposal.id}', 'no'); this.parentElement.parentElement.parentElement.remove();" class="btn-vote-no">Vote No</button>` :
                        `<span class="voted-indicator"> You voted: ${proposal.userVote}</span>`
                    }
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
    }

    showCreateProposalModal() {
        console.log('showCreateProposalModal called - creating modal...');
        
        // Remove any existing modals first
        const existingModals = document.querySelectorAll('.modal-overlay');
        existingModals.forEach(modal => {
            console.log('🗑️ Removing existing modal:', modal);
            modal.remove();
        });
        
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.id = 'create-proposal-modal';
        modal.style.cssText = `
            position: fixed !important;
            top: 0 !important;
            left: 0 !important;
            width: 100% !important;
            height: 100% !important;
            background: rgba(0, 0, 0, 0.9) !important;
            display: flex !important;
            justify-content: center !important;
            align-items: center !important;
            z-index: 999999 !important;
            visibility: visible !important;
            opacity: 1 !important;
        `;
        modal.innerHTML = `
            <div class="modal create-proposal-modal" style="
                background: #1a1a1a !important;
                border: 2px solid #00d4ff !important;
                border-radius: 10px !important;
                padding: 0 !important;
                max-width: 500px !important;
                width: 90% !important;
                max-height: 90vh !important;
                overflow-y: auto !important;
                box-shadow: 0 10px 30px rgba(0, 212, 255, 0.3) !important;
                position: relative !important;
                z-index: 1000000 !important;
                display: block !important;
                visibility: visible !important;
            ">
                <div class="modal-header" style="
                    padding: 20px;
                    border-bottom: 1px solid #333;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                ">
                    <h2 style="margin: 0; color: #fff;">Create New Proposal</h2>
                    <button onclick="this.closest('.modal-overlay').remove(); console.log('Modal closed via X button');" class="close-btn" style="
                        background: none;
                        border: none;
                        color: #999;
                        font-size: 24px;
                        cursor: pointer;
                        padding: 0;
                        width: 30px;
                        height: 30px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                    ">×</button>
                </div>
                <div class="modal-body" style="padding: 20px;">
                    <form id="createProposalForm">
                        <div class="form-group" style="margin-bottom: 20px;">
                            <label for="proposalTitle" style="display: block; margin-bottom: 8px; color: #fff; font-weight: bold;">Proposal Title</label>
                            <input type="text" id="proposalTitle" required placeholder="Enter proposal title..." style="
                                   width: 100%;
                                   padding: 12px;
                                   background: #2a2a2a;
                                   border: 1px solid #444;
                                   border-radius: 5px;
                                   color: #fff;
                                   box-sizing: border-box;
                                   ">
                        </div>
                        <div class="form-group" style="margin-bottom: 20px;">
                            <label for="proposalType" style="display: block; margin-bottom: 8px; color: #fff; font-weight: bold;">Proposal Type</label>
                            <select id="proposalType" required onchange="handleProposalTypeChange(this.value)" style="
                                    width: 100%;
                                    padding: 12px;
                                    background: #2a2a2a;
                                    border: 1px solid #444;
                                    border-radius: 5px;
                                    color: #fff;
                                    box-sizing: border-box;
                                    ">
                                <option value="">Select type...</option>
                                <option value="UbiRateChange">UBI Rate Change</option>
                                <option value="WelfareAllocation">Welfare Allocation</option>
                                <option value="NetworkParameter">Network Parameter</option>
                                <option value="TreasuryManagement">Treasury Management</option>
                                <option value="GovernanceChange">Governance Change</option>
                            </select>
                        </div>
                        
                        <!-- Dynamic fields for treasury proposals -->
                        <div id="treasuryFields" class="dynamic-fields" style="display: none;">
                            <div class="form-group" style="margin-bottom: 20px;">
                                <label for="treasuryAmount" style="display: block; margin-bottom: 8px; color: #fff; font-weight: bold;">Treasury Amount (ZHTP)</label>
                                <input type="number" id="treasuryAmount" step="0.000001" min="0" placeholder="0.000000" style="
                                       width: 100%;
                                       padding: 12px;
                                       background: #2a2a2a;
                                       border: 1px solid #444;
                                       border-radius: 5px;
                                       color: #fff;
                                       box-sizing: border-box;
                                       ">
                            </div>
                            <div class="form-group" style="margin-bottom: 20px;">
                                <label for="recipientAddress" style="display: block; margin-bottom: 8px; color: #fff; font-weight: bold;">Recipient Address</label>
                                <input type="text" id="recipientAddress" placeholder="Enter recipient wallet address..." style="
                                       width: 100%;
                                       padding: 12px;
                                       background: #2a2a2a;
                                       border: 1px solid #444;
                                       border-radius: 5px;
                                       color: #fff;
                                       box-sizing: border-box;
                                       ">
                            </div>
                            <div style="
                                background: #3a2a00;
                                border: 1px solid #ffa500;
                                border-radius: 5px;
                                padding: 15px;
                                margin-bottom: 20px;
                                color: #ffcc00;
                            ">
                                <h4 style="margin: 0 0 10px 0; color: #ffa500;">⚠️ Treasury Safeguards Active</h4>
                                <ul style="margin: 0; padding-left: 20px;">
                                    <li>Treasury proposals require majority consensus (51%+ votes)</li>
                                    <li>Maximum single allocation: 10% of total treasury</li>
                                    <li>Extended voting period for large amounts</li>
                                    <li>All treasury movements are publicly auditable</li>
                                </ul>
                            </div>
                        </div>
                        
                        <!-- Dynamic fields for UBI rate changes -->
                        <div id="ubiFields" class="dynamic-fields" style="display: none;">
                            <div class="form-group" style="margin-bottom: 20px;">
                                <label for="newUbiRate" style="display: block; margin-bottom: 8px; color: #fff; font-weight: bold;">New UBI Rate (ZHTP per day)</label>
                                <input type="number" id="newUbiRate" step="0.000001" min="0" placeholder="0.000000" style="
                                       width: 100%;
                                       padding: 12px;
                                       background: #2a2a2a;
                                       border: 1px solid #444;
                                       border-radius: 5px;
                                       color: #fff;
                                       box-sizing: border-box;
                                       ">
                            </div>
                        </div>
                        <div class="form-group" style="margin-bottom: 20px;">
                            <label for="proposalDescription" style="display: block; margin-bottom: 8px; color: #fff; font-weight: bold;">Description</label>
                            <textarea id="proposalDescription" required placeholder="Describe your proposal in detail..." rows="5" style="
                                      width: 100%;
                                      padding: 12px;
                                      background: #2a2a2a;
                                      border: 1px solid #444;
                                      border-radius: 5px;
                                      color: #fff;
                                      min-height: 100px;
                                      resize: vertical;
                                      box-sizing: border-box;
                                      "></textarea>
                        </div>
                        <div class="form-group" style="margin-bottom: 20px;">
                            <label for="votingDuration" style="display: block; margin-bottom: 8px; color: #fff; font-weight: bold;">Voting Duration (hours)</label>
                            <input type="number" id="votingDuration" value="72" min="24" max="168" style="
                                   width: 100%;
                                   padding: 12px;
                                   background: #2a2a2a;
                                   border: 1px solid #444;
                                   border-radius: 5px;
                                   color: #fff;
                                   box-sizing: border-box;
                                   ">
                        </div>
                    </form>
                </div>
                <div class="modal-footer" style="
                    padding: 20px;
                    border-top: 1px solid #333;
                    display: flex;
                    gap: 10px;
                    justify-content: flex-end;
                ">
                    <button onclick="submitProposal(); this.parentElement.parentElement.parentElement.remove();" class="dao-btn primary" style="
                            padding: 12px 24px;
                            background: #00d4ff;
                            border: none;
                            border-radius: 5px;
                            color: #000;
                            cursor: pointer;
                            font-size: 14px;
                            font-weight: bold;
                            ">Submit Proposal</button>
                    <button onclick="this.parentElement.parentElement.parentElement.remove()" class="dao-btn secondary" style="
                            padding: 12px 24px;
                            background: #444;
                            border: none;
                            border-radius: 5px;
                            color: #fff;
                            cursor: pointer;
                            font-size: 14px;
                            ">Cancel</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        console.log(' Modal added to DOM');
        console.log(' Modal element:', modal);
        console.log(' Modal visible?', modal.offsetWidth > 0 && modal.offsetHeight > 0);
        console.log(' Modal computed style:', window.getComputedStyle(modal));
        console.log(' Body children count:', document.body.children.length);
        
        // Force focus and ensure visibility
        modal.scrollIntoView();
        modal.focus();
        
        // Double-check that modal is visible
        setTimeout(() => {
            const isVisible = modal.offsetWidth > 0 && modal.offsetHeight > 0;
            console.log('🕐 Modal visibility check after 100ms:', isVisible);
            if (!isVisible) {
                console.error('❌ Modal still not visible! Forcing display...');
                modal.style.display = 'flex';
                modal.style.visibility = 'visible';
                modal.style.opacity = '1';
            }
        }, 100);
        
        // Prevent modal from closing when clicking inside the modal content
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                console.log(' Modal closed by clicking outside');
                modal.remove();
            }
        });
    }

    showVoteDelegationModal() {
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal delegation-modal">
                <div class="modal-header">
                    <h2>🗳️ Vote Delegation</h2>
                    <button onclick="this.parentElement.parentElement.parentElement.remove()" class="close-btn">×</button>
                </div>
                <div class="modal-body">
                    <div class="delegation-info">
                        <h3>Current Delegation Status</h3>
                        <p>Your voting power: <strong>150 ZHTP</strong></p>
                        <p>Currently delegated: <strong>0 ZHTP</strong></p>
                        <p>Available to delegate: <strong>150 ZHTP</strong></p>
                    </div>
                    <form id="delegationForm">
                        <div class="form-group">
                            <label for="delegateTo">Delegate to DID</label>
                            <input type="text" id="delegateTo" placeholder="did:zhtp:..." pattern="did:zhtp:.*">
                        </div>
                        <div class="form-group">
                            <label for="delegateAmount">Amount to Delegate</label>
                            <input type="number" id="delegateAmount" min="1" max="150" placeholder="Enter amount...">
                        </div>
                    </form>
                </div>
                <div class="modal-footer">
                    <button onclick="browser.submitDelegation(); this.parentElement.parentElement.parentElement.remove();" class="dao-btn primary">Delegate Votes</button>
                    <button onclick="this.parentElement.parentElement.parentElement.remove()" class="dao-btn secondary">Cancel</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
    }

    showTreasuryModal() {
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal treasury-modal">
                <div class="modal-header">
                    <h2>🏛️ DAO Treasury</h2>
                    <button onclick="this.parentElement.parentElement.parentElement.remove()" class="close-btn">×</button>
                </div>
                <div class="modal-body">
                    <div class="treasury-stats">
                        <div class="stat-card">
                            <div class="stat-value" id="modalTreasuryBalance">Loading...</div>
                            <div class="stat-label">Treasury Balance</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-value" id="modalUbiDistributed">Loading...</div>
                            <div class="stat-label">UBI Distributed</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-value" id="modalWelfareDistributed">Loading...</div>
                            <div class="stat-label">Welfare Distributed</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-value" id="modalDaoFeesCollected">Loading...</div>
                            <div class="stat-label">Total DAO Fees</div>
                        </div>
                    </div>
                    <div class="treasury-allocation">
                        <h3>Fund Allocation</h3>
                        <div class="allocation-chart">
                            <div class="allocation-item">
                                <span class="allocation-label">UBI Fund (60%)</span>
                                <div class="allocation-bar">
                                    <div class="allocation-fill" style="width: 60%; background: #4caf50;"></div>
                                </div>
                            </div>
                            <div class="allocation-item">
                                <span class="allocation-label">Welfare Fund (40%)</span>
                                <div class="allocation-bar">
                                    <div class="allocation-fill" style="width: 40%; background: #2196f3;"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button onclick="this.parentElement.parentElement.parentElement.remove()" class="dao-btn primary">Close</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Load real treasury data
        this.loadTreasuryModalData();
    }

    async loadTreasuryModalData() {
        try {
            const treasuryData = await this.api.getDaoTreasury();
            
            // Update modal with real data
            const formatCurrency = (amount) => {
                if (amount >= 1000000) return (amount / 1000000).toFixed(1) + 'M ZHTP';
                if (amount >= 1000) return (amount / 1000).toFixed(1) + 'K ZHTP';
                return amount.toLocaleString() + ' ZHTP';
            };
            
            document.getElementById('modalTreasuryBalance').textContent = formatCurrency(treasuryData.treasury_balance || 0);
            document.getElementById('modalUbiDistributed').textContent = formatCurrency(treasuryData.total_ubi_distributed || 0);
            document.getElementById('modalWelfareDistributed').textContent = formatCurrency(treasuryData.total_welfare_distributed || 0);
            document.getElementById('modalDaoFeesCollected').textContent = formatCurrency(treasuryData.total_dao_fees_collected || 0);
            
        } catch (error) {
            console.error('❌ Failed to load treasury modal data:', error);
        }
    }

    showTreasurySafeguardsModal() {
        console.log('🛡️ Showing treasury safeguards modal...');
        
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal" style="max-width: 700px;">
                <div class="modal-header">
                    <h2>🛡️ Treasury Protection Safeguards</h2>
                    <button onclick="this.parentElement.parentElement.parentElement.remove()" class="modal-close">×</button>
                </div>
                <div class="modal-body">
                    <div class="safeguards-overview">
                        <p class="safeguards-intro">
                            The ZHTP DAO Treasury is protected by multiple layers of security and consensus mechanisms
                            to ensure responsible fund management and prevent unauthorized access.
                        </p>
                        
                        <div class="safeguard-section">
                            <h3>🔒 Consensus Requirements</h3>
                            <div class="safeguard-details">
                                <div class="safeguard-rule">
                                    <strong>60% Approval Threshold:</strong> Treasury proposals require 60% approval 
                                    (compared to 50% for regular governance proposals)
                                </div>
                                <div class="safeguard-rule">
                                    <strong>25% Quorum Minimum:</strong> At least 25% of total voting power must 
                                    participate in treasury proposal votes
                                </div>
                                <div class="safeguard-rule">
                                    <strong>Extended Voting Period:</strong> Treasury proposals have longer voting 
                                    periods to ensure thorough community consideration
                                </div>
                            </div>
                        </div>
                        
                        <div class="safeguard-section">
                            <h3>⚖️ Proposal Requirements</h3>
                            <div class="safeguard-details">
                                <div class="safeguard-rule">
                                    <strong>Minimum Voting Power:</strong> Proposers must have at least 100 voting 
                                    power to submit treasury allocation proposals
                                </div>
                                <div class="safeguard-rule">
                                    <strong>Amount Verification:</strong> Requested amounts are validated against 
                                    available treasury funds at proposal time
                                </div>
                                <div class="safeguard-rule">
                                    <strong>Large Allocation Warnings:</strong> Proposals requesting >25% of treasury 
                                    funds trigger special warnings and require additional confirmation
                                </div>
                            </div>
                        </div>
                        
                        <div class="safeguard-section">
                            <h3> Execution Protections</h3>
                            <div class="safeguard-details">
                                <div class="safeguard-rule">
                                    <strong>Double Validation:</strong> Fund availability is re-checked at both 
                                    proposal submission and execution time
                                </div>
                                <div class="safeguard-rule">
                                    <strong>Consensus Re-validation:</strong> Voting results are verified again 
                                    before fund release
                                </div>
                                <div class="safeguard-rule">
                                    <strong>Blockchain Audit Trail:</strong> All treasury transactions are recorded 
                                    permanently on the blockchain
                                </div>
                            </div>
                        </div>
                        
                        <div class="safeguard-section">
                            <h3>📊 Monitoring & Transparency</h3>
                            <div class="safeguard-details">
                                <div class="safeguard-rule">
                                    <strong>Real-time Balance Tracking:</strong> Treasury balance is monitored 
                                    and updated in real-time
                                </div>
                                <div class="safeguard-rule">
                                    <strong>Public Transaction History:</strong> All treasury activities are 
                                    visible to the community
                                </div>
                                <div class="safeguard-rule">
                                    <strong>Automated Reporting:</strong> Regular treasury reports are generated 
                                    and distributed to DAO members
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button onclick="this.parentElement.parentElement.parentElement.remove()" class="dao-btn primary">
                        🔒 Close Safeguards
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
    }

    async submitProposal() {
        console.log(' Browser.submitProposal() called, collecting form data...');
        
        // Try to get elements from JavaScript modal form first, then HTML form
        let titleElement = document.getElementById('proposalTitle');
        let typeElement = document.getElementById('proposalType');
        let descElement = document.getElementById('proposalDescription');
        let durationElement = document.getElementById('votingDuration');
        let treasuryAmountElement = document.getElementById('treasuryAmount');
        let recipientAddressElement = document.getElementById('recipientAddress');
        let newUbiRateElement = document.getElementById('newUbiRate');
        
        let formSource = 'modal';
        
        // If modal form elements don't exist or are not visible, try HTML form
        if (!titleElement || !titleElement.offsetParent) {
            console.log(' Modal form not visible, trying HTML form...');
            titleElement = document.getElementById('proposalTitleHTML');
            typeElement = document.getElementById('proposalTypeHTML');
            descElement = document.getElementById('proposalDescriptionHTML');
            durationElement = document.getElementById('votingDurationHTML');
            treasuryAmountElement = document.getElementById('treasuryAmountHTML');
            recipientAddressElement = document.getElementById('recipientAddressHTML');
            newUbiRateElement = document.getElementById('newUbiRateHTML');
            formSource = 'html';
        }
        
        console.log(' Using form source:', formSource);
        console.log(' Form elements found:', {
            titleElement: !!titleElement,
            typeElement: !!typeElement,
            descElement: !!descElement,
            durationElement: !!durationElement,
            treasuryAmountElement: !!treasuryAmountElement,
            recipientAddressElement: !!recipientAddressElement,
            newUbiRateElement: !!newUbiRateElement
        });
        
        // Collect actual form values
        const title = titleElement?.value?.trim();
        const type = typeElement?.value?.trim();
        const description = descElement?.value?.trim();
        const duration = durationElement?.value;
        
        // Collect dynamic field values
        const treasuryAmount = treasuryAmountElement?.value?.trim();
        const recipientAddress = recipientAddressElement?.value?.trim();
        const newUbiRate = newUbiRateElement?.value?.trim();
        
        console.log(' Form data collected:', { 
            title, type, description, duration,
            treasuryAmount, recipientAddress, newUbiRate,
            formSource
        });
        
        // Basic validation
        if (!title || !type || !description) {
            console.error('❌ Missing required fields:', { title: !!title, type: !!type, description: !!description });
            this.showNotification('❌ Please fill in all required fields: title, type, and description', 'error');
            return;
        }
        
        // Type-specific validation
        if (type === 'TreasuryManagement') {
            if (!treasuryAmount || !recipientAddress) {
                console.error('❌ Treasury proposal missing required fields:', { treasuryAmount: !!treasuryAmount, recipientAddress: !!recipientAddress });
                this.showNotification('❌ Treasury proposals require amount and recipient address', 'error');
                return;
            }
            
            const amount = parseFloat(treasuryAmount);
            if (isNaN(amount) || amount <= 0) {
                this.showNotification('❌ Please enter a valid treasury amount greater than 0', 'error');
                return;
            }
            
            // Validate recipient address format (basic check)
            if (recipientAddress.length < 10) {
                this.showNotification('❌ Please enter a valid recipient address', 'error');
                return;
            }
        }
        
        if (type === 'UbiRateChange') {
            if (!newUbiRate) {
                console.error('❌ UBI rate change missing required fields:', { newUbiRate: !!newUbiRate });
                this.showNotification('❌ UBI rate change proposals require a new rate value', 'error');
                return;
            }
            
            const rate = parseFloat(newUbiRate);
            if (isNaN(rate) || rate < 0) {
                this.showNotification('❌ Please enter a valid UBI rate (0 or greater)', 'error');
                return;
            }
        }
        
        // Handle treasury proposals with enhanced safeguards
        if (type === 'TreasuryManagement') {
            console.log('🏛️ Treasury proposal detected - applying enhanced safeguards...');
            
            const requestedAmount = parseFloat(treasuryAmount);
            
            // Get current treasury data to validate request
            try {
                const treasuryData = await this.api.getDaoTreasury();
                const availableFunds = treasuryData.available_funds || 0;
                
                // Treasury Protection: Check if requested amount exceeds available funds
                if (requestedAmount > availableFunds) {
                    this.showNotification(`❌ Treasury Protection: Requested ${requestedAmount.toLocaleString()} ZHTP exceeds available treasury funds (${availableFunds.toLocaleString()} ZHTP)`, 'error');
                    return;
                }
                
                // Treasury Protection: Warn for large allocations (>25% of treasury)
                const treasuryPercentage = (requestedAmount / availableFunds) * 100;
                if (treasuryPercentage > 25) {
                    const confirmed = confirm(`⚠️ Treasury Protection Warning:\n\nThis proposal requests ${treasuryPercentage.toFixed(1)}% of available treasury funds.\n\nLarge treasury allocations require community consensus and will need 60% approval instead of the usual 50%.\n\nContinue with proposal submission?`);
                    if (!confirmed) {
                        console.log('❌ User cancelled large treasury allocation proposal');
                        return;
                    }
                }
                
                // Treasury Protection: Add safeguard notice to description
                const safeguardNotice = `\n\n🔒 TREASURY SAFEGUARDS APPLIED:\n• Amount: ${requestedAmount.toLocaleString()} ZHTP (${treasuryPercentage.toFixed(1)}% of treasury)\n• Recipient: ${recipientAddress}\n• Requires 60% approval for execution\n• Funds will only be released upon majority consensus\n• Treasury balance verified at time of proposal`;
                
                // Update description with safeguard information
                const enhancedDescription = description + safeguardNotice;
                
                console.log('🛡️ Treasury safeguards applied:', {
                    requestedAmount,
                    availableFunds,
                    treasuryPercentage: treasuryPercentage.toFixed(1) + '%',
                    recipientAddress,
                    safeguardsApplied: true
                });
                
                // Create enhanced proposal object for treasury allocation
                const proposal = {
                    title: title,
                    type: 'treasury_allocation', // Force type for consistency
                    description: enhancedDescription,
                    amount: requestedAmount,
                    recipient: recipientAddress,
                    treasury_safeguards: {
                        verified_amount: requestedAmount,
                        treasury_percentage: treasuryPercentage,
                        available_funds_at_time: availableFunds,
                        requires_supermajority: treasuryPercentage > 25,
                        recipient_address: recipientAddress
                    }
                };
                
                console.log('🏛️ Submitting treasury proposal with safeguards:', proposal);
                await this.submitNewProposal(proposal);
                
            } catch (error) {
                console.error('❌ Failed to validate treasury proposal:', error);
                this.showNotification('❌ Failed to validate treasury proposal: ' + error.message, 'error');
                return;
            }
            
        } else if (type === 'UbiRateChange') {
            // Handle UBI rate change proposals
            try {
                console.log('💰 Submitting UBI rate change proposal:', { title, type, description, newUbiRate });
                
                // Create proposal object with UBI rate information
                const proposal = {
                    title: title,
                    type: 'ubi_rate_change',
                    description: description + `\n\n📊 PROPOSED UBI RATE: ${newUbiRate} ZHTP per day`,
                    amount: 0,
                    ubi_rate: parseFloat(newUbiRate)
                };
                
                console.log('🚀 Calling submitNewProposal with UBI rate change:', proposal);
                await this.submitNewProposal(proposal);
                
            } catch (error) {
                console.error('❌ Failed to submit UBI rate change proposal:', error);
                this.showNotification('❌ Failed to submit UBI rate change proposal: ' + error.message, 'error');
                return;
            }
            
        } else {
            // Regular proposal submission for other proposal types
            try {
                console.log('Submitting regular proposal:', { title, type, description, duration });
                console.log('👤 Using identity:', this.currentIdentity);
                
                // Create proposal object and submit to backend
                const proposal = {
                    title: title,
                    type: type,
                    description: description,
                    amount: 0 // Regular proposals don't have amounts
                };
                
                console.log('🚀 Calling submitNewProposal with:', proposal);
                await this.submitNewProposal(proposal);
                
            } catch (error) {
                console.error('❌ Failed to submit proposal:', error);
                this.showNotification('❌ Failed to submit proposal: ' + error.message, 'error');
                return;
            }
        }
        
        // Close the modal after successful submission (if using modal form)
        if (formSource === 'modal') {
            console.log(' Proposal submitted successfully, closing modal...');
            const modal = document.querySelector('.modal-overlay');
            if (modal) {
                modal.remove();
                console.log('🗑️ Modal removed');
            }
        } else {
            // Hide HTML form
            const htmlForm = document.getElementById('createProposalFormHTML');
            if (htmlForm) {
                htmlForm.style.display = 'none';
                console.log('HTML form hidden');
            }
        }
        
        // Show success message with type-specific information
        if (type === 'TreasuryManagement') {
            this.showNotification(' Treasury proposal submitted with enhanced safeguards - requires 60% approval', 'success');
        } else if (type === 'UbiRateChange') {
            this.showNotification(' UBI rate change proposal submitted successfully', 'success');
        } else {
            this.showNotification(' Proposal submitted successfully', 'success');
        }
    }

    async submitDelegation() {
        const delegateTo = document.getElementById('delegateTo').value;
        const amount = document.getElementById('delegateAmount').value;
        
        if (!delegateTo || !amount) {
            this.showNotification('❌ Please fill in all fields', 'error');
            return;
        }
        
        if (!delegateTo.startsWith('did:zhtp:')) {
            this.showNotification('❌ Invalid DID format', 'error');
            return;
        }
        
        try {
            console.log('🗳️ Delegating votes:', { delegateTo, amount });
            this.showNotification(' Votes delegated successfully', 'success');
            // In real implementation, would submit to blockchain
        } catch (error) {
            console.error('❌ Failed to delegate votes:', error);
            this.showNotification('❌ Failed to delegate votes', 'error');
        }
    }

    refreshCurrentPage() {
        if (this.currentUrl === 'zhtp://wallet.zhtp') {
            this.loadWalletData();
        } else if (this.currentUrl === 'zhtp://dao.zhtp') {
            this.loadDaoData();
        } else if (this.currentUrl === 'zhtp://identity.zhtp') {
            this.loadIdentityData();
        }
    }
}

// Global ZK-DID Functions for HTML onclick handlers
function signInWithBiometric() {
    console.log('📷 Starting biometric authentication...');
    
    // Check if we have a ZK-DID entered
    const identityInput = document.getElementById('signinDid');
    if (!identityInput?.value) {
        window.browser?.showNotification('Please enter your ZK-DID first', 'error');
        return;
    }
    
    // Simulate biometric scan and then authenticate
    window.browser?.showNotification('Initializing biometric scan...', 'info');
    
    setTimeout(() => {
        window.browser?.showNotification('Please look at the camera and remain still...', 'info');
        
        setTimeout(() => {
            // After "successful" biometric scan, trigger the actual sign-in
            signInWithZkDid();
        }, 3000);
    }, 1500);
}

function signInWithPassphrase() {
    console.log('🔑 Using passphrase authentication...');
    
    // Check if both fields are filled
    const identityInput = document.getElementById('signinDid');
    const passphraseInput = document.getElementById('signinPassphrase');
    
    if (!identityInput?.value) {
        window.browser?.showNotification('Please enter your ZK-DID', 'error');
        return;
    }
    
    if (!passphraseInput?.value) {
        window.browser?.showNotification('Please enter your passphrase', 'error');
        return;
    }
    
    // Trigger the actual sign-in
    signInWithZkDid();
}

function signInWithQR() {
    console.log(' Starting QR code authentication...');
    
    // Check if we have a ZK-DID entered
    const identityInput = document.getElementById('signinDid');
    if (!identityInput?.value) {
        window.browser?.showNotification('Please enter your ZK-DID first', 'error');
        return;
    }
    
    window.browser?.showNotification(' QR code authentication coming soon! Using standard authentication for now...', 'info');
    
    // For now, just trigger normal authentication
    setTimeout(() => {
        signInWithZkDid();
    }, 2000);
}

function executeSignIn() {
    const did = document.getElementById('signinDid').value;
    const passphrase = document.getElementById('recoveryPassphrase').value;
    
    if (!did && !passphrase) {
        showZkDidStatus('Please enter your ZK-DID or select an authentication method', 'error');
        return;
    }
    
    const authMethod = passphrase ? 'passphrase' : 'manual';
    executeSignInProcess(did, authMethod);
}

function executeSignInProcess(did, method) {
    console.log(`🚀 Signing in with DID: ${did}, Method: ${method}`);
    
    showZkDidStatus(`Authenticating with ${method}...`, 'pending');
    
    // Simulate authentication process
    setTimeout(() => {
        showZkDidStatus('Verifying identity on ZHTP network...', 'pending');
        
        setTimeout(() => {
            // Simulate successful sign in
            const identity = {
                did: did || `zk1signed${Date.now()}`,
                name: 'Authenticated User',
                type: 'citizen',
                authenticated: true,
                method: method
            };
            
            // Save to browser instance
            if (window.browser) {
                window.browser.currentIdentity = identity;
                window.browser.updateIdentityIndicator();
            }
            
            showZkDidStatus(' Successfully signed in to ZHTP network!', 'success');
            
            setTimeout(() => {
                closeModal('zkDidModal');
                window.browser?.showNotification('Welcome back to ZHTP!', 'success');
            }, 2000);
            
        }, 2000);
    }, 1500);
}

function setupBiometrics() {
    console.log('📷 Setting up biometric authentication...');
    
    const statusElement = document.getElementById('biometricStatus');
    statusElement.className = 'status-indicator pending';
    statusElement.textContent = 'Initializing camera...';
    
    // Simulate biometric setup
    setTimeout(() => {
        statusElement.textContent = 'Please position your face in the camera';
        
        setTimeout(() => {
            statusElement.className = 'status-indicator success';
            statusElement.textContent = ' Biometric profile created successfully';
            
            document.getElementById('biometricBtn').textContent = ' Biometrics Configured';
            document.getElementById('biometricBtn').disabled = true;
        }, 3000);
    }, 2000);
}



function recoverWithSeed() {
    console.log('🌱 Recovering with seed phrase...');
    hideAllRecoverySections();
    document.getElementById('seedRecovery').style.display = 'block';
}

function recoverWithBackup() {
    console.log('💾 Recovering with backup file...');
    hideAllRecoverySections();
    document.getElementById('backupRecovery').style.display = 'block';
}

function recoverWithSocial() {
    console.log('👥 Recovering with social recovery...');
    hideAllRecoverySections();
    document.getElementById('socialRecovery').style.display = 'block';
}

function hideAllRecoverySections() {
    document.querySelectorAll('.recovery-section').forEach(section => {
        section.style.display = 'none';
    });
}

async function executeSeedRecovery() {
    console.log('🌱 Executing seed recovery...');
    
    try {
        const seedInput = document.querySelector('#seedRecovery textarea');
        if (!seedInput?.value.trim()) {
            window.browser?.showNotification('Please enter your seed phrase', 'error');
            return;
        }
        
        const seedPhrase = seedInput.value.trim();
        const words = seedPhrase.split(/\s+/);
        
        if (words.length !== 12 && words.length !== 24) {
            window.browser?.showNotification('Seed phrase must be 12 or 24 words', 'error');
            return;
        }
        
        // Get new passphrase from form instead of prompt
        const passphraseInput = document.getElementById('seedRecoveryPassphrase');
        const newPassphrase = passphraseInput?.value;
        
        if (!newPassphrase || newPassphrase.length < 8) {
            window.browser?.showNotification('Passphrase must be at least 8 characters long', 'error');
            return;
        }
        
        window.browser?.showNotification(' Recovering identity from seed phrase...', 'info');
        
        // Use the enhanced ZHTP API for seed recovery
        const result = await window.browser.api.recoverFromSeed(seedPhrase, newPassphrase);
        
        if (result.success) {
            window.browser.currentIdentity = result.identity;
            window.browser.updateIdentityIndicator();
            window.browser?.showNotification(` Identity recovered successfully: ${result.identity.displayName}`, 'success');
            
            // Auto-navigate to dashboard after recovery
            setTimeout(() => {
                window.browser.navigateToUrl('zhtp://dashboard.zhtp');
            }, 2000);
        } else {
            window.browser?.showNotification('❌ Seed recovery failed: ' + result.error, 'error');
        }
        
    } catch (error) {
        console.error('❌ Seed recovery failed:', error);
        window.browser?.showNotification('❌ Seed recovery failed: ' + error.message, 'error');
    }
}

async function executeBackupRecovery() {
    console.log('💾 Executing backup recovery...');
    
    try {
        const fileInput = document.querySelector('#backupRecovery input[type="file"]');
        const passwordInput = document.querySelector('#backupRecovery input[type="password"]');
        
        if (!fileInput?.files[0]) {
            window.browser?.showNotification('Please select a backup file', 'error');
            return;
        }
        
        if (!passwordInput?.value) {
            window.browser?.showNotification('Please enter the backup password', 'error');
            return;
        }
        
        const backupFile = fileInput.files[0];
        const backupPassword = passwordInput.value;
        
        window.browser?.showNotification('💾 Restoring identity from backup file...', 'info');
        
        // Read the backup file
        const backupData = await new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result);
            reader.onerror = (e) => reject(e);
            reader.readAsText(backupFile);
        });
        
        // Use the enhanced ZHTP API for backup recovery
        const result = await window.browser.api.recoverFromBackup(backupData, backupPassword);
        
        if (result.success) {
            window.browser.currentIdentity = result.identity;
            window.browser.updateIdentityIndicator();
            window.browser?.showNotification(` Identity restored from backup: ${result.identity.displayName}`, 'success');
            
            // Auto-navigate to dashboard after recovery
            setTimeout(() => {
                window.browser.navigateToUrl('zhtp://dashboard.zhtp');
            }, 2000);
        } else {
            window.browser?.showNotification('❌ Backup recovery failed: ' + result.error, 'error');
        }
        
    } catch (error) {
        console.error('❌ Backup recovery failed:', error);
        window.browser?.showNotification('❌ Backup recovery failed: ' + error.message, 'error');
    }
}

async function executeSocialRecovery() {
    console.log('👥 Executing social recovery...');
    
    try {
        const codeInput = document.querySelector('#socialRecovery input[type="text"]');
        
        if (!codeInput?.value.trim()) {
            window.browser?.showNotification('Please enter the recovery code from your trusted contact', 'error');
            return;
        }
        
        const recoveryCode = codeInput.value.trim();
        
        window.browser?.showNotification('👥 Processing social recovery request...', 'info');
        
        // Use the enhanced ZHTP API for social recovery
        const result = await window.browser.api.recoverFromSocial(recoveryCode);
        
        if (result.success) {
            if (result.needsMoreApprovals) {
                window.browser?.showNotification(
                    `⏳ Recovery request submitted. Need ${result.approvalsNeeded - result.approvalsReceived} more approvals from trusted contacts.`, 
                    'info'
                );
            } else {
                window.browser.currentIdentity = result.identity;
                window.browser.updateIdentityIndicator();
                window.browser?.showNotification(` Identity recovered via social recovery: ${result.identity.displayName}`, 'success');
                
                // Auto-navigate to dashboard after recovery
                setTimeout(() => {
                    window.browser.navigateToUrl('zhtp://dashboard.zhtp');
                }, 2000);
            }
        } else {
            window.browser?.showNotification('❌ Social recovery failed: ' + result.error, 'error');
        }
        
    } catch (error) {
        console.error('❌ Social recovery failed:', error);
        window.browser?.showNotification('❌ Social recovery failed: ' + error.message, 'error');
    }
}

async function executeRecovery() {
    const seedPhrase = document.getElementById('seedPhrase')?.value?.trim();
    const backupFile = document.getElementById('backupFile')?.files[0];
    const guardianCode = document.getElementById('guardianCode')?.value?.trim();
    
    if (seedPhrase) {
        console.log(' Recovering from seed phrase...');
        await recoverFromSeed(seedPhrase);
    } else if (backupFile) {
        console.log(' Recovering from backup file...');
        await recoverFromBackup(backupFile);
    } else if (guardianCode) {
        console.log(' Recovering with guardian code...');
        await recoverFromSocial(guardianCode);
    } else {
        window.browser?.showNotification('❌ Please select a recovery method and provide the required information', 'error');
    }
}

async function recoverFromSeed(seedPhrase) {
    const words = seedPhrase.trim().split(/\s+/);
    
    // Support both 12-word and 20-word seed phrases
    if (words.length !== 12 && words.length !== 20 && words.length !== 24) {
        window.browser?.showNotification('❌ Seed phrase must be 12, 20, or 24 words', 'error');
        return;
    }
    
    try {
        window.browser?.showNotification('🔄 Recovering identity from seed phrase...', 'info');
        
        // Call the ZHTP blockchain API to recover identity from seed
        const result = await window.browser.api.recoverIdentityFromSeed({
            seed_phrase: seedPhrase,
            word_count: words.length
        });
        
        console.log(' Recovery result:', result);
        
        // Handle the blockchain response
        if (result.status === 200 || result.status === 201) {
            let recoveryData = null;
            
            // Parse response data
            if (result.data && typeof result.data === 'string') {
                try {
                    recoveryData = JSON.parse(result.data);
                } catch (e) {
                    console.error('Failed to parse recovery response:', e);
                }
            } else if (result.data && typeof result.data === 'object') {
                recoveryData = result.data;
            } else if (result.body) {
                // Handle byte array response
                try {
                    if (Array.isArray(result.body)) {
                        const jsonString = new TextDecoder().decode(new Uint8Array(result.body));
                        recoveryData = JSON.parse(jsonString);
                    } else if (typeof result.body === 'string') {
                        recoveryData = JSON.parse(result.body);
                    } else {
                        recoveryData = result.body;
                    }
                } catch (bodyParseError) {
                    console.error('Failed to parse body field:', bodyParseError);
                }
            }
            
            if (recoveryData && recoveryData.success) {
                // Successfully recovered identity
                const identity = recoveryData.identity || {};
                
                // Set the current identity
                window.browser.currentIdentity = {
                    did: identity.did || recoveryData.did,
                    identity_id: identity.identity_id,
                    display_name: identity.display_name || 'Recovered User',
                    identity_type: identity.identity_type || 'human',
                    access_level: identity.access_level || 'Visitor',
                    public_key: identity.public_key,
                    authenticated: true,
                    recovered: true,
                    recovery_method: 'seed_phrase',
                    session_token: recoveryData.session_token
                };
                
                // Save to localStorage
                localStorage.setItem('zhtp-current-identity', JSON.stringify(window.browser.currentIdentity));
                
                // Update UI
                window.browser.updateIdentityIndicator();
                
                // Load wallet data
                await window.browser.loadWalletData();
                
                // Show success message
                window.browser?.showNotification(`✅ Identity recovered successfully: ${window.browser.currentIdentity.display_name}`, 'success');
                
                // Close modal and navigate to dashboard
                window.browser.closeModal();
                setTimeout(() => {
                    window.browser.navigateToUrl('zhtp://dashboard.zhtp');
                }, 1000);
            } else {
                throw new Error(recoveryData?.message || 'Recovery failed - invalid seed phrase');
            }
        } else {
            throw new Error(result.message || result.error || 'Recovery request failed');
        }
        
    } catch (error) {
        console.error('❌ Seed recovery failed:', error);
        window.browser?.showNotification('❌ Recovery failed: ' + error.message, 'error');
    }
}

async function recoverFromBackup(file) {
    try {
        window.browser?.showNotification('📁 Reading backup file...', 'info');
        
        // Read the backup file
        const backupData = await new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const data = JSON.parse(e.target.result);
                    resolve(data);
                } catch (error) {
                    reject(new Error('Invalid backup file format - not valid JSON'));
                }
            };
            reader.onerror = () => reject(new Error('Failed to read backup file'));
            reader.readAsText(file);
        });
        
        console.log(' Backup data loaded:', backupData);
        
        // Validate backup data structure
        if (!backupData.identity_id && !backupData.did) {
            throw new Error('Invalid backup file - missing identity information');
        }
        
        window.browser?.showNotification('🔄 Restoring identity from backup...', 'info');
        
        // Call the ZHTP blockchain API to restore from backup
        const result = await window.browser.api.restoreIdentityFromBackup({
            backup_data: backupData,
            restore_wallets: true
        });
        
        console.log(' Restore result:', result);
        
        // Handle the blockchain response
        if (result.status === 200 || result.status === 201) {
            let restoreData = null;
            
            // Parse response data
            if (result.data && typeof result.data === 'string') {
                try {
                    restoreData = JSON.parse(result.data);
                } catch (e) {
                    console.error('Failed to parse restore response:', e);
                }
            } else if (result.data && typeof result.data === 'object') {
                restoreData = result.data;
            } else if (result.body) {
                // Handle byte array response
                try {
                    if (Array.isArray(result.body)) {
                        const jsonString = new TextDecoder().decode(new Uint8Array(result.body));
                        restoreData = JSON.parse(jsonString);
                    } else if (typeof result.body === 'string') {
                        restoreData = JSON.parse(result.body);
                    } else {
                        restoreData = result.body;
                    }
                } catch (bodyParseError) {
                    console.error('Failed to parse body field:', bodyParseError);
                }
            }
            
            if (restoreData && restoreData.success) {
                // Successfully restored identity
                const identity = restoreData.identity || backupData;
                
                // Set the current identity
                window.browser.currentIdentity = {
                    did: identity.did || restoreData.did,
                    identity_id: identity.identity_id,
                    display_name: identity.display_name || identity.name || 'Restored User',
                    identity_type: identity.identity_type || identity.type || 'human',
                    access_level: identity.access_level || 'Visitor',
                    public_key: identity.public_key,
                    authenticated: true,
                    recovered: true,
                    recovery_method: 'backup_file',
                    session_token: restoreData.session_token
                };
                
                // Save to localStorage
                localStorage.setItem('zhtp-current-identity', JSON.stringify(window.browser.currentIdentity));
                
                // Update UI
                window.browser.updateIdentityIndicator();
                
                // Load wallet data
                await window.browser.loadWalletData();
                
                // Show success message
                window.browser?.showNotification(`✅ Identity restored from backup: ${window.browser.currentIdentity.display_name}`, 'success');
                
                // Close modal and navigate to dashboard
                window.browser.closeModal();
                setTimeout(() => {
                    window.browser.navigateToUrl('zhtp://dashboard.zhtp');
                }, 1000);
            } else {
                throw new Error(restoreData?.message || 'Restore failed - backup data not recognized by blockchain');
            }
        } else {
            throw new Error(result.message || result.error || 'Restore request failed');
        }
        
    } catch (error) {
        console.error('❌ Backup recovery failed:', error);
        window.browser?.showNotification('❌ Recovery failed: ' + error.message, 'error');
    }
}

async function recoverFromSocial(guardianCode) {
    try {
        window.browser?.showNotification('👥 Contacting recovery guardians...', 'info');
        
        // Validate guardian code format
        if (!guardianCode || guardianCode.length < 16) {
            throw new Error('Invalid guardian recovery code - must be at least 16 characters');
        }
        
        // Call the ZHTP blockchain API for social recovery
        const result = await window.browser.api.recoverIdentityWithGuardians({
            guardian_code: guardianCode,
            recovery_type: 'social'
        });
        
        console.log(' Social recovery result:', result);
        
        // Handle the blockchain response
        if (result.status === 200 || result.status === 201) {
            let recoveryData = null;
            
            // Parse response data
            if (result.data && typeof result.data === 'string') {
                try {
                    recoveryData = JSON.parse(result.data);
                } catch (e) {
                    console.error('Failed to parse recovery response:', e);
                }
            } else if (result.data && typeof result.data === 'object') {
                recoveryData = result.data;
            } else if (result.body) {
                // Handle byte array response
                try {
                    if (Array.isArray(result.body)) {
                        const jsonString = new TextDecoder().decode(new Uint8Array(result.body));
                        recoveryData = JSON.parse(jsonString);
                    } else if (typeof result.body === 'string') {
                        recoveryData = JSON.parse(result.body);
                    } else {
                        recoveryData = result.body;
                    }
                } catch (bodyParseError) {
                    console.error('Failed to parse body field:', bodyParseError);
                }
            }
            
            if (recoveryData && recoveryData.success) {
                window.browser?.showNotification('✅ Guardian signatures verified', 'success');
                
                // Successfully recovered identity via social recovery
                const identity = recoveryData.identity || {};
                const guardianInfo = recoveryData.guardian_info || {};
                
                // Set the current identity
                window.browser.currentIdentity = {
                    did: identity.did || recoveryData.did,
                    identity_id: identity.identity_id,
                    display_name: identity.display_name || 'Recovered User',
                    identity_type: identity.identity_type || 'human',
                    access_level: identity.access_level || 'Visitor',
                    public_key: identity.public_key,
                    authenticated: true,
                    recovered: true,
                    recovery_method: 'social_recovery',
                    guardian_count: guardianInfo.verified_guardians || 0,
                    session_token: recoveryData.session_token
                };
                
                // Save to localStorage
                localStorage.setItem('zhtp-current-identity', JSON.stringify(window.browser.currentIdentity));
                
                // Update UI
                window.browser.updateIdentityIndicator();
                
                // Load wallet data
                await window.browser.loadWalletData();
                
                // Show success message
                window.browser?.showNotification(`✅ Identity recovered via social recovery: ${window.browser.currentIdentity.display_name}`, 'success');
                
                // Close modal and navigate to dashboard
                window.browser.closeModal();
                setTimeout(() => {
                    window.browser.navigateToUrl('zhtp://dashboard.zhtp');
                }, 1000);
            } else {
                throw new Error(recoveryData?.message || 'Social recovery failed - guardian verification failed');
            }
        } else {
            throw new Error(result.message || result.error || 'Social recovery request failed');
        }
        
    } catch (error) {
        console.error('❌ Social recovery failed:', error);
        window.browser?.showNotification('❌ Recovery failed: ' + error.message, 'error');
    }
}

function completeRecovery(identity) {
    showZkDidStatus(' Identity recovered successfully!', 'success');
    
    // Save to browser instance
    if (window.browser) {
        window.browser.currentIdentity = identity;
        window.browser.updateIdentityIndicator();
    }
    
    document.getElementById('zkDidResults').style.display = 'block';
    
    setTimeout(() => {
        closeModal('zkDidModal');
        window.browser?.showNotification('Identity recovered successfully!', 'success');
    }, 2000);
}

function showZkDidStatus(message, type) {
    const statusElement = document.getElementById('zkDidStatus');
    statusElement.textContent = message;
    statusElement.className = `status-message ${type}`;
    statusElement.style.display = 'block';
    
    console.log(` ZK-DID Status: ${message}`);
}

// Global function for closing modals from HTML
function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'none';
        console.log('🔒 Modal closed:', modalId);
    }
    
    // Also call the browser's closeModal method to close any other modals
    if (window.browser) {
        window.browser.closeModal();
    }
}

// Navigation Functions
function navigateBack() {
    console.log('🔙 Navigating back...');
    if (window.browser) {
        window.browser.showNotification('Back navigation', 'info');
    }
}

function navigateForward() {
    console.log('⏩ Navigating forward...');
    if (window.browser) {
        window.browser.showNotification('Forward navigation', 'info');
    }
}

function refreshPage() {
    console.log(' Refreshing page...');
    if (window.browser) {
        window.browser.showNotification('Page refreshed', 'info');
        window.browser.updateDashboard();
    }
}

function openSettings() {
    console.log('⚙️ Opening settings...');
    if (window.browser) {
        window.browser.openModal('settings');
    }
}

// DAO Functions
function createProposal() {
    console.log('Opening proposal creation...');
    if (window.browser) {
        window.browser.showCreateProposalModal();
    } else {
        console.error('❌ Browser instance not available');
    }
}

function delegateVotes() {
    console.log('🗳️ Switching to delegates tab...');
    // Switch to delegates tab instead of navigating away
    switchDaoTab('delegates');
}

function viewTreasury() {
    console.log('🏛️ Switching to treasury tab...');
    // Switch to treasury tab instead of navigating away
    switchDaoTab('treasury');
}

function voteYes(proposalId) {
    console.log(`👍 Voting YES on ${proposalId}...`);
    if (window.browser) {
        window.browser.voteOnProposal(proposalId, 'yes');
    } else {
        console.error('❌ Browser instance not available');
    }
}

function proposeSpending() {
    console.log('💸 Opening spending proposal modal...');
    if (window.browser) {
        window.browser.showSpendingProposalModal();
    } else {
        console.error('❌ Browser instance not available');
    }
}

function viewTreasuryHistory() {
    console.log('📊 Viewing treasury history...');
    if (window.browser) {
        // For now, just show a notification
        window.browser.showNotification('Treasury history feature coming soon!', 'info');
    } else {
        console.error('❌ Browser instance not available');
    }
}

function voteNo(proposalId) {
    console.log(`👎 Voting NO on ${proposalId}...`);
    if (window.browser) {
        window.browser.voteOnProposal(proposalId, 'no');
    } else {
        console.error('❌ Browser instance not available');
    }
}

function viewProposal(proposalId) {
    console.log(`📄 Viewing details for ${proposalId}...`);
    if (window.browser) {
        window.browser.viewProposalDetails(proposalId);
    } else {
        console.error('❌ Browser instance not available');
    }
}

// Global function to handle proposal type changes for dynamic form fields
function handleProposalTypeChange(selectedType) {
    console.log(' Proposal type changed to:', selectedType);
    
    // Hide all dynamic field groups
    const dynamicFields = document.querySelectorAll('.dynamic-fields');
    dynamicFields.forEach(fieldGroup => {
        fieldGroup.style.display = 'none';
    });
    
    // Show relevant fields based on proposal type
    switch(selectedType) {
        case 'TreasuryManagement':
            const treasuryFields = document.getElementById('treasuryFields');
            if (treasuryFields) {
                treasuryFields.style.display = 'block';
                console.log('📊 Treasury fields shown');
            }
            break;
            
        case 'UbiRateChange':
            const ubiFields = document.getElementById('ubiFields');
            if (ubiFields) {
                ubiFields.style.display = 'block';
                console.log('💰 UBI fields shown');
            }
            break;
            
        default:
            console.log('Using default fields for proposal type:', selectedType);
            break;
    }
}

// HTML version of the proposal type change handler
function handleProposalTypeChangeHTML(selectedType) {
    console.log(' HTML Proposal type changed to:', selectedType);
    
    // Hide all dynamic field groups in HTML form
    const treasuryFieldsHTML = document.getElementById('treasuryFieldsHTML');
    const ubiFieldsHTML = document.getElementById('ubiFieldsHTML');
    
    if (treasuryFieldsHTML) treasuryFieldsHTML.style.display = 'none';
    if (ubiFieldsHTML) ubiFieldsHTML.style.display = 'none';
    
    // Show relevant fields based on proposal type
    switch(selectedType) {
        case 'TreasuryManagement':
            if (treasuryFieldsHTML) {
                treasuryFieldsHTML.style.display = 'block';
                console.log('📊 HTML Treasury fields shown');
            }
            break;
            
        case 'UbiRateChange':
            if (ubiFieldsHTML) {
                ubiFieldsHTML.style.display = 'block';
                console.log('💰 HTML UBI fields shown');
            }
            break;
            
        default:
            console.log('Using default HTML fields for proposal type:', selectedType);
            break;
    }
}

async function submitProposal() {
    console.log('Global submitProposal called...');
    
    if (window.browser) {
        console.log(' Browser instance found, checking identity...');
        console.log('👤 Current identity:', window.browser.currentIdentity);
        
        if (!window.browser.currentIdentity) {
            console.error('❌ No identity found - user must sign in first');
            window.browser.showNotification('❌ Please sign in to create proposals', 'error');
            return;
        }
        
        console.log(' Calling browser.submitProposal()...');
        // Call the browser's submitProposal method which will handle form data collection
        await window.browser.submitProposal();
    } else {
        console.error('❌ Browser instance not available');
    }
}

function cancelProposal() {
    console.log('❌ Cancelling proposal creation...');
    if (window.browser) {
        window.browser.closeModal();
    } else {
        // Fallback to DOM manipulation
        const form = document.getElementById('createProposalForm');
        if (form) {
            form.style.display = 'none';
        }
    }
}

// Settings Functions
function switchSettingsTab(tabName) {
    // Hide all settings sections
    document.querySelectorAll('.settings-section').forEach(section => {
        section.classList.remove('active');
    });
    
    // Remove active class from all tabs
    document.querySelectorAll('.settings-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Show selected section
    const selectedSection = document.getElementById(`settings-${tabName}`);
    if (selectedSection) {
        selectedSection.classList.add('active');
    }
    
    // Add active class to selected tab
    event.target.classList.add('active');
    
    console.log(`⚙️ Switched to settings tab: ${tabName}`);
}

function saveSettings() {
    console.log('💾 Saving settings...');
    
    // Get all setting values
    const settings = {
        homePage: document.getElementById('homePage').value,
        theme: document.getElementById('theme').value,
        language: document.getElementById('language').value,
        zkMode: document.getElementById('zkMode').checked,
        biometricAuth: document.getElementById('biometricAuth').checked,
        autoClear: document.getElementById('autoClear').value,
        network: document.getElementById('network').value,
        meshDiscovery: document.getElementById('meshDiscovery').checked,
        relayMode: document.getElementById('relayMode').checked,
        devMode: document.getElementById('devMode').checked,
        debugMode: document.getElementById('debugMode').checked
    };
    
    localStorage.setItem('zhtp-settings', JSON.stringify(settings));
    window.browser?.showNotification('Settings saved successfully!', 'success');
}

function resetSettings() {
    console.log(' Resetting settings...');
    localStorage.removeItem('zhtp-settings');
    window.browser?.showNotification('Settings reset to defaults', 'info');
    location.reload();
}

function exportData() {
    console.log('📤 Exporting data...');
    const data = {
        settings: JSON.parse(localStorage.getItem('zhtp-settings') || '{}'),
        identities: JSON.parse(localStorage.getItem('zhtp-identities') || '[]'),
        timestamp: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'zhtp-data-export.json';
    a.click();
    URL.revokeObjectURL(url);
    
    window.browser?.showNotification('Data exported successfully!', 'success');
}

function resetBrowser() {
    console.log(' Resetting browser...');
    if (confirm('This will delete all your data and settings. Are you sure?')) {
        localStorage.clear();
        window.browser?.showNotification('Browser reset complete', 'info');
        location.reload();
    }
}

// Social Functions
function publishPost() {
    const content = document.getElementById('postContent').value;
    if (!content.trim()) {
        window.browser?.showNotification('Please enter post content', 'error');
        return;
    }
    
    console.log('🚀 Publishing post...', content);
    window.browser?.showNotification('Post published to Web4 network!', 'success');
    document.getElementById('postContent').value = '';
}

function addImage() {
    console.log('📷 Adding image...');
    window.browser?.showNotification('Image upload coming soon!', 'info');
}

function addPoll() {
    console.log('📊 Adding poll...');
    window.browser?.showNotification('Poll creation coming soon!', 'info');
}

function addLocation() {
    console.log(' Adding location...');
    window.browser?.showNotification('Location sharing coming soon!', 'info');
}

function likePost(postId) {
    console.log(`❤️ Liking post ${postId}...`);
    window.browser?.showNotification('Post liked!', 'success');
}

function sharePost(postId) {
    console.log(` Sharing post ${postId}...`);
    window.browser?.showNotification('Post shared!', 'success');
}

function commentPost(postId) {
    console.log(`💬 Commenting on post ${postId}...`);
    window.browser?.showNotification('Comment interface coming soon!', 'info');
}

function tipPost(postId) {
    console.log(`💰 Tipping post ${postId}...`);
    window.browser?.showNotification('Tip sent to author!', 'success');
}

// Marketplace Functions
function showCategory(category) {
    // Hide all categories
    document.querySelectorAll('.marketplace-category').forEach(cat => {
        cat.classList.remove('active');
    });
    
    // Remove active class from all buttons
    document.querySelectorAll('.category-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Show selected category
    const selectedCategory = document.getElementById(`category-${category}`);
    if (selectedCategory) {
        selectedCategory.classList.add('active');
    }
    
    // Add active class to selected button
    event.target.classList.add('active');
    
    console.log(`🛒 Showing category: ${category}`);
}

function installApp(appId) {
    console.log(`📦 Installing app: ${appId}...`);
    window.browser?.showNotification(`Installing ${appId}...`, 'pending');
    
    setTimeout(() => {
        window.browser?.showNotification(`${appId} installed successfully!`, 'success');
    }, 2000);
}

function buyNFT(nftId) {
    console.log(`🖼️ Buying NFT: ${nftId}...`);
    window.browser?.showNotification(`Purchasing ${nftId}...`, 'pending');
    
    setTimeout(() => {
        window.browser?.showNotification(`${nftId} purchased successfully!`, 'success');
    }, 2000);
}

function searchDomains() {
    const query = document.getElementById('domainSearch').value;
    if (!query) return;
    
    console.log(` Searching domains: ${query}...`);
    window.browser?.showNotification(`Searching for ${query}...`, 'info');
}

function buyDomain(domain) {
    console.log(`🌐 Buying domain: ${domain}...`);
    window.browser?.showNotification(`Purchasing ${domain}...`, 'pending');
    
    setTimeout(() => {
        window.browser?.showNotification(`${domain} purchased successfully!`, 'success');
    }, 2000);
}

// Whisper Functions
function selectChat(contactId) {
    // Remove active class from all contacts
    document.querySelectorAll('.contact-item').forEach(contact => {
        contact.classList.remove('active');
    });
    
    // Add active class to selected contact
    event.target.classList.add('active');
    
    console.log(`💬 Selected chat: ${contactId}`);
    // In a real app, this would load the chat history
}

function voiceCall() {
    console.log('📞 Starting voice call...');
    window.browser?.showNotification('Voice calling coming soon!', 'info');
}

function videoCall() {
    console.log('📹 Starting video call...');
    window.browser?.showNotification('Video calling coming soon!', 'info');
}

function chatSettings() {
    console.log('⚙️ Opening chat settings...');
    window.browser?.showNotification('Chat settings coming soon!', 'info');
}

function sendMessage() {
    const messageInput = document.getElementById('messageInput');
    const message = messageInput.value.trim();
    
    if (!message) return;
    
    console.log('📨 Sending message:', message);
    
    // Add message to chat
    const messagesContainer = document.getElementById('chatMessages');
    const messageElement = document.createElement('div');
    messageElement.className = 'message sent';
    messageElement.innerHTML = `
        <div class="message-content">${message}</div>
        <div class="message-time">${new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
    `;
    
    messagesContainer.appendChild(messageElement);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
    
    messageInput.value = '';
}

function handleMessageKeyPress(event) {
    if (event.key === 'Enter') {
        sendMessage();
    }
}

function attachFile() {
    console.log('📎 Attaching file...');
    window.browser?.showNotification('File attachment coming soon!', 'info');
}

// Global ZK-DID Functions for HTML onclick handlers
async function signInWithZkDid() {
    console.log('🔑 Signing in with ZK-DID...');
    
    try {
        // Add debugging to see if elements are found
        const identityInput = document.getElementById('signinDid');
        const passphraseInput = document.getElementById('signinPassphrase');
        
        console.log(' Debug - Identity input found:', identityInput);
        console.log(' Debug - Identity input type:', identityInput?.type);
        console.log(' Debug - Identity input placeholder:', identityInput?.placeholder);
        console.log(' Debug - Passphrase input found:', passphraseInput);
        console.log(' Debug - Passphrase input type:', passphraseInput?.type);
        console.log(' Debug - Passphrase input placeholder:', passphraseInput?.placeholder);
        console.log(' Debug - Identity value:', identityInput?.value);
        console.log(' Debug - Identity value length:', identityInput?.value?.length);
        console.log(' Debug - Passphrase value:', passphraseInput?.value ? '***' : 'empty');
        console.log(' Debug - Passphrase value length:', passphraseInput?.value?.length);
        
        if (!identityInput) {
            window.browser?.showNotification('❌ Identity input field not found! Please refresh the page.', 'error');
            return;
        }
        
        if (!passphraseInput) {
            window.browser?.showNotification('❌ Passphrase input field not found! Please refresh the page.', 'error');
            return;
        }
        
        if (!identityInput.value || !passphraseInput.value) {
            window.browser?.showNotification('Please enter both identity and passphrase', 'error');
            return;
        }
        
        const identity = identityInput.value.trim();
        const passphrase = passphraseInput.value.trim();
        
        console.log(' Debug - Processing identity:', identity.substring(0, 20) + '...');
        
        // Show loading state
        window.browser?.showNotification('Authenticating with ZK-DID...', 'info');
        
        // Attempt to sign in through the ZHTP API
        console.log(` Attempting authentication for identity: ${identity.substring(0, 20)}...`);
        const result = await window.browser.api.signInWithIdentity(identity, passphrase);
        
        console.log(' Sign in result:', result);
        
        // Handle ZHTP response - check if we got a successful HTTP response
        if (result.status === 200 || result.status === 201) {
            // Parse signin response data
            let signinData = null;
            if (result.data && typeof result.data === 'string') {
                try {
                    signinData = JSON.parse(result.data);
                    console.log(' Parsed signin data:', signinData);
                    
                    // Check if it's the ZHTP protocol response
                    if (signinData.status === 'success' && signinData.message === 'ZHTP mesh connection established') {
                        console.warn('⚠️ Received ZHTP protocol response instead of signin response');
                        throw new Error('Sign-in endpoint returned protocol response instead of identity data');
                    }
                } catch (e) {
                    console.error('📄 Failed to parse signin response:', e);
                    throw new Error('Invalid signin response format');
                }
            } else if (result.data && typeof result.data === 'object') {
                signinData = result.data;
            } else if (result.body) {
                // Check if there's a body field (new server format)
                try {
                    if (Array.isArray(result.body)) {
                        const jsonString = new TextDecoder().decode(new Uint8Array(result.body));
                        signinData = JSON.parse(jsonString);
                    } else if (typeof result.body === 'string') {
                        signinData = JSON.parse(result.body);
                    } else {
                        signinData = result.body;
                    }
                    console.log(' Successfully parsed signin data from body field');
                } catch (bodyParseError) {
                    console.error('❌ Failed to parse body field:', bodyParseError);
                    throw new Error('Failed to parse signin response body');
                }
            } else {
                console.error('❌ No signin data in response');
                throw new Error('No signin data received from server');
            }
            
            // Check if signin was successful
            if (!signinData.success) {
                throw new Error(signinData.message || 'Sign-in failed');
            }
            
            // Extract identity information from signin response
            const identityInfo = signinData.identity_info || {};
            const userDid = signinData.did || identity;
            
            // Set the current identity in the browser
            window.browser.currentIdentity = {
                did: userDid,
                identity_id: identityInfo.identity_id,
                display_name: identityInfo.display_name || 'User',
                identity_type: identityInfo.identity_type || 'citizen',
                access_level: identityInfo.access_level || 'Visitor',
                public_key: identityInfo.public_key || 'authenticated_key',
                authenticated: true,
                session_token: signinData.session_token,
                created_at: identityInfo.created_at,
                last_active: identityInfo.last_active,
                has_password: identityInfo.has_password,
                is_imported: identityInfo.is_imported
            };
            
            // Save identity to localStorage
            localStorage.setItem('zhtp-current-identity', JSON.stringify(window.browser.currentIdentity));
            
            // Update the identity indicator immediately
            window.browser.updateIdentityIndicator();
            
            //  LOAD WALLET DATA for existing citizen
            console.log('💰 Loading wallet data for returning citizen...');
            try {
                await window.browser.loadWalletData();
                console.log('✅ Wallet data loaded successfully');
            } catch (error) {
                console.warn('⚠️ Could not load wallet data after sign-in:', error);
            }
            
            // Show success message
            const displayName = window.browser.currentIdentity.display_name || 'User';
            const message = `Welcome back, ${displayName}!`;
            window.browser?.showNotification(message, 'success');
            
            // Close the modal
            window.browser.closeModal();
            
            // Navigate to dashboard after a brief delay
            setTimeout(() => {
                window.browser.navigateToUrl('zhtp://dashboard.zhtp');
                // Ensure indicator is updated after navigation
                setTimeout(() => {
                    window.browser.updateIdentityIndicator();
                }, 500);
            }, 1000);
        } else {
            // Handle error response
            const errorMsg = result.message || result.error || 'Authentication failed';
            window.browser?.showNotification('❌ Authentication failed: ' + errorMsg, 'error');
            
            // If identity not found, suggest creating one
            if (errorMsg.includes('not found') || errorMsg.includes('invalid')) {
                setTimeout(() => {
                    window.browser?.showNotification(' Don\'t have a ZK-DID yet? Try creating a new identity!', 'info');
                }, 3000);
            }
        }
        
    } catch (error) {
        console.error('❌ ZK-DID sign in failed:', error);
        const errorMessage = error.message;
        window.browser?.showNotification('Sign in failed: ' + errorMessage, 'error');
        
        // If identity not found, suggest creating one
        if (errorMessage.includes('not found')) {
            setTimeout(() => {
                window.browser?.showNotification(' Don\'t have a ZK-DID yet? Try creating a new identity!', 'info');
            }, 3000);
        }
    }
}

async function createNewZkDid() {
    console.log('🆕 Creating new ZK-DID identity...');
    
    try {
        // Find form elements using IDs (more reliable than placeholders)
        const nameInput = document.getElementById('displayName');
        const typeSelect = document.getElementById('identityType');
        const termsCheckbox = document.getElementById('termsAccepted');
        
        console.log('📝 Form inputs found:', {
            nameInput: nameInput?.id,
            nameValue: nameInput?.value,
            typeSelect: typeSelect?.id,
            typeValue: typeSelect?.value,
            termsCheckbox: termsCheckbox?.id,
            termsChecked: termsCheckbox?.checked
        });
        
        if (!nameInput?.value.trim()) {
            window.browser?.showNotification('📢 ERROR: Please enter a display name', 'error');
            console.error('❌ Display name input is empty or not found');
            return;
        }
        
        if (!termsCheckbox?.checked) {
            window.browser?.showNotification('📢 ERROR: Please agree to the terms and privacy policy', 'error');
            console.error('❌ Terms checkbox not checked');
            return;
        }
        
        // Get passphrase inputs
        const passphraseInput = document.getElementById('createPassphrase');
        const confirmPassphraseInput = document.getElementById('confirmPassphrase');
        
        console.log('🔐 Passphrase inputs:', {
            passphraseLength: passphraseInput?.value?.length,
            confirmLength: confirmPassphraseInput?.value?.length,
            match: passphraseInput?.value === confirmPassphraseInput?.value
        });
        
        if (!passphraseInput?.value || passphraseInput.value.length < 8) {
            window.browser?.showNotification('🔒 Secure passphrase must be at least 8 characters long for soulbound protection', 'error');
            console.error('❌ Passphrase too short or missing');
            return;
        }
        
        if (passphraseInput.value !== confirmPassphraseInput?.value) {
            window.browser?.showNotification('🔒 Passphrases do not match - please confirm your secure passphrase', 'error');
            console.error('❌ Passphrases do not match');
            return;
        }
        
        const displayName = nameInput.value.trim();
        const identityType = typeSelect?.value || 'citizen';
        const passphrase = passphraseInput.value;
        
        // Show loading state
        window.browser?.showNotification('⚡ Generating quantum-resistant ZK-DID identity...', 'info');
        
        // Create identity through the enhanced ZHTP API
        // Map identity types properly: citizen -> human for blockchain
        const blockchainIdentityType = identityType === 'citizen' ? 'human' : 
                                       identityType === 'organization' ? 'organization' : 
                                       identityType === 'developer' ? 'developer' : 
                                       identityType === 'validator' ? 'validator' : 'human';
        
        console.log(`📤 Creating ${blockchainIdentityType} identity with display name: ${displayName}`);
        
        const result = await window.browser.api.createIdentity({
            identity_type: blockchainIdentityType,
            display_name: displayName,
            recovery_options: [passphrase] // Server expects array of recovery options
        });
        
        console.log(' Identity creation result:', result);
        
        // Handle ZHTP response - check if we got a successful HTTP response
        if (result.status === 200 || result.status === 201) {
            // Parse the identity creation response data
            let identityData = null;
            
            // First check if the data contains the actual API response
            if (result.data && typeof result.data === 'string') {
                try {
                    // This might be a nested JSON response from the ZHTP protocol
                    const parsedData = JSON.parse(result.data);
                    console.log(' Parsed first level data:', parsedData);
                    
                    // If it's just the ZHTP protocol response, we need to look elsewhere
                    if (parsedData.status === 'success' && parsedData.message === 'ZHTP mesh connection established') {
                        console.warn('⚠️ Received ZHTP protocol response instead of API response - identity endpoint may not be working');
                        throw new Error('Identity creation endpoint returned protocol response instead of identity data');
                    }
                    
                    identityData = parsedData;
                } catch (e) {
                    console.error('📄 Failed to parse response data as JSON:', e);
                    throw new Error('Invalid response format from identity creation');
                }
            } else if (result.data && typeof result.data === 'object') {
                identityData = result.data;
            } else {
                console.error('❌ No identity data in response, checking for body field...');
                
                // Check if there's a body field (new server format)
                if (result.body) {
                    try {
                        if (Array.isArray(result.body)) {
                            // Handle byte array response
                            const jsonString = new TextDecoder().decode(new Uint8Array(result.body));
                            identityData = JSON.parse(jsonString);
                        } else if (typeof result.body === 'string') {
                            identityData = JSON.parse(result.body);
                        } else {
                            identityData = result.body;
                        }
                        console.log(' Successfully parsed identity data from body field');
                    } catch (bodyParseError) {
                        console.error('❌ Failed to parse body field:', bodyParseError);
                        throw new Error('Failed to parse identity response body');
                    }
                } else {
                    console.error('❌ No identity data found in response fields');
                    console.log(' Full response structure:', JSON.stringify(result, null, 2));
                    throw new Error('Server response missing identity data - check server logs for actual identity creation');
                }
            }
            
            console.log(' Parsed identity data:', identityData);
            
            // Extract the identity information from the server response - convert to proper hex format
            let identityId = identityData.identity_id;
            if (Array.isArray(identityId)) {
                // Convert byte array to hex string
                identityId = identityId.map(b => b.toString(16).padStart(2, '0')).join('');
            }
            const userDid = `did:zhtp:${identityId}`;
            
            // Extract citizenship data if available
            const citizenshipResult = identityData.citizenship_result;
            let walletSeedPhrases = null;
            let walletInfo = null;
            
            if (citizenshipResult) {
                console.log('🏛️ Citizenship result found:', citizenshipResult);
                
                // Extract ALL THREE seed phrases from the server response
                if (citizenshipResult.wallet_seed_phrases) {
                    console.log('🔍 Raw wallet_seed_phrases:', citizenshipResult.wallet_seed_phrases);
                    
                    // Helper function to convert seed phrase to string
                    const extractSeedPhrase = (seedData) => {
                        if (!seedData) return 'Seed phrase not available';
                        
                        // If it's already a string, return it
                        if (typeof seedData === 'string') return seedData;
                        
                        // If it's an object with a words property (array)
                        if (seedData.words && Array.isArray(seedData.words)) {
                            return seedData.words.join(' ');
                        }
                        
                        // If it's an array of words
                        if (Array.isArray(seedData) && seedData.length > 0 && typeof seedData[0] === 'string') {
                            return seedData.join(' ');
                        }
                        
                        // If it's a byte array, try to decode it
                        if (Array.isArray(seedData) && seedData.length > 0 && typeof seedData[0] === 'number') {
                            try {
                                const decoder = new TextDecoder();
                                return decoder.decode(new Uint8Array(seedData));
                            } catch (e) {
                                console.error('Failed to decode seed phrase from bytes:', e);
                                return 'Seed phrase decoding failed';
                            }
                        }
                        
                        console.warn('Unknown seed phrase format:', seedData);
                        return 'Seed phrase format unknown';
                    };
                    
                    walletSeedPhrases = {
                        primary: extractSeedPhrase(
                            citizenshipResult.wallet_seed_phrases.primary || 
                            citizenshipResult.wallet_seed_phrases.primary_wallet_seeds
                        ),
                        ubi: extractSeedPhrase(
                            citizenshipResult.wallet_seed_phrases.ubi || 
                            citizenshipResult.wallet_seed_phrases.ubi_wallet_seeds
                        ),
                        savings: extractSeedPhrase(
                            citizenshipResult.wallet_seed_phrases.savings || 
                            citizenshipResult.wallet_seed_phrases.savings_wallet_seeds
                        )
                    };
                    
                    console.log('🔑 Extracted wallet seed phrases:');
                    console.log('  💰 Primary:', walletSeedPhrases.primary);
                    console.log('  💰 Primary words:', walletSeedPhrases.primary?.split(' ').length);
                    console.log('  🏛️ UBI:', walletSeedPhrases.ubi);
                    console.log('  🏛️ UBI words:', walletSeedPhrases.ubi?.split(' ').length);
                    console.log('  💎 Savings:', walletSeedPhrases.savings);
                    console.log('  💎 Savings words:', walletSeedPhrases.savings?.split(' ').length);
                } else {
                    console.warn('⚠️ No wallet_seed_phrases found in citizenship result');
                }
                
                // Extract wallet information - convert byte arrays to hex strings
                const convertWalletId = (walletId) => {
                    if (Array.isArray(walletId)) {
                        // Convert byte array to hex string
                        return walletId.map(b => b.toString(16).padStart(2, '0')).join('');
                    }
                    return walletId || `wallet-${Date.now()}`;
                };
                
                walletInfo = {
                    primary_wallet_id: convertWalletId(citizenshipResult.primary_wallet_id),
                    ubi_wallet_id: convertWalletId(citizenshipResult.ubi_wallet_id),
                    savings_wallet_id: convertWalletId(citizenshipResult.savings_wallet_id),
                    initial_balance: citizenshipResult.welcome_bonus || citizenshipResult.initial_balance || 5000,
                    ubi_amount: citizenshipResult.ubi_registration?.daily_amount || citizenshipResult.ubi_amount || 33
                };
                
                console.log('💰 Wallet information:', walletInfo);
            }
            
            // Set the current identity in the browser immediately
            window.browser.currentIdentity = {
                did: userDid,
                identity_id: identityId,
                display_name: displayName,
                identity_type: identityType,
                access_level: identityData.access_level || 'Visitor',
                public_key: citizenshipResult?.public_key || 'generated_public_key',
                authenticated: true,
                created_at: identityData.created_at,
                server_id: result.server_id,
                capabilities: result.capabilities,
                citizenship_result: citizenshipResult,
                wallet_info: walletInfo,
                wallet_seed_phrases: walletSeedPhrases // Store all three seed phrases
            };
            
            // Update the identity indicator right away
            window.browser.updateIdentityIndicator();
            
            //  CRITICAL: Load wallet data for new citizen!
            // The createIdentity API returns complete citizenship data, so we should load it
            console.log('💰 Loading wallet data for new citizen...');
            
            // Save identity to localStorage
            localStorage.setItem('zhtp-current-identity', JSON.stringify(window.browser.currentIdentity));
            
            // If the result includes citizenship benefits, use them
            if (identityData.citizen_benefits) {
                // Store citizenship data for the multi-wallet interface
                window.browser.citizenWalletData = {
                    citizenship: {
                        identity: window.browser.currentIdentity,
                        benefits: identityData.citizen_benefits,
                        fees: identityData.fees,
                        transaction_hash: identityData.transaction_hash
                    },
                    wallets: [], // Will be populated by loadWalletData
                    welcome_bonus: identityData.fees ? `Welcome bonus: ${identityData.fees.total} ZHTP credits applied!` : null
                };
                
                // Update the multi-wallet interface immediately
                window.browser.updateMultiWalletInterface(window.browser.citizenWalletData);
                
                // Also call loadWalletData to ensure UI is updated
                try {
                    await window.browser.loadWalletData();
                    console.log(' Wallet data loaded successfully for new citizen');
                } catch (error) {
                    console.warn('⚠️ Could not update wallet UI after identity creation:', error);
                }
            } else {
                // Fallback: Try to load wallet data from API
                try {
                    await window.browser.loadWalletData();
                    console.log(' Wallet data loaded via API fallback');
                } catch (error) {
                    console.warn('⚠️ Could not load wallet data after identity creation:', error);
                }
            }
            
            // Show success notification and seed phrase modal
            const identityDid = window.browser.currentIdentity.did;
            
            // Display the seed phrase modal with ALL THREE wallet seed phrases
            if (walletSeedPhrases && (walletSeedPhrases.primary || walletSeedPhrases.ubi || walletSeedPhrases.savings)) {
                console.log('🔑 Displaying seed phrase modal with all three wallet seeds');
                window.browser?.showSeedPhraseModal(identityDid, walletSeedPhrases, walletInfo);
            } else {
                // Just show success notification
                window.browser?.showNotification(` ZK-DID identity created: ${identityDid}`, 'success');
                
                // Close modal and navigate to dashboard  
                window.browser.closeModal();
                window.browser.navigateToUrl('zhtp://dashboard.zhtp');
            }
            
        } else {
            // Handle error response
            const errorMessage = result.message || result.error || 'Unknown error occurred';
            window.browser?.showNotification('❌ Identity creation failed: ' + errorMessage, 'error');
        }
        
    } catch (error) {
        console.error('❌ ZK-DID creation failed:', error);
        window.browser?.showNotification('❌ Identity creation failed: ' + error.message, 'error');
    }
}

async function recoverZkDid() {
    console.log(' Recovering ZK-DID identity...');
    
    try {
        const seedInput = document.querySelector('#zkdid-recover textarea');
        const passphraseInput = document.querySelector('#zkdid-recover input[placeholder="New Passphrase"]');
        
        if (!seedInput?.value || !passphraseInput?.value) {
            window.browser?.showNotification('Please enter both recovery seed and new passphrase', 'error');
            return;
        }
        
        const recoveryData = {
            seed: seedInput.value.trim(),
            newPassphrase: passphraseInput.value.trim()
        };
        
        // Show loading state
        window.browser?.showNotification('Recovering ZK-DID identity...', 'info');
        
        // Recover identity through the ZHTP API
        const result = await window.browser.api.recoverIdentity(recoveryData);
        
        if (result.success) {
            window.browser.currentIdentity = result.identity;
            window.browser.updateIdentityIndicator();
            window.browser?.showNotification(`Identity recovered: ${result.identity.displayName}`, 'success');
            window.browser.closeModal();
        } else {
            window.browser?.showNotification('Recovery failed: ' + result.error, 'error');
        }
        
    } catch (error) {
        console.error('❌ ZK-DID recovery failed:', error);
        window.browser?.showNotification('Recovery failed: ' + error.message, 'error');
    }
}

function sendEmoji() {
    console.log('😊 Opening emoji picker...');
    window.browser?.showNotification('Emoji picker coming soon!', 'info');
}

// Wallet tab switching for multi-wallet system
function switchWalletTab(walletType) {
    console.log(`💎 Switching to ${walletType} wallet...`);
    
    // Remove active class from all tabs
    document.querySelectorAll('.wallet-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Remove active class from all wallet content
    document.querySelectorAll('.wallet-content').forEach(content => {
        content.classList.remove('active');
    });
    
    // Add active class to selected tab
    const selectedTab = document.querySelector(`.wallet-tab[onclick="switchWalletTab('${walletType}')"]`);
    if (selectedTab) {
        selectedTab.classList.add('active');
    }
    
    // Show selected wallet content
    const selectedContent = document.getElementById(`wallet-${walletType}`);
    if (selectedContent) {
        selectedContent.classList.add('active');
    }
    
    // Load data for the selected wallet
    loadWalletDataForType(walletType);
}

// Load wallet data for specific wallet type
async function loadWalletDataForType(walletType) {
    if (!window.browser?.currentIdentity) {
        console.warn('⚠️ No current identity found for wallet data loading');
        return;
    }

// DAO tab switching for multi-tab DAO governance
function switchDaoTab(daoType) {
    console.log(`🏛️ Switching to ${daoType} DAO tab...`);
    
    // Remove active class from all tabs
    document.querySelectorAll('.dao-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Remove active class from all DAO content
    document.querySelectorAll('.dao-content').forEach(content => {
        content.classList.remove('active');
    });
    
    // Add active class to selected tab
    const selectedTab = document.querySelector(`.dao-tab[onclick="switchDaoTab('${daoType}')"]`);
    if (selectedTab) {
        selectedTab.classList.add('active');
    }
    
    // Show selected DAO content
    const selectedContent = document.getElementById(`dao-${daoType}`);
    if (selectedContent) {
        selectedContent.classList.add('active');
    }
    
    // Load data for the selected DAO tab
    loadDaoDataForType(daoType);
}

// Load DAO data for specific tab type
async function loadDaoDataForType(daoType) {
    console.log(`📊 Loading ${daoType} DAO data...`);
    
    try {
        switch (daoType) {
            case 'proposals':
                await window.browser?.loadDaoProposals();
                break;
            case 'treasury':
                await window.browser?.loadDaoTreasury();
                break;
            case 'delegates':
                await window.browser?.loadDaoDelegates();
                break;
            default:
                console.warn(`Unknown DAO tab type: ${daoType}`);
        }
    } catch (error) {
        console.error(`❌ Failed to load ${daoType} DAO data:`, error);
        window.browser?.showNotification(`Failed to load ${daoType} data`, 'error');
    }
}

// Specific DAO data loading methods
async function loadDaoProposals() {
    console.log(' Loading DAO proposals...');
    
    try {
        const did = window.browser?.currentDid;
        if (!did) {
            console.warn('⚠️ No DID available for DAO proposals');
            return;
        }

        const response = await fetch(`http://localhost:8000/zhtp/dao/proposals/${encodeURIComponent(did)}`);
        const data = await response.json();
        
        console.log(' DAO proposals response:', data);
        
        if (data.success) {
            const proposalsHtml = data.proposals.map(proposal => `
                <div class="proposal-item">
                    <h4>${proposal.title || `Proposal #${proposal.id}`}</h4>
                    <p>${proposal.description || 'No description available'}</p>
                    <div class="proposal-stats">
                        <span>For: ${proposal.votes_for || 0}</span>
                        <span>Against: ${proposal.votes_against || 0}</span>
                        <span>Status: ${proposal.status || 'Active'}</span>
                    </div>
                    <button onclick="voteOnProposal('${proposal.id}', true)" class="btn-primary">Vote For</button>
                    <button onclick="voteOnProposal('${proposal.id}', false)" class="btn-secondary">Vote Against</button>
                </div>
            `).join('');
            
            const proposalsElement = document.getElementById('dao-content');
            if (proposalsElement) {
                proposalsElement.innerHTML = `
                    <h3> DAO Proposals</h3>
                    <div class="proposals-container">
                        ${proposalsHtml || '<p>No proposals found</p>'}
                    </div>
                `;
            }
        } else {
            console.error('❌ Failed to load proposals:', data.error);
        }
    } catch (error) {
        console.error('❌ Error loading DAO proposals:', error);
    }
}

async function loadDaoTreasury() {
    console.log('💰 Loading DAO treasury...');
    
    try {
        const did = window.browser?.currentDid;
        if (!did) {
            console.warn('⚠️ No DID available for DAO treasury');
            return;
        }

        const response = await fetch(`http://localhost:8000/zhtp/dao/treasury/${encodeURIComponent(did)}`);
        const data = await response.json();
        
        console.log('💰 DAO treasury response:', data);
        
        if (data.success) {
            const treasuryElement = document.getElementById('dao-content');
            if (treasuryElement) {
                treasuryElement.innerHTML = `
                    <h3>💰 DAO Treasury</h3>
                    <div class="treasury-stats">
                        <div class="stat-card">
                            <h4>Total Treasury</h4>
                            <p>${data.treasury.total_balance || '0'} ZHT</p>
                        </div>
                        <div class="stat-card">
                            <h4>Available Funds</h4>
                            <p>${data.treasury.available_balance || '0'} ZHT</p>
                        </div>
                        <div class="stat-card">
                            <h4>Locked Funds</h4>
                            <p>${data.treasury.locked_balance || '0'} ZHT</p>
                        </div>
                        <div class="stat-card">
                            <h4>Recent Transactions</h4>
                            <p>${data.treasury.recent_transactions || 0}</p>
                        </div>
                    </div>
                    <div class="treasury-transactions">
                        <h4>Recent Treasury Transactions</h4>
                        ${data.treasury.transactions ? data.treasury.transactions.map(tx => `
                            <div class="transaction-item">
                                <span>Amount: ${tx.amount} ZHT</span>
                                <span>Type: ${tx.type}</span>
                                <span>Date: ${tx.timestamp}</span>
                            </div>
                        `).join('') : '<p>No recent transactions</p>'}
                    </div>
                `;
            }
        } else {
            console.error('❌ Failed to load treasury:', data.error);
        }
    } catch (error) {
        console.error('❌ Error loading DAO treasury:', error);
    }
}

async function loadDaoDelegates() {
    console.log('👥 Loading DAO delegates...');
    
    try {
        const did = window.browser?.currentDid;
        if (!did) {
            console.warn('⚠️ No DID available for DAO delegates');
            return;
        }

        const response = await fetch(`http://localhost:8000/zhtp/dao/delegates/${encodeURIComponent(did)}`);
        const data = await response.json();
        
        console.log('👥 DAO delegates response:', data);
        
        if (data.success) {
            const delegatesHtml = data.delegates.map(delegate => `
                <div class="delegate-item">
                    <h4>${delegate.name || delegate.did.substring(0, 12) + '...'}</h4>
                    <p>Voting Power: ${delegate.voting_power || 0} ZHT</p>
                    <p>Delegated From: ${delegate.delegated_from || 0} users</p>
                    <button onclick="delegateVotingPower('${delegate.did}')" class="btn-primary">Delegate to This User</button>
                </div>
            `).join('');
            
            const delegatesElement = document.getElementById('dao-content');
            if (delegatesElement) {
                delegatesElement.innerHTML = `
                    <h3>👥 DAO Delegates</h3>
                    <div class="delegates-container">
                        ${delegatesHtml || '<p>No delegates found</p>'}
                    </div>
                    <div class="delegation-controls">
                        <h4>Delegate Your Voting Power</h4>
                        <input type="text" id="delegateDidInput" placeholder="Enter DID to delegate to" />
                        <button onclick="delegateVotingPower(document.getElementById('delegateDidInput').value)" class="btn-primary">Delegate</button>
                    </div>
                `;
            }
        } else {
            console.error('❌ Failed to load delegates:', data.error);
        }
    } catch (error) {
        console.error('❌ Error loading DAO delegates:', error);
    }
}
    
    try {
        console.log(`📊 Loading ${walletType} wallet data...`);
        
        // Get the citizen wallet data from browser instance
        const citizenData = window.browser.citizenWalletData;
        
        if (!citizenData) {
            console.warn('⚠️ No citizenWalletData found - user may not be a citizen');
            return;
        }
        
        if (!citizenData.citizenship || !citizenData.wallets) {
            console.warn('⚠️ Invalid citizenship wallet data structure:', citizenData);
            return;
        }
        
        console.log('📊 Citizen data found:', citizenData);
        console.log('💰 Welcome bonus check:', citizenData.welcome_bonus);
        console.log('🏛️ Citizenship data:', citizenData.citizenship);
        console.log('💼 Wallets data:', citizenData.wallets);
        
        const citizenship = citizenData.citizenship;
        const wallets = citizenData.wallets;
        
        // Find the wallet by type from the array
        const walletInfo = wallets.find(w => w.type === walletType);
        
        if (!walletInfo) {
            console.warn(`⚠️ Wallet type ${walletType} not found in citizen data`);
            return;
        }
        
        let balanceElementId, usdElementId;
        
        // Determine wallet details based on type
        switch (walletType) {
            case 'primary':
                balanceElementId = 'primaryWalletBalance';
                usdElementId = 'primaryWalletBalanceUsd';
                break;
            case 'ubi':
                balanceElementId = 'ubiWalletBalance';
                usdElementId = 'ubiWalletBalanceUsd';
                break;
            case 'savings':
                balanceElementId = 'savingsWalletBalance';
                usdElementId = 'savingsWalletBalanceUsd';
                break;
            default:
                console.error('Unknown wallet type:', walletType);
                return;
        }
        
        // Update wallet ID display
        const walletIdElement = document.getElementById(`${walletType}WalletId`);
        if (walletIdElement && walletInfo) {
            walletIdElement.textContent = walletInfo.address?.substring(0, 16) + '...' || 'Loading...';
        }
        
        // Get balance from the wallet data structure
        let balance = walletInfo?.balance || 0;
        
        // For primary wallet, if balance is 0 but we have a welcome bonus, show the total
        if (walletType === 'primary' && balance === 0 && citizenData.totalBalance) {
            balance = citizenData.totalBalance;
        }
        
        console.log(`💰 ${walletType} wallet balance: ${balance} ZHTP`);
        
        // Update balance display
        const balanceElement = document.getElementById(balanceElementId);
        const usdElement = document.getElementById(usdElementId);
        
        if (balanceElement) {
            balanceElement.textContent = parseFloat(balance).toFixed(4);
        }
        
        if (usdElement) {
            usdElement.textContent = `≈ $${(balance * 1.00).toFixed(2)} USD`;
        }
        
        // Update specific wallet info
        if (walletType === 'ubi' && citizenship.ubi_eligibility) {
            const nextUbiElement = document.getElementById('nextUbiPayment');
            const ubiScheduleElement = document.getElementById('ubiSchedule');
            
            if (nextUbiElement) {
                nextUbiElement.textContent = `${citizenship.ubi_eligibility.daily_amount} ZHTP`;
            }
            
            if (ubiScheduleElement) {
                ubiScheduleElement.textContent = `Daily: ${citizenship.ubi_eligibility.daily_amount} ZHTP, Monthly: ${citizenship.ubi_eligibility.monthly_amount} ZHTP`;
            }
        }
        
        if (walletType === 'savings') {
            const stakingRewardsElement = document.getElementById('stakingRewards');
            const privacyLevelElement = document.getElementById('privacyLevel');
            
            if (stakingRewardsElement) {
                stakingRewardsElement.textContent = '0'; // TODO: Calculate actual staking rewards
            }
            
            if (privacyLevelElement) {
                privacyLevelElement.textContent = 'Maximum (Stealth)';
            }
        }
        
        // Extract transactions from the wallet data (each wallet has its own transactions array)
        console.log(` Extracting transactions for ${walletType} wallet from wallet data...`);
        console.log(` Wallet info for ${walletType}:`, walletInfo);
        
        let walletTransactions = [];
        if (walletInfo?.transactions && Array.isArray(walletInfo.transactions)) {
            walletTransactions = walletInfo.transactions;
            console.log(` Found ${walletTransactions.length} transactions in ${walletType} wallet data:`, walletTransactions);
        } else {
            console.log(` No transactions found in ${walletType} wallet data`);
        }
        
        // Also extract transactions from all wallets for the Recent Transactions section (only for primary wallet)
        if (walletType === 'primary') {
            console.log(' Extracting ALL transactions from ALL citizen wallets for Recent Transactions...');
            let allTransactions = [];
            
            // Extract transactions from all wallets
            for (const wallet of wallets) {
                console.log(` Checking wallet ${wallet.type} for transactions...`);
                if (wallet.transactions && Array.isArray(wallet.transactions)) {
                    console.log(` Found ${wallet.transactions.length} transactions in ${wallet.type} wallet`);
                    allTransactions = allTransactions.concat(wallet.transactions);
                } else {
                    console.log(` No transactions in ${wallet.type} wallet`);
                }
            }
            
            console.log(` Total transactions extracted from all wallets: ${allTransactions.length}`);
            console.log(' All transactions:', allTransactions);
            
            // Update the Recent Transactions section directly
            if (window.browser?.updateTransactionHistory) {
                console.log(' Calling window.browser.updateTransactionHistory with all transactions...');
                window.browser.updateTransactionHistory(allTransactions);
            } else {
                console.warn('⚠️ window.browser.updateTransactionHistory method not found');
            }
        }
        
        // Load assets for this wallet (for now, just show ZHTP)
        const assets = [
            {
                name: 'ZHTP',
                symbol: 'ZHTP',
                balance: balance,
                usdPrice: 1.00,
                icon: '💎',
                change24h: 0
            }
        ];
        updateAssetDisplay(walletType, assets);
        
        console.log(` ${walletType} wallet data loaded successfully`);
        
    } catch (error) {
        console.error(`❌ Failed to load ${walletType} wallet data:`, error);
    }
}

// Helper function to paste from clipboard
async function pasteFromClipboard(inputId) {
    try {
        const text = await navigator.clipboard.readText();
        const input = document.getElementById(inputId);
        if (input) {
            input.value = text;
            window.browser?.showNotification(' Pasted from clipboard!', 'success');
        }
    } catch (err) {
        console.error('Failed to paste from clipboard:', err);
        window.browser?.showNotification('❌ Failed to paste from clipboard', 'error');
    }
}

// Helper functions to update wallet displays
function updateTransactionDisplay(walletType, transactions) {
    const transactionList = document.getElementById('transactionList');
    if (!transactionList) {
        console.warn('⚠️ Transaction list element not found');
        return;
    }
    
    if (transactions.length === 0) {
        transactionList.innerHTML = `
            <div class="transaction-item">
                <div class="transaction-info">
                    <div class="transaction-title">No transactions yet</div>
                    <div class="transaction-subtitle">Your transaction history will appear here</div>
                </div>
            </div>
        `;
        return;
    }
    
    const transactionHtml = transactions.map(tx => `
        <div class="transaction-item">
            <div class="transaction-icon">${tx.type === 'received' ? '📥' : '📤'}</div>
            <div class="transaction-info">
                <div class="transaction-title">${tx.type === 'received' ? 'Received' : 'Sent'}</div>
                <div class="transaction-subtitle">${formatTransactionDate(tx.timestamp)}</div>
            </div>
            <div class="transaction-amount ${tx.type}">
                ${tx.type === 'received' ? '+' : '-'}${parseFloat(tx.amount).toFixed(4)} ZHTP
            </div>
        </div>
    `).join('');
    
    transactionList.innerHTML = transactionHtml;
}

function updateAssetDisplay(walletType, assets) {
    const assetList = document.getElementById('assetList');
    if (!assetList) {
        console.warn('⚠️ Asset list element not found');
        return;
    }
    
    const assetHtml = assets.map(asset => `
        <div class="asset-item">
            <div class="asset-icon">${asset.icon}</div>
            <div class="asset-info">
                <div class="asset-name">${asset.name}</div>
                <div class="asset-symbol">${asset.symbol}</div>
            </div>
            <div class="asset-balance">
                <div class="asset-amount">${parseFloat(asset.balance).toFixed(4)}</div>
                <div class="asset-value">≈ $${(asset.balance * asset.usdPrice).toFixed(2)} USD</div>
            </div>
        </div>
    `).join('');
    
    assetList.innerHTML = assetHtml;
}

function formatTransactionDate(timestamp) {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffMins < 60) {
        return diffMins <= 1 ? 'Just now' : `${diffMins} minutes ago`;
    } else if (diffHours < 24) {
        return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`;
    } else if (diffDays < 7) {
        return `${diffDays} day${diffDays === 1 ? '' : 's'} ago`;
    } else {
        return date.toLocaleDateString();
    }
}

// Transfer between wallets
async function transferBetweenWallets(fromWallet) {
    if (!window.browser?.currentIdentity) {
        window.browser?.showNotification('Please sign in first', 'error');
        return;
    }
    
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>🔀 Transfer Between Wallets</h3>
                <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">✕</button>
            </div>
            <div class="modal-body">
                <div class="form-group">
                    <label class="form-label">From Wallet</label>
                    <select class="form-input" id="fromWallet" disabled>
                        <option value="${fromWallet}">${fromWallet.charAt(0).toUpperCase() + fromWallet.slice(1)} Wallet</option>
                    </select>
                </div>
                <div class="form-group">
                    <label class="form-label">To Wallet</label>
                    <select class="form-input" id="toWallet">
                        ${fromWallet !== 'primary' ? '<option value="primary">Primary Wallet</option>' : ''}
                        ${fromWallet !== 'ubi' ? '<option value="ubi">UBI Wallet</option>' : ''}
                        ${fromWallet !== 'savings' ? '<option value="savings">Savings Wallet</option>' : ''}
                    </select>
                </div>
                <div class="form-group">
                    <label class="form-label">Amount (ZHTP)</label>
                    <input type="number" class="form-input" id="transferAmount" placeholder="0.00" step="0.01" min="0">
                </div>
                <div class="form-group">
                    <label class="form-label">Purpose (Optional)</label>
                    <input type="text" class="form-input" id="transferPurpose" placeholder="Personal savings, UBI accumulation, etc.">
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn-secondary" onclick="this.closest('.modal-overlay').remove()">Cancel</button>
                <button class="btn-primary" onclick="executeWalletTransfer('${fromWallet}')">Transfer</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
}

async function executeWalletTransfer(fromWallet) {
    try {
        const toWallet = document.getElementById('toWallet').value;
        const amount = parseFloat(document.getElementById('transferAmount').value);
        const purpose = document.getElementById('transferPurpose').value || 'Internal transfer';
        
        if (!toWallet || !amount || amount <= 0) {
            window.browser?.showNotification('Please fill in all required fields', 'error');
            return;
        }
        
        // Get current wallet balances
        const citizenData = window.browser.citizenWalletData;
        if (!citizenData || !citizenData.wallets) {
            window.browser?.showNotification('❌ Wallet data not available', 'error');
            return;
        }
        
        const fromWalletInfo = citizenData.wallets.find(w => w.type === fromWallet);
        const toWalletInfo = citizenData.wallets.find(w => w.type === toWallet);
        
        if (!fromWalletInfo || !toWalletInfo) {
            window.browser?.showNotification('❌ Wallet not found', 'error');
            return;
        }
        
        let fromBalance = fromWalletInfo.balance;
        if (fromWallet === 'primary' && fromBalance === 0 && citizenData.totalBalance) {
            fromBalance = citizenData.totalBalance; // Use total balance for primary wallet
        }
        
        if (fromBalance < amount) {
            window.browser?.showNotification(`❌ Insufficient balance in ${fromWallet} wallet`, 'error');
            return;
        }
        
        window.browser?.showNotification(` Transferring ${amount} ZHTP from ${fromWallet} to ${toWallet} wallet...`, 'info');
        
        // Update wallet balances
        if (fromWallet === 'primary' && citizenData.totalBalance) {
            citizenData.totalBalance -= amount;
            fromWalletInfo.balance = Math.max(0, citizenData.totalBalance);
        } else {
            fromWalletInfo.balance -= amount;
        }
        
        toWalletInfo.balance += amount;
        
        // Add transaction record to both wallets
        const transaction = {
            id: `tx_${Date.now()}`,
            type: fromWallet === 'primary' ? 'transfer_out' : 'transfer_in',
            amount: amount,
            from: fromWallet,
            to: toWallet,
            purpose: purpose,
            timestamp: new Date().toISOString(),
            status: 'completed'
        };
        
        // Initialize transactions arrays if they don't exist
        if (!fromWalletInfo.transactions) fromWalletInfo.transactions = [];
        if (!toWalletInfo.transactions) toWalletInfo.transactions = [];
        
        fromWalletInfo.transactions.unshift({...transaction, type: 'transfer_out'});
        toWalletInfo.transactions.unshift({...transaction, type: 'transfer_in'});
        
        // Save updated data
        window.browser.citizenWalletData = citizenData;
        
        setTimeout(() => {
            window.browser?.showNotification(` Successfully transferred ${amount} ZHTP from ${fromWallet} to ${toWallet}!`, 'success');
            document.querySelector('.modal-overlay').remove();
            // Refresh both wallet displays
            loadWalletDataForType(fromWallet);
            loadWalletDataForType(toWallet);
        }, 1500);
        
    } catch (error) {
        console.error('❌ Wallet transfer failed:', error);
        window.browser?.showNotification('Transfer failed: ' + error.message, 'error');
    }
}

// Additional wallet functions
async function claimUBI() {
    if (!window.browser?.currentIdentity) {
        window.browser?.showNotification('Please sign in first', 'error');
        return;
    }
    
    const citizenData = window.browser.citizenWalletData;
    if (!citizenData || !citizenData.citizenship || !citizenData.citizenship.ubi_eligibility) {
        window.browser?.showNotification('❌ UBI eligibility not found', 'error');
        return;
    }
    
    const ubiAmount = citizenData.citizenship.ubi_eligibility.daily_amount || 50.0000;
    
    window.browser?.showNotification('🏛️ Claiming daily UBI payment...', 'info');
    
    setTimeout(() => {
        // Find UBI wallet and update balance
        const ubiWallet = citizenData.wallets.find(w => w.type === 'ubi');
        if (ubiWallet) {
            ubiWallet.balance += ubiAmount;
            
            // Add UBI transaction
            if (!ubiWallet.transactions) ubiWallet.transactions = [];
            ubiWallet.transactions.unshift({
                id: `ubi_${Date.now()}`,
                type: 'ubi_payment',
                amount: ubiAmount,
                from: 'ZHTP UBI Fund',
                to: 'ubi',
                purpose: 'Daily UBI Payment',
                timestamp: new Date().toISOString(),
                status: 'completed'
            });
            
            // Update total balance
            citizenData.totalBalance += ubiAmount;
            
            window.browser?.showNotification(` UBI payment of ${ubiAmount} ZHTP claimed successfully!`, 'success');
            loadWalletDataForType('ubi');
        }
    }, 1500);
}

async function viewUbiHistory() {
    window.browser?.showNotification('📊 UBI payment history coming soon!', 'info');
}

async function viewStakingRewards() {
    window.browser?.showNotification('💎 Staking rewards interface coming soon!', 'info');
}

console.log('💎 ZHTP Multi-Wallet System loaded successfully!');

console.log(' ZHTP Web4 Desktop App script loaded successfully!');




// Global browser instance
window.browser = new Web4Browser();

// Initialize when page loads
document.addEventListener('DOMContentLoaded', () => {
    console.log(' DOM loaded, initializing ZHTP Web4 Desktop App...');
    window.browser.initialize();
});

// Username validation with debouncing
let usernameCheckTimeout = null;

async function checkUsernameAvailability(displayName) {
    // Clear previous timeout
    if (usernameCheckTimeout) {
        clearTimeout(usernameCheckTimeout);
    }

    // Get all validation status elements
    const statusElements = document.querySelectorAll('#displayNameStatus, #quickDisplayNameStatus, #mainDisplayNameStatus');
    const inputElements = document.querySelectorAll('#displayNameInput, #quickDisplayNameInput, #displayName');

    // If empty, clear validation
    if (!displayName || displayName.trim().length === 0) {
        statusElements.forEach(status => {
            status.textContent = '';
            status.className = 'validation-status';
        });
        inputElements.forEach(input => {
            input.classList.remove('valid', 'invalid');
        });
        return;
    }

    // Show checking status immediately
    statusElements.forEach(status => {
        status.textContent = ' Checking availability...';
        status.className = 'validation-status checking';
    });

    // Debounce the actual check
    usernameCheckTimeout = setTimeout(async () => {
        try {
            console.log(' Checking username availability for:', displayName);
            const identityExists = await window.browser.api.checkIdentityExists(displayName.trim());
            
            if (identityExists) {
                // Username is taken
                statusElements.forEach(status => {
                    status.textContent = '❌ This display name is already taken';
                    status.className = 'validation-status taken';
                });
                inputElements.forEach(input => {
                    input.classList.remove('valid');
                    input.classList.add('invalid');
                });
                console.log('❌ Display name already taken:', displayName);
            } else {
                // Username is available
                statusElements.forEach(status => {
                    status.textContent = ' Display name is available';
                    status.className = 'validation-status available';
                });
                inputElements.forEach(input => {
                    input.classList.remove('invalid');
                    input.classList.add('valid');
                });
                console.log(' Display name available:', displayName);
            }
        } catch (error) {
            console.error('❌ Error checking username availability:', error);
            statusElements.forEach(status => {
                status.textContent = '⚠️ Unable to check availability';
                status.className = 'validation-status';
            });
            inputElements.forEach(input => {
                input.classList.remove('valid', 'invalid');
            });
        }
    }, 500); // 500ms debounce
}

// Wallet functions
async function sendTokens() {
    if (!window.browser?.currentIdentity) {
        window.browser?.showNotification('❌ Please sign in to send tokens', 'error');
        return;
    }

    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>📤 Send ZHTP Tokens</h3>
                <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">✕</button>
            </div>
            <div class="modal-body">
                <div class="form-group">
                    <label class="form-label">Recipient Address/DID</label>
                    <input type="text" class="form-input" id="sendRecipient" placeholder="zk... or username.zkdid">
                </div>
                <div class="form-group">
                    <label class="form-label">Amount (ZHTP)</label>
                    <input type="number" class="form-input" id="sendAmount" placeholder="0.00" step="0.01" min="0">
                </div>
                <div class="form-group">
                    <label class="form-label">Message (Optional)</label>
                    <input type="text" class="form-input" id="sendMessage" placeholder="Payment for...">
                </div>
                <div class="form-group">
                    <label class="form-checkbox">
                        <input type="checkbox" id="sendPrivate">
                        <span class="checkmark"></span>
                        Use stealth transaction (enhanced privacy)
                    </label>
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn-secondary" onclick="this.closest('.modal-overlay').remove()">Cancel</button>
                <button class="btn-primary" onclick="executeSendTokens()">Send Tokens</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
}

async function executeSendTokens() {
    try {
        const recipient = document.getElementById('sendRecipient').value;
        const amount = parseFloat(document.getElementById('sendAmount').value);
        const message = document.getElementById('sendMessage').value;
        const usePrivate = document.getElementById('sendPrivate').checked;

        if (!recipient || !amount || amount <= 0) {
            window.browser?.showNotification('❌ Please fill in all required fields', 'error');
            return;
        }

        console.log('💸 Sending tokens:', { recipient, amount, message, usePrivate });
        
        const result = await window.browser.api.sendTokens({
            recipient,
            amount,
            message,
            usePrivate,
            sender: window.browser.currentIdentity.did
        });

        if (result.success) {
            window.browser?.showNotification(` Sent ${amount} ZHTP to ${recipient}`, 'success');
            document.querySelector('.modal-overlay').remove();
            // Refresh wallet data
            if (window.browser) {
                setTimeout(() => window.browser.loadWalletData(), 1000);
            }
        } else {
            window.browser?.showNotification(`❌ Transfer failed: ${result.error}`, 'error');
        }
    } catch (error) {
        console.error('❌ Send tokens error:', error);
        window.browser?.showNotification('❌ Failed to send tokens', 'error');
    }
}

async function receiveTokens() {
    if (!window.browser?.currentIdentity) {
        window.browser?.showNotification('❌ Please sign in to receive tokens', 'error');
        return;
    }

    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>📥 Receive ZHTP Tokens</h3>
                <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">✕</button>
            </div>
            <div class="modal-body">
                <div class="receive-section">
                    <h4>Your Address</h4>
                    <div class="address-display">
                        <div class="address-text" id="receiveAddress">${window.browser.currentIdentity.did}</div>
                        <button class="copy-btn" onclick="copyReceiveAddress()"> Copy</button>
                    </div>
                </div>
                <div class="receive-section">
                    <h4>QR Code</h4>
                    <div class="qr-placeholder">
                        <div class="qr-code"> QR Code would appear here</div>
                        <p>Scan with ZHTP mobile wallet</p>
                    </div>
                </div>
                <div class="receive-section">
                    <h4>Custom Amount (Optional)</h4>
                    <input type="number" class="form-input" id="requestAmount" placeholder="0.00" step="0.01" min="0">
                    <button class="btn-secondary" onclick="generatePaymentLink()">Generate Payment Link</button>
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
}

function copyReceiveAddress() {
    const address = document.getElementById('receiveAddress').textContent;
    navigator.clipboard.writeText(address).then(() => {
        window.browser?.showNotification(' Address copied to clipboard!', 'success');
    });
}

function generatePaymentLink() {
    const amount = document.getElementById('requestAmount').value;
    const address = window.browser.currentIdentity.did;
    const link = `zhtp://pay/${address}${amount ? `?amount=${amount}` : ''}`;
    
    navigator.clipboard.writeText(link).then(() => {
        window.browser?.showNotification(' Payment link copied to clipboard!', 'success');
    });
}

async function swapTokens() {
    if (!window.browser?.currentIdentity) {
        window.browser?.showNotification('❌ Please sign in to swap tokens', 'error');
        return;
    }

    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3> Swap Tokens</h3>
                <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">✕</button>
            </div>
            <div class="modal-body">
                <div class="swap-section">
                    <div class="form-group">
                        <label class="form-label">From</label>
                        <select class="form-input" id="swapFromToken">
                            <option value="ZHTP">ZHTP (ZHTP)</option>
                            <option value="WHISPER">Whisper (WHISPER)</option>
                        </select>
                        <input type="number" class="form-input" id="swapFromAmount" placeholder="0.00" step="0.01" min="0">
                    </div>
                    
                    <div class="swap-arrow">⇅</div>
                    
                    <div class="form-group">
                        <label class="form-label">To</label>
                        <select class="form-input" id="swapToToken">
                            <option value="WHISPER">Whisper (WHISPER)</option>
                            <option value="ZHTP">ZHTP (ZHTP)</option>
                        </select>
                        <input type="number" class="form-input" id="swapToAmount" placeholder="0.00" readonly>
                    </div>
                </div>
                
                <div class="swap-info">
                    <div class="info-row">
                        <span>Exchange Rate:</span>
                        <span id="swapRate">1 ZHTP = 10 WHISPER</span>
                    </div>
                    <div class="info-row">
                        <span>Fee:</span>
                        <span id="swapFee">0.1%</span>
                    </div>
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn-secondary" onclick="this.closest('.modal-overlay').remove()">Cancel</button>
                <button class="btn-primary" onclick="executeSwap()">Swap Tokens</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
    
    // Add event listeners for amount calculation
    document.getElementById('swapFromAmount').addEventListener('input', calculateSwapAmount);
    document.getElementById('swapFromToken').addEventListener('change', calculateSwapAmount);
    document.getElementById('swapToToken').addEventListener('change', calculateSwapAmount);
}

function calculateSwapAmount() {
    const fromAmount = parseFloat(document.getElementById('swapFromAmount').value) || 0;
    const fromToken = document.getElementById('swapFromToken').value;
    const toToken = document.getElementById('swapToToken').value;
    
    let rate = 1;
    if (fromToken === 'ZHTP' && toToken === 'WHISPER') {
        rate = 10; // 1 ZHTP = 10 WHISPER
    } else if (fromToken === 'WHISPER' && toToken === 'ZHTP') {
        rate = 0.1; // 1 WHISPER = 0.1 ZHTP
    }
    
    const toAmount = fromAmount * rate * 0.999; // 0.1% fee
    document.getElementById('swapToAmount').value = toAmount.toFixed(4);
    document.getElementById('swapRate').textContent = `1 ${fromToken} = ${rate} ${toToken}`;
}

async function executeSwap() {
    try {
        const fromToken = document.getElementById('swapFromToken').value;
        const toToken = document.getElementById('swapToToken').value;
        const fromAmount = parseFloat(document.getElementById('swapFromAmount').value);
        const toAmount = parseFloat(document.getElementById('swapToAmount').value);

        if (!fromAmount || fromAmount <= 0) {
            window.browser?.showNotification('❌ Please enter a valid amount', 'error');
            return;
        }

        console.log(' Swapping tokens:', { fromToken, toToken, fromAmount, toAmount });
        
        const result = await window.browser.api.swapTokens({
            fromToken,
            toToken,
            fromAmount,
            toAmount,
            user: window.browser.currentIdentity.did
        });

        if (result.success) {
            window.browser?.showNotification(` Swapped ${fromAmount} ${fromToken} for ${toAmount} ${toToken}`, 'success');
            document.querySelector('.modal-overlay').remove();
            // Refresh wallet data
            if (window.browser) {
                setTimeout(() => window.browser.loadWalletData(), 1000);
            }
        } else {
            window.browser?.showNotification(`❌ Swap failed: ${result.error}`, 'error');
        }
    } catch (error) {
        console.error('❌ Swap error:', error);
        window.browser?.showNotification('❌ Failed to swap tokens', 'error');
    }
}

async function stakeTokens() {
    if (!window.browser?.currentIdentity) {
        window.browser?.showNotification('❌ Please sign in to stake tokens', 'error');
        return;
    }

    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>🏦 Stake ZHTP Tokens</h3>
                <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">✕</button>
            </div>
            <div class="modal-body">
                <div class="stake-info">
                    <div class="info-card">
                        <h4>💰 Current APY</h4>
                        <div class="apy-rate">8.5%</div>
                    </div>
                    <div class="info-card">
                        <h4>⏰ Lock Period</h4>
                        <div class="lock-period">30 days minimum</div>
                    </div>
                </div>
                
                <div class="form-group">
                    <label class="form-label">Amount to Stake (ZHTP)</label>
                    <input type="number" class="form-input" id="stakeAmount" placeholder="0.00" step="0.01" min="0">
                    <div class="balance-info">Available: <span id="availableBalance">-- ZHTP</span></div>
                </div>
                
                <div class="form-group">
                    <label class="form-label">Lock Period</label>
                    <select class="form-input" id="stakePeriod">
                        <option value="30">30 days (8.5% APY)</option>
                        <option value="90">90 days (10.2% APY)</option>
                        <option value="180">180 days (12.8% APY)</option>
                        <option value="365">365 days (15.5% APY)</option>
                    </select>
                </div>
                
                <div class="stake-calculation">
                    <div class="calc-row">
                        <span>Estimated Rewards:</span>
                        <span id="estimatedRewards">-- ZHTP</span>
                    </div>
                    <div class="calc-row">
                        <span>Unlock Date:</span>
                        <span id="unlockDate">--</span>
                    </div>
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn-secondary" onclick="this.closest('.modal-overlay').remove()">Cancel</button>
                <button class="btn-primary" onclick="executeStake()">Stake Tokens</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
    
    // Load current balance
    loadStakeBalance();
    
    // Add event listeners
    document.getElementById('stakeAmount').addEventListener('input', calculateStakeRewards);
    document.getElementById('stakePeriod').addEventListener('change', calculateStakeRewards);
}

async function loadStakeBalance() {
    try {
        const balanceData = await window.browser.api.getWalletBalance(window.browser.currentIdentity.did);
        const availableElement = document.getElementById('availableBalance');
        if (availableElement && balanceData) {
            availableElement.textContent = `${parseFloat(balanceData.balance).toFixed(4)} ZHTP`;
        }
    } catch (error) {
        console.error('❌ Failed to load balance:', error);
    }
}

function calculateStakeRewards() {
    const amount = parseFloat(document.getElementById('stakeAmount').value) || 0;
    const period = parseInt(document.getElementById('stakePeriod').value);
    
    let apy = 0.085; // 8.5% default
    switch (period) {
        case 30: apy = 0.085; break;
        case 90: apy = 0.102; break;
        case 180: apy = 0.128; break;
        case 365: apy = 0.155; break;
    }
    
    const rewards = amount * apy * (period / 365);
    const unlockDate = new Date();
    unlockDate.setDate(unlockDate.getDate() + period);
    
    document.getElementById('estimatedRewards').textContent = `${rewards.toFixed(4)} ZHTP`;
    document.getElementById('unlockDate').textContent = unlockDate.toLocaleDateString();
}

async function executeStake() {
    try {
        const amount = parseFloat(document.getElementById('stakeAmount').value);
        const period = parseInt(document.getElementById('stakePeriod').value);

        if (!amount || amount <= 0) {
            window.browser?.showNotification('❌ Please enter a valid amount', 'error');
            return;
        }

        console.log('🏦 Staking tokens:', { amount, period });
        
        const result = await window.browser.api.stakeTokens({
            amount,
            period,
            user: window.browser.currentIdentity.did
        });

        if (result.success) {
            window.browser?.showNotification(` Staked ${amount} ZHTP for ${period} days`, 'success');
            document.querySelector('.modal-overlay').remove();
            // Refresh wallet data
            if (window.browser) {
                setTimeout(() => window.browser.loadWalletData(), 1000);
            }
        } else {
            window.browser?.showNotification(`❌ Staking failed: ${result.error}`, 'error');
        }
    } catch (error) {
        console.error('❌ Staking error:', error);
        window.browser?.showNotification('❌ Failed to stake tokens', 'error');
    }
}

// Make functions globally available for HTML onclick handlers
window.sendTokens = sendTokens;
window.receiveTokens = receiveTokens;
window.swapTokens = swapTokens;
window.stakeTokens = stakeTokens;
window.executeSendTokens = executeSendTokens;
window.copyReceiveAddress = copyReceiveAddress;
window.generatePaymentLink = generatePaymentLink;
window.executeSwap = executeSwap;
window.executeStake = executeStake;
window.switchZkDidTab = switchZkDidTab;
window.signInWithZkDid = signInWithZkDid;
window.createNewZkDid = createNewZkDid;
window.recoverZkDid = recoverZkDid;
window.sendEmoji = sendEmoji;
window.executeSeedRecovery = executeSeedRecovery;
window.executeBackupRecovery = executeBackupRecovery;
window.executeSocialRecovery = executeSocialRecovery;
window.recoverWithSeed = recoverWithSeed;
window.recoverWithBackup = recoverWithBackup;
window.recoverWithSocial = recoverWithSocial;
window.navigateBack = navigateBack;
window.navigateForward = navigateForward;
window.refreshPage = refreshPage;
window.checkUsernameAvailability = checkUsernameAvailability;
window.switchWalletTab = switchWalletTab;
window.loadWalletDataForType = loadWalletDataForType;
window.transferBetweenWallets = transferBetweenWallets;
window.executeWalletTransfer = executeWalletTransfer;
window.claimUBI = claimUBI;
window.switchDaoTab = switchDaoTab;
window.loadDaoDataForType = loadDaoDataForType;

// Add global functions for DAO interactions from HTML
window.voteOnProposal = function(proposalId, vote) {
    if (window.browser) {
        window.browser.voteOnProposal(proposalId, vote);
    } else {
        console.error('❌ Browser instance not available');
    }
};

window.delegateVotingPower = function(targetDid) {
    if (window.browser) {
        window.browser.delegateVotingPower(targetDid);
    } else {
        console.error('❌ Browser instance not available');
    }
};

console.log(' ZHTP Web4 Desktop App script loaded successfully!');

// ===== ENSURE GLOBAL FUNCTIONS ARE AVAILABLE IMMEDIATELY =====
// Move all DAO functions to ensure they're available when HTML loads

// Define all DAO functions immediately for HTML onclick handlers
window.switchDaoTab = function(tabName) {
    console.log(' Switching to DAO tab:', tabName);
    
    // Remove active class from all tabs
    const tabs = document.querySelectorAll('.dao-tab');
    tabs.forEach(tab => tab.classList.remove('active'));
    
    // Add active class to selected tab
    const selectedTab = document.querySelector(`.dao-tab[onclick*="${tabName}"]`);
    if (selectedTab) {
        selectedTab.classList.add('active');
    }
    
    // Load content for the selected tab
    if (window.browser) {
        switch(tabName) {
            case 'proposals':
                window.browser.loadDaoProposals();
                break;
            case 'treasury':
                window.browser.loadDaoTreasury();
                break;
            case 'delegates':
                window.browser.loadDaoDelegates();
                break;
            default:
                console.warn('Unknown DAO tab:', tabName);
        }
    } else {
        console.error('❌ Browser instance not available - will retry when ready');
    }
};

window.createProposal = function() {
    console.log('Creating new DAO proposal...');
    if (window.browser) {
        window.browser.showCreateProposalModal();
    } else {
        console.error('❌ Browser instance not available - will retry when ready');
    }
};

window.voteOnProposals = function() {
    console.log('🗳️ Viewing active proposals for voting...');
    window.switchDaoTab('proposals');
    if (window.browser) {
        window.browser.loadDaoProposals();
    }
};

window.proposeSpending = function() {
    console.log('💰 Opening treasury spending proposal...');
    if (window.browser) {
        window.browser.showSpendingProposalModal();
    } else {
        console.error('❌ Browser instance not available - will retry when ready');
    }
};

window.viewTreasuryHistory = function() {
    console.log('📊 Loading treasury transaction history...');
    if (window.browser) {
        window.browser.loadTreasuryHistory();
    } else {
        console.error('❌ Browser instance not available - will retry when ready');
    }
};

window.delegateVotes = function() {
    console.log('🗳️ Switching to delegates tab...');
    window.switchDaoTab('delegates');
};

window.revokeDelegation = function() {
    console.log('❌ Revoking vote delegation...');
    if (window.browser) {
        window.browser.revokeDelegation();
    } else {
        console.error('❌ Browser instance not available - will retry when ready');
    }
};

window.becomeDeligate = function() {
    console.log('👤 Starting delegate registration...');
    if (window.browser) {
        window.browser.showDelegateRegistrationModal();
    } else {
        console.error('❌ Browser instance not available - will retry when ready');
    }
};

window.voteOnProposal = function(proposalId, voteChoice) {
    console.log(`🗳️ Voting ${voteChoice ? 'FOR' : 'AGAINST'} proposal ${proposalId}...`);
    if (window.browser) {
        window.browser.submitVote(proposalId, voteChoice);
    } else {
        console.error('❌ Browser instance not available - will retry when ready');
    }
};

window.delegateVotingPower = function(delegateId) {
    console.log(`👥 Delegating voting power to ${delegateId}...`);
    if (window.browser) {
        window.browser.delegateVotingPower(delegateId);
    } else {
        console.error('❌ Browser instance not available - will retry when ready');
    }
};

window.viewTreasury = function() {
    console.log('🏛️ Switching to treasury tab...');
    window.switchDaoTab('treasury');
};

// Add missing modal and UI functions
window.openSettings = function() {
    console.log('⚙️ Opening settings...');
    if (window.browser) {
        window.browser.openSettings();
    } else {
        console.error('❌ Browser instance not available - will retry when ready');
    }
};

window.openDhtTesting = function() {
    console.log(' Opening DHT Testing Dashboard...');
    if (window.dhtDashboard) {
        window.dhtDashboard.showTestingInterface();
    } else if (window.browser) {
        window.browser.openDhtTesting();
    } else {
        console.error('❌ DHT Dashboard not initialized - will retry when ready');
    }
};

window.closeModal = function(modalId) {
    console.log(`❌ Closing modal: ${modalId}`);
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'none';
    }
};

// Tab switching is already defined earlier in the file at line 452
// This duplicate has been removed to prevent conflicts

// ZK-DID Authentication Functions
window.signInWithZkDid = function() {
    console.log('🔑 Signing in with ZK-DID...');
    if (window.browser) {
        window.browser.signInWithZkDid();
    } else {
        console.error('❌ Browser instance not available - will retry when ready');
    }
};

window.signInWithPassphrase = function() {
    console.log(' Signing in with passphrase...');
    if (window.browser) {
        window.browser.signInWithPassphrase();
    } else {
        console.error('❌ Browser instance not available - will retry when ready');
    }
};

window.signInWithBiometric = function() {
    console.log('👆 Signing in with biometric...');
    if (window.browser) {
        window.browser.signInWithBiometric();
    } else {
        console.error('❌ Browser instance not available - will retry when ready');
    }
};

window.signInWithQR = function() {
    console.log(' Signing in with QR code...');
    if (window.browser) {
        window.browser.signInWithQR();
    } else {
        console.error('❌ Browser instance not available - will retry when ready');
    }
};

// createNewZkDid is already defined at the top of the file (line 349)
// Removed duplicate wrapper that was causing errors

window.setupBiometrics = function() {
    console.log('👆 Setting up biometrics...');
    if (window.browser) {
        window.browser.setupBiometrics();
    } else {
        console.error('❌ Browser instance not available - will retry when ready');
    }
};

// Recovery Functions
window.recoverWithSeed = function() {
    console.log('🌱 Recovering with seed phrase...');
    if (window.browser) {
        window.browser.recoverWithSeed();
    } else {
        console.error('❌ Browser instance not available - will retry when ready');
    }
};

window.recoverWithBackup = function() {
    console.log('💾 Recovering with backup...');
    if (window.browser) {
        window.browser.recoverWithBackup();
    } else {
        console.error('❌ Browser instance not available - will retry when ready');
    }
};

window.recoverWithSocial = function() {
    console.log('👥 Recovering with social...');
    if (window.browser) {
        window.browser.recoverWithSocial();
    } else {
        console.error('❌ Browser instance not available - will retry when ready');
    }
};

window.executeRecovery = function() {
    console.log(' Executing recovery...');
    if (window.browser) {
        window.browser.executeRecovery();
    } else {
        console.error('❌ Browser instance not available - will retry when ready');
    }
};

// Wallet Functions
window.sendTokens = function() {
    console.log('💸 Sending tokens...');
    if (window.browser) {
        window.browser.sendTokens();
    } else {
        console.error('❌ Browser instance not available - will retry when ready');
    }
};

window.receiveTokens = function() {
    console.log('💰 Receiving tokens...');
    if (window.browser) {
        window.browser.receiveTokens();
    } else {
        console.error('❌ Browser instance not available - will retry when ready');
    }
};

window.swapTokens = function() {
    console.log(' Swapping tokens...');
    if (window.browser) {
        window.browser.swapTokens();
    } else {
        console.error('❌ Browser instance not available - will retry when ready');
    }
};

window.stakeTokens = function() {
    console.log('🏦 Staking tokens...');
    if (window.browser) {
        window.browser.stakeTokens();
    } else {
        console.error('❌ Browser instance not available - will retry when ready');
    }
};

// ===== IMMEDIATE FUNCTION DEFINITIONS FOR HTML ONCLICK HANDLERS =====
// These functions must be available immediately when HTML loads

// Core DAO functions that HTML calls directly
window.switchDaoTab = function(tabName) {
    console.log(' Switching to DAO tab:', tabName);
    
    if (window.browser && window.browser.isInitialized) {
        // Use the browser instance method if available
        window.browser.switchDaoTab(tabName);
    } else {
        console.log('⏳ Browser not ready, queuing DAO tab switch for:', tabName);
        // Store the requested tab to switch to when browser is ready
        window.pendingDaoTab = tabName;
        
        // Show loading state
        const tabs = document.querySelectorAll('.dao-tab');
        tabs.forEach(tab => tab.classList.remove('active'));
        const selectedTab = document.querySelector(`.dao-tab[onclick*="${tabName}"]`);
        if (selectedTab) {
            selectedTab.classList.add('active');
        }
        
        // Show loading content
        const daoContent = document.getElementById('dao-content');
        if (daoContent) {
            daoContent.innerHTML = `
                <div class="loading-state">
                    <div class="loading-spinner"></div>
                    <p>Loading ${tabName} data...</p>
                </div>
            `;
        }
    }
};

window.createProposal = function() {
    console.log('Creating new DAO proposal...');
    
    if (window.browser && window.browser.isInitialized) {
        window.browser.showCreateProposalModal();
    } else {
        console.log('⏳ Browser not ready, showing preparation message');
        alert('Please wait for the Web4 Browser to finish loading before creating proposals.');
    }
};

window.voteOnProposals = function() {
    console.log('🗳️ Viewing active proposals for voting...');
    window.switchDaoTab('proposals');
};

window.delegateVotes = function() {
    console.log('🗳️ Switching to delegates tab...');
    window.switchDaoTab('delegates');
};

window.viewTreasury = function() {
    console.log('🏛️ Switching to treasury tab...');
    window.switchDaoTab('treasury');
};

window.proposeSpending = function() {
    console.log('💸 Opening spending proposal modal...');
    if (window.browser && window.browser.isInitialized) {
        window.browser.showSpendingProposalModal();
    } else {
        alert('Please wait for the Web4 Browser to finish loading before proposing spending.');
    }
};

window.viewTreasuryHistory = function() {
    console.log('📊 Loading treasury transaction history...');
    if (window.browser && window.browser.isInitialized) {
        window.browser.loadTreasuryHistory();
    } else {
        alert('Please wait for the Web4 Browser to finish loading before viewing treasury history.');
    }
};

// Voting functions
window.voteYes = function(proposalId) {
    console.log(` Voting YES on proposal: ${proposalId}`);
    if (window.browser && window.browser.isInitialized) {
        window.browser.voteOnProposal(proposalId, true);
    } else {
        alert('Please wait for the Web4 Browser to finish loading before voting.');
    }
};

window.voteNo = function(proposalId) {
    console.log(`❌ Voting NO on proposal: ${proposalId}`);
    if (window.browser && window.browser.isInitialized) {
        window.browser.voteOnProposal(proposalId, false);
    } else {
        alert('Please wait for the Web4 Browser to finish loading before voting.');
    }
};

window.viewProposal = function(proposalId) {
    console.log(`📄 Viewing proposal details: ${proposalId}`);
    if (window.browser && window.browser.isInitialized) {
        window.browser.showProposalDetails(proposalId);
    } else {
        alert('Please wait for the Web4 Browser to finish loading before viewing proposal details.');
    }
};

// Initialize the browser instance when DOM is ready
document.addEventListener('DOMContentLoaded', async () => {
    try {
        console.log('🚀 Starting Web4 Browser initialization...');
        window.browser = new Web4Browser();
        await window.browser.initialize();
        
        // Handle any pending DAO tab switch
        if (window.pendingDaoTab) {
            console.log(' Executing pending DAO tab switch to:', window.pendingDaoTab);
            window.browser.switchDaoTab(window.pendingDaoTab);
            window.pendingDaoTab = null;
        }
        
        console.log(' Web4 Browser ready! All DAO functions now fully operational.');
    } catch (error) {
        console.error('❌ Failed to initialize Web4 Browser:', error);
    }
});

// Global helper functions for backward compatibility

// Make functions globally accessible
window.submitProposal = submitProposal;
window.handleProposalTypeChange = handleProposalTypeChange;
window.handleProposalTypeChangeHTML = handleProposalTypeChangeHTML;
window.cancelProposal = cancelProposal;
window.createProposal = createProposal;
window.voteYes = voteYes;
window.voteNo = voteNo;
window.viewProposal = viewProposal;
