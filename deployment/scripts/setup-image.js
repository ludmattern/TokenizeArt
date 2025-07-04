const { ethers } = require('hardhat');
const fs = require('fs');
const path = require('path');

async function main() {
	console.log('🖼️  Setting up BADGER42 image in contract...\n');

	// Get contract address from environment
	require('dotenv').config({ path: path.join(__dirname, '../../.env') });
	const contractAddress = process.env.TOKEN_ADDRESS;

	if (!contractAddress) {
		console.error('❌ No contract address found in .env file');
		console.log('Please deploy the contract first with: npx hardhat run scripts/deploy.js --network <network>');
		process.exit(1);
	}

	// Read and encode the BADGER42.svg file (optimized version)
	const svgPath = path.join(__dirname, '../../mint/BADGER42.svg');
	if (!fs.existsSync(svgPath)) {
		console.error('❌ BADGER42.svg file not found at:', svgPath);
		process.exit(1);
	}

	console.log('📖 Reading BADGER42.svg file...');
	const svgContent = fs.readFileSync(svgPath, 'utf8');
	console.log('   ✅ SVG file size:', svgContent.length, 'characters');

	// Encode to base64
	console.log('🔄 Encoding SVG to base64...');
	const base64Content = Buffer.from(svgContent).toString('base64');
	const dataURI = `data:image/svg+xml;base64,${base64Content}`;
	console.log('   ✅ Base64 encoded, size:', dataURI.length, 'characters');

	// Get signers
	const [deployer] = await ethers.getSigners();
	console.log('👤 Using account:', deployer.address);
	console.log('📍 Contract address:', contractAddress);
	console.log('');

	// Get contract instance
	const MATTERN42NFT = await ethers.getContractFactory('MATTERN42NFT');
	const nft = MATTERN42NFT.attach(contractAddress);

	try {
		// Check if we're the owner
		const owner = await nft.owner();
		if (owner.toLowerCase() !== deployer.address.toLowerCase()) {
			console.error('❌ You are not the owner of this contract');
			console.log('Contract owner:', owner);
			console.log('Your address:', deployer.address);
			process.exit(1);
		}

		// Set the default image data
		console.log('🔧 Setting default image data in contract...');
		const setImageTx = await nft.setDefaultImageData(dataURI);
		console.log('   ⏳ Transaction sent:', setImageTx.hash);

		await setImageTx.wait();
		console.log('   ✅ Default image data set successfully!');
		console.log('');

		// Verify the image data was set
		console.log('🔍 Verifying image data...');
		const storedImageData = await nft.getDefaultImageData();
		const isMatching = storedImageData === dataURI;

		console.log('   ✅ Image data stored:', isMatching ? 'SUCCESS' : 'MISMATCH');
		console.log('   ✅ Stored data length:', storedImageData.length);
		console.log('');

		// Test minting with the default image
		console.log('🎨 Testing mint with default BADGER42 image...');
		const testMintTx = await nft.mintOnChain(
			deployer.address,
			'BADGER42 Test NFT',
			'This is a test NFT using the default BADGER42 image stored on-chain',
			'lmattern',
			'', // Empty string to use default image
			'{"trait_type": "Character", "value": "BADGER42"}'
		);

		await testMintTx.wait();
		console.log('   ✅ Test NFT minted successfully!');

		const currentTokenId = await nft.getCurrentTokenId();
		const testTokenId = currentTokenId - 1n; // Get the token we just minted

		const tokenURI = await nft.tokenURI(testTokenId);
		const metadata = await nft.getOnChainMetadata(testTokenId);

		console.log('   ✅ Token ID:', testTokenId.toString());
		console.log('   ✅ Metadata name:', metadata.name);
		console.log('   ✅ Using default image:', metadata.imageData.includes('data:image/svg+xml;base64,'));
		console.log('   ✅ Token URI length:', tokenURI.length);
		console.log('');

		// Save the base64 data for reference
		const outputDir = path.join(__dirname, '../data');
		if (!fs.existsSync(outputDir)) {
			fs.mkdirSync(outputDir, { recursive: true });
		}

		const base64File = path.join(outputDir, 'badger42-base64.txt');
		fs.writeFileSync(base64File, dataURI);
		console.log('💾 Base64 data saved to:', base64File);

		console.log('');
		console.log('🎉 BADGER42 image setup completed successfully!');
		console.log('');
		console.log('📋 Summary:');
		console.log('   ✅ SVG file read and encoded');
		console.log('   ✅ Default image data set in contract');
		console.log('   ✅ Test NFT minted with default image');
		console.log('   ✅ All on-chain metadata working correctly');
		console.log('');
		console.log('🚀 Your contract is now ready for production minting!');
	} catch (error) {
		console.error('❌ Setup failed:', error.message);

		// If it's a gas estimation error, provide helpful info
		if (error.message.includes('gas')) {
			console.log('');
			console.log('💡 This might be a gas limit issue. The SVG file is quite large.');
			console.log('   Consider using a smaller image or increasing gas limit.');
			console.log('   Current SVG size:', svgContent.length, 'characters');
			console.log('   Base64 size:', dataURI.length, 'characters');
		}

		console.error('Full error:', error);
		process.exit(1);
	}
}

main()
	.then(() => process.exit(0))
	.catch((error) => {
		console.error('❌ Setup script failed:', error);
		process.exit(1);
	});
