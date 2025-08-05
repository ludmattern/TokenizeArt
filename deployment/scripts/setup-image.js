const { ethers } = require('hardhat');
const fs = require('fs');
const path = require('path');

async function main() {
	console.log('🖼️  Setting up BADGER42 image...\n');

	// Get contract address
	require('dotenv').config({ path: path.join(__dirname, '../../.env') });
	const contractAddress = process.env.TOKEN_ADDRESS;

	if (!contractAddress) {
		console.error('❌ No contract address found in .env file');
		console.log('Run: npx hardhat run scripts/deploy.js --network <network>');
		process.exit(1);
	}

	// Read SVG file
	const svgPath = path.join(__dirname, '../../mint/BADGER42.svg');
	if (!fs.existsSync(svgPath)) {
		console.error('❌ BADGER42.svg file not found at:', svgPath);
		process.exit(1);
	}

	const svgContent = fs.readFileSync(svgPath, 'utf8');
	const base64Content = Buffer.from(svgContent).toString('base64');
	const dataURI = `data:image/svg+xml;base64,${base64Content}`;

	console.log('📖 SVG size:', svgContent.length, 'characters');
	console.log('📦 Base64 size:', dataURI.length, 'characters');

	// Connect to contract
	const [deployer] = await ethers.getSigners();
	const MATTERN42NFT = await ethers.getContractFactory('MATTERN42NFT');
	const nft = MATTERN42NFT.attach(contractAddress);

	try {
		// Set default image
		console.log('🔧 Setting default image...');
		const setImageTx = await nft.setDefaultImageData(dataURI);
		await setImageTx.wait();
		console.log('   ✅ Default image set!');

		// Show status
		const currentSupply = await nft.totalSupply();
		console.log('');
		console.log('📊 Current supply:', currentSupply.toString());
		console.log('');

		if (currentSupply > 0n) {
			console.log('🌐 Your existing NFTs:');
			for (let i = 1; i <= Number(currentSupply); i++) {
				console.log(`   💎 Token #${i}: https://gemcase.vercel.app/nft/sepolia/${contractAddress}/${i}`);
			}
		}

		console.log('');
		console.log('🎉 Setup complete!');
		console.log('🌟 Visit your website to mint NFTs with the BADGER42 image!');

	} catch (error) {
		console.error('❌ Setup failed:', error.message);
		process.exit(1);
	}
}

main()
	.then(() => process.exit(0))
	.catch((error) => {
		console.error('❌ Setup script failed:', error);
		process.exit(1);
	});
