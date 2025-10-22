/**
 * ZHTP URL Utilities for DHT Testing
 * Provides utilities for testing DHT routing and content resolution
 */

class ZhtpUrlUtils {
    constructor() {
        this.cache = new Map();
        this.debugMode = true;
    }

    /**
     * Parse ZHTP URLs and prepare for DHT resolution
     */
    parseUrl(zhtpUrl) {
        if (!zhtpUrl || typeof zhtpUrl !== 'string') {
            throw new Error('Invalid ZHTP URL provided');
        }

        // Handle both zhtp:// and regular URLs
        if (zhtpUrl.startsWith('zhtp://')) {
            return this.parseZhtpUrl(zhtpUrl);
        } else if (zhtpUrl.startsWith('http://localhost') || zhtpUrl.startsWith('http://127.0.0.1')) {
            return this.parseLocalUrl(zhtpUrl);
        } else {
            throw new Error(`Unsupported URL scheme: ${zhtpUrl}`);
        }
    }

    parseZhtpUrl(url) {
        const match = url.match(/^zhtp:\/\/([^\/]+)(\/.*)?$/);
        if (!match) {
            throw new Error(`Invalid ZHTP URL format: ${url}`);
        }

        const domain = match[1];
        const path = match[2] || '/';
        
        return {
            protocol: 'zhtp',
            domain,
            path,
            originalUrl: url,
            isDhtResolvable: true,
            contentKey: this.generateContentKey(domain, path)
        };
    }

    parseLocalUrl(url) {
        try {
            const urlObj = new URL(url);
            return {
                protocol: 'http',
                domain: urlObj.hostname,
                path: urlObj.pathname + urlObj.search,
                port: urlObj.port || '80',
                originalUrl: url,
                isDhtResolvable: false,
                isLocalDevelopment: true
            };
        } catch (error) {
            throw new Error(`Invalid local URL: ${url}`);
        }
    }

    /**
     * Generate consistent content keys for DHT storage
     */
    generateContentKey(domain, path) {
        const normalized = `${domain.toLowerCase()}${path}`;
        return this.hashString(normalized);
    }

    /**
     * Simple hash function for content keys (production would use BLAKE3)
     */
    async hashString(str) {
        const encoder = new TextEncoder();
        const data = encoder.encode(str);
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    }

    /**
     * Generate test DHT routing scenarios
     */
    generateTestScenarios() {
        return [
            {
                name: 'Local Wallet Test',
                url: 'zhtp://wallet.zhtp/dashboard',
                expectedNodes: 3,
                expectedContent: 'wallet-dashboard',
                description: 'Test DHT routing for local wallet application'
            },
            {
                name: 'DAO Governance Test',
                url: 'zhtp://dao.zhtp/proposals',
                expectedNodes: 5,
                expectedContent: 'dao-proposals',
                description: 'Test DHT routing for DAO governance content'
            },
            {
                name: 'Social Network Test',
                url: 'zhtp://social.zhtp/feed',
                expectedNodes: 8,
                expectedContent: 'social-feed',
                description: 'Test DHT routing for social network content'
            },
            {
                name: 'Marketplace Test',
                url: 'zhtp://marketplace.zhtp/browse',
                expectedNodes: 4,
                expectedContent: 'marketplace-listings',
                description: 'Test DHT routing for marketplace content'
            },
            {
                name: 'Deep Path Test',
                url: 'zhtp://app.zhtp/user/profile/settings',
                expectedNodes: 6,
                expectedContent: 'user-settings',
                description: 'Test DHT routing with deep path structures'
            }
        ];
    }

    /**
     * Simulate DHT node discovery for testing
     */
    async simulateDhtNodeDiscovery(contentKey, maxNodes = 5) {
        if (this.debugMode) {
            console.log(` Simulating DHT node discovery for key: ${contentKey.substring(0, 16)}...`);
        }

        // Simulate network delay
        await this.delay(100 + Math.random() * 200);

        // Generate mock nodes that would store this content
        const nodes = [];
        const nodeCount = Math.min(maxNodes, 3 + Math.floor(Math.random() * 3));

        for (let i = 0; i < nodeCount; i++) {
            const nodeId = await this.generateMockNodeId(contentKey, i);
            const distance = this.calculateXorDistance(contentKey, nodeId);
            
            nodes.push({
                nodeId,
                address: `192.168.1.${100 + i}:33442`,
                distance,
                reliability: 0.85 + Math.random() * 0.15,
                responseTime: 50 + Math.random() * 150,
                hasContent: Math.random() > 0.3, // 70% chance node has content
                lastSeen: Date.now() - Math.random() * 3600000, // Within last hour
                protocol: ['bluetooth', 'wifi', 'tcp'][Math.floor(Math.random() * 3)]
            });
        }

        // Sort by distance (closest first, Kademlia algorithm)
        nodes.sort((a, b) => a.distance - b.distance);

        if (this.debugMode) {
            console.log(` Discovered ${nodes.length} nodes for content`);
            nodes.forEach((node, idx) => {
                console.log(`  ${idx + 1}. Node ${node.nodeId.substring(0, 8)}... (${node.protocol}) - ${node.hasContent ? 'HAS' : 'NO'} content`);
            });
        }

        return nodes;
    }

    /**
     * Generate mock node ID for testing
     */
    async generateMockNodeId(contentKey, seed) {
        const combined = `${contentKey}_node_${seed}_${Date.now()}`;
        return await this.hashString(combined);
    }

    /**
     * Calculate XOR distance between two keys (Kademlia distance metric)
     */
    calculateXorDistance(key1, key2) {
        if (key1.length !== key2.length) {
            throw new Error('Keys must be same length for XOR distance calculation');
        }

        let distance = 0;
        for (let i = 0; i < Math.min(key1.length, 32); i += 2) {
            const byte1 = parseInt(key1.substr(i, 2), 16);
            const byte2 = parseInt(key2.substr(i, 2), 16);
            const xor = byte1 ^ byte2;
            
            if (xor !== 0) {
                // Find position of most significant bit
                distance = (i / 2) * 8 + (7 - Math.floor(Math.log2(xor)));
                break;
            }
        }

        return distance;
    }

    /**
     * Simulate DHT content routing test
     */
    async testDhtRouting(url, options = {}) {
        const {
            maxNodes = 5,
            timeout = 5000,
            requireContent = true,
            logResults = true
        } = options;

        const startTime = Date.now();
        const testId = Math.random().toString(36).substring(7);

        if (logResults) {
            console.log(`🧪 Starting DHT routing test [${testId}] for: ${url}`);
        }

        try {
            // Parse URL
            const parsed = this.parseUrl(url);
            
            if (!parsed.isDhtResolvable) {
                throw new Error('URL is not DHT resolvable');
            }

            // Discover nodes
            const nodes = await this.simulateDhtNodeDiscovery(parsed.contentKey, maxNodes);
            
            if (nodes.length === 0) {
                throw new Error('No DHT nodes discovered');
            }

            // Query nodes for content
            const queryResults = await this.queryNodesForContent(parsed.contentKey, nodes, timeout);
            
            // Analyze results
            const results = {
                testId,
                url,
                contentKey: parsed.contentKey,
                duration: Date.now() - startTime,
                nodesDiscovered: nodes.length,
                nodesQueried: queryResults.length,
                contentFound: queryResults.some(r => r.hasContent),
                successfulQueries: queryResults.filter(r => r.success).length,
                averageResponseTime: this.calculateAverageResponseTime(queryResults),
                routing: {
                    domain: parsed.domain,
                    path: parsed.path,
                    protocol: parsed.protocol
                },
                nodes: nodes.map(n => ({
                    id: n.nodeId.substring(0, 16),
                    protocol: n.protocol,
                    distance: n.distance,
                    hasContent: n.hasContent,
                    reliability: n.reliability
                })),
                queryResults
            };

            if (requireContent && !results.contentFound) {
                throw new Error('Content not found in DHT network');
            }

            if (logResults) {
                this.logTestResults(results);
            }

            return results;

        } catch (error) {
            const errorResult = {
                testId,
                url,
                error: error.message,
                duration: Date.now() - startTime,
                success: false
            };

            if (logResults) {
                console.error(`❌ DHT routing test [${testId}] failed:`, error.message);
            }

            return errorResult;
        }
    }

    /**
     * Query multiple nodes for content
     */
    async queryNodesForContent(contentKey, nodes, timeout) {
        const promises = nodes.map(node => 
            this.queryNodeForContent(contentKey, node, timeout)
        );

        const results = await Promise.allSettled(promises);
        
        return results.map((result, idx) => ({
            nodeId: nodes[idx].nodeId,
            nodeAddress: nodes[idx].address,
            success: result.status === 'fulfilled',
            ...((result.status === 'fulfilled') ? result.value : { error: result.reason.message })
        }));
    }

    /**
     * Query a single node for content
     */
    async queryNodeForContent(contentKey, node, timeout) {
        const startTime = Date.now();
        
        try {
            // Simulate network delay based on node response time
            await this.delay(node.responseTime);
            
            // Simulate timeout
            if (node.responseTime > timeout) {
                throw new Error('Query timeout');
            }

            // Simulate node failure (10% chance)
            if (Math.random() < 0.1) {
                throw new Error('Node unreachable');
            }

            const responseTime = Date.now() - startTime;
            
            return {
                hasContent: node.hasContent,
                responseTime,
                contentSize: node.hasContent ? 1024 + Math.floor(Math.random() * 10240) : 0,
                contentHash: node.hasContent ? contentKey : null,
                protocol: node.protocol,
                nodeReliability: node.reliability
            };

        } catch (error) {
            return {
                hasContent: false,
                responseTime: Date.now() - startTime,
                error: error.message
            };
        }
    }

    /**
     * Calculate average response time from query results
     */
    calculateAverageResponseTime(queryResults) {
        const successful = queryResults.filter(r => r.success && r.responseTime);
        if (successful.length === 0) return 0;
        
        const totalTime = successful.reduce((sum, r) => sum + r.responseTime, 0);
        return Math.round(totalTime / successful.length);
    }

    /**
     * Log detailed test results
     */
    logTestResults(results) {
        console.log(` DHT Routing Test [${results.testId}] Results:`);
        console.log(`   URL: ${results.url}`);
        console.log(`   Content Key: ${results.contentKey.substring(0, 32)}...`);
        console.log(`   Duration: ${results.duration}ms`);
        console.log(`   Nodes: ${results.nodesDiscovered} discovered, ${results.successfulQueries}/${results.nodesQueried} responsive`);
        console.log(`   Content: ${results.contentFound ? ' FOUND' : '❌ NOT FOUND'}`);
        console.log(`   Avg Response: ${results.averageResponseTime}ms`);
        
        if (results.nodes.length > 0) {
            console.log('   Node Details:');
            results.nodes.forEach((node, idx) => {
                const status = results.queryResults[idx]?.success ? '' : '❌';
                console.log(`     ${idx + 1}. ${node.id}... (${node.protocol}) ${status} dist:${node.distance}`);
            });
        }
    }

    /**
     * Run comprehensive DHT routing test suite
     */
    async runTestSuite() {
        console.log('🚀 Starting DHT Routing Test Suite...\n');
        
        const scenarios = this.generateTestScenarios();
        const results = [];
        
        for (const scenario of scenarios) {
            console.log(` Running: ${scenario.name}`);
            console.log(`   Description: ${scenario.description}`);
            
            const result = await this.testDhtRouting(scenario.url, {
                maxNodes: scenario.expectedNodes,
                logResults: false
            });
            
            result.scenarioName = scenario.name;
            result.expectedNodes = scenario.expectedNodes;
            result.expectedContent = scenario.expectedContent;
            
            results.push(result);
            
            // Brief pause between tests
            await this.delay(100);
        }

        this.logTestSuiteResults(results);
        return results;
    }

    /**
     * Log test suite results summary
     */
    logTestSuiteResults(results) {
        console.log('\n📊 DHT Routing Test Suite Results:');
        console.log('=' .repeat(50));
        
        const successful = results.filter(r => !r.error);
        const failed = results.filter(r => r.error);
        
        console.log(`Total Tests: ${results.length}`);
        console.log(`Successful: ${successful.length} (${Math.round(successful.length/results.length*100)}%)`);
        console.log(`Failed: ${failed.length}`);
        
        if (successful.length > 0) {
            const avgDuration = Math.round(successful.reduce((sum, r) => sum + r.duration, 0) / successful.length);
            const avgNodes = Math.round(successful.reduce((sum, r) => sum + r.nodesDiscovered, 0) / successful.length);
            const avgResponseTime = Math.round(successful.reduce((sum, r) => sum + r.averageResponseTime, 0) / successful.length);
            
            console.log(`\nPerformance Averages:`);
            console.log(`  Duration: ${avgDuration}ms`);
            console.log(`  Nodes Discovered: ${avgNodes}`);
            console.log(`  Response Time: ${avgResponseTime}ms`);
        }

        console.log('\nDetailed Results:');
        results.forEach((result, idx) => {
            const status = result.error ? '❌' : '';
            const duration = result.duration || 0;
            const nodes = result.nodesDiscovered || 0;
            
            console.log(`  ${idx + 1}. ${status} ${result.scenarioName} (${duration}ms, ${nodes} nodes)`);
            if (result.error) {
                console.log(`      Error: ${result.error}`);
            }
        });
    }

    /**
     * Utility: delay function for simulating network latency
     */
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Enable/disable debug mode
     */
    setDebugMode(enabled) {
        this.debugMode = enabled;
        console.log(`DHT Debug mode: ${enabled ? 'ON' : 'OFF'}`);
    }

    /**
     * Clear internal cache
     */
    clearCache() {
        this.cache.clear();
        console.log('DHT URL utils cache cleared');
    }

    /**
     * Get cache statistics
     */
    getCacheStats() {
        return {
            size: this.cache.size,
            keys: Array.from(this.cache.keys())
        };
    }
}

// Export for use in browser
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ZhtpUrlUtils;
} else if (typeof window !== 'undefined') {
    window.ZhtpUrlUtils = ZhtpUrlUtils;
}

export default ZhtpUrlUtils;
