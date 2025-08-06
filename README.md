# TokenizeArt - MATTERN42 NFT Collection

This project implements an ERC-721 NFT smart contract with hybrid metadata storage capabilities, deployed on Sepolia testnet.

## Contract Deployment Information

- **Contract Address**: `0x5Cfd6D03313974551379C9Ae07183741739023DB`
- **Network**: Sepolia Testnet
- **Etherscan**: https://sepolia.etherscan.io/address/0x5Cfd6D03313974551379C9Ae07183741739023DB

## Technical Choices and Justifications

### Blockchain Selection
**Choice**: Ethereum Sepolia Testnet
**Justification**: 
- ERC-721 standard compliance for maximum compatibility
- Active testnet with reliable infrastructure
- No real monetary cost while maintaining production-like environment
- Widespread tooling and documentation support

### Smart Contract Architecture
**Choice**: Hybrid storage system (IPFS + On-chain)
**Justification**:
- **IPFS Mode**: Industry standard for marketplace compatibility and cost efficiency
- **On-chain Mode**: Future-proof solution with permanent, censorship-resistant storage
- Flexibility allows users to choose based on their needs and budget

### Development Framework
**Choice**: Hardhat with OpenZeppelin libraries
**Justification**:
- Hardhat provides robust testing and deployment environment
- OpenZeppelin contracts are audited and battle-tested
- Modular architecture enables easy maintenance and upgrades

### Image Storage Strategy
**Choice**: SVG format with base64 encoding
**Justification**:
- Scalable vector graphics work at any resolution
- Base64 encoding enables true on-chain storage
- BADGER42 design incorporates required "42" element prominently
- Compact file size reduces gas costs

## NFT Specifications

### Metadata Standards
- **Artist Name**: "lmattern" (42 school login as required)
- **Collection Name**: "MATTERN42 NFT Collection" (includes "42" as required)
- **Token Naming**: Each NFT named "MATTERN42 NFT Collection #{tokenId}"
- **Image**: BADGER42.svg featuring the number "42" displayed

### Owner Verification
The contract implements standard ERC-721 `ownerOf(uint256 tokenId)` function enabling verification of NFT ownership as required by the subject specifications.

## Project Structure

### Required Directories
- `code/` - Smart contract source code (MATTERN42NFT.sol)
- `deployment/` - Contract deployment scripts and configuration
- `mint/` - NFT image asset (BADGER42.svg)  
- `documentation/` - Complete project documentation
- `website/` - Web interface for NFT minting

## Quick Start

### Option 1: Using Makefile
```bash
make help          # Show available commands
make setup         # Install dependencies and compile contracts
make deploy        # Deploy contract to Sepolia testnet  
make dev           # Start development server with auto-reload
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

## Development Features

### Smart Contract Capabilities
- Hybrid metadata storage (IPFS + On-chain)
- Owner verification via ownerOf() function
- Supply limit enforcement (4242 maximum)
- Professional access control and security

### Web Interface Features
- **IPFS Mode**: Cost-efficient minting with Pinata integration
- **On-Chain Mode**: Permanent blockchain storage with embedded images
- MetaMask integration for wallet connectivity
- Real-time transaction status and cost estimation

## Security and Compliance

- ERC-721 standard compliance
- OpenZeppelin security patterns
- Owner-only minting controls  
- Comprehensive input validation
- Testnet deployment for safe development
