/**
 * Ren Cloud Client - Hardwired AI Integration
 * 
 * Like Gemini in Chrome:
 * - No local model downloads
 * - No fallback chains (Ren only)
 * - Browser sends signed requests to Ren cloud service
 * - Inference happens server-side
 */

// Configuration - Production endpoint
const REN_CLOUD_URL = 'https://ren.sovereign.network/api';
// Development endpoint (local)
const REN_LOCAL_URL = 'http://localhost:8765';

/**
 * Ren Cloud Client
 * Handles all communication with Ren AI service
 */
class RenClient {
    constructor(options = {}) {
        this.zkDidManager = options.zkDidManager || null;
        this.endpoint = options.endpoint || this._detectEndpoint();
        this.sessionId = null;
        this._available = null;
        this._eventListeners = new Map();
        
        console.log('[Ren] Client initialized with endpoint:', this.endpoint);
    }

    /**
     * Detect which endpoint to use - local dev or cloud
     */
    _detectEndpoint() {
        // In development, try local first
        if (window.location.hostname === 'localhost' || 
            window.location.protocol === 'file:') {
            return REN_LOCAL_URL;
        }
        return REN_CLOUD_URL;
    }

    /**
     * Set the ZK-DID manager for request signing
     */
    setZkDidManager(manager) {
        this.zkDidManager = manager;
        console.log('[Ren] ZK-DID manager connected');
    }

    /**
     * Check if Ren service is available
     */
    async isAvailable() {
        if (this._available !== null) {
            return this._available;
        }

        try {
            const controller = new AbortController();
            const timeout = setTimeout(() => controller.abort(), 5000);
            
            const response = await fetch(`${this.endpoint}/health`, {
                signal: controller.signal
            });
            
            clearTimeout(timeout);
            this._available = response.ok;
            return this._available;
        } catch (error) {
            console.warn('[Ren] Service unavailable:', error.message);
            this._available = false;
            return false;
        }
    }

    /**
     * Sign a request payload with user's DID
     */
    async _signRequest(payload) {
        if (!this.zkDidManager || !this.zkDidManager.currentIdentity) {
            // Return unsigned request if no identity
            return {
                ...payload,
                timestamp: Date.now()
            };
        }

        const identity = this.zkDidManager.currentIdentity;
        const signedPayload = {
            ...payload,
            did: identity.did,
            timestamp: Date.now()
        };

        // Sign the payload
        try {
            const signature = await this.zkDidManager.signData(
                JSON.stringify(signedPayload)
            );
            signedPayload.signature = signature;
        } catch (error) {
            console.warn('[Ren] Could not sign request:', error.message);
        }

        return signedPayload;
    }

    /**
     * Send a chat message to Ren
     * @param {string} message - User message
     * @param {Object} options - Optional settings
     * @returns {Promise<Object>} Response with content and metadata
     */
    async chat(message, options = {}) {
        const payload = await this._signRequest({
            prompt: message,
            session_id: options.sessionId || this.sessionId
        });

        try {
            const response = await fetch(`${this.endpoint}/chat`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                const error = await response.text();
                throw new Error(`HTTP ${response.status}: ${error}`);
            }

            const data = await response.json();
            
            // Update session ID for conversation continuity
            if (data.session_id) {
                this.sessionId = data.session_id;
            }

            return {
                success: true,
                content: data.response,
                tokensUsed: data.tokens_used,
                sessionId: data.session_id
            };

        } catch (error) {
            console.error('[Ren] Chat error:', error);
            return {
                success: false,
                content: '',
                error: error.message
            };
        }
    }

    /**
     * Stream chat response from Ren (word by word)
     * @param {string} message - User message
     * @param {Function} onToken - Callback for each token
     * @param {Object} options - Optional settings
     */
    async chatStream(message, onToken, options = {}) {
        const payload = await this._signRequest({
            prompt: message,
            session_id: options.sessionId || this.sessionId
        });

        try {
            const response = await fetch(`${this.endpoint}/chat/stream`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let buffer = '';

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                buffer += decoder.decode(value, { stream: true });
                const lines = buffer.split('\n');
                buffer = lines.pop() || '';

                for (const line of lines) {
                    if (line.startsWith('data: ')) {
                        try {
                            const data = JSON.parse(line.slice(6));
                            if (data.chunk) {
                                onToken(data.chunk);
                            }
                            if (data.session_id) {
                                this.sessionId = data.session_id;
                            }
                            if (data.done) {
                                return { success: true };
                            }
                        } catch (e) {
                            // Skip malformed JSON
                        }
                    }
                }
            }

            return { success: true };

        } catch (error) {
            console.error('[Ren] Stream error:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Ask Ren to analyze code
     * @param {string} code - Source code
     * @param {string} task - What to do (refactor, explain, find bugs)
     * @param {string} context - Additional context
     */
    async analyzeCode(code, task, context = '') {
        const prompt = `Task: ${task}\n\nCode:\n\`\`\`\n${code}\n\`\`\`${context ? `\n\nContext: ${context}` : ''}`;
        return this.chat(prompt);
    }

    /**
     * Start a new conversation session
     */
    newSession() {
        this.sessionId = null;
        console.log('[Ren] Started new session');
    }

    /**
     * Add event listener
     */
    on(event, callback) {
        if (!this._eventListeners.has(event)) {
            this._eventListeners.set(event, []);
        }
        this._eventListeners.get(event).push(callback);
    }

    /**
     * Emit event
     */
    _emit(event, data) {
        const listeners = this._eventListeners.get(event) || [];
        listeners.forEach(callback => callback(data));
    }
}

/**
 * Ren Chat Panel - UI Component
 * Renders a chat interface for interacting with Ren
 */
class RenChatPanel {
    constructor(options = {}) {
        this.client = options.client || new RenClient();
        this.container = options.container || null;
        this.messages = [];
        this.isStreaming = false;
    }

    /**
     * Render the chat panel into a container
     */
    render(container) {
        this.container = container || this.container;
        if (!this.container) {
            console.error('[RenPanel] No container provided');
            return;
        }

        this.container.innerHTML = `
            <div class="ren-panel">
                <div class="ren-header">
                    <span class="ren-logo">Ren</span>
                    <span class="ren-status" id="renStatus">Connecting...</span>
                    <button class="ren-new-chat" onclick="window.renPanel.newChat()">New Chat</button>
                </div>
                <div class="ren-messages" id="renMessages">
                    <div class="ren-welcome">
                        <h3>Hello! I'm Ren</h3>
                        <p>Your AI assistant for the Sovereign Network. Ask me anything!</p>
                    </div>
                </div>
                <div class="ren-input-area">
                    <textarea 
                        id="renInput" 
                        placeholder="Message Ren..." 
                        rows="1"
                        onkeydown="window.renPanel.handleKeyDown(event)"
                    ></textarea>
                    <button id="renSend" onclick="window.renPanel.sendMessage()">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
                        </svg>
                    </button>
                </div>
            </div>
        `;

        // Add styles
        this._injectStyles();
        
        // Check service availability
        this._checkStatus();
    }

    /**
     * Check Ren service status
     */
    async _checkStatus() {
        const statusEl = document.getElementById('renStatus');
        const available = await this.client.isAvailable();
        
        if (available) {
            statusEl.textContent = 'Online';
            statusEl.className = 'ren-status online';
        } else {
            statusEl.textContent = 'Offline';
            statusEl.className = 'ren-status offline';
        }
    }

    /**
     * Handle keyboard input
     */
    handleKeyDown(event) {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            this.sendMessage();
        }
    }

    /**
     * Send message to Ren
     */
    async sendMessage() {
        const input = document.getElementById('renInput');
        const message = input.value.trim();
        
        if (!message || this.isStreaming) return;
        
        input.value = '';
        this._autoResize(input);
        
        // Add user message to UI
        this._addMessage('user', message);
        
        // Add placeholder for Ren's response
        const responseId = this._addMessage('assistant', '');
        const responseEl = document.getElementById(responseId);
        
        this.isStreaming = true;
        
        // Stream response
        await this.client.chatStream(message, (token) => {
            responseEl.querySelector('.ren-message-content').textContent += token;
            this._scrollToBottom();
        });
        
        this.isStreaming = false;
    }

    /**
     * Add message to the chat
     */
    _addMessage(role, content) {
        const messagesEl = document.getElementById('renMessages');
        const welcome = messagesEl.querySelector('.ren-welcome');
        if (welcome) welcome.remove();
        
        const id = `msg-${Date.now()}`;
        const messageHtml = `
            <div class="ren-message ${role}" id="${id}">
                <div class="ren-message-role">${role === 'user' ? 'You' : 'Ren'}</div>
                <div class="ren-message-content">${this._escapeHtml(content)}</div>
            </div>
        `;
        
        messagesEl.insertAdjacentHTML('beforeend', messageHtml);
        this._scrollToBottom();
        
        return id;
    }

    /**
     * Start new chat
     */
    newChat() {
        this.client.newSession();
        const messagesEl = document.getElementById('renMessages');
        messagesEl.innerHTML = `
            <div class="ren-welcome">
                <h3>Hello! I'm Ren</h3>
                <p>Your AI assistant for the Sovereign Network. Ask me anything!</p>
            </div>
        `;
    }

    /**
     * Scroll chat to bottom
     */
    _scrollToBottom() {
        const messagesEl = document.getElementById('renMessages');
        messagesEl.scrollTop = messagesEl.scrollHeight;
    }

    /**
     * Auto-resize textarea
     */
    _autoResize(textarea) {
        textarea.style.height = 'auto';
        textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
    }

    /**
     * Escape HTML to prevent XSS
     */
    _escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    /**
     * Inject CSS styles
     */
    _injectStyles() {
        if (document.getElementById('ren-styles')) return;
        
        const styles = document.createElement('style');
        styles.id = 'ren-styles';
        styles.textContent = `
            .ren-panel {
                display: flex;
                flex-direction: column;
                height: 100%;
                background: #1a1a2e;
                color: #e0e0e0;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            }
            
            .ren-header {
                display: flex;
                align-items: center;
                padding: 12px 16px;
                background: #16213e;
                border-bottom: 1px solid #0f3460;
            }
            
            .ren-logo {
                font-size: 18px;
                font-weight: 700;
                background: linear-gradient(135deg, #00d4ff, #7b2cbf);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                margin-right: 12px;
            }
            
            .ren-status {
                font-size: 12px;
                padding: 4px 8px;
                border-radius: 4px;
                background: #333;
            }
            
            .ren-status.online {
                background: #1b4332;
                color: #95d5b2;
            }
            
            .ren-status.offline {
                background: #5c1a1a;
                color: #f8d7da;
            }
            
            .ren-new-chat {
                margin-left: auto;
                padding: 6px 12px;
                background: transparent;
                border: 1px solid #0f3460;
                color: #00d4ff;
                border-radius: 4px;
                cursor: pointer;
                font-size: 12px;
            }
            
            .ren-new-chat:hover {
                background: #0f3460;
            }
            
            .ren-messages {
                flex: 1;
                overflow-y: auto;
                padding: 16px;
            }
            
            .ren-welcome {
                text-align: center;
                padding: 40px 20px;
                color: #888;
            }
            
            .ren-welcome h3 {
                color: #00d4ff;
                margin-bottom: 8px;
            }
            
            .ren-message {
                margin-bottom: 16px;
                max-width: 85%;
            }
            
            .ren-message.user {
                margin-left: auto;
            }
            
            .ren-message-role {
                font-size: 11px;
                color: #888;
                margin-bottom: 4px;
            }
            
            .ren-message-content {
                padding: 12px 16px;
                border-radius: 12px;
                line-height: 1.5;
                white-space: pre-wrap;
            }
            
            .ren-message.user .ren-message-content {
                background: #0f3460;
            }
            
            .ren-message.assistant .ren-message-content {
                background: #16213e;
                border: 1px solid #0f3460;
            }
            
            .ren-input-area {
                display: flex;
                padding: 12px 16px;
                background: #16213e;
                border-top: 1px solid #0f3460;
                gap: 8px;
            }
            
            .ren-input-area textarea {
                flex: 1;
                padding: 10px 14px;
                background: #1a1a2e;
                border: 1px solid #0f3460;
                border-radius: 8px;
                color: #e0e0e0;
                font-size: 14px;
                resize: none;
                font-family: inherit;
            }
            
            .ren-input-area textarea:focus {
                outline: none;
                border-color: #00d4ff;
            }
            
            .ren-input-area button {
                padding: 10px 14px;
                background: #00d4ff;
                border: none;
                border-radius: 8px;
                color: #000;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            
            .ren-input-area button:hover {
                background: #00b8e6;
            }
        `;
        
        document.head.appendChild(styles);
    }
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { RenClient, RenChatPanel };
}

// Make available globally for browser
window.RenClient = RenClient;
window.RenChatPanel = RenChatPanel;

export { RenClient, RenChatPanel };
export default RenClient;
