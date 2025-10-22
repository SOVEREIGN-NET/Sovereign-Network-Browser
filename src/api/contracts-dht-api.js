/**
 * Smart Contracts DHT API
 * Provides direct DHT packet-based smart contract operations
 * 
 * This API communicates directly with the ZHTP node's DHT layer for:
 * - Contract deployment through DHT packets
 * - Contract querying via DHT network
 * - Contract execution through distributed messaging
 * - Contract discovery using DHT routing
 */

class ContractsDhtApi {
    constructor(zhtpNodeUrl = 'http://localhost:9333') {
        this.zhtpNodeUrl = zhtpNodeUrl;
        this.nodeId = this.generateNodeId();
    }

    /**
     * Generate a temporary node ID for browser DHT operations
     */
    generateNodeId() {
        const crypto = require('crypto');
        return crypto.randomBytes(20).toString('hex');
    }

    /**
     * Send DHT packet through ZHTP node
     */
    async sendDhtPacket(packet) {
        try {
            const response = await fetch(`${this.zhtpNodeUrl}/api/dht/send`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(packet)
            });

            if (!response.ok) {
                throw new Error(`DHT packet send failed: ${response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            console.error('DHT packet send error:', error);
            throw error;
        }
    }

    /**
     * Deploy smart contract via DHT
     */
    async deployContract(contractId, bytecode, metadata, options = {}) {
        console.log(` Deploying contract ${contractId} via DHT...`);

        const contractData = {
            contract_id: contractId,
            operation: 'Deploy',
            bytecode: Array.from(bytecode), // Convert to array for JSON serialization
            metadata: {
                name: metadata.name || 'Unnamed Contract',
                version: metadata.version || '1.0.0',
                author: metadata.author || null,
                description: metadata.description || null,
                abi: metadata.abi ? Array.from(metadata.abi) : null,
                source_hash: metadata.source_hash || null,
                deployed_at: Math.floor(Date.now() / 1000),
                owner: this.nodeId,
                permissions: metadata.permissions || {
                    execute_policy: 'Public',
                    query_policy: 'Public',
                    upgrade_policy: 'OwnerOnly'
                }
            },
            zk_proofs: [] // Add zero-knowledge proofs if needed
        };

        const packet = {
            message_id: this.generateMessageId(),
            message_type: 'ContractDeploy',
            sender_id: this.nodeId,
            target_id: options.target_node || null,
            contract_data: contractData,
            timestamp: Math.floor(Date.now() / 1000)
        };

        try {
            const result = await this.sendDhtPacket(packet);
            console.log(` Contract ${contractId} deployment initiated via DHT`);
            return result;
        } catch (error) {
            console.error(`❌ Contract deployment failed:`, error);
            throw error;
        }
    }

    /**
     * Query smart contract state via DHT
     */
    async queryContract(contractId, functionName = null, args = null, options = {}) {
        console.log(` Querying contract ${contractId} via DHT...`);

        const contractData = {
            contract_id: contractId,
            operation: 'Query',
            function_name: functionName,
            arguments: args ? Array.from(new TextEncoder().encode(JSON.stringify(args))) : null,
            gas_limit: options.gas_limit || 1000000,
            zk_proofs: options.zk_proofs || []
        };

        const packet = {
            message_id: this.generateMessageId(),
            message_type: 'ContractQuery',
            sender_id: this.nodeId,
            target_id: options.target_node || null,
            contract_data: contractData,
            timestamp: Math.floor(Date.now() / 1000)
        };

        try {
            const result = await this.sendDhtPacket(packet);
            console.log(` Contract query sent via DHT`);
            return result;
        } catch (error) {
            console.error(`❌ Contract query failed:`, error);
            throw error;
        }
    }

    /**
     * Execute smart contract function via DHT
     */
    async executeContract(contractId, functionName, args = [], options = {}) {
        console.log(`⚡ Executing contract ${contractId}.${functionName} via DHT...`);

        const contractData = {
            contract_id: contractId,
            operation: 'Execute',
            function_name: functionName,
            arguments: Array.from(new TextEncoder().encode(JSON.stringify(args))),
            gas_limit: options.gas_limit || 10000000,
            zk_proofs: options.zk_proofs || []
        };

        const packet = {
            message_id: this.generateMessageId(),
            message_type: 'ContractExecute',
            sender_id: this.nodeId,
            target_id: options.target_node || null,
            contract_data: contractData,
            timestamp: Math.floor(Date.now() / 1000)
        };

        try {
            const result = await this.sendDhtPacket(packet);
            console.log(` Contract execution initiated via DHT`);
            return result;
        } catch (error) {
            console.error(`❌ Contract execution failed:`, error);
            throw error;
        }
    }

    /**
     * Find smart contract in DHT network
     */
    async findContract(contractId, options = {}) {
        console.log(`🔎 Finding contract ${contractId} via DHT...`);

        const contractData = {
            contract_id: contractId,
            operation: 'Find',
            zk_proofs: options.zk_proofs || []
        };

        const packet = {
            message_id: this.generateMessageId(),
            message_type: 'ContractFind',
            sender_id: this.nodeId,
            target_id: options.target_node || null,
            contract_data: contractData,
            timestamp: Math.floor(Date.now() / 1000)
        };

        try {
            const result = await this.sendDhtPacket(packet);
            console.log(` Contract search initiated via DHT`);
            return result;
        } catch (error) {
            console.error(`❌ Contract search failed:`, error);
            throw error;
        }
    }

    /**
     * Listen for DHT contract responses
     */
    async listenForContractResponses(messageId, timeout = 30000) {
        return new Promise((resolve, reject) => {
            const timeoutId = setTimeout(() => {
                reject(new Error('DHT response timeout'));
            }, timeout);

            // Poll for responses (in a real implementation, this would use WebSocket)
            const pollInterval = setInterval(async () => {
                try {
                    const response = await fetch(`${this.zhtpNodeUrl}/api/dht/response/${messageId}`);
                    if (response.ok) {
                        const data = await response.json();
                        if (data.received) {
                            clearTimeout(timeoutId);
                            clearInterval(pollInterval);
                            resolve(data.response);
                        }
                    }
                } catch (error) {
                    // Continue polling on error
                }
            }, 1000);
        });
    }

    /**
     * Deploy and execute contract in one operation
     */
    async deployAndExecute(contractId, bytecode, metadata, functionName, args = [], options = {}) {
        console.log(`🚀 Deploy and execute ${contractId}.${functionName} via DHT...`);

        // First deploy the contract
        await this.deployContract(contractId, bytecode, metadata, options);

        // Wait a moment for deployment to propagate
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Then execute the function
        return await this.executeContract(contractId, functionName, args, options);
    }

    /**
     * Get contract info from DHT
     */
    async getContractInfo(contractId, options = {}) {
        console.log(` Getting contract info for ${contractId} via DHT...`);

        try {
            const result = await this.findContract(contractId, options);
            
            if (result && result.contract_data && result.contract_data.metadata) {
                return {
                    id: contractId,
                    ...result.contract_data.metadata,
                    found_via_dht: true,
                    response_nodes: result.nodes || []
                };
            }
            
            return null;
        } catch (error) {
            console.error(`❌ Failed to get contract info:`, error);
            return null;
        }
    }

    /**
     * List available contracts in DHT network
     */
    async listContracts(options = {}) {
        console.log(` Listing contracts in DHT network...`);

        try {
            const response = await fetch(`${this.zhtpNodeUrl}/api/dht/contracts/list`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            if (!response.ok) {
                throw new Error(`Contract list failed: ${response.statusText}`);
            }

            const contracts = await response.json();
            console.log(` Found ${contracts.length} contracts in DHT`);
            return contracts;
        } catch (error) {
            console.error(`❌ Contract listing failed:`, error);
            return [];
        }
    }

    /**
     * Generate unique message ID
     */
    generateMessageId() {
        const crypto = require('crypto');
        return crypto.randomBytes(16).toString('hex');
    }

    /**
     * Create a simple test contract
     */
    createTestContract() {
        // Simple WASM bytecode for a counter contract (placeholder)
        const testWasm = new Uint8Array([
            0x00, 0x61, 0x73, 0x6d, 0x01, 0x00, 0x00, 0x00, // WASM header
            0x01, 0x07, 0x01, 0x60, 0x02, 0x7f, 0x7f, 0x01, // Function signature
            0x7f, 0x03, 0x02, 0x01, 0x00, 0x0a, 0x09, 0x01, // Function body
            0x07, 0x00, 0x20, 0x00, 0x20, 0x01, 0x6a, 0x0b   // Add operation
        ]);

        const metadata = {
            name: 'Test Counter Contract',
            version: '1.0.0',
            author: 'ZHTP Browser',
            description: 'Simple counter contract for testing DHT deployment',
            permissions: {
                execute_policy: 'Public',
                query_policy: 'Public',
                upgrade_policy: 'OwnerOnly'
            }
        };

        return {
            bytecode: testWasm,
            metadata: metadata
        };
    }
}

// Export as ES module default export
export default ContractsDhtApi;

// Also make available globally for console access
if (typeof window !== 'undefined') {
    window.ContractsDhtApi = ContractsDhtApi;
}