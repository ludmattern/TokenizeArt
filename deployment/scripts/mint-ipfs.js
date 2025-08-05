const { ethers } = require('hardhat');
const fs = require('fs');
const path = require('path');

// Simple function to upload to IPFS (you can replace with pinata, infura, etc.)
async function uploadToIPFS(data, isJson = false) {
	// For now, we'll create a placeholder IPFS hash
	// In real usage, you'd use a service like Pinata or Infura
	
	const hash = 'Qm' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
	
	console.log('📤 Mock upload to IPFS:');
	console.log('   Data size:', JSON.stringify(data).length, 'characters');
	console.log('   IPFS Hash:', hash);
	console.log('   URL: https://ipfs.io/ipfs/' + hash);
	
	return hash;
}

async function main() {
	console.log('🌐 IPFS NFT Minting...\n');

	// Get contract address
	require('dotenv').config({ path: path.join(__dirname, '../../.env') });
	const contractAddress = process.env.TOKEN_ADDRESS;

	if (!contractAddress) {
		console.error('❌ No contract address found');
		process.exit(1);
	}

	// Read SVG file
	const svgPath = path.join(__dirname, '../../mint/BADGER42.svg');
	const svgContent = fs.readFileSync(svgPath, 'utf8');

	// 1. Upload image to IPFS
	console.log('🖼️  Uploading image to IPFS...');
	const imageHash = await uploadToIPFS(svgContent);
	const imageUri = `https://ipfs.io/ipfs/${imageHash}`;

	// 2. Create metadata
	const [deployer] = await ethers.getSigners();
	const MATTERN42NFT = await ethers.getContractFactory('MATTERN42NFT');
	const nft = MATTERN42NFT.attach(contractAddress);
	
	const currentSupply = await nft.totalSupply();
	const nextTokenId = currentSupply + 1n;

	const metadata = {
		name: `BADGER42 Collection #${nextTokenId}`,
		description: "A unique digital collectible from the MATTERN42 NFT Collection. This badger represents the answer to the ultimate question of life, the universe, and everything! Stored on IPFS.",
		image: imageUri,
		artist: "lmattern",
		tokenId: Number(nextTokenId),
		attributes: [
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
				"value": "IPFS"
			}
		]
	};

	// 3. Upload metadata to IPFS
	console.log('📄 Uploading metadata to IPFS...');
	const metadataHash = await uploadToIPFS(metadata, true);
	const metadataUri = `https://ipfs.io/ipfs/${metadataHash}`;

	// 4. Mint NFT with IPFS URI
	console.log('⚡ Minting NFT with IPFS metadata...');
	const mintTx = await nft.mint(deployer.address, metadataUri, 'lmattern');
	await mintTx.wait();

	console.log('✅ IPFS NFT minted successfully!');
	console.log('📍 Token ID:', nextTokenId.toString());
	console.log('🖼️  Image URI:', imageUri);
	console.log('📄 Metadata URI:', metadataUri);
	console.log('');
	console.log('🌐 View your NFT:');
	console.log('   💎 Gemcase:', `https://gemcase.vercel.app/nft/sepolia/${contractAddress}/${nextTokenId}`);
}

main()
	.then(() => process.exit(0))
	.catch((error) => {
		console.error('❌ IPFS minting failed:', error);
		process.exit(1);
	});
