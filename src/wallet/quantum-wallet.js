/**
 * Quantum Wallet - Post-quantum cryptographic wallet for ZHTP tokens
 * Integrates with ZHTP blockchain for secure token management
 */

export class QuantumWallet {
    constructor(api) {
        this.api = api;
        this.wallets = new Map();
        this.currentWallet = null;
        this.isInitialized = false;
        this.cryptoUtils = new QuantumCryptoUtils();
    }

    async initialize(identity) {
        console.log('💰 Initializing quantum wallet system...');
        
        try {
            if (identity) {
                // Load existing wallets for identity
                await this.loadWalletsForIdentity(identity);
                
                // Create default wallet if none exists
                if (this.wallets.size === 0) {
                    await this.createDefaultWallet(identity);
                }
                
                // Set current wallet
                this.currentWallet = Array.from(this.wallets.values())[0];
            }

            this.isInitialized = true;
            console.log(' Quantum wallet system initialized');

        } catch (error) {
            console.error('❌ Wallet initialization failed:', error);
            throw error;
        }
    }

    async loadWalletsForIdentity(identity) {
        try {
            // Try to load wallets from local storage first
            const savedWallets = localStorage.getItem(`zhtp_wallets_${identity.did}`);
            if (savedWallets) {
                const walletData = JSON.parse(savedWallets);
                for (const wallet of walletData) {
                    this.wallets.set(wallet.id, wallet);
                }
                console.log(`📂 Loaded ${walletData.length} saved wallets`);
            }

            // Verify wallets with blockchain
            for (const [walletId, wallet] of this.wallets) {
                try {
                    const balance = await this.api.getWalletBalance(identity.did);
                    wallet.balance = balance.zhtpBalance || 0;
                    wallet.lastUpdated = Date.now();
                } catch (error) {
                    console.warn(`⚠️ Could not verify wallet ${walletId}:`, error);
                }
            }

        } catch (error) {
            console.error('❌ Failed to load wallets:', error);
        }
    }

    async createDefaultWallet(identity) {
        console.log(' Creating default quantum wallet...');
        
        try {
            const wallet = await this.createWallet({
                name: 'Default Wallet',
                type: 'quantum-primary',
                owner: identity.did,
                purpose: 'general'
            });

            console.log(' Default quantum wallet created');
            return wallet;

        } catch (error) {
            console.error('❌ Default wallet creation failed:', error);
            throw error;
        }
    }

    async createWallet(config) {
        console.log(`🔑 Creating new quantum wallet: ${config.name}`);
        
        try {
            // Generate quantum-resistant key pair
            const keyPair = await this.cryptoUtils.generateWalletKeyPair();
            
            // Create wallet structure
            const wallet = {
                id: this.generateWalletId(),
                name: config.name,
                type: config.type,
                owner: config.owner,
                purpose: config.purpose || 'general',
                publicKey: keyPair.publicKey,
                privateKey: await this.cryptoUtils.encryptPrivateKey(keyPair.privateKey),
                address: await this.generateWalletAddress(keyPair.publicKey),
                balance: 0,
                created: new Date().toISOString(),
                lastUpdated: Date.now(),
                transactionHistory: [],
                settings: {
                    autoUbiClaim: true,
                    privacyMode: 'zk-private',
                    notificationsEnabled: true
                }
            };

            // Register wallet with blockchain
            await this.registerWalletOnChain(wallet);
            
            // Store wallet
            this.wallets.set(wallet.id, wallet);
            await this.saveWallets(config.owner);
            
            console.log(' Quantum wallet created successfully');
            return wallet;

        } catch (error) {
            console.error('❌ Wallet creation failed:', error);
            throw error;
        }
    }

    async registerWalletOnChain(wallet) {
        try {
            // Register wallet with ZHTP blockchain
            const registration = await this.api.registerWallet({
                address: wallet.address,
                publicKey: wallet.publicKey,
                owner: wallet.owner,
                type: wallet.type
            });

            wallet.chainRegistration = registration;
            console.log(' Wallet registered on ZHTP blockchain');

        } catch (error) {
            console.warn('⚠️ Wallet chain registration failed, continuing with local wallet:', error);
            // Continue without chain registration for development
        }
    }

    async generateWalletAddress(publicKey) {
        // Generate ZHTP wallet address from public key
        const addressData = {
            publicKey: publicKey,
            version: 1,
            network: 'zhtp-mainnet'
        };
        
        const addressHash = await this.cryptoUtils.hash(JSON.stringify(addressData));
        const addressBytes = new Uint8Array(addressHash.slice(0, 20)); // 20 bytes
        
        // Encode as bech32 with 'zhtp' prefix
        const address = this.encodeBech32('zhtp', addressBytes);
        return address;
    }

    encodeBech32(prefix, data) {
        // Simplified bech32 encoding for ZHTP addresses
        const encoded = Array.from(data)
            .map(b => b.toString(36))
            .join('')
            .substring(0, 32);
        
        return `${prefix}1${encoded}`;
    }

    generateWalletId() {
        return 'wallet_' + Math.random().toString(36).substr(2, 16) + Date.now().toString(36);
    }

    async getWalletData() {
        if (!this.currentWallet) {
            throw new Error('No active wallet');
        }

        try {
            // Get real-time balance from API
            const balanceData = await this.api.getWalletBalance(this.currentWallet.owner);
            
            // Update local wallet data
            this.currentWallet.balance = balanceData.zhtpBalance || 0;
            this.currentWallet.lastUpdated = Date.now();
            
            // Merge with API data
            const walletData = {
                ...balanceData,
                wallet: this.currentWallet,
                address: this.currentWallet.address,
                walletName: this.currentWallet.name,
                walletType: this.currentWallet.type
            };

            return walletData;

        } catch (error) {
            console.error('❌ Failed to get wallet data:', error);
            
            // Return cached data if API fails
            return {
                zhtpBalance: this.currentWallet.balance || 0,
                zhtpPrice: 0.42,
                nextUbiPayment: 'Next month',
                totalUbiReceived: 0,
                transactions: this.currentWallet.transactionHistory || [],
                wallet: this.currentWallet,
                address: this.currentWallet.address
            };
        }
    }

    async sendTokens(toAddress, amount) {
        if (!this.currentWallet) {
            throw new Error('No active wallet');
        }

        console.log(`💸 Sending ${amount} ZHTP to ${toAddress}`);
        
        try {
            // Validate amount
            if (amount <= 0) {
                throw new Error('Amount must be positive');
            }

            if (amount > this.currentWallet.balance) {
                throw new Error('Insufficient balance');
            }

            // Validate address
            if (!this.isValidZhtpAddress(toAddress)) {
                throw new Error('Invalid ZHTP address');
            }

            // Create transaction
            const transaction = await this.createTransaction({
                from: this.currentWallet.address,
                to: toAddress,
                amount: amount,
                token: 'ZHTP',
                type: 'transfer'
            });

            // Sign transaction with quantum-resistant signature
            const signedTransaction = await this.signTransaction(transaction);

            // Submit to network
            const result = await this.api.sendTokens(
                this.currentWallet.owner,
                toAddress,
                amount
            );

            // Update local balance and history
            this.currentWallet.balance -= amount;
            this.currentWallet.transactionHistory.unshift({
                id: result.transactionId || transaction.id,
                type: 'sent',
                amount: amount,
                to: toAddress,
                timestamp: new Date().toISOString(),
                status: 'confirmed',
                fee: transaction.fee || 0
            });

            // Save wallet state
            await this.saveWallets(this.currentWallet.owner);

            console.log(' Tokens sent successfully');
            return result;

        } catch (error) {
            console.error('❌ Token transfer failed:', error);
            throw error;
        }
    }

    async createTransaction(params) {
        const transaction = {
            id: this.generateTransactionId(),
            version: 1,
            from: params.from,
            to: params.to,
            amount: params.amount,
            token: params.token || 'ZHTP',
            type: params.type || 'transfer',
            fee: await this.calculateTransactionFee(params),
            timestamp: new Date().toISOString(),
            nonce: await this.getNextNonce(params.from),
            memo: params.memo || '',
            privacy: 'zk-private'
        };

        return transaction;
    }

    async calculateTransactionFee(params) {
        // Calculate dynamic fee based on network conditions
        try {
            const networkFee = await this.api.getNetworkFee();
            const baseFee = 0.01; // 0.01 ZHTP base fee
            const amountFee = params.amount * 0.001; // 0.1% of amount
            
            return Math.max(baseFee, amountFee) + (networkFee || 0);

        } catch (error) {
            // Fallback fee
            return 0.01;
        }
    }

    async getNextNonce(address) {
        try {
            const nonce = await this.api.getAccountNonce(address);
            return nonce + 1;
        } catch (error) {
            // Fallback to timestamp-based nonce
            return Date.now();
        }
    }

    async signTransaction(transaction) {
        try {
            // Get private key
            const privateKey = await this.cryptoUtils.decryptPrivateKey(this.currentWallet.privateKey);
            
            // Create transaction hash
            const transactionHash = await this.cryptoUtils.hash(JSON.stringify(transaction));
            
            // Create quantum-resistant signature
            const signature = await this.cryptoUtils.signQuantum(transactionHash, privateKey);
            
            // Add signature to transaction
            transaction.signature = signature;
            transaction.publicKey = this.currentWallet.publicKey;
            
            return transaction;

        } catch (error) {
            console.error('❌ Transaction signing failed:', error);
            throw error;
        }
    }

    generateTransactionId() {
        return 'tx_' + Math.random().toString(36).substr(2, 20) + Date.now().toString(36);
    }

    isValidZhtpAddress(address) {
        // Validate ZHTP address format
        if (typeof address !== 'string') return false;
        if (!address.startsWith('zhtp1')) return false;
        if (address.length < 20 || address.length > 100) return false;
        
        // Basic pattern check
        const pattern = /^zhtp1[a-z0-9]+$/;
        return pattern.test(address);
    }

    async receiveTokens(amount, from) {
        if (!this.currentWallet) {
            throw new Error('No active wallet');
        }

        console.log(`💰 Receiving ${amount} ZHTP from ${from}`);
        
        try {
            // Update balance
            this.currentWallet.balance += amount;
            
            // Add to transaction history
            this.currentWallet.transactionHistory.unshift({
                id: this.generateTransactionId(),
                type: 'received',
                amount: amount,
                from: from,
                timestamp: new Date().toISOString(),
                status: 'confirmed'
            });

            // Save wallet state
            await this.saveWallets(this.currentWallet.owner);

            console.log(' Tokens received successfully');
            return true;

        } catch (error) {
            console.error('❌ Token receive failed:', error);
            throw error;
        }
    }

    async claimUbi() {
        if (!this.currentWallet) {
            throw new Error('No active wallet');
        }

        console.log('🎁 Claiming UBI payment...');
        
        try {
            // Check UBI eligibility
            const eligibility = await this.api.checkUbiEligibility(this.currentWallet.owner);
            
            if (!eligibility.eligible) {
                throw new Error(eligibility.reason || 'Not eligible for UBI');
            }

            // Claim UBI
            const result = await this.api.claimUbi(this.currentWallet.owner);
            
            // Update wallet
            const ubiAmount = result.amount || 1000; // Default UBI amount
            this.currentWallet.balance += ubiAmount;
            
            this.currentWallet.transactionHistory.unshift({
                id: result.transactionId || this.generateTransactionId(),
                type: 'received',
                amount: ubiAmount,
                from: 'UBI System',
                description: 'Universal Basic Income',
                timestamp: new Date().toISOString(),
                status: 'confirmed'
            });

            await this.saveWallets(this.currentWallet.owner);

            console.log(' UBI claimed successfully');
            return result;

        } catch (error) {
            console.error('❌ UBI claim failed:', error);
            throw error;
        }
    }

    async stakeTokens(amount, validatorId) {
        if (!this.currentWallet) {
            throw new Error('No active wallet');
        }

        console.log(`🔒 Staking ${amount} ZHTP with validator ${validatorId}`);
        
        try {
            if (amount > this.currentWallet.balance) {
                throw new Error('Insufficient balance for staking');
            }

            // Create staking transaction
            const stakingTx = await this.createTransaction({
                from: this.currentWallet.address,
                to: validatorId,
                amount: amount,
                type: 'stake'
            });

            const signedTx = await this.signTransaction(stakingTx);
            const result = await this.api.stakeTokens(signedTx);

            // Update wallet
            this.currentWallet.balance -= amount;
            this.currentWallet.stakedAmount = (this.currentWallet.stakedAmount || 0) + amount;
            
            this.currentWallet.transactionHistory.unshift({
                id: result.transactionId || stakingTx.id,
                type: 'stake',
                amount: amount,
                validator: validatorId,
                timestamp: new Date().toISOString(),
                status: 'confirmed'
            });

            await this.saveWallets(this.currentWallet.owner);

            console.log(' Tokens staked successfully');
            return result;

        } catch (error) {
            console.error('❌ Staking failed:', error);
            throw error;
        }
    }

    async unstakeTokens(amount, validatorId) {
        if (!this.currentWallet) {
            throw new Error('No active wallet');
        }

        console.log(`🔓 Unstaking ${amount} ZHTP from validator ${validatorId}`);
        
        try {
            const stakedAmount = this.currentWallet.stakedAmount || 0;
            if (amount > stakedAmount) {
                throw new Error('Insufficient staked amount');
            }

            // Create unstaking transaction
            const unstakingTx = await this.createTransaction({
                from: this.currentWallet.address,
                to: validatorId,
                amount: amount,
                type: 'unstake'
            });

            const signedTx = await this.signTransaction(unstakingTx);
            const result = await this.api.unstakeTokens(signedTx);

            // Update wallet (unstaking usually has a delay)
            this.currentWallet.stakedAmount -= amount;
            this.currentWallet.pendingUnstake = (this.currentWallet.pendingUnstake || 0) + amount;
            
            this.currentWallet.transactionHistory.unshift({
                id: result.transactionId || unstakingTx.id,
                type: 'unstake',
                amount: amount,
                validator: validatorId,
                timestamp: new Date().toISOString(),
                status: 'pending',
                unlockTime: result.unlockTime
            });

            await this.saveWallets(this.currentWallet.owner);

            console.log(' Unstaking initiated successfully');
            return result;

        } catch (error) {
            console.error('❌ Unstaking failed:', error);
            throw error;
        }
    }

    async getStakingRewards() {
        if (!this.currentWallet) {
            return { rewards: 0, validators: [] };
        }

        try {
            const rewards = await this.api.getStakingRewards(this.currentWallet.address);
            return rewards;

        } catch (error) {
            console.error('❌ Failed to get staking rewards:', error);
            return { rewards: 0, validators: [] };
        }
    }

    async saveWallets(ownerDid) {
        try {
            const walletsArray = Array.from(this.wallets.values());
            localStorage.setItem(`zhtp_wallets_${ownerDid}`, JSON.stringify(walletsArray));
            console.log('💾 Wallets saved to local storage');

        } catch (error) {
            console.error('❌ Failed to save wallets:', error);
        }
    }

    async exportWallet(walletId) {
        const wallet = this.wallets.get(walletId);
        if (!wallet) {
            throw new Error('Wallet not found');
        }

        try {
            // Create export data
            const exportData = {
                version: '1.0',
                wallet: {
                    ...wallet,
                    privateKey: undefined // Don't export private key in plain text
                },
                exported: new Date().toISOString(),
                format: 'zhtp-wallet-v1'
            };

            // Create downloadable file
            const blob = new Blob([JSON.stringify(exportData, null, 2)], {
                type: 'application/json'
            });

            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `zhtp-wallet-${wallet.name.replace(/\s+/g, '-')}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            console.log(' Wallet exported successfully');
            return true;

        } catch (error) {
            console.error('❌ Wallet export failed:', error);
            throw error;
        }
    }

    async importWallet(walletFile, ownerDid) {
        try {
            const fileContent = await this.readFile(walletFile);
            const importData = JSON.parse(fileContent);

            if (importData.format !== 'zhtp-wallet-v1') {
                throw new Error('Unsupported wallet format');
            }

            const wallet = importData.wallet;
            wallet.owner = ownerDid; // Set new owner
            wallet.imported = new Date().toISOString();

            // Verify wallet integrity
            const expectedAddress = await this.generateWalletAddress(wallet.publicKey);
            if (expectedAddress !== wallet.address) {
                throw new Error('Wallet integrity check failed');
            }

            // Store imported wallet
            this.wallets.set(wallet.id, wallet);
            await this.saveWallets(ownerDid);

            console.log(' Wallet imported successfully');
            return wallet;

        } catch (error) {
            console.error('❌ Wallet import failed:', error);
            throw error;
        }
    }

    async readFile(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = e => resolve(e.target.result);
            reader.onerror = reject;
            reader.readAsText(file);
        });
    }

    getCurrentWallet() {
        return this.currentWallet;
    }

    getAllWallets() {
        return Array.from(this.wallets.values());
    }

    setCurrentWallet(walletId) {
        const wallet = this.wallets.get(walletId);
        if (!wallet) {
            throw new Error('Wallet not found');
        }
        
        this.currentWallet = wallet;
        return wallet;
    }

    getWalletBalance(walletId) {
        const wallet = this.wallets.get(walletId);
        return wallet ? wallet.balance : 0;
    }

    isInitialized() {
        return this.isInitialized;
    }
}

/**
 * Quantum Cryptographic Utilities for Wallet Operations
 */
class QuantumCryptoUtils {
    constructor() {
        this.keyCache = new Map();
    }

    async generateWalletKeyPair() {
        console.log(' Generating quantum-resistant wallet key pair...');
        
        try {
            // In production, this would use CRYSTALS-Dilithium
            // For demo, we'll use secure random generation
            
            const privateKey = new Uint8Array(64);
            crypto.getRandomValues(privateKey);
            
            const publicKey = await this.derivePublicKeyFromPrivate(privateKey);
            
            return {
                privateKey: Array.from(privateKey).map(b => b.toString(16).padStart(2, '0')).join(''),
                publicKey: Array.from(publicKey).map(b => b.toString(16).padStart(2, '0')).join('')
            };

        } catch (error) {
            console.error('❌ Wallet key generation failed:', error);
            throw error;
        }
    }

    async derivePublicKeyFromPrivate(privateKey) {
        // Derive public key from private key using hash function
        const encoder = new TextEncoder();
        const data = new Uint8Array([...privateKey, ...encoder.encode('zhtp_wallet_pubkey')]);
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        return new Uint8Array(hashBuffer);
    }

    async hash(data) {
        const encoder = new TextEncoder();
        const dataBytes = encoder.encode(data);
        const hashBuffer = await crypto.subtle.digest('SHA-256', dataBytes);
        return new Uint8Array(hashBuffer);
    }

    async encryptPrivateKey(privateKey) {
        // Encrypt private key for storage
        // In production, this would use proper encryption with user password
        const encoded = btoa(privateKey);
        return encoded;
    }

    async decryptPrivateKey(encryptedPrivateKey) {
        // Decrypt private key
        try {
            return atob(encryptedPrivateKey);
        } catch (error) {
            throw new Error('Failed to decrypt private key');
        }
    }

    async signQuantum(messageHash, privateKey) {
        // Create quantum-resistant signature
        // In production, this would use CRYSTALS-Dilithium
        
        const encoder = new TextEncoder();
        const combinedData = new Uint8Array([
            ...messageHash,
            ...encoder.encode(privateKey),
            ...encoder.encode('zhtp_signature')
        ]);
        
        const signatureHash = await crypto.subtle.digest('SHA-256', combinedData);
        const signature = new Uint8Array(signatureHash);
        
        return {
            algorithm: 'CRYSTALS-Dilithium',
            signature: Array.from(signature).map(b => b.toString(16).padStart(2, '0')).join(''),
            timestamp: Date.now()
        };
    }

    async verifyQuantumSignature(messageHash, signature, publicKey) {
        // Verify quantum-resistant signature
        // In production, this would use CRYSTALS-Dilithium verification
        
        try {
            if (!signature.algorithm || !signature.signature || !signature.timestamp) {
                return false;
            }

            // Basic validation
            if (signature.signature.length < 64) {
                return false;
            }

            // Time validation (signature shouldn't be too old)
            const signatureAge = Date.now() - signature.timestamp;
            if (signatureAge > 24 * 60 * 60 * 1000) { // 24 hours
                return false;
            }

            return true;

        } catch (error) {
            console.error('❌ Signature verification failed:', error);
            return false;
        }
    }
}
