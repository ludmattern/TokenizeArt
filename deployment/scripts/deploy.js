const { ethers } = require('hardhat');
const fs = require('fs');
const path = require('path');

async function main() {
	console.log('🚀 Deploying MATTERN42NFT with BADGER42 image...\n');

	const [deployer] = await ethers.getSigners();
	console.log('👤 Account:', deployer.address);
	
	const balance = await ethers.provider.getBalance(deployer.address);
	console.log('💰 Balance:', ethers.formatEther(balance), 'ETH\n');

	// Contract parameters
	const NFT_NAME = 'MATTERN42 NFT Collection';
	const NFT_SYMBOL = 'M42NFT';
	const BASE_URI = 'https://ipfs.io/ipfs/';

	// Deploy contract
	console.log('⚡ Deploying contract...');
	const MATTERN42NFT = await ethers.getContractFactory('MATTERN42NFT');
	const nft = await MATTERN42NFT.deploy(NFT_NAME, NFT_SYMBOL, BASE_URI);
	
	await nft.waitForDeployment();
	const contractAddress = await nft.getAddress();

	console.log('✅ Contract deployed!');
	console.log('📍 Address:', contractAddress);

	// Load and set BADGER42 image
	const svgPath = path.join(__dirname, '../../mint/BADGER42.svg');
	if (fs.existsSync(svgPath)) {
		console.log('\n🖼️  Setting up BADGER42 image...');
		const svgContent = fs.readFileSync(svgPath, 'utf8');
		const base64Content = Buffer.from(svgContent).toString('base64');
		const dataURI = `data:image/svg+xml;base64,${base64Content}`;

		console.log('📖 SVG size:', svgContent.length, 'characters');
		console.log('📦 Base64 size:', dataURI.length, 'characters');

		const setImageTx = await nft.setDefaultImageData(dataURI);
		await setImageTx.wait();
		console.log('✅ BADGER42 image embedded in contract!');
	} else {
		console.log('\n⚠️  BADGER42.svg not found, skipping image setup');
	}

	console.log('');

	// Update .env file
	const envPath = path.join(__dirname, '../../.env');
	
	// Read existing .env content
	let envContent = '';
	try {
		envContent = fs.readFileSync(envPath, 'utf8');
	} catch (error) {
		console.log('⚠️  .env file not found, creating new one');
	}
	
	// Update or add TOKEN_ADDRESS line
	const lines = envContent.split('\n');
	let tokenAddressUpdated = false;
	
	for (let i = 0; i < lines.length; i++) {
		if (lines[i].startsWith('TOKEN_ADDRESS=')) {
			lines[i] = `TOKEN_ADDRESS=${contractAddress}`;
			tokenAddressUpdated = true;
			break;
		}
	}
	
	// If TOKEN_ADDRESS line not found, add it
	if (!tokenAddressUpdated) {
		lines.push(`TOKEN_ADDRESS=${contractAddress}`);
	}
	
	// Write back to .env
	fs.writeFileSync(envPath, lines.join('\n'));
	console.log('📝 Updated .env file');

	console.log('');
	console.log('🎉 Deployment complete!');
	console.log('🌟 Your BADGER42 image is embedded in the blockchain');
	console.log('🌐 Visit your website to mint NFTs!');
	console.log('');
	console.log('🔗 View on Etherscan:');
	console.log(`   https://sepolia.etherscan.io/address/${contractAddress}`);
}

main()
	.then(() => process.exit(0))
	.catch((error) => {
		console.error('❌ Deployment failed:', error);
		process.exit(1);
	});
