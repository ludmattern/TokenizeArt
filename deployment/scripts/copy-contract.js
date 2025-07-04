const fs = require('fs');
const path = require('path');

async function copyContract() {
	console.log('📋 Copying contract from ../code to ./contracts...');

	const sourceFile = path.join(__dirname, '..', '..', 'code', 'MATTERN42NFT.sol');
	const targetDir = path.join(__dirname, '..', 'contracts');
	const targetFile = path.join(targetDir, 'MATTERN42NFT.sol');

	try {
		// Create contracts directory if it doesn't exist
		if (!fs.existsSync(targetDir)) {
			fs.mkdirSync(targetDir, { recursive: true });
			console.log('📁 Created contracts directory');
		}

		// Check if source file exists
		if (!fs.existsSync(sourceFile)) {
			console.error('❌ Source contract file not found:', sourceFile);
			console.log('💡 Expected file location: ../code/MATTERN42NFT.sol');
			process.exit(1);
		}

		// Copy the contract file
		fs.copyFileSync(sourceFile, targetFile);
		console.log('✅ Contract copied successfully!');
		console.log('   From:', sourceFile);
		console.log('   To:  ', targetFile);
	} catch (error) {
		console.error('❌ Error copying contract:', error.message);
		process.exit(1);
	}
}

copyContract();
