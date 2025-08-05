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
        
        let imageHtml = '';
        if (metadata.image) {
            let imageUrl = metadata.image;
            if (imageUrl.startsWith('ipfs://')) {
                imageUrl = IPFSUtils.ipfsToGatewayUrl(imageUrl);
            }
            
            imageHtml = `
                <img src="${imageUrl}" 
                     alt="${metadata.name || CONFIG.APP.COLLECTION_NAME}" 
                     style="width: 100%; height: 150px; object-fit: contain; border-radius: 8px; background: rgba(255,255,255,0.1);" 
                     onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                <div style="width: 100%; height: 150px; background: linear-gradient(45deg, #ff6b6b, #4ecdc4); border-radius: 8px; display: none; align-items: center; justify-content: center; font-size: 2rem;">🦡42</div>
            `;
        } else {
            imageHtml = `<div style="width: 100%; height: 150px; background: linear-gradient(45deg, #ff6b6b, #4ecdc4); border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 2rem;">🦡42</div>`;
        }

        const storageType = isOnChain ? '💎 On-Chain Storage' : '🌐 IPFS Storage';
        const storageColor = isOnChain ? '#4ecdc4' : '#ffd700';

        return `
            ${imageHtml}
            <h4>${metadata.name || CONFIG.APP.COLLECTION_NAME} #${nft.id}</h4>
            <p style="font-size: 0.9rem; opacity: 0.8; margin: 5px 0;">${metadata.description || 'NFT from the collection'}</p>
            <div style="font-size: 0.8rem; color: ${storageColor};">${storageType}</div>
            <a href="${CONFIG.NETWORK.ETHERSCAN_URL}/token/${contractAddress}?a=${nft.id}" target="_blank" style="color: #ffd700; text-decoration: none; font-size: 0.9rem;">📱 View on Etherscan</a>
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
