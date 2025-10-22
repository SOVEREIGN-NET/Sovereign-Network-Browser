/**
 * Web4 Page Renderer - Renders ZHTP protocol pages from zkDHT
 * Supports dynamic component rendering and Web4 protocol features
 */

class Web4PageRenderer {
    constructor(container) {
        this.container = container;
        this.currentPage = null;
        this.components = new Map();
        this.initializeComponents();
    }

    initializeComponents() {
        // Register all available Web4 components
        this.registerComponent('balance-overview', this.renderBalanceOverview.bind(this));
        this.registerComponent('quick-actions', this.renderQuickActions.bind(this));
        this.registerComponent('asset-list', this.renderAssetList.bind(this));
        this.registerComponent('transaction-history', this.renderTransactionHistory.bind(this));
        this.registerComponent('governance-stats', this.renderGovernanceStats.bind(this));
        this.registerComponent('active-proposals', this.renderActiveProposals.bind(this));
        this.registerComponent('voting-power', this.renderVotingPower.bind(this));
        this.registerComponent('post-composer', this.renderPostComposer.bind(this));
        this.registerComponent('social-feed', this.renderSocialFeed.bind(this));
        this.registerComponent('trending-topics', this.renderTrendingTopics.bind(this));
        this.registerComponent('category-nav', this.renderCategoryNav.bind(this));
        this.registerComponent('featured-items', this.renderFeaturedItems.bind(this));
        this.registerComponent('search-filters', this.renderSearchFilters.bind(this));
        this.registerComponent('contact-sidebar', this.renderContactSidebar.bind(this));
        this.registerComponent('chat-interface', this.renderChatInterface.bind(this));
        this.registerComponent('message-composer', this.renderMessageComposer.bind(this));
        this.registerComponent('header', this.renderHeader.bind(this));
        this.registerComponent('content', this.renderContent.bind(this));
    }

    registerComponent(type, renderer) {
        this.components.set(type, renderer);
    }

    async renderPage(pageData) {
        console.log('🎨 Rendering Web4 page:', pageData.title);
        
        try {
            this.currentPage = pageData;
            
            // Clear container
            this.container.innerHTML = '';
            
            // Create page wrapper
            const pageWrapper = document.createElement('div');
            pageWrapper.className = `web4-page layout-${pageData.content.layout}`;
            
            // Add page header
            const pageHeader = this.createPageHeader(pageData);
            pageWrapper.appendChild(pageHeader);
            
            // Render components
            const contentContainer = document.createElement('div');
            contentContainer.className = 'page-content';
            
            for (const component of pageData.content.components) {
                const componentElement = await this.renderComponent(component);
                if (componentElement) {
                    contentContainer.appendChild(componentElement);
                }
            }
            
            pageWrapper.appendChild(contentContainer);
            
            // Add page footer
            const pageFooter = this.createPageFooter(pageData);
            pageWrapper.appendChild(pageFooter);
            
            this.container.appendChild(pageWrapper);
            
            // Apply layout-specific styling
            this.applyLayoutStyling(pageData.content.layout);
            
            console.log(' Web4 page rendered successfully');
            
        } catch (error) {
            console.error('❌ Failed to render Web4 page:', error);
            this.renderErrorPage(error);
        }
    }

    createPageHeader(pageData) {
        const header = document.createElement('div');
        header.className = 'page-header';
        header.innerHTML = `
            <div class="page-title-section">
                <h1 class="page-title">${pageData.title}</h1>
                <div class="page-meta">
                    <span class="page-version">v${pageData.version}</span>
                    <span class="page-author">by ${pageData.metadata.author}</span>
                </div>
            </div>
            <div class="page-actions">
                <button class="page-btn" onclick="window.browser?.refreshPage()"> Refresh</button>
                <button class="page-btn" onclick="window.browser?.sharePage()">📤 Share</button>
                <button class="page-btn" onclick="window.browser?.bookmarkPage()">⭐ Bookmark</button>
            </div>
        `;
        return header;
    }

    createPageFooter(pageData) {
        const footer = document.createElement('div');
        footer.className = 'page-footer';
        footer.innerHTML = `
            <div class="page-info">
                <span>Content Hash: ${pageData.metadata.contentHash.substring(0, 16)}...</span>
                <span>Created: ${new Date(pageData.metadata.created).toLocaleDateString()}</span>
            </div>
            <div class="zhtp-branding">
                <span>🌐 Powered by ZHTP Protocol</span>
            </div>
        `;
        return footer;
    }

    async renderComponent(componentData) {
        const renderer = this.components.get(componentData.type);
        if (!renderer) {
            console.warn(`Unknown component type: ${componentData.type}`);
            return this.renderUnknownComponent(componentData);
        }

        try {
            return await renderer(componentData);
        } catch (error) {
            console.error(`Failed to render component ${componentData.type}:`, error);
            return this.renderErrorComponent(componentData.type, error);
        }
    }

    // Wallet Components
    renderBalanceOverview(component) {
        const element = document.createElement('div');
        element.className = 'balance-overview-component';
        element.innerHTML = `
            <div class="balance-card">
                <h3>💰 Total Balance</h3>
                <div class="balance-amount">
                    <span class="amount">${component.data.totalBalance}</span>
                    <span class="currency">${component.data.currency}</span>
                </div>
                <div class="balance-usd">≈ $${component.data.usdValue} USD</div>
                <div class="balance-change ${component.data.change24h.startsWith('+') ? 'positive' : 'negative'}">
                    ${component.data.change24h} (24h)
                </div>
            </div>
        `;
        return element;
    }

    renderQuickActions(component) {
        const element = document.createElement('div');
        element.className = 'quick-actions-component';
        
        const actionButtons = component.actions.map(action => {
            const icons = { send: '📤', receive: '📥', swap: '', stake: '🏦' };
            return `
                <button class="action-btn" onclick="window.browser?.handleWalletAction('${action}')">
                    ${icons[action]} ${action.charAt(0).toUpperCase() + action.slice(1)}
                </button>
            `;
        }).join('');
        
        element.innerHTML = `
            <div class="actions-grid">
                ${actionButtons}
            </div>
        `;
        return element;
    }

    renderAssetList(component) {
        const element = document.createElement('div');
        element.className = 'asset-list-component';
        
        const assetItems = component.assets.map(asset => `
            <div class="asset-item" onclick="window.browser?.selectAsset('${asset.symbol}')">
                <div class="asset-icon">${asset.symbol === 'ZHTP' ? '🪙' : '⚡'}</div>
                <div class="asset-info">
                    <div class="asset-name">${asset.name}</div>
                    <div class="asset-symbol">${asset.symbol}</div>
                </div>
                <div class="asset-balance">
                    <div class="asset-amount">${asset.balance}</div>
                    <div class="asset-value">${asset.value}</div>
                </div>
            </div>
        `).join('');
        
        element.innerHTML = `
            <h3>📊 Your Assets</h3>
            <div class="asset-grid">
                ${assetItems}
            </div>
        `;
        return element;
    }

    renderTransactionHistory(component) {
        const element = document.createElement('div');
        element.className = 'transaction-history-component';
        
        const txItems = component.transactions.map(tx => `
            <div class="transaction-item">
                <div class="tx-icon">${tx.type === 'received' ? '📥' : '📤'}</div>
                <div class="tx-info">
                    <div class="tx-amount">${tx.amount}</div>
                    <div class="tx-details">${tx.type === 'received' ? 'from' : 'to'} ${tx.from || tx.to}</div>
                </div>
                <div class="tx-time">${tx.time}</div>
            </div>
        `).join('');
        
        element.innerHTML = `
            <h3> Recent Transactions</h3>
            <div class="transaction-list">
                ${txItems}
            </div>
        `;
        return element;
    }

    // DAO Components
    renderGovernanceStats(component) {
        const element = document.createElement('div');
        element.className = 'governance-stats-component';
        
        element.innerHTML = `
            <div class="stats-grid">
                <div class="stat-card">
                    <div class="stat-value">${component.data.totalProposals}</div>
                    <div class="stat-label">Total Proposals</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value">${component.data.activeProposals}</div>
                    <div class="stat-label">Active Proposals</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value">${component.data.totalMembers.toLocaleString()}</div>
                    <div class="stat-label">DAO Members</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value">${component.data.votingPower}</div>
                    <div class="stat-label">Your Voting Power</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value">${component.data.treasuryValue}</div>
                    <div class="stat-label">Treasury Value</div>
                </div>
            </div>
        `;
        return element;
    }

    renderActiveProposals(component) {
        const element = document.createElement('div');
        element.className = 'active-proposals-component';
        
        const proposalItems = component.proposals.map(proposal => {
            const totalVotes = proposal.votesYes + proposal.votesNo;
            const yesPercentage = totalVotes > 0 ? (proposal.votesYes / totalVotes * 100).toFixed(1) : 0;
            const noPercentage = totalVotes > 0 ? (proposal.votesNo / totalVotes * 100).toFixed(1) : 0;
            
            return `
                <div class="proposal-card">
                    <div class="proposal-header">
                        <h4>${proposal.title}</h4>
                        <span class="proposal-status ${proposal.status}">${proposal.status}</span>
                    </div>
                    <p class="proposal-description">${proposal.description}</p>
                    <div class="vote-progress">
                        <div class="vote-bar">
                            <div class="vote-yes" style="width: ${yesPercentage}%"></div>
                            <div class="vote-no" style="width: ${noPercentage}%"></div>
                        </div>
                        <div class="vote-stats">
                            <span class="yes-votes">${yesPercentage}% Yes (${proposal.votesYes.toLocaleString()})</span>
                            <span class="no-votes">${noPercentage}% No (${proposal.votesNo.toLocaleString()})</span>
                        </div>
                    </div>
                    <div class="proposal-actions">
                        <button class="vote-btn yes" onclick="window.browser?.voteOnProposal('${proposal.id}', 'yes')">
                            👍 Vote Yes
                        </button>
                        <button class="vote-btn no" onclick="window.browser?.voteOnProposal('${proposal.id}', 'no')">
                            👎 Vote No
                        </button>
                        <button class="vote-btn details" onclick="window.browser?.viewProposalDetails('${proposal.id}')">
                            📄 Details
                        </button>
                    </div>
                    <div class="proposal-deadline">${proposal.deadline}</div>
                </div>
            `;
        }).join('');
        
        element.innerHTML = `
            <h3>🗳️ Active Proposals</h3>
            <div class="proposals-list">
                ${proposalItems}
            </div>
        `;
        return element;
    }

    // Social Components
    renderPostComposer(component) {
        const element = document.createElement('div');
        element.className = 'post-composer-component';
        
        const featureButtons = component.features.map(feature => {
            const icons = { text: '', images: '📷', polls: '📊', location: '' };
            return `<button class="composer-btn" onclick="window.browser?.addToPost('${feature}')">${icons[feature]}</button>`;
        }).join('');
        
        element.innerHTML = `
            <div class="composer-card">
                <textarea class="post-input" placeholder="${component.placeholder}" id="postTextarea"></textarea>
                <div class="composer-actions">
                    <div class="composer-features">
                        ${featureButtons}
                    </div>
                    <button class="post-btn" onclick="window.browser?.publishPost()">🚀 Post</button>
                </div>
            </div>
        `;
        return element;
    }

    renderSocialFeed(component) {
        const element = document.createElement('div');
        element.className = 'social-feed-component';
        
        const feedPosts = component.posts.map(post => `
            <div class="post-card" data-post-id="${post.id}">
                <div class="post-header">
                    <div class="post-avatar">${post.avatar}</div>
                    <div class="post-info">
                        <div class="post-author">${post.author}</div>
                        <div class="post-time">${post.timestamp}</div>
                    </div>
                </div>
                <div class="post-content">${post.content}</div>
                <div class="post-actions">
                    <button class="post-action" onclick="window.browser?.likePost('${post.id}')">
                        ❤️ ${post.likes}
                    </button>
                    <button class="post-action" onclick="window.browser?.sharePost('${post.id}')">
                         ${post.shares}
                    </button>
                    <button class="post-action" onclick="window.browser?.commentOnPost('${post.id}')">
                        💬 ${post.comments}
                    </button>
                    <button class="post-action" onclick="window.browser?.tipAuthor('${post.id}')">
                        💰 Tip
                    </button>
                </div>
            </div>
        `).join('');
        
        element.innerHTML = `<div class="feed-posts">${feedPosts}</div>`;
        return element;
    }

    // Generic Components
    renderHeader(component) {
        const element = document.createElement('div');
        element.className = 'header-component';
        element.innerHTML = `
            <h2>${component.title}</h2>
            ${component.subtitle ? `<p class="subtitle">${component.subtitle}</p>` : ''}
        `;
        return element;
    }

    renderContent(component) {
        const element = document.createElement('div');
        element.className = 'content-component';
        element.innerHTML = component.html;
        return element;
    }

    renderUnknownComponent(componentData) {
        const element = document.createElement('div');
        element.className = 'unknown-component';
        element.innerHTML = `
            <div class="component-placeholder">
                <h4>Unknown Component: ${componentData.type}</h4>
                <p>This component type is not yet supported.</p>
                <details>
                    <summary>Component Data</summary>
                    <pre>${JSON.stringify(componentData, null, 2)}</pre>
                </details>
            </div>
        `;
        return element;
    }

    renderErrorComponent(componentType, error) {
        const element = document.createElement('div');
        element.className = 'error-component';
        element.innerHTML = `
            <div class="component-error">
                <h4>❌ Error rendering ${componentType}</h4>
                <p>${error.message}</p>
            </div>
        `;
        return element;
    }

    renderErrorPage(error) {
        this.container.innerHTML = `
            <div class="error-page">
                <h1>❌ Page Load Error</h1>
                <p>Failed to load Web4 page: ${error.message}</p>
                <button onclick="window.browser?.goBack()">← Go Back</button>
                <button onclick="window.browser?.refreshPage()"> Retry</button>
            </div>
        `;
    }

    applyLayoutStyling(layout) {
        // Apply layout-specific CSS classes
        const layoutClasses = {
            'wallet-dashboard': 'wallet-layout',
            'dao-dashboard': 'dao-layout',
            'social-feed': 'social-layout',
            'marketplace-grid': 'marketplace-layout',
            'messaging-interface': 'messaging-layout',
            'default': 'default-layout'
        };

        const layoutClass = layoutClasses[layout] || 'default-layout';
        this.container.classList.add(layoutClass);
    }

    // Utility methods
    getCurrentPage() {
        return this.currentPage;
    }

    clearPage() {
        this.container.innerHTML = '';
        this.currentPage = null;
    }
}

export default Web4PageRenderer;
