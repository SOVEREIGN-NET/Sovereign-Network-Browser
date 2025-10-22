/**
 * DHT Testing Dashboard for Web4 Browser
 * Provides a comprehensive interface for testing DHT routing functionality
 */

import ZhtpUrlUtils from './zhtp-url-utils.js';

class DhtTestingDashboard {
    constructor(browser) {
        this.browser = browser;
        this.urlUtils = new ZhtpUrlUtils();
        this.testResults = [];
        this.isRunning = false;
    }

    /**
     * Initialize DHT testing dashboard
     */
    async initialize() {
        console.log('🧪 Initializing DHT Testing Dashboard...');
        
        // Enable debug mode for detailed logging
        this.urlUtils.setDebugMode(true);
        
        // Add DHT testing commands to browser
        this.addTestingCommands();
        
        console.log(' DHT Testing Dashboard ready');
    }

    /**
     * Add testing commands to browser console
     */
    addTestingCommands() {
        if (typeof window !== 'undefined') {
            // Make testing functions available globally
            window.dhtTest = {
                single: (url, options) => this.testSingleUrl(url, options),
                suite: () => this.runFullTestSuite(),
                routing: (url) => this.testRouting(url),
                discovery: (contentKey, maxNodes) => this.testNodeDiscovery(contentKey, maxNodes),
                performance: () => this.runPerformanceTest(),
                results: () => this.getTestResults(),
                clear: () => this.clearResults(),
                help: () => this.showHelp()
            };
            
            console.log('DHT Testing commands added to window.dhtTest');
        }
    }

    /**
     * Test DHT routing for a single URL
     */
    async testSingleUrl(url, options = {}) {
        console.log(`🔬 Testing DHT routing for: ${url}`);
        
        try {
            const result = await this.urlUtils.testDhtRouting(url, {
                maxNodes: options.maxNodes || 5,
                timeout: options.timeout || 5000,
                requireContent: options.requireContent !== false,
                logResults: true
            });

            this.testResults.push(result);
            
            // Show browser notification if available
            if (this.browser && this.browser.showNotification) {
                const status = result.error ? 'error' : 'success';
                const message = result.error ? 
                    `DHT test failed: ${result.error}` : 
                    `DHT test completed: ${result.nodesDiscovered} nodes, content ${result.contentFound ? 'found' : 'not found'}`;
                
                this.browser.showNotification(message, status);
            }

            return result;

        } catch (error) {
            console.error('DHT test error:', error);
            if (this.browser && this.browser.showNotification) {
                this.browser.showNotification(`DHT test error: ${error.message}`, 'error');
            }
            throw error;
        }
    }

    /**
     * Run comprehensive DHT test suite
     */
    async runFullTestSuite() {
        if (this.isRunning) {
            console.log('⚠️ Test suite already running...');
            return;
        }

        this.isRunning = true;
        
        try {
            console.log('🚀 Starting comprehensive DHT test suite...');
            
            if (this.browser && this.browser.showNotification) {
                this.browser.showNotification('Starting DHT test suite...', 'info');
            }

            const results = await this.urlUtils.runTestSuite();
            this.testResults.push(...results);

            const successful = results.filter(r => !r.error).length;
            const total = results.length;
            
            console.log(` DHT test suite completed: ${successful}/${total} tests passed`);
            
            if (this.browser && this.browser.showNotification) {
                this.browser.showNotification(
                    `DHT test suite completed: ${successful}/${total} tests passed`, 
                    successful === total ? 'success' : 'warning'
                );
            }

            return results;

        } finally {
            this.isRunning = false;
        }
    }

    /**
     * Test DHT routing specifically
     */
    async testRouting(url) {
        console.log(`🗺️ Testing DHT routing for: ${url}`);
        
        const parsed = this.urlUtils.parseUrl(url);
        console.log('Parsed URL:', parsed);
        
        // Test node discovery
        const nodes = await this.urlUtils.simulateDhtNodeDiscovery(parsed.contentKey, 8);
        console.log('Discovered nodes:', nodes);
        
        // Test routing algorithm
        const closest = nodes.slice(0, 3);
        console.log('Closest nodes for routing:', closest);
        
        return {
            url,
            parsed,
            allNodes: nodes,
            closestNodes: closest,
            routingEfficiency: this.calculateRoutingEfficiency(nodes)
        };
    }

    /**
     * Test node discovery functionality
     */
    async testNodeDiscovery(contentKey, maxNodes = 10) {
        console.log(` Testing node discovery for content key: ${contentKey?.substring(0, 16) || 'auto-generated'}...`);
        
        if (!contentKey) {
            contentKey = await this.urlUtils.hashString(`test_content_${Date.now()}`);
        }

        const discovery = await this.urlUtils.simulateDhtNodeDiscovery(contentKey, maxNodes);
        
        console.log(`Discovery results: ${discovery.length} nodes found`);
        discovery.forEach((node, idx) => {
            console.log(`  ${idx + 1}. ${node.nodeId.substring(0, 8)}... (${node.protocol}) - distance: ${node.distance}`);
        });

        return discovery;
    }

    /**
     * Run performance test suite
     */
    async runPerformanceTest() {
        console.log('⚡ Running DHT performance tests...');

        const tests = [
            { name: 'Small Content', size: 'small', nodes: 3 },
            { name: 'Medium Content', size: 'medium', nodes: 5 },
            { name: 'Large Content', size: 'large', nodes: 8 },
            { name: 'High Replication', size: 'medium', nodes: 15 },
        ];

        const results = [];
        
        for (const test of tests) {
            console.log(`Testing: ${test.name} (${test.nodes} nodes)`);
            
            const url = `zhtp://test-${test.size}.zhtp/performance`;
            const startTime = Date.now();
            
            const result = await this.testSingleUrl(url, {
                maxNodes: test.nodes,
                logResults: false
            });
            
            result.testName = test.name;
            result.testConfig = test;
            results.push(result);
        }

        this.logPerformanceResults(results);
        return results;
    }

    /**
     * Calculate routing efficiency
     */
    calculateRoutingEfficiency(nodes) {
        if (!nodes || nodes.length === 0) return 0;
        
        // Calculate based on distance distribution and response times
        const avgDistance = nodes.reduce((sum, n) => sum + n.distance, 0) / nodes.length;
        const avgResponseTime = nodes.reduce((sum, n) => sum + n.responseTime, 0) / nodes.length;
        const contentAvailability = nodes.filter(n => n.hasContent).length / nodes.length;
        
        // Efficiency score (0-100)
        const distanceScore = Math.max(0, 100 - avgDistance * 2);
        const speedScore = Math.max(0, 100 - avgResponseTime / 10);
        const availabilityScore = contentAvailability * 100;
        
        return Math.round((distanceScore + speedScore + availabilityScore) / 3);
    }

    /**
     * Log performance test results
     */
    logPerformanceResults(results) {
        console.log('\n⚡ DHT Performance Test Results:');
        console.log('=' .repeat(40));
        
        results.forEach(result => {
            console.log(`${result.testName}:`);
            console.log(`  Duration: ${result.duration}ms`);
            console.log(`  Nodes: ${result.nodesDiscovered}`);
            console.log(`  Success Rate: ${Math.round(result.successfulQueries / result.nodesQueried * 100)}%`);
            console.log(`  Avg Response: ${result.averageResponseTime}ms`);
            console.log('');
        });
    }

    /**
     * Show browser-based DHT testing interface
     */
    showTestingInterface() {
        const interfaceHtml = `
            <div id="dht-testing-interface" style="
                position: fixed; 
                top: 20px; 
                right: 20px; 
                width: 400px; 
                background: rgba(0, 0, 0, 0.9); 
                border: 1px solid #00d4ff; 
                border-radius: 10px; 
                padding: 20px; 
                color: white; 
                font-family: monospace;
                z-index: 10000;
                max-height: 80vh;
                overflow-y: auto;
            ">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                    <h3 style="margin: 0; color: #00d4ff;">DHT Testing Dashboard</h3>
                    <button onclick="document.getElementById('dht-testing-interface').remove()" 
                            style="background: #ff4444; border: none; color: white; padding: 5px 10px; border-radius: 5px; cursor: pointer;">×</button>
                </div>
                
                <div style="margin-bottom: 15px;">
                    <label style="display: block; margin-bottom: 5px;">Test URL:</label>
                    <input type="text" id="dht-test-url" placeholder="zhtp://wallet.zhtp/dashboard" 
                           style="width: 100%; padding: 8px; background: #333; border: 1px solid #666; color: white; border-radius: 5px;">
                </div>
                
                <div style="margin-bottom: 15px;">
                    <button onclick="window.dhtDashboard.testUrlFromInterface()" 
                            style="background: #00d4ff; border: none; color: white; padding: 10px 20px; border-radius: 5px; cursor: pointer; margin-right: 10px;">
                        Test Single URL
                    </button>
                    <button onclick="window.dhtDashboard.runFullTestSuite()" 
                            style="background: #ff9900; border: none; color: white; padding: 10px 20px; border-radius: 5px; cursor: pointer;">
                        Run Full Suite
                    </button>
                </div>
                
                <div style="margin-bottom: 15px;">
                    <button onclick="window.dhtDashboard.runPerformanceTest()" 
                            style="background: #9900ff; border: none; color: white; padding: 8px 16px; border-radius: 5px; cursor: pointer; margin-right: 10px;">
                        Performance Test
                    </button>
                    <button onclick="window.dhtDashboard.clearResults()" 
                            style="background: #666; border: none; color: white; padding: 8px 16px; border-radius: 5px; cursor: pointer;">
                        Clear Results
                    </button>
                </div>
                
                <div id="dht-test-results" style="
                    background: #1a1a1a; 
                    border: 1px solid #333; 
                    border-radius: 5px; 
                    padding: 10px; 
                    min-height: 100px; 
                    font-size: 12px;
                    white-space: pre-wrap;
                    overflow-y: auto;
                ">
                    Ready for DHT testing...
                    
                    Quick commands:
                    - window.dhtTest.single('zhtp://wallet.zhtp/')
                    - window.dhtTest.suite()
                    - window.dhtTest.help()
                </div>
            </div>
        `;
        
        // Remove existing interface
        const existing = document.getElementById('dht-testing-interface');
        if (existing) {
            existing.remove();
        }
        
        // Add new interface
        document.body.insertAdjacentHTML('beforeend', interfaceHtml);
        
        // Store reference for interface methods
        window.dhtDashboard = this;
    }

    /**
     * Test URL from browser interface
     */
    async testUrlFromInterface() {
        const urlInput = document.getElementById('dht-test-url');
        const resultsDiv = document.getElementById('dht-test-results');
        
        if (!urlInput || !urlInput.value.trim()) {
            this.updateInterfaceResults('❌ Please enter a valid ZHTP URL');
            return;
        }
        
        const url = urlInput.value.trim();
        this.updateInterfaceResults(`🔬 Testing DHT routing for: ${url}\n`);
        
        try {
            const result = await this.testSingleUrl(url, { logResults: false });
            
            const output = ` Test completed for: ${url}
Duration: ${result.duration}ms
Nodes discovered: ${result.nodesDiscovered}
Content found: ${result.contentFound ? 'YES' : 'NO'}
Success rate: ${Math.round(result.successfulQueries / result.nodesQueried * 100)}%
Avg response time: ${result.averageResponseTime}ms

Nodes:
${result.nodes.map((n, i) => `  ${i+1}. ${n.id}... (${n.protocol}) ${n.hasContent ? '' : '❌'}`).join('\n')}
`;
            
            this.updateInterfaceResults(output);
            
        } catch (error) {
            this.updateInterfaceResults(`❌ Test failed: ${error.message}`);
        }
    }

    /**
     * Update interface results display
     */
    updateInterfaceResults(text) {
        const resultsDiv = document.getElementById('dht-test-results');
        if (resultsDiv) {
            resultsDiv.textContent = text;
            resultsDiv.scrollTop = resultsDiv.scrollHeight;
        }
    }

    /**
     * Get all test results
     */
    getTestResults() {
        console.log(`📊 Total test results: ${this.testResults.length}`);
        return this.testResults;
    }

    /**
     * Clear all test results
     */
    clearResults() {
        this.testResults = [];
        console.log('🗑️ DHT test results cleared');
        
        // Clear interface results if visible
        const resultsDiv = document.getElementById('dht-test-results');
        if (resultsDiv) {
            resultsDiv.textContent = 'Results cleared. Ready for new tests...';
        }
    }

    /**
     * Show help information
     */
    showHelp() {
        const help = `
🧪 DHT Testing Dashboard Help

Available Commands:
  window.dhtTest.single(url, options)  - Test single ZHTP URL
  window.dhtTest.suite()               - Run full test suite
  window.dhtTest.routing(url)          - Test routing algorithm
  window.dhtTest.discovery(key, max)   - Test node discovery
  window.dhtTest.performance()         - Run performance tests
  window.dhtTest.results()             - Show all results
  window.dhtTest.clear()               - Clear results
  window.dhtTest.help()                - Show this help

Example URLs to test:
  - zhtp://wallet.zhtp/dashboard
  - zhtp://dao.zhtp/proposals
  - zhtp://social.zhtp/feed
  - zhtp://marketplace.zhtp/browse

Options for single test:
  {
    maxNodes: 5,        // Maximum nodes to discover
    timeout: 5000,      // Query timeout in ms
    requireContent: true, // Require content to be found
    logResults: true    // Log detailed results
  }

Browser Interface:
  Use window.dhtDashboard.showTestingInterface() to show GUI
        `;
        
        console.log(help);
        return help;
    }
}

// Export for use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DhtTestingDashboard;
} else if (typeof window !== 'undefined') {
    window.DhtTestingDashboard = DhtTestingDashboard;
}

export default DhtTestingDashboard;