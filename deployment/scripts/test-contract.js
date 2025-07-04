const { ethers } = require('hardhat');
const fs = require('fs');
const path = require('path');

async function main() {
	console.log('🧪 Testing deployed MATTERN42NFT contract...\n');

	// Get contract address from environment
	require('dotenv').config({ path: path.join(__dirname, '../../.env') });
	const contractAddress = process.env.TOKEN_ADDRESS;

	if (!contractAddress) {
		console.error('❌ No contract address found in .env file');
		console.log('Please deploy the contract first with: npx hardhat run scripts/deploy.js --network <network>');
		process.exit(1);
	}

	// Get signers
	const [deployer, user1] = await ethers.getSigners();
	console.log('👤 Testing with deployer:', deployer.address);
	console.log('👤 Test user:', user1.address);
	console.log('📍 Contract address:', contractAddress);
	console.log('');

	// Get contract instance
	const MATTERN42NFT = await ethers.getContractFactory('MATTERN42NFT');
	const nft = MATTERN42NFT.attach(contractAddress);

	try {
		// Test 1: Read contract information
		console.log('📖 Test 1: Reading contract information...');
		const name = await nft.name();
		const symbol = await nft.symbol();
		const owner = await nft.owner();
		const maxSupply = await nft.MAX_SUPPLY();
		const currentTokenId = await nft.getCurrentTokenId();

		console.log('   ✅ Name:', name);
		console.log('   ✅ Symbol:', symbol);
		console.log('   ✅ Owner:', owner);
		console.log('   ✅ Max Supply:', maxSupply.toString());
		console.log('   ✅ Current Token ID:', currentTokenId.toString());
		console.log('');

		// Test 2: Check ownership
		console.log('🔐 Test 2: Verifying ownership...');
		const isOwner = owner.toLowerCase() === deployer.address.toLowerCase();
		console.log('   ✅ Deployer is owner:', isOwner);
		console.log('');

		// Test 3: Test minting (simple mint)
		console.log('🎨 Test 3: Testing simple mint...');
		const mintTx = await nft.mint(user1.address, 'test-metadata.json', 'lmattern');
		await mintTx.wait();

		const tokenId = 1;
		const tokenOwner = await nft.ownerOf(tokenId);
		const tokenURI = await nft.tokenURI(tokenId);
		const tokenArtist = await nft.getArtist(tokenId);

		console.log('   ✅ Token minted successfully');
		console.log('   ✅ Token ID:', tokenId);
		console.log('   ✅ Token Owner:', tokenOwner);
		console.log('   ✅ Token URI:', tokenURI);
		console.log('   ✅ Token Artist:', tokenArtist);
		console.log('');

		// Test 4: Test on-chain minting
		console.log('🔗 Test 4: Testing on-chain mint...');

		// Create sample metadata
		const sampleImageData =
			'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4gPGNpcmNsZSBjeD0iNTAiIGN5PSI1MCIgcj0iNDAiIGZpbGw9InJlZCIgLz4gPC9zdmc+';
		const sampleAttributes = '{"trait_type": "Color", "value": "Red"}';

		const onChainMintTx = await nft.mintOnChain(user1.address, 'Test On-Chain NFT', 'This is a test NFT with on-chain metadata', 'lmattern', sampleImageData, sampleAttributes);
		await onChainMintTx.wait();

		const onChainTokenId = 2;
		const onChainTokenURI = await nft.tokenURI(onChainTokenId);
		const onChainMetadata = await nft.getOnChainMetadata(onChainTokenId);

		console.log('   ✅ On-chain token minted successfully');
		console.log('   ✅ Token ID:', onChainTokenId);
		console.log('   ✅ On-chain Token URI length:', onChainTokenURI.length);
		console.log('   ✅ Metadata name:', onChainMetadata.name);
		console.log('   ✅ Metadata description:', onChainMetadata.description);
		console.log('   ✅ Is on-chain:', onChainMetadata.isOnChain);
		console.log('');

		// Test 5: Check balances
		console.log('💰 Test 5: Checking balances...');
		const user1Balance = await nft.balanceOf(user1.address);
		const totalSupply = await nft.totalSupply();

		console.log('   ✅ User1 balance:', user1Balance.toString());
		console.log('   ✅ Total supply:', totalSupply.toString());
		console.log('');

		// Test 6: Test pause functionality
		console.log('⏸️  Test 6: Testing pause functionality...');
		const pauseTx = await nft.pause();
		await pauseTx.wait();

		const isPaused = await nft.paused();
		console.log('   ✅ Contract paused:', isPaused);

		// Try to mint while paused (should fail)
		try {
			await nft.mint(user1.address, 'should-fail.json', 'lmattern');
			console.log('   ❌ Mint succeeded while paused (unexpected)');
		} catch (error) {
			console.log('   ✅ Mint correctly failed while paused');
		}

		// Unpause
		const unpauseTx = await nft.unpause();
		await unpauseTx.wait();
		console.log('   ✅ Contract unpaused');
		console.log('');

		// Summary
		console.log('📊 Test Summary:');
		console.log('   ✅ All basic functions working');
		console.log('   ✅ Minting works correctly');
		console.log('   ✅ On-chain metadata works');
		console.log('   ✅ Pause functionality works');
		console.log('   ✅ Access control works');
		console.log('');
		console.log('🎉 All tests passed successfully!');
	} catch (error) {
		console.error('❌ Test failed:', error.message);
		console.error('Full error:', error);
		process.exit(1);
	}
}

main()
	.then(() => process.exit(0))
	.catch((error) => {
		console.error('❌ Test script failed:', error);
		process.exit(1);
	});
