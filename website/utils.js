// Utility functions for MATTERN42 NFT Application
// This file contains helper functions for IPFS, URL validation, and other utilities

class IPFSUtils {
    /**
     * Upload JSON metadata to IPFS via Pinata
     * @param {Object} metadata - The metadata object to upload
     * @returns {Promise<string>} - The IPFS hash
     */
    static async uploadToIPFS(metadata) {
        if (!CONFIG.PINATA.API_KEY || !CONFIG.PINATA.SECRET) {
            throw new Error('Pinata API credentials not configured');
        }

        const url = 'https://api.pinata.cloud/pinning/pinJSONToIPFS';
        
        const data = {
            pinataContent: metadata,
            pinataMetadata: {
                name: `${metadata.name || CONFIG.APP.COLLECTION_NAME}_metadata.json`,
                keyvalues: {
                    collection: CONFIG.APP.COLLECTION_NAME,
                    artist: CONFIG.APP.ARTIST_NAME
                }
            },
            pinataOptions: {
                cidVersion: 0
            }
        };

        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'pinata_api_key': CONFIG.PINATA.API_KEY,
                    'pinata_secret_api_key': CONFIG.PINATA.SECRET
                },
                body: JSON.stringify(data)
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Pinata API error: ${response.status} - ${errorText}`);
            }

            const result = await response.json();
            return result.IpfsHash;
        } catch (error) {
            throw error;
        }
    }

    /**
     * Convert IPFS URI to gateway URL
     * @param {string} ipfsUri - The IPFS URI (ipfs://hash)
     * @returns {string} - The gateway URL
     */
    static ipfsToGatewayUrl(ipfsUri) {
        if (!ipfsUri.startsWith('ipfs://')) return ipfsUri;
        const hash = ipfsUri.replace('ipfs://', '');
        return `${CONFIG.PINATA.GATEWAY_URL}${hash}`;
    }
}

class MetadataUtils {
    /**
     * Create metadata object for IPFS minting
     * @param {string} name - NFT name
     * @param {string} description - NFT description
     * @param {number} tokenId - Token ID
     * @returns {Object} - Metadata object
     */
    static createIPFSMetadata(name, description, tokenId) {
        return {
            "name": name,
            "description": description,
            "image": `ipfs://${CONFIG.APP.DEFAULT_IMAGE_IPFS}`,
            "artist": CONFIG.APP.ARTIST_NAME,
            "tokenId": tokenId.toString(),
            "attributes": [
                {"trait_type": "Collection", "value": CONFIG.APP.COLLECTION_NAME},
                {"trait_type": "Artist", "value": CONFIG.APP.ARTIST_NAME},
                {"trait_type": "Storage", "value": "IPFS"},
                {"trait_type": "Generation", "value": new Date().toISOString().split('T')[0]}
            ]
        };
    }

    /**
     * Create attributes for on-chain minting
     * @returns {string} - JSON stringified attributes
     */
    static createOnChainAttributes() {
        return JSON.stringify([
            {"trait_type": "Collection", "value": CONFIG.APP.COLLECTION_NAME},
            {"trait_type": "Artist", "value": CONFIG.APP.ARTIST_NAME},
            {"trait_type": "Storage", "value": "On-chain"}
        ]);
    }

    /**
     * Parse metadata from various URI formats
     * @param {string} uri - The metadata URI
     * @returns {Promise<Object>} - Parsed metadata object
     */
    static async parseMetadataFromURI(uri) {
        if (uri.startsWith('data:application/json;base64,')) {
            // Base64 encoded JSON
            const base64Data = uri.replace('data:application/json;base64,', '');
            const decodedJson = atob(base64Data);
            return JSON.parse(decodedJson);
        } else if (uri.startsWith('ipfs://')) {
            // IPFS URI - fetch from gateway
            const gatewayUrl = IPFSUtils.ipfsToGatewayUrl(uri);
            const response = await fetch(gatewayUrl);
            if (response.ok) {
                return await response.json();
            } else {
                throw new Error(`Failed to fetch metadata: HTTP ${response.status}`);
            }
        } else if (uri.startsWith('http')) {
            // HTTP URL
            const response = await fetch(uri);
            if (response.ok) {
                return await response.json();
            } else {
                throw new Error(`Failed to fetch metadata: HTTP ${response.status}`);
            }
        } else {
            // Try to decode as raw base64
            try {
                const decodedJson = atob(uri);
                return JSON.parse(decodedJson);
            } catch (error) {
                throw new Error('Unknown metadata format');
            }
        }
    }
}

class UIUtils {
    /**
     * Show status message to user
     * @param {string} message - The message to show
     * @param {string} type - The type of message ('success', 'error', 'info')
     */
    static showStatus(message, type) {
        const status = document.getElementById('status');
        if (status) {
            status.textContent = message;
            status.className = `status ${type}`;
            status.style.display = 'block';

            if (type === 'success') {
                setTimeout(() => status.style.display = 'none', 5000);
            }
        }
    }

    /**
     * Create and show image modal
     * @param {string} imageUrl - URL of the image to display
     * @param {string} title - Title for the modal
     */
    static showImageModal(imageUrl, title) {
        // Remove existing modal if any
        const existingModal = document.getElementById('imageModal');
        if (existingModal) existingModal.remove();

        const modal = document.createElement('div');
        modal.id = 'imageModal';
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            background: rgba(0, 0, 0, 0.3);
            backdrop-filter: blur(8px);
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            z-index: 10000;
            cursor: pointer;
            animation: modalFadeIn 0.3s ease-out;
        `;

        modal.innerHTML = `
            <style>
                @keyframes modalFadeIn {
                    from { opacity: 0; transform: scale(0.9); }
                    to { opacity: 1; transform: scale(1); }
                }
                @keyframes imageZoomIn {
                    from { opacity: 0; transform: scale(0.8); }
                    to { opacity: 1; transform: scale(1); }
                }
            </style>
            <div style="
                background: var(--card-bg);
                border: 1px solid var(--border-color);
                border-radius: var(--border-radius-lg);
                padding: 2rem;
                max-width: 90vw;
                max-height: 90vh;
                display: flex;
                flex-direction: column;
                align-items: center;
                position: relative;
                animation: imageZoomIn 0.4s ease-out;
            " onclick="event.stopPropagation();">
                <button onclick="document.getElementById('imageModal').remove()" style="
                    position: absolute;
                    top: 1rem;
                    right: 1rem;
                    background: rgba(255, 255, 255, 0.1);
                    border: 1px solid var(--border-color);
                    color: var(--text-primary);
                    border-radius: 50%;
                    width: 40px;
                    height: 40px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    font-size: 1.2rem;
                    transition: all 0.3s ease;
                " onmouseover="this.style.background='rgba(239, 68, 68, 0.2)'; this.style.borderColor='var(--error)'" 
                   onmouseout="this.style.background='rgba(255, 255, 255, 0.1)'; this.style.borderColor='var(--border-color)'">×</button>
                
                <h3 style="
                    color: var(--text-primary);
                    margin-bottom: 1.5rem;
                    text-align: center;
                    background: var(--accent-gradient);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    background-clip: text;
                ">${title}</h3>
                
                <img src="${imageUrl}" 
                     alt="${title}"
                     style="
                        max-width: 100%;
                        max-height: 70vh;
                        object-fit: contain;
                        border-radius: var(--border-radius);
                        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
                        border: 1px solid var(--border-color);
                     "
                     onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                
                <div style="
                    width: 300px;
                    height: 300px;
                    background: var(--accent-gradient);
                    border-radius: var(--border-radius);
                    display: none;
                    align-items: center;
                    justify-content: center;
                    font-size: 4rem;
                    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
                ">🦡</div>
                
                <p style="
                    color: var(--text-secondary);
                    margin-top: 1rem;
                    font-size: 0.9rem;
                    text-align: center;
                ">Click anywhere outside to close</p>
            </div>
        `;

        // Close modal when clicking outside
        modal.onclick = () => modal.remove();

        // Close modal with Escape key
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') {
                modal.remove();
                document.removeEventListener('keydown', handleKeyDown);
            }
        };
        document.addEventListener('keydown', handleKeyDown);

        document.body.appendChild(modal);
    }

    /**
     * Format Ethereum address for display
     * @param {string} address - The full address
     * @returns {string} - Formatted address (0x1234...5678)
     */
    static formatAddress(address) {
        if (!address) return '';
        return `${address.substring(0, 6)}...${address.substring(38)}`;
    }

    /**
     * Create NFT card HTML
     * @param {Object} nft - NFT data {id, uri, metadata}
     * @param {string} contractAddress - Contract address for Etherscan link
     * @returns {string} - HTML string for the NFT card
     */
    static createNFTCardHTML(nft, contractAddress) {
        const metadata = nft.metadata || {};
        const isOnChain = nft.uri.startsWith('data:application/json;base64,');
        
        // Use metadata name if available, otherwise create default name
        const nftTitle = metadata.name || `${CONFIG.APP.COLLECTION_NAME} #${nft.id}`;
        
        let imageHtml = '';
        if (metadata.image) {
            let imageUrl = metadata.image;
            if (imageUrl.startsWith('ipfs://')) {
                imageUrl = IPFSUtils.ipfsToGatewayUrl(imageUrl);
            }
            
            imageHtml = `
                <img src="${imageUrl}" 
                     alt="${nftTitle}" 
                     style="
                        width: 100%; 
                        height: 200px; 
                        object-fit: contain; 
                        border-radius: var(--border-radius); 
                        background: rgba(0, 0, 0, 0.1);
                        border: 1px solid var(--border-color);
                        cursor: pointer;
                        transition: all 0.3s ease;
                     "
                     onclick="UIUtils.showImageModal('${imageUrl}', '${nftTitle.replace(/'/g, "\\'")}');"
                     onmouseover="this.style.transform='scale(1.02)'; this.style.boxShadow='0 8px 24px rgba(0, 212, 255, 0.2)'"
                     onmouseout="this.style.transform='scale(1)'; this.style.boxShadow='none'"
                     onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                <div style="
                    width: 100%; 
                    height: 200px; 
                    background: var(--accent-gradient); 
                    border-radius: var(--border-radius); 
                    display: none; 
                    align-items: center; 
                    justify-content: center; 
                    font-size: 3rem;
                    cursor: pointer;
                    transition: all 0.3s ease;
                " onclick="UIUtils.showImageModal('', '${nftTitle.replace(/'/g, "\\'")}');"
                   onmouseover="this.style.transform='scale(1.02)'"
                   onmouseout="this.style.transform='scale(1)'">🦡</div>
            `;
        } else {
            imageHtml = `<div style="
                width: 100%; 
                height: 200px; 
                background: var(--accent-gradient); 
                border-radius: var(--border-radius); 
                display: flex; 
                align-items: center; 
                justify-content: center; 
                font-size: 3rem;
                cursor: pointer;
                transition: all 0.3s ease;
            " onclick="UIUtils.showImageModal('', '${nftTitle.replace(/'/g, "\\'")}');"
               onmouseover="this.style.transform='scale(1.02)'"
               onmouseout="this.style.transform='scale(1)'">🦡</div>`;
        }

        const storageType = isOnChain ? 'On-Chain' : 'IPFS';
        const storageColor = isOnChain ? 'var(--accent-secondary)' : 'var(--accent-primary)';

        return `
            ${imageHtml}
            <h4>${nftTitle}</h4>
            <p style="
                color: var(--text-secondary);
                font-size: 0.875rem; 
                margin: 0.75rem 0;
                line-height: 1.4;
            ">${metadata.description || 'NFT from the collection'}</p>
            <div style="
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-top: 1rem;
                padding-top: 1rem;
                border-top: 1px solid var(--border-color);
            ">
                <span style="
                    font-size: 0.75rem; 
                    color: ${storageColor};
                    background: rgba(0, 0, 0, 0.2);
                    padding: 0.25rem 0.5rem;
                    border-radius: 12px;
                    border: 1px solid ${storageColor}33;
                ">${storageType}</span>
                <a href="${CONFIG.NETWORK.ETHERSCAN_URL}/token/${contractAddress}?a=${nft.id}" 
                   target="_blank" 
                   style="
                        color: var(--accent-primary); 
                        text-decoration: none; 
                        font-size: 0.75rem;
                        padding: 0.25rem 0.5rem;
                        border-radius: 6px;
                        border: 1px solid var(--border-color);
                        background: rgba(0, 0, 0, 0.2);
                        transition: all 0.3s ease;
                   "
                   onmouseover="this.style.borderColor='var(--accent-primary)'; this.style.background='rgba(0, 212, 255, 0.1)'"
                   onmouseout="this.style.borderColor='var(--border-color)'; this.style.background='rgba(0, 0, 0, 0.2)'">
                    Etherscan
                </a>
            </div>
        `;
    }
}

// Export utilities
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { IPFSUtils, MetadataUtils, UIUtils };
} else {
    window.IPFSUtils = IPFSUtils;
    window.MetadataUtils = MetadataUtils;
    window.UIUtils = UIUtils;
}

// For ES6 modules
export { IPFSUtils, MetadataUtils, UIUtils };
