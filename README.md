# TokenizeArt - MATTERN42 NFT Collection

**Hybrid NFT project** supporting both IPFS and on-chain metadata storage.

## 🚀 Quick Start

1. **Deploy contract:**
   ```bash
   cd deployment
   npx hardhat run scripts/deploy.js --network sepolia
   ```

2. **Setup default image (for on-chain mode):**
   ```bash
   npx hardhat run scripts/setup-image.js --network sepolia
   ```

3. **Mint NFTs:**
   
   **IPFS Mode (Guidelines compliant):**
   ```bash
   npx hardhat run scripts/mint-ipfs.js --network sepolia
   ```
   
   **On-Chain Mode (Permanent storage):**
   ```bash
   npx hardhat run scripts/mint-onchain.js --network sepolia
   ```
   
   **Web Interface:**
   - Open `website/index.html` in your browser
   - Choose IPFS or On-Chain mode
   - Connect MetaMask and mint!

## 📁 Structure

- `code/MATTERN42NFT.sol` - Hybrid smart contract
- `deployment/scripts/deploy.js` - Deploy contract
- `deployment/scripts/setup-image.js` - Setup default image for on-chain
- `deployment/scripts/mint-ipfs.js` - Mint with IPFS storage
- `deployment/scripts/mint-onchain.js` - Mint with on-chain storage
- `mint/BADGER42.svg` - NFT image
- `website/` - Hybrid minting interface
- `.env` - Contract address (auto-updated)

## 🎯 Features

### IPFS Mode ✅ (Guidelines Compliant)
- **IPFS storage** - Images and metadata on distributed network
- **Standard compatibility** - Works with all NFT platforms
- **Cost efficient** - Lower gas fees

### On-Chain Mode 🚀 (Innovation)
- **Full on-chain** - Everything stored on blockchain
- **Permanent** - No external dependencies
- **SVG images** - Scalable vector graphics
- **Future-proof** - Will work forever

Both modes include:
- Artist name: "lmattern" 
- NFT names with "42"
- Platform compatibility (Gemcase, OpenSea, etc.)
- Owner verification via `ownerOf()`
