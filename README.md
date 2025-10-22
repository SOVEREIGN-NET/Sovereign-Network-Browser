# 🖥️ ZHTP Web4 Desktop App

A complete Web4 desktop application built with Electron, featuring built-in ZK-DID identity management, quantum-resistant cryptography, and real ZHTP blockchain integration.

## 🚀 Features

###  Zero-Knowledge Identity (ZK-DID)
- **Quantum-Resistant Security**: CRYSTALS-Dilithium signatures + CRYSTALS-Kyber encryption
- **Biometric Verification**: Advanced facial recognition with liveness detection
- **Privacy-First**: Zero-knowledge proofs for all identity operations
- **One Identity Per Human**: Soulbound identity with citizen onboarding
- **Credential Management**: Verifiable credentials with ZK proofs

### 💰 Quantum Wallet System
- **Post-Quantum Cryptography**: Quantum-resistant key generation and signatures
- **Multi-Wallet Support**: Multiple wallets per identity with different purposes
- **Real-time Balance**: Live ZHTP token balance and transaction history
- **UBI Integration**: Automatic Universal Basic Income claiming
- **Staking Support**: Participate in network consensus and earn rewards

### 🏛️ DAO Governance
- **Zero-Knowledge Voting**: Private voting with verifiable results
- **One Citizen One Vote**: Equal representation for all verified citizens
- **Proposal System**: Create and vote on network governance proposals
- **Treasury Management**: Community-controlled fund allocation
- **Execution Engine**: Automatic proposal implementation

### 🌐 Web4 Navigation
- **ZHTP Protocol**: Native support for zhtp://, zk://, mesh://, dao:// protocols
- **Decentralized DNS**: ZDNS resolution for .zhtp domains
- **dApp Integration**: Seamless dApp discovery and launching
- **Real-time Updates**: WebSocket integration for live network data

###  Built-in dApps
- **social.zhtp**: Decentralized social network with ZK privacy
- **whisper.zhtp**: End-to-end encrypted messaging with token burning
- **marketplace.zhtp**: P2P commerce with automatic escrow
- **dao.zhtp**: Community governance interface
- **stats.zhtp**: Real-time network statistics and analytics

## Technology Stack

### Desktop App Framework
- **Electron**: Cross-platform desktop app framework
- **Native Menus**: Full application menu with keyboard shortcuts
- **File System Integration**: Identity backup/restore with native dialogs
- **Cross-Platform**: Windows, macOS, and Linux support

### Frontend
- **Vanilla JavaScript**: No framework dependencies for maximum performance
- **Web Crypto API**: Browser-native cryptographic operations
- **WebSocket**: Real-time communication with ZHTP network
- **Electron IPC**: Communication between main and renderer processes

### Cryptography
- **Quantum-Resistant**: CRYSTALS-Dilithium/Kyber simulation
- **Zero-Knowledge Proofs**: Plonky2 integration (simulated for web)
- **BLAKE3 Hashing**: High-performance cryptographic hashing
- **Secure Storage**: Encrypted local storage for sensitive data

### Integration
- **ZHTP Blockchain**: Real API integration with ZHTP node
- **WebRTC**: Peer-to-peer communication for mesh networking
- **Biometric APIs**: Camera access for identity verification
- **Native OS**: Platform-specific features and notifications

## 🚀 Quick Start

### Prerequisites
1. **ZHTP Node**: Ensure ZHTP blockchain node is running
   ```bash
   cd ../core
   cargo run --bin zhtp-node
   ```

2. **Node.js**: Version 16 or higher

### Installation & Running

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Start Desktop App (Development)**
   ```bash
   npm run dev
   ```

3. **Start Desktop App (Production)**
   ```bash
   npm start
   ```

### Building Executables

1. **Build for Current Platform**
   ```bash
   npm run build
   ```

2. **Build for Windows**
   ```bash
   npm run build-win
   ```

3. **Build for macOS**
   ```bash
   npm run build-mac
   ```

4. **Build for Linux**
   ```bash
   npm run build-linux
   ```

5. **Package for All Platforms**
   ```bash
   npm run package
   ```

##  Usage Guide

### 1. Create ZK-DID Identity

- **Menu**: Identity → Create ZK-DID Identity
- **Keyboard**: `Ctrl+N` (Windows/Linux) or `Cmd+N` (macOS)
- Complete biometric verification with camera
- Your quantum-resistant identity is created and stored securely

### 2. Access Quantum Wallet

- **Menu**: Wallet → Open Wallet
- **Keyboard**: `Ctrl+W` (Windows/Linux) or `Cmd+W` (macOS)
- View ZHTP token balance and transaction history
- Send tokens to other ZHTP addresses
- Claim Universal Basic Income (UBI) payments

### 3. Participate in DAO Governance

- **Menu**: DAO → View Proposals
- **Keyboard**: `Ctrl+P` (Windows/Linux) or `Cmd+P` (macOS)
- Cast zero-knowledge votes on proposals
- Create new proposals for network improvements
- Track proposal execution and results

### 4. Navigate Web4 Internet

- Use the address bar to navigate to `.zhtp` domains
- **Menu**: Navigate → Social Network, Marketplace, etc.
- Discover and launch decentralized applications
- Access built-in dApps directly from menu

### 5. Identity Management

- **Backup Identity**: Identity → Backup Identity
- **Restore Identity**: Identity → Restore Identity
- **Manage Multiple Identities**: Identity → Manage Identities
- Secure file-based backup and restore system

## 🎛️ Menu System

### ZHTP Menu
- About ZHTP Web4 App
- Preferences (`Ctrl+,`)
- Quit (`Ctrl+Q`)

### Identity Menu
- Create ZK-DID Identity (`Ctrl+N`)
- Manage Identities (`Ctrl+I`)
- Backup Identity
- Restore Identity

### Wallet Menu
- Open Wallet (`Ctrl+W`)
- Send Tokens (`Ctrl+S`)
- Claim UBI
- Transaction History

### DAO Menu
- View Proposals (`Ctrl+P`)
- Create Proposal
- Vote on Proposals
- Treasury Status

### Navigate Menu
- Home (`Ctrl+H`)
- Social Network
- Marketplace
- Whisper Messaging
- Back (`Ctrl+Left`)
- Forward (`Ctrl+Right`)
- Refresh (`Ctrl+R`)

### Developer Menu
- Developer Tools (`F12`)
- Reload App (`Ctrl+Shift+R`)
- Node Status
- Network Statistics

##  Configuration

### Environment Variables

Create `.env` file for custom configuration:

```env
ZHTP_NODE_URL=http://localhost:8080
NETWORK_TYPE=mainnet
DEBUG_MODE=false
ENABLE_BIOMETRICS=true
```

### App Settings

Access via **ZHTP → Preferences**:
- **Network Configuration**: ZHTP node URL and connection settings
- **Privacy Settings**: ZK privacy defaults and data handling
- **Notification Settings**: Real-time update preferences
- **Developer Mode**: Advanced debugging and testing features

##  Security Features

### Desktop Security
- **Secure Storage**: OS-level encrypted storage for keys
- **Process Isolation**: Electron main/renderer process separation
- **File System Access**: Controlled file access for backups
- **Certificate Handling**: Proper SSL/TLS certificate validation

### Quantum-Resistant Cryptography
- **Key Generation**: CRYSTALS-Dilithium/Kyber algorithms
- **Digital Signatures**: Post-quantum signature schemes
- **Encryption**: Hybrid quantum-classical encryption
- **Key Storage**: Platform-specific secure storage

### Zero-Knowledge Privacy
- **Identity Proofs**: ZK proofs for identity verification
- **Transaction Privacy**: Private transaction amounts and recipients
- **Voting Privacy**: Anonymous voting with verifiable results
- **Credential Privacy**: Selective disclosure of identity attributes

## 💻 Platform Support

### Windows
- Windows 10 and 11
- Native Windows installer (NSIS)
- Windows-specific features and notifications

### macOS
- macOS 10.14 (Mojave) and later
- Apple-signed DMG installer
- macOS menu bar integration

### Linux
- Ubuntu 18.04+ and other major distributions
- AppImage format for universal compatibility
- Linux desktop environment integration

## 🧪 Development

### Project Structure

```
packages/browser/
├── main.js                    # Electron main process
├── src/
│   ├── main.js               # Frontend application entry
│   ├── api/
│   │   └── zhtp-api.js       # ZHTP blockchain API client
│   ├── identity/
│   │   ├── zkdid-manager.js  # ZK-DID identity management
│   │   └── biometric-verifier.js # Biometric verification
│   ├── wallet/
│   │   └── quantum-wallet.js # Quantum-resistant wallet
│   ├── dao/
│   │   └── dao-manager.js    # DAO governance system
│   └── navigation/
│       └── navigation-manager.js # Web4 navigation
├── assets/
│   ├── icon.png              # App icon (PNG)
│   └── icon.svg              # App icon (SVG)
├── index.html                # Main HTML entry point
└── package.json              # Dependencies and scripts
```

### Electron IPC Integration

```javascript
// Main process to renderer communication
mainWindow.webContents.send('create-identity');
mainWindow.webContents.send('navigate-url', 'social.zhtp');

// Renderer to main process communication
const result = await ipcRenderer.invoke('show-save-dialog', options);
const fileData = await ipcRenderer.invoke('read-file', filePath);
```

### Building and Packaging

```bash
# Development with hot reload
npm run dev

# Build distributable packages
npm run build

# Platform-specific builds
npm run build-win    # Windows installer
npm run build-mac    # macOS DMG
npm run build-linux  # Linux AppImage

# Package all platforms
npm run package
```

## 🚢 Deployment

### Auto-Updates
- Configure electron-updater for automatic updates
- Code signing for security and trust
- Update channels for beta/stable releases

### Distribution
- GitHub Releases for download distribution
- Platform-specific app stores
- Enterprise deployment options

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

### Development Guidelines

- **Security First**: All crypto operations must be secure
- **Performance**: Optimize for desktop and mobile devices
- **Privacy**: No user data tracking or analytics
- **Accessibility**: Support screen readers and keyboard navigation
- **Cross-Platform**: Ensure compatibility across all supported platforms

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Electron Team**: Cross-platform desktop app framework
- **CRYSTALS Team**: Post-quantum cryptography algorithms
- **Plonky2 Team**: Zero-knowledge proof system
- **ZHTP Community**: Protocol design and implementation
- **Web4 Vision**: Decentralized internet architecture

##  Links

- **ZHTP Protocol**: [Technical Specification](../docs/technical-overview.md)
- **ZHTP Core**: [Blockchain Implementation](../core/)
- **Community**: [Discord Server](https://discord.gg/zhtp)
- **Documentation**: [Developer Docs](https://docs.zhtp.network)

---

**🖥️ Welcome to the Future of the Internet - Web4 Desktop App is Here! 🚀**

## 🚀 Features

###  Zero-Knowledge Identity (ZK-DID)
- **Quantum-Resistant Security**: CRYSTALS-Dilithium signatures + CRYSTALS-Kyber encryption
- **Biometric Verification**: Advanced facial recognition with liveness detection
- **Privacy-First**: Zero-knowledge proofs for all identity operations
- **One Identity Per Human**: Soulbound identity with citizen onboarding
- **Credential Management**: Verifiable credentials with ZK proofs

### 💰 Quantum Wallet System
- **Post-Quantum Cryptography**: Quantum-resistant key generation and signatures
- **Multi-Wallet Support**: Multiple wallets per identity with different purposes
- **Real-time Balance**: Live ZHTP token balance and transaction history
- **UBI Integration**: Automatic Universal Basic Income claiming
- **Staking Support**: Participate in network consensus and earn rewards

### 🏛️ DAO Governance
- **Zero-Knowledge Voting**: Private voting with verifiable results
- **One Citizen One Vote**: Equal representation for all verified citizens
- **Proposal System**: Create and vote on network governance proposals
- **Treasury Management**: Community-controlled fund allocation
- **Execution Engine**: Automatic proposal implementation

### 🌐 Web4 Navigation
- **ZHTP Protocol**: Native support for zhtp://, zk://, mesh://, dao:// protocols
- **Decentralized DNS**: ZDNS resolution for .zhtp domains
- **dApp Integration**: Seamless dApp discovery and launching
- **Real-time Updates**: WebSocket integration for live network data

###  Built-in dApps
- **social.zhtp**: Decentralized social network with ZK privacy
- **whisper.zhtp**: End-to-end encrypted messaging with token burning
- **marketplace.zhtp**: P2P commerce with automatic escrow
- **dao.zhtp**: Community governance interface
- **stats.zhtp**: Real-time network statistics and analytics

## Technology Stack

### Frontend
- **Vite**: Modern build tool and dev server
- **Vanilla JavaScript**: No framework dependencies for maximum performance
- **Web Crypto API**: Browser-native cryptographic operations
- **WebSocket**: Real-time communication with ZHTP network
- **Progressive Web App**: Installable browser experience

### Cryptography
- **Quantum-Resistant**: CRYSTALS-Dilithium/Kyber simulation
- **Zero-Knowledge Proofs**: Plonky2 integration (simulated for web)
- **BLAKE3 Hashing**: High-performance cryptographic hashing
- **Secure Storage**: Encrypted local storage for sensitive data

### Integration
- **ZHTP Blockchain**: Real API integration with ZHTP node
- **WebRTC**: Peer-to-peer communication for mesh networking
- **Biometric APIs**: Camera access for identity verification
- **Service Workers**: Offline functionality and caching

## 🚀 Quick Start

### Prerequisites
1. **ZHTP Node**: Ensure ZHTP blockchain node is running
   ```bash
   cd ../core
   cargo run --bin zhtp-node
   ```

2. **Node.js**: Version 16 or higher

### Installation

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Start Development Server**
   ```bash
   npm run dev
   ```

3. **Open Browser**
   Navigate to `http://localhost:3000`

### Production Build

1. **Build for Production**
   ```bash
   npm run build
   ```

2. **Preview Production Build**
   ```bash
   npm run preview
   ```

3. **Start Production Server**
   ```bash
   npm start
   ```

##  Usage Guide

### 1. Create ZK-DID Identity

1. Click **"Create Your ZK-DID Identity"** on the dashboard
2. Choose identity type (Citizen, Organization, Developer)
3. Complete biometric verification with camera
4. Your quantum-resistant identity is created and stored securely

### 2. Access Quantum Wallet

1. Navigate to wallet section or use `zhtp://wallet`
2. View ZHTP token balance and transaction history
3. Send tokens to other ZHTP addresses
4. Claim Universal Basic Income (UBI) payments
5. Participate in staking for network rewards

### 3. Participate in DAO Governance

1. Open DAO interface at `dao.zhtp`
2. View active proposals and community discussions
3. Cast zero-knowledge votes on proposals
4. Create new proposals for network improvements
5. Track proposal execution and results

### 4. Browse Web4 Internet

1. Use the address bar to navigate to `.zhtp` domains
2. Discover and launch decentralized applications
3. Communicate via whisper.zhtp encrypted messaging
4. Shop on marketplace.zhtp peer-to-peer commerce
5. Connect socially through social.zhtp network

### 5. Developer Tools

1. Access developer tools at `dev.zhtp`
2. Build smart contracts and dApps
3. Test on ZHTP testnet
4. Deploy to mainnet
5. Monitor network statistics

##  Configuration

### API Endpoints

The browser automatically detects and connects to ZHTP nodes:

```javascript
// Priority order for node connection
const nodeUrls = [
  'http://localhost:8080',      // Local development
  'https://node1.zhtp.network', // Public node 1
  'https://node2.zhtp.network', // Public node 2
  'https://bootstrap.zhtp.network' // Bootstrap node
];
```

### Environment Variables

Create `.env` file for custom configuration:

```env
VITE_ZHTP_NODE_URL=http://localhost:8080
VITE_NETWORK_TYPE=mainnet
VITE_DEBUG_MODE=false
VITE_ENABLE_BIOMETRICS=true
```

### Browser Settings

Access via settings menu (⚙️):
- **Network Configuration**: ZHTP node URL and connection settings
- **Privacy Settings**: ZK privacy defaults and data handling
- **Notification Settings**: Real-time update preferences
- **Developer Mode**: Advanced debugging and testing features

##  Security Features

### Quantum-Resistant Cryptography
- **Key Generation**: CRYSTALS-Dilithium/Kyber algorithms
- **Digital Signatures**: Post-quantum signature schemes
- **Encryption**: Hybrid quantum-classical encryption
- **Key Storage**: Encrypted local storage with user passphrase

### Zero-Knowledge Privacy
- **Identity Proofs**: ZK proofs for identity verification
- **Transaction Privacy**: Private transaction amounts and recipients
- **Voting Privacy**: Anonymous voting with verifiable results
- **Credential Privacy**: Selective disclosure of identity attributes

### Biometric Security
- **Liveness Detection**: Advanced anti-spoofing measures
- **Privacy-Preserving**: Biometric data never leaves device
- **Multi-Factor**: Combined with cryptographic authentication
- **Revocation**: Secure identity revocation and recovery

## 🌐 Protocol Support

### ZHTP Protocol (`zhtp://`)
- `zhtp://identity/create` - Create new identity
- `zhtp://wallet/send?to=address&amount=100` - Send tokens
- `zhtp://dao/proposal/123` - View specific proposal

### ZK Protocol (`zk://`)
- `zk://proof/verify/abc123` - Verify ZK proof
- `zk://private/message` - Private messaging interface

### Mesh Protocol (`mesh://`)
- `mesh://node/status` - Node status and connectivity
- `mesh://peer/connect/node123` - Connect to specific peer

### DAO Protocol (`dao://`)
- `dao://vote/proposal123` - Vote on proposal
- `dao://treasury` - View treasury status

## 🧪 Development

### Project Structure

```
packages/browser/
├── src/
│   ├── main.js                 # Main application entry
│   ├── api/
│   │   └── zhtp-api.js        # ZHTP blockchain API client
│   ├── identity/
│   │   ├── zkdid-manager.js   # ZK-DID identity management
│   │   └── biometric-verifier.js # Biometric verification
│   ├── wallet/
│   │   └── quantum-wallet.js  # Quantum-resistant wallet
│   ├── dao/
│   │   └── dao-manager.js     # DAO governance system
│   └── navigation/
│       └── navigation-manager.js # Web4 navigation
├── public/
│   ├── zhtp-icon.svg          # ZHTP logo/icon
│   └── manifest.json          # PWA manifest
├── index.html                  # Main HTML entry point
├── vite.config.js             # Vite configuration
├── server.js                  # Production server
└── package.json               # Dependencies and scripts
```

### API Integration

The browser integrates with real ZHTP APIs:

```javascript
// Example API calls
const api = new ZhtpApi();

// Blockchain operations
const balance = await api.getWalletBalance(userDid);
const result = await api.sendTokens(fromDid, toAddress, amount);

// Identity operations
const identity = await api.createIdentity(identityData);
const verification = await api.verifyIdentity(did);

// DAO operations
const proposals = await api.getDaoProposals();
const voteResult = await api.voteOnProposal(proposalId, vote);
```

### Testing

```bash
# Run tests
npm test

# Test with ZHTP node
npm run test:integration

# Test biometric features (requires camera)
npm run test:biometric
```

## 🚢 Deployment

### Docker Deployment

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY dist ./dist
COPY server.js ./
EXPOSE 3000
CMD ["node", "server.js"]
```

### Production Checklist

- [ ] ZHTP node configured and running
- [ ] SSL certificates for HTTPS
- [ ] Environment variables set
- [ ] Service worker registered
- [ ] Analytics configured
- [ ] Error monitoring enabled
- [ ] Performance monitoring active

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

### Development Guidelines

- **Security First**: All crypto operations must be secure
- **Performance**: Optimize for mobile and low-end devices
- **Privacy**: No user data tracking or analytics
- **Accessibility**: Support screen readers and keyboard navigation
- **Testing**: Comprehensive test coverage for all features

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **CRYSTALS Team**: Post-quantum cryptography algorithms
- **Plonky2 Team**: Zero-knowledge proof system
- **ZHTP Community**: Protocol design and implementation
- **Web4 Vision**: Decentralized internet architecture

##  Links

- **ZHTP Protocol**: [Technical Specification](../docs/technical-overview.md)
- **ZHTP Core**: [Blockchain Implementation](../core/)
- **Community**: [Discord Server](https://discord.gg/zhtp)
- **Documentation**: [Developer Docs](https://docs.zhtp.network)

---

**🌐 Welcome to the Future of the Internet - Web4 is Here! 🚀**
