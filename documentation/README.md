# MATTERN42NFT Documentation

## Project Overview

MATTERN42NFT is an ERC-721 compliant NFT smart contract deployed on the Sepolia Ethereum testnet. The project implements a hybrid NFT system supporting both traditional IPFS metadata storage and fully on-chain metadata with embedded images.

## Contract Information

- **Contract Address**: `0x5Cfd6D03313974551379C9Ae07183741739023DB`
- **Network**: Sepolia Testnet
- **Standard**: ERC-721 (Non-Fungible Token)
- **Maximum Supply**: 4242 tokens

## Features

### Dual Storage System
1. **IPFS Mode**: Traditional metadata stored on IPFS via Pinata
2. **On-Chain Mode**: Complete metadata and image data stored directly on blockchain

### Core Functions
- `mint(address to, string metadataURI, string artist)`: Mint NFT with external metadata URI
- `mintOnChain(address to, string name, string description, string artist, string imageData, string attributes)`: Mint NFT with on-chain metadata
- `totalSupply()`: Returns total number of minted tokens
- `ownerOf(uint256 tokenId)`: Returns owner address of specific token
- `tokenURI(uint256 tokenId)`: Returns metadata URI for specific token
- `setDefaultImageData(string imageData)`: Sets default image for new tokens

## Usage Instructions

### Prerequisites
- MetaMask or compatible Web3 wallet
- Sepolia testnet ETH (available from faucets)
- Node.js environment for local development

### Deployment
1. Configure environment variables in `.env` file
2. Install dependencies: `npm install`
3. Compile contract: `npx hardhat compile`
4. Deploy: `npx hardhat run scripts/deploy.js --network sepolia`

### Web Interface
1. Start local server: `node server.js`
2. Access interface at `http://localhost:3000`
3. Connect wallet and select minting mode
4. Complete transaction to mint NFT

### Verification
To verify NFT ownership and metadata:
1. Use `ownerOf(tokenId)` function to check ownership
2. Use `tokenURI(tokenId)` function to retrieve metadata
3. View on Etherscan: `https://sepolia.etherscan.io/address/youraddress`

## Technical Architecture

### Smart Contract Structure
- Inherits from OpenZeppelin ERC721 and ERC721URIStorage
- Implements Ownable pattern for access control
- Uses Base64 encoding for on-chain data URIs
- Supports up to 4242 tokens maximum supply

### Metadata Standards
- **Artist**: Always set to "lmattern" (42 login)
- **Name Format**: "MATTERN42 NFT Collection #{tokenId}"
- **Image**: BADGER42.svg embedded as base64 data URI
- **Attributes**: JSON-formatted trait data

### Security Features
- Owner-only minting functions
- Supply limit enforcement
- Token existence validation
- Proper access control modifiers

## File Structure

```
TokenizeArt/
├── code/               # Smart contract source
├── deployment/         # Deployment scripts and configuration
├── mint/              # NFT assets (BADGER42.svg)
├── website/           # Web interface
└── documentation/     # This documentation
```

This documentation provides the essential information needed to understand, deploy, and interact with the MATTERN42NFT contract system.
