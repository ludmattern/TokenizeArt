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
            <div style="
                background: rgba(30, 30, 30, 0.9); 
                border: 2px solid #4ecdc4; 
                border-radius: 15px; 
                padding: 30px; 
                margin: 20px 0; 
                text-align: center;
                backdrop-filter: blur(10px);
            ">
                <h2 style="color: #4ecdc4; margin-top: 0;">🦡 ${CONFIG.APP.NAME}</h2>
                <p style="margin-bottom: 25px;">Entrez l'adresse du contrat NFT déployé :</p>
                
                <div style="margin: 20px 0;">
                    <input 
                        type="text" 
                        id="contractAddressInput" 
                        placeholder="0x..." 
                        style="
                            padding: 15px; 
                            border-radius: 8px; 
                            border: 2px solid #4ecdc4; 
                            background: rgba(0,0,0,0.5); 
                            color: white; 
                            font-family: monospace;
                            width: 100%;
                            max-width: 400px;
                            text-align: center;
                            font-size: 14px;
                        "
                        value="enter address of the NFT contract"
                    >
                    <br><br>
                    <button 
                        onclick="app.setContractAddress()" 
                        style="
                            padding: 15px 30px; 
                            background: #4ecdc4; 
                            color: #1a1a1a; 
                            border: none; 
                            border-radius: 8px; 
                            cursor: pointer; 
                            font-weight: bold;
                            font-size: 16px;
                        "
                    >
                        🚀 Utiliser cette adresse
                    </button>
                </div>
                
                <div style="
                    margin-top: 20px; 
                    padding: 15px; 
                    background: rgba(0,0,0,0.3); 
                    border-radius: 8px;
                    font-size: 0.9rem;
                    opacity: 0.8;
                ">
                    💡 <strong>Conseil :</strong> L'adresse pré-remplie est le contrat ${CONFIG.APP.NAME} déployé sur Sepolia
                </div>
            </div>
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
            UIUtils.showStatus('Veuillez entrer une adresse de contrat', 'error');
            return;
        }
        
        if (!ethers.isAddress(address)) {
            UIUtils.showStatus('Format d\'adresse Ethereum invalide', 'error');
            addressInput.style.borderColor = '#ff6b6b';
            return;
        }
        
        // Set the contract address
        CONFIG.CONTRACT.ADDRESS = address;
        addressInput.style.borderColor = '#4caf50';
        
        // Save to local storage
        localStorage.setItem(CONFIG.CONTRACT.STORAGE_KEY, address);
        
        // Remove form and show connect section
        const form = document.getElementById('contractInputForm');
        if (form) form.remove();
        
        document.getElementById('connectSection').style.display = 'block';
        this.showContractInfo();
        UIUtils.showStatus(`✅ Adresse de contrat définie : ${UIUtils.formatAddress(address)}`, 'success');
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
        UIUtils.showStatus('Adresse de contrat réinitialisée. Veuillez saisir une nouvelle adresse.', 'info');
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
            btn.textContent = '🌐 Mint IPFS NFT (Pinata)';
            modeInfo.innerHTML = '🌐 <strong>IPFS Mode (Pinata):</strong> Métadonnées uploadées sur IPFS via Pinata - Compatible avec tous les marketplaces';
        } else {
            btn.textContent = '💎 Mint On-Chain NFT';
            modeInfo.innerHTML = '💎 <strong>On-Chain Mode:</strong> Metadata + image fully embedded in blockchain - Higher cost, permanent storage';
        }
    }

    // Mint NFT (method continues...)
    async mint() {
        if (!this.contract) {
            UIUtils.showStatus('Contract not found', 'error');
            return;
        }

        const name = document.getElementById('nftName').value || CONFIG.APP.COLLECTION_NAME;
        const description = document.getElementById('nftDescription').value || `A unique NFT from the ${CONFIG.APP.COLLECTION_NAME} collection`;

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
                
                UIUtils.showStatus('🌐 Uploading metadata to IPFS via Pinata...', 'info');
                
                // Upload metadata to IPFS using Pinata
                let metadataURI;
                try {
                    const metadataHash = await IPFSUtils.uploadToIPFS(metadata);
                    metadataURI = `ipfs://${metadataHash}`;
                    UIUtils.showStatus(`✅ Metadata uploaded: ${metadataURI}`, 'success');
                } catch (ipfsError) {
                    // Fallback to base64 if IPFS fails
                    const metadataJson = JSON.stringify(metadata);
                    const metadataBase64 = btoa(metadataJson);
                    metadataURI = `data:application/json;base64,${metadataBase64}`;
                    UIUtils.showStatus('⚠️ Using base64 fallback (configure Pinata for marketplace compatibility)', 'info');
                }
                
                gasEstimate = await this.contract.mint.estimateGas(this.userAddress, metadataURI, CONFIG.APP.ARTIST_NAME);
                gasPrice = (await this.provider.getFeeData()).gasPrice;
                estimatedCost = gasEstimate * gasPrice;
                
                UIUtils.showStatus(`💰 IPFS Mint: ~${ethers.formatEther(estimatedCost)} ETH`, 'info');
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

            UIUtils.showStatus('⏳ Transaction submitted...', 'info');
            const receipt = await tx.wait();
            
            const actualCost = receipt.gasUsed * receipt.gasPrice;
            UIUtils.showStatus(`✅ NFT Minted! Cost: ${ethers.formatEther(actualCost)} ETH`, 'success');
            
            // Refresh stats and gallery after successful mint
            await this.refreshStats();
            
        } catch (error) {
            UIUtils.showStatus('❌ Mint failed: ' + error.message, 'error');
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
                UIUtils.showStatus('❌ Aucun contrat trouvé à cette adresse', 'error');
            } else if (error.message.includes('could not decode result data')) {
                UIUtils.showStatus('❌ ABI incompatible avec le contrat', 'error');
            } else {
                UIUtils.showStatus(`❌ Erreur de connexion: ${error.message}`, 'error');
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
