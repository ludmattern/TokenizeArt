# TokenizeArt - MATTERN42 NFT Collection

**Professional NFT minting platform** with web interface supporting both IPFS and on-chain metadata storage.

## 🚀 Quick Start

### Option 1: Using Makefile (Recommended)
```bash
# Show all available commands
make help

# First time setup
make setup          # Install deps + compile contracts

# Deploy contract (once)
make deploy

# Start development server
make dev            # With auto-reload
# OR
make start          # Production mode

# Open http://localhost:3000 and mint! 🎨
```

### Option 2: Manual Commands
```bash
# Deploy contract
cd deployment
npx hardhat run scripts/deploy.js --network sepolia

# Start web application
cd website
npm install
node server.js
```

### Quick Development
```bash
make quickstart     # Does everything: setup → deploy → start
```

## 📁 Structure

### Smart Contract
- `code/MATTERN42NFT.sol` - Hybrid NFT contract (IPFS + On-chain)
- `deployment/scripts/deploy.js` - Deploy contract to blockchain

### Web Application
- `website/server.js` - Express server with environment config
- `website/app.js` - Main NFT application (class-based)
- `website/config.js` - Configuration management
- `website/contract-abi.js` - Contract interface definitions
- `website/utils.js` - Utility classes (IPFS, Metadata, UI)
- `website/mint.html` - Professional web interface
- `website/style.css` - Modern UI styling

### Assets
- `mint/BADGER42.svg` - NFT image (embedded in contract)
- `.env` - Environment variables (contract address, API keys)
- `Makefile` - Professional automation commands

## 🛠️ Development Commands

```bash
# Project status and info
make status         # Show project overview
make logs          # View server logs

# Development workflow  
make dev           # Start with auto-reload
make stop          # Stop all servers
make clean         # Clean build artifacts

# Smart contract operations
make compile       # Compile contracts
make test          # Run contract tests
make deploy        # Deploy to Sepolia

# Dependencies management
make install       # Install all dependencies
```

## 🎯 Features

### IPFS Mode 🌐 (Standard)
- **IPFS storage** via Pinata API - Industry standard
- **Marketplace compatible** - Works with OpenSea, Rarible, etc.
- **Cost efficient** - ~0.0002 ETH per mint
- **Fast transactions** - Metadata uploaded to IPFS

### On-Chain Mode � (Premium)
- **100% on-chain** - Everything stored on blockchain
- **Permanent storage** - No external dependencies
- **Future-proof** - Cannot be lost or censored
- **Higher cost** - ~0.3 ETH per mint (full blockchain storage)
- **SVG images** - Scalable vector graphics
- **Future-proof** - Will work forever

Both modes include:
- Artist name: "lmattern" 
- NFT names with "42"
- Platform compatibility (Gemcase, OpenSea, etc.)
- Owner verification via `ownerOf()`
