// MATTERN42 NFT Main Application
// Dependencies: config.js, contract-abi.js, utils.js, ethers.js

// Application State Management
class NFTApp {
    constructor() {
        this.provider = null;
        this.signer = null;
        this.contract = null;
        this.userAddress = null;
        this.currentMode = 'ipfs';
        
        // Initialize contract address from config
        CONFIG.CONTRACT.ADDRESS = '';
    }

    // Initialize the application
    async init() {
        const contractLoaded = await this.loadContract();
        if (contractLoaded) {
            this.showContractInfo();
        }
    }

    // Load contract address from localStorage
    async loadContract() {
        const savedAddress = localStorage.getItem(CONFIG.CONTRACT.STORAGE_KEY);
        if (savedAddress && ethers.isAddress(savedAddress)) {
            CONFIG.CONTRACT.ADDRESS = savedAddress;
            return true;
        }
        
        this.showContractInputForm();
        return false;
    }

    // Show contract input form
    showContractInputForm() {
        const container = document.querySelector('.container');
        const inputDiv = document.createElement('div');
        inputDiv.id = 'contractInputForm';
        inputDiv.innerHTML = `
            <section class="contract-input-section" style="
                background: var(--glass-bg);
                backdrop-filter: blur(16px);
                border: 1px solid var(--border-color);
                border-radius: var(--border-radius-lg);
                padding: 2rem;
                margin: 2rem 0;
                text-align: center;
                position: relative;
                overflow: hidden;
            ">
                <div style="
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    height: 2px;
                    background: var(--accent-gradient);
                    opacity: 0.8;
                "></div>
                
                <p style="
                    color: var(--text-secondary);
                    margin-bottom: 1.5rem;
                    font-size: 0.95rem;
                    line-height: 1.5;
                ">
                    Enter the address of your deployed NFT contract to continue
                </p>

                <div class="form-section" style="margin: 1.5rem 0;">
                    <input 
                        type="text" 
                        id="contractAddressInput" 
                        placeholder="0x..." 
                        style="
                            width: 100%;
                            padding: 1rem 1.25rem;
                            border: 1px solid var(--border-color);
                            border-radius: var(--border-radius);
                            background: var(--glass-bg);
                            color: var(--text-primary);
                            font-size: 0.9rem;
                            font-family: 'JetBrains Mono', monospace;
                            text-align: center;
                            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                            outline: none;
                            margin-bottom: 1.5rem;
                        "
                        onfocus="this.style.borderColor='var(--accent-primary)'; this.style.boxShadow='0 0 0 3px rgba(0, 212, 255, 0.1)'; this.style.background='rgba(255, 255, 255, 0.02)'"
                        onblur="this.style.borderColor='var(--border-color)'; this.style.boxShadow='none'; this.style.background='var(--glass-bg)'"
                        value=""
                    >
                    
                    <button 
                        onclick="app.setContractAddress()" 
                        style="
                            background: var(--accent-gradient);
                            color: var(--text-primary);
                            border: none;
                            padding: 1rem 2.5rem;
                            border-radius: 12px;
                            font-size: 1rem;
                            font-weight: 600;
                            cursor: pointer;
                            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                            position: relative;
                            overflow: hidden;
                            min-width: 180px;
                            font-family: inherit;
                        "
                        onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 0 40px rgba(0, 212, 255, 0.15)'"
                        onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='none'"
                    >
                        Use This Contract
                    </button>
                </div>
                
                <div style="
                    margin-top: 1.5rem;
                    padding: 1rem;
                    background: rgba(0, 212, 255, 0.05);
                    border: 1px solid rgba(0, 212, 255, 0.1);
                    border-radius: var(--border-radius);
                    font-size: 0.8rem;
                    color: var(--text-secondary);
                    text-align: left;
                ">
                    <strong style="color: var(--accent-primary);">ℹ️ Info:</strong>
                    This address will be stored locally in your browser. You can find contract addresses on 
                    <a href="https://sepolia.etherscan.io" target="_blank" style="color: var(--accent-primary); text-decoration: none; border-bottom: 1px dotted var(--accent-primary);">
                        Sepolia Etherscan
                    </a> or use the deployed contract from your .env file.
                </div>
            </section>
        `;
        
        // Insert after stats section
        const stats = document.querySelector('.stats');
        stats.after(inputDiv);
        
        // Hide connect and mint sections
        document.getElementById('connectSection').style.display = 'none';
        document.getElementById('mintSection').style.display = 'none';
    }

    // Set contract address from input
    setContractAddress() {
        const addressInput = document.getElementById('contractAddressInput');
        const address = addressInput.value.trim();
        
        if (!address) {
            UIUtils.showStatus('The contract address is required', 'error');
            return;
        }
        
        if (!ethers.isAddress(address)) {
            UIUtils.showStatus('Invalid Ethereum address format', 'error');
            const input = document.getElementById('contractAddressInput');
            input.style.borderColor = 'var(--error)';
            input.style.boxShadow = '0 0 0 3px rgba(239, 68, 68, 0.1)';
            setTimeout(() => {
                input.style.borderColor = 'var(--border-color)';
                input.style.boxShadow = 'none';
            }, 3000);
            return;
        }
        
        // Set the contract address
        CONFIG.CONTRACT.ADDRESS = address;
        const input = document.getElementById('contractAddressInput');
        input.style.borderColor = 'var(--success)';
        input.style.boxShadow = '0 0 0 3px rgba(16, 185, 129, 0.1)';
        
        // Save to local storage
        localStorage.setItem(CONFIG.CONTRACT.STORAGE_KEY, address);
        
        // Remove form and show connect section
        const form = document.getElementById('contractInputForm');
        if (form) form.remove();
        
        document.getElementById('connectSection').style.display = 'block';
        this.showContractInfo();
        UIUtils.showStatus(`Contract address defined: ${UIUtils.formatAddress(address)}`, 'success');
    }

    // Reset contract address
    resetContract() {
        localStorage.removeItem(CONFIG.CONTRACT.STORAGE_KEY);
        CONFIG.CONTRACT.ADDRESS = '';
        document.getElementById('contractInfo').style.display = 'none';
        document.getElementById('connectSection').style.display = 'none';
        document.getElementById('mintSection').style.display = 'none';
        
        // Remove any existing form
        const existingForm = document.getElementById('contractInputForm');
        if (existingForm) existingForm.remove();
        
        this.showContractInputForm();
        UIUtils.showStatus('Contract address reset. Please enter a new address.', 'info');
    }

    // Show contract info in stats
    showContractInfo() {
        if (CONFIG.CONTRACT.ADDRESS) {
            const contractInfo = document.getElementById('contractInfo');
            const contractDisplay = document.getElementById('contractDisplay');
            contractDisplay.textContent = UIUtils.formatAddress(CONFIG.CONTRACT.ADDRESS);
            contractInfo.style.display = 'block';
        }
    }

    // Connect wallet
    async connectWallet() {
        if (!window.ethereum) {
            UIUtils.showStatus('Install MetaMask!', 'error');
            return;
        }

        if (!CONFIG.CONTRACT.ADDRESS) {
            UIUtils.showStatus('Contract not deployed yet!', 'error');
            return;
        }

        try {
            await window.ethereum.request({ method: 'eth_requestAccounts' });
            this.provider = new ethers.BrowserProvider(window.ethereum);
            this.signer = await this.provider.getSigner();
            this.userAddress = await this.signer.getAddress();

            const network = await this.provider.getNetwork();
            
            if (Number(network.chainId) !== CONFIG.NETWORK.SEPOLIA_CHAIN_ID) {
                await this.switchToSepolia();
                return;
            }

            this.contract = new ethers.Contract(CONFIG.CONTRACT.ADDRESS, CONTRACT_ABI, this.signer);

            document.getElementById('connectSection').classList.add('hidden');
            document.getElementById('mintSection').classList.remove('hidden');
            
            UIUtils.showStatus('Connected!', 'success');
            
            // Load stats and NFTs after connection
            await this.refreshStats();
        } catch (error) {
            UIUtils.showStatus('Connection failed: ' + error.message, 'error');
        }
    }

    // Switch to Sepolia network
    async switchToSepolia() {
        try {
            await window.ethereum.request({
                method: 'wallet_switchEthereumChain',
                params: [{ chainId: `0x${CONFIG.NETWORK.SEPOLIA_CHAIN_ID.toString(16)}` }]
            });
            location.reload();
        } catch (error) {
            UIUtils.showStatus('Switch to Sepolia network', 'error');
        }
    }

    // Set mint mode
    setMode(mode) {
        this.currentMode = mode;
        document.querySelectorAll('.mode-btn').forEach(btn => btn.classList.remove('active'));
        event.target.classList.add('active');
        
        const btn = document.getElementById('mintBtn');
        const modeInfo = document.getElementById('modeInfo');
        
        if (mode === 'ipfs') {
            btn.textContent = 'Mint IPFS NFT (Pinata)';
            modeInfo.innerHTML = '<strong>IPFS Mode (Pinata):</strong> Métadonnées uploadées sur IPFS via Pinata - Compatible avec tous les marketplaces';
        } else {
            btn.textContent = 'Mint On-Chain NFT';
            modeInfo.innerHTML = '<strong>On-Chain Mode:</strong> Metadata + image fully embedded in blockchain - Higher cost, permanent storage';
        }
    }

    // Mint NFT (method continues...)
    async mint() {
        if (!this.contract) {
            UIUtils.showStatus('Contract not found', 'error');
            return;
        }

        // Generate automatic NFT naming and description
        let name, description;
        
        try {
            // Get next token ID for unique naming
            const totalSupply = await this.contract.totalSupply();
            const nextTokenId = Number(totalSupply) + 1;
            
            name = `${CONFIG.APP.COLLECTION_NAME} #${nextTokenId}`;
            description = `A unique NFT from the ${CONFIG.APP.COLLECTION_NAME} collection. Token ID: ${nextTokenId}`;
        } catch (error) {
            // Fallback if we can't get total supply
            name = CONFIG.APP.COLLECTION_NAME;
            description = `A unique NFT from the ${CONFIG.APP.COLLECTION_NAME} collection`;
        }

        try {
            document.getElementById('mintBtn').disabled = true;
            UIUtils.showStatus('Estimating gas...', 'info');

            let tx, gasEstimate, gasPrice, estimatedCost;

            if (this.currentMode === 'ipfs') {
                // Get next token ID for unique metadata
                const totalSupply = await this.contract.totalSupply();
                const nextTokenId = (Number(totalSupply) + 1);
                
                // Generate IPFS metadata automatically
                const metadata = MetadataUtils.createIPFSMetadata(name, description, nextTokenId);
                
                UIUtils.showStatus('Uploading metadata to IPFS via Pinata...', 'info');
                
                // Upload metadata to IPFS using Pinata
                let metadataURI;
                try {
                    const metadataHash = await IPFSUtils.uploadToIPFS(metadata);
                    metadataURI = `ipfs://${metadataHash}`;
                    UIUtils.showStatus(`Metadata uploaded: ${metadataURI}`, 'success');
                } catch (ipfsError) {
                    // Fallback to base64 if IPFS fails
                    const metadataJson = JSON.stringify(metadata);
                    const metadataBase64 = btoa(metadataJson);
                    metadataURI = `data:application/json;base64,${metadataBase64}`;
                    UIUtils.showStatus('Using base64 fallback (configure Pinata for marketplace compatibility)', 'info');
                }
                
                gasEstimate = await this.contract.mint.estimateGas(this.userAddress, metadataURI, CONFIG.APP.ARTIST_NAME);
                gasPrice = (await this.provider.getFeeData()).gasPrice;
                estimatedCost = gasEstimate * gasPrice;
                
                UIUtils.showStatus(`IPFS Mint: ~${ethers.formatEther(estimatedCost)} ETH`, 'info');
                await new Promise(resolve => setTimeout(resolve, 2000));
                UIUtils.showStatus('Minting IPFS NFT...', 'info');
                
                tx = await this.contract.mint(this.userAddress, metadataURI, CONFIG.APP.ARTIST_NAME);
            } else {
                // On-chain mint with embedded base64 image
                const attributes = MetadataUtils.createOnChainAttributes();
                
                gasEstimate = await this.contract.mintOnChain.estimateGas(this.userAddress, name, description, CONFIG.APP.ARTIST_NAME, '', attributes);
                gasPrice = (await this.provider.getFeeData()).gasPrice;
                estimatedCost = gasEstimate * gasPrice;
                
                UIUtils.showStatus(`⛽ On-Chain Mint: ~${ethers.formatEther(estimatedCost)} ETH (Higher cost for on-chain storage)`, 'info');
                await new Promise(resolve => setTimeout(resolve, 3000));
                UIUtils.showStatus('Minting On-Chain NFT with embedded image...', 'info');
                
                tx = await this.contract.mintOnChain(this.userAddress, name, description, CONFIG.APP.ARTIST_NAME, '', attributes);
            }

            UIUtils.showStatus('Transaction submitted...', 'info');
            const receipt = await tx.wait();
            
            const actualCost = receipt.gasUsed * receipt.gasPrice;
            UIUtils.showStatus(`NFT Minted! Cost: ${ethers.formatEther(actualCost)} ETH`, 'success');
            
            // Refresh stats and gallery after successful mint
            await this.refreshStats();
            
        } catch (error) {
            UIUtils.showStatus('Mint failed: ' + error.message, 'error');
        } finally {
            document.getElementById('mintBtn').disabled = false;
        }
    }

    // Continue with other methods...
    async refreshStats() {
        if (!this.contract) return;

        try {
            // Use MetaMask provider if available, otherwise use public RPC
            let readProvider;
            let readOnlyContract;
            
            if (this.provider && this.userAddress) {
                readProvider = this.provider;
                readOnlyContract = this.contract;
            } else {
                readProvider = new ethers.JsonRpcProvider('https://sepolia.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161');
                readOnlyContract = new ethers.Contract(CONFIG.CONTRACT.ADDRESS, CONTRACT_ABI, readProvider);
            }
            
            const code = await readProvider.getCode(CONFIG.CONTRACT.ADDRESS);
            if (code === '0x') {
                throw new Error('No contract found at this address');
            }
            
            const totalSupply = await readOnlyContract.totalSupply();
            
            if (this.userAddress) {
                const userBalance = await readOnlyContract.balanceOf(this.userAddress);
                document.getElementById('userBalance').textContent = userBalance.toString();
                
                if (userBalance > 0) {
                    await this.loadUserNFTs();
                }
            } else {
                document.getElementById('userBalance').textContent = '-';
            }

            document.getElementById('totalSupply').textContent = totalSupply.toString();

        } catch (error) {
            if (error.message.includes('No contract found')) {
                UIUtils.showStatus('No contract found at this address', 'error');
            } else if (error.message.includes('could not decode result data')) {
                UIUtils.showStatus('ABI mismatch', 'error');
            } else {
                UIUtils.showStatus(`Connection error: ${error.message}`, 'error');
            }
        }
    }

    // Load user NFTs
    async loadUserNFTs() {
        const gallery = document.getElementById('gallery');
        gallery.innerHTML = '<div style="text-align: center; padding: 20px;">Loading your NFTs...</div>';

        try {
            const totalSupply = await this.contract.totalSupply();
            const userNFTs = [];

            for (let i = 1; i <= totalSupply; i++) {
                try {
                    const owner = await this.contract.ownerOf(i);
                    if (owner.toLowerCase() === this.userAddress.toLowerCase()) {
                        const tokenURI = await this.contract.tokenURI(i);
                        let metadata = {};
                        try {
                            metadata = await MetadataUtils.parseMetadataFromURI(tokenURI);
                        } catch (error) {
                            metadata = {
                                name: CONFIG.APP.COLLECTION_NAME,
                                description: 'NFT from the collection',
                                image: null
                            };
                        }
                        userNFTs.push({ id: i, uri: tokenURI, metadata });
                    }
                } catch (error) {
                    // Token might not exist
                }
            }

            gallery.innerHTML = '';
            
            if (userNFTs.length === 0) {
                gallery.innerHTML = `<div style="text-align: center; padding: 40px; opacity: 0.7;">No NFTs found. Mint your first ${CONFIG.APP.COLLECTION_NAME}! 🦡</div>`;
                return;
            }

            for (const nft of userNFTs) {
                const card = document.createElement('div');
                card.className = 'nft-card';
                card.innerHTML = UIUtils.createNFTCardHTML(nft, CONFIG.CONTRACT.ADDRESS);
                gallery.appendChild(card);
            }
        } catch (error) {
            gallery.innerHTML = '<div style="text-align: center; padding: 20px; color: #ff6b6b;">Error loading NFTs</div>';
        }
    }
}

// Global functions for HTML onclick handlers
function connectWallet() {
    app.connectWallet();
}

function setMode(mode) {
    app.setMode(mode);
}

function mint() {
    app.mint();
}

function resetContract() {
    app.resetContract();
}

// For ES6 modules
export { NFTApp };
