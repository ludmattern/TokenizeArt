// Export contract address to JSON file for website
const fs = require('fs');
const path = require('path');
const { config } = require('dotenv');

async function main() {
	try {
		// Load environment variables from parent directory
		const envPath = path.join(__dirname, '../../.env');
		const result = config({ path: envPath });

		if (result.error) {
			console.log('⚠️ No .env file found, checking process.env...');
		}

		// Read contract address from environment
		const contractAddress = process.env.TOKEN_ADDRESS;

		if (!contractAddress) {
			console.log('❌ No contract address found in environment');
			console.log('Deploy the contract first with: make deploy');
			return;
		}

		// Create contract address data
		const data = {
			address: contractAddress,
			network: process.env.NETWORK || 'sepolia',
			timestamp: new Date().toISOString(),
		};

		// Write to website folder
		const websitePath = path.join(__dirname, '../../website');
		const outputFile = path.join(websitePath, 'contract-address.json');

		fs.writeFileSync(outputFile, JSON.stringify(data, null, 2));

		console.log(`✅ Contract address exported to: ${outputFile}`);
		console.log(`📍 Contract: ${contractAddress}`);
		console.log(`🌐 Network: ${data.network}`);
	} catch (error) {
		console.error('❌ Export failed:', error.message);
		process.exit(1);
	}
}

main().catch(console.error);
