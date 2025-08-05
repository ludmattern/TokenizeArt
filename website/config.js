// Configuration for MATTERN42 NFT Application
// Loads environment variables from server API endpoint

let CONFIG = {
    // Network Configuration
    NETWORK: {
        SEPOLIA_CHAIN_ID: 11155111,
        ETHERSCAN_URL: 'https://sepolia.etherscan.io'
    },
    
    // Contract Configuration (loaded from localStorage or user input)
    CONTRACT: {
        ADDRESS: '', // Will be set dynamically
        STORAGE_KEY: 'MATTERN42_CONTRACT_ADDRESS'
    },
    
    // IPFS Configuration via Pinata (loaded from server)
    PINATA: {
        API_KEY: '',
        SECRET: '',
        GATEWAY_URL: 'https://gateway.pinata.cloud/ipfs/'
    },
    
    // Application Configuration
    APP: {
        NAME: 'MATTERN42 NFT',
        COLLECTION_NAME: 'BADGER42',
        ARTIST_NAME: 'lmattern',
        DEFAULT_IMAGE_IPFS: 'bafkreiaiyo6ij3pqf2stwdtrwztalvlmtmffupaqceqt63jcyzap6xqove'
    },
    
    // Gas Configuration (optional - will use network defaults if not set)
    GAS: {
        // These will be calculated automatically if not set
        PRICE: null,
        LIMIT: null
    }
};

// Load configuration from server
async function loadConfig() {
    try {
        const response = await fetch('/api/config');
        const serverConfig = await response.json();
        
        // Update CONFIG with server values
        CONFIG.PINATA.API_KEY = serverConfig.PINATA_API_KEY;
        CONFIG.PINATA.SECRET = serverConfig.PINATA_SECRET;
        
        // Set contract address if available from server
        if (serverConfig.TOKEN_ADDRESS) {
            CONFIG.CONTRACT.ADDRESS = serverConfig.TOKEN_ADDRESS;
        }
        
        console.log('Configuration loaded from server');
        return CONFIG;
    } catch (error) {
        console.error('Failed to load server config:', error);
        // Fallback to default values if server is not available
        return CONFIG;
    }
}

// Export configuration
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { CONFIG, loadConfig };
} else {
    window.CONFIG = CONFIG;
    window.loadConfig = loadConfig;
}

// For ES6 modules
export { CONFIG, loadConfig };
