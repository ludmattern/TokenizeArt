const { ethers } = require('hardhat');
const fs = require('fs');
const path = require('path');

async function main() {
	console.log('🚀 Deploying MATTERN42NFT...\n');

	const [deployer] = await ethers.getSigners();
	console.log('� Account:', deployer.address);
	
	const balance = await ethers.provider.getBalance(deployer.address);
	console.log('💰 Balance:', ethers.formatEther(balance), 'ETH\n');

	// Contract parameters
	const NFT_NAME = 'MATTERN42 NFT Collection';
	const NFT_SYMBOL = 'M42NFT';
	const BASE_URI = 'https://ipfs.io/ipfs/';

	// Deploy
	const MATTERN42NFT = await ethers.getContractFactory('MATTERN42NFT');
	const nft = await MATTERN42NFT.deploy(NFT_NAME, NFT_SYMBOL, BASE_URI);
	
	await nft.waitForDeployment();
	const contractAddress = await nft.getAddress();

	console.log('✅ Contract deployed!');
	console.log('� Address:', contractAddress);
	console.log('');

	// Update .env file
	const envPath = path.join(__dirname, '../../.env');
	if (fs.existsSync(envPath)) {
		let envContent = fs.readFileSync(envPath, 'utf8');
		envContent = envContent.replace(/TOKEN_ADDRESS=.*/, `TOKEN_ADDRESS=${contractAddress}`);
		fs.writeFileSync(envPath, envContent);
		console.log('📝 Updated .env file');
	}

	console.log('');
	console.log('🎉 Next steps:');
	console.log('1. Configure image: npx hardhat run scripts/setup-image.js --network sepolia');
	console.log('2. Visit your website to mint NFTs!');
}

main()
	.then(() => process.exit(0))
	.catch((error) => {
		console.error('❌ Deployment failed:', error);
		process.exit(1);
	});
