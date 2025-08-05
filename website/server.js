const express = require('express');
const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: '../.env' }); // Load from parent directory

const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files
app.use(express.static(__dirname));

// API endpoint to provide environment variables to the frontend
app.get('/api/config', (req, res) => {
    res.json({
        PINATA_API_KEY: process.env.PINATA_API_KEY,
        PINATA_SECRET: process.env.PINATA_SECRET,
        TOKEN_ADDRESS: process.env.TOKEN_ADDRESS
    });
});

// Serve the main HTML file
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'mint.html'));
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 MATTERN42 NFT Server running at http://localhost:${PORT}`);
    console.log(`📱 Open your browser and connect MetaMask to Sepolia testnet`);
});
