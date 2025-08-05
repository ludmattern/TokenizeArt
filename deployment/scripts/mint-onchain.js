const { ethers } = require('hardhat');
const fs = require('fs');
const path = require('path');

async function main() {
	console.log('⚡ On-Chain NFT Minting...\n');

	// Get contract address
	require('dotenv').config({ path: path.join(__dirname, '../../.env') });
	const contractAddress = process.env.TOKEN_ADDRESS;

	if (!contractAddress) {
		console.error('❌ No contract address found');
		process.exit(1);
	}

	// Connect to contract
	const [deployer] = await ethers.getSigners();
	const MATTERN42NFT = await ethers.getContractFactory('MATTERN42NFT');
	const nft = MATTERN42NFT.attach(contractAddress);

	// Get next token ID
	const currentSupply = await nft.totalSupply();
	const nextTokenId = currentSupply + 1n;

	// Prepare metadata
	const tokenName = `BADGER42 Collection #${nextTokenId}`;
	const description = 'A unique digital collectible from the MATTERN42 NFT Collection. This badger represents the answer to the ultimate question of life, the universe, and everything! Fully stored on-chain with SVG art.';
	const attributes = JSON.stringify([
		{
			"trait_type": "Character",
			"value": "BADGER42"
		},
		{
			"trait_type": "Rarity",
			"value": "Genesis"  
		},
		{
			"trait_type": "Collection",
			"value": "MATTERN42"
		},
		{
			"trait_type": "Storage",
			"value": "On-Chain"
		}
	]);

	console.log('🎨 Minting on-chain NFT:');
	console.log('   Name:', tokenName);
	console.log('   Artist: lmattern');
	console.log('   Using default BADGER42 image');
	console.log('');

	// Mint the NFT
	console.log('⏳ Minting...');
	const mintTx = await nft.mintOnChain(
		deployer.address,
		tokenName,
		description,
		'lmattern',
		'', // Empty string to use default image
		attributes
	);

	await mintTx.wait();

	console.log('✅ On-Chain NFT minted successfully!');
	console.log('📍 Token ID:', nextTokenId.toString());
	console.log('');
	console.log('🌐 View your NFT:');
	console.log('   💎 Gemcase:', `https://gemcase.vercel.app/nft/sepolia/${contractAddress}/${nextTokenId}`);
}

main()
	.then(() => process.exit(0))
	.catch((error) => {
		console.error('❌ On-chain minting failed:', error);
		process.exit(1);
	});
