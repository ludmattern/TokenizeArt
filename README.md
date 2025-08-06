# TokenizeArt - MATTERN42 NFT Collection

This project implements an ERC-721 NFT smart contract with hybrid metadata storage capabilities, deployed on Sepolia testnet.

## 🚀 Quick Start

### Complete Setup (Recommended)
```bash
# One command to rule them all
make quickstart
```
This will: install dependencies → compile contracts → deploy → verify on Etherscan → start server

### Step by Step
```bash
# 1. Setup project
make setup          # Install dependencies and compile

# 2. Deploy contract  
make deploy         # Deploy to Sepolia testnet

# 3. Verify on Etherscan
make etherscan-verify

# 4. Start application
make start          # Open http://localhost:3000
```

## 📋 Project Requirements Met

## 📋 Project Requirements Met

### ✅ Mandatory Requirements
- **Smart Contract**: ERC-721 NFT with hybrid storage (IPFS + On-chain)  
- **Deployment Script**: Automated deployment to Sepolia testnet
- **Web Interface**: Professional minting interface with MetaMask integration
- **NFT Image**: BADGER42.svg featuring the number "42" prominently
- **Documentation**: Complete technical documentation in `documentation/`
- **README**: Technical choices and architectural decisions explained

### 🏆 Bonus Features Implemented
- **Beautiful NFT Design**: Custom SVG artwork with "42" and badger theme
- **Professional Web Interface**: Modern, responsive UI with dual minting modes
- **On-Chain Metadata Storage**: Premium option for permanent blockchain storage
- **Etherscan Verification**: Automated contract verification and publication

## 💡 Technical Architecture

### Smart Contract Features
- **Hybrid Storage**: Choose between IPFS (cost-efficient) or on-chain (permanent)
- **Owner Verification**: Standard `ownerOf()` function for ownership validation
- **Supply Management**: Maximum 4242 NFTs with transparent tracking
- **Security**: OpenZeppelin standards with comprehensive access controls

### Web Application Features  
- **Dual Minting Modes**: IPFS integration via Pinata + on-chain SVG storage
- **Wallet Integration**: Seamless MetaMask connectivity and transaction handling
- **Real-time Updates**: Live transaction status and cost estimation
- **Responsive Design**: Works on desktop and mobile devices

## 🛠️ Development Commands

```bash
# Project management
make help          # Show all available commands
make status        # Check project status and deployment info
make clean         # Clean all build artifacts and dependencies

# Development workflow
make setup         # Complete initial setup (install + compile)
make compile       # Compile smart contracts only
make deploy        # Deploy contract to Sepolia testnet
make verify        # Test deployed contract functionality
make etherscan-verify # Verify contract source code on Etherscan

# Server management
make start         # Start production server
make dev           # Start development server with auto-reload
make stop          # Stop all running servers
```

## 📐 Technical Justifications

### Blockchain Selection: Ethereum Sepolia
- **ERC-721 Standard**: Maximum compatibility with NFT marketplaces
- **Active Testnet**: Reliable infrastructure without real monetary cost
- **Production-Like**: Maintains mainnet behavior for accurate testing
- **Tooling Support**: Extensive documentation and development tools

### Smart Contract Architecture: Hybrid Storage
- **IPFS Integration**: Industry standard for cost-effective metadata storage
- **On-Chain Option**: Permanent, censorship-resistant storage for premium use
- **Flexibility**: Users choose storage method based on needs and budget
- **Future-Proof**: Multiple storage options ensure long-term accessibility

### Development Framework: Hardhat + OpenZeppelin
- **Security First**: Battle-tested, audited contract libraries
- **Development Experience**: Robust testing, debugging, and deployment tools
- **Modular Design**: Easy maintenance and upgrade paths
- **Industry Standard**: Widely adopted by professional teams

### Image Strategy: SVG with Base64 Encoding
- **Scalability**: Vector graphics work at any resolution
- **On-Chain Storage**: True blockchain permanence through base64 encoding
- **Gas Efficiency**: Compact file size reduces transaction costs
- **Design Compliance**: BADGER42 prominently features required "42"

## 📂 Project Structure

```
TokenizeArt/
├── code/                    # Smart contract source
│   └── MATTERN42NFT.sol    # Main ERC-721 contract
├── deployment/             # Contract deployment
│   ├── scripts/
│   │   ├── deploy.js       # Deployment script
│   │   ├── verify.js       # Contract testing
│   │   └── etherscan-verify.js # Etherscan verification
│   └── hardhat.config.js   # Hardhat configuration
├── website/                # Web application
│   ├── mint.html          # Main interface
│   ├── app.js             # NFT minting logic
│   ├── server.js          # Express server
│   └── utils.js           # IPFS & utility functions
├── mint/                   # NFT assets
│   └── BADGER42.svg       # NFT artwork (with "42")
├── documentation/          # Project documentation
│   └── README.md          # Technical specifications
└── README.md              # Main project documentation
```
