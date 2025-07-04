const { ethers } = require('hardhat');
const fs = require('fs');
const path = require('path');

async function main() {
	console.log('🎨 Minting MATTERN42 NFTs...\n');

	// Get contract address from environment
	require('dotenv').config({ path: path.join(__dirname, '../../.env') });
	const contractAddress = process.env.TOKEN_ADDRESS;

	if (!contractAddress) {
		console.error('❌ No contract address found in .env file');
		process.exit(1);
	}

	// Get signers
	const [deployer] = await ethers.getSigners();
	console.log('👤 Minting with account:', deployer.address);
	console.log('📍 Contract address:', contractAddress);
	console.log('');

	// Get contract instance
	const MATTERN42NFT = await ethers.getContractFactory('MATTERN42NFT');
	const nft = MATTERN42NFT.attach(contractAddress);

	// Check ownership
	const owner = await nft.owner();
	if (owner.toLowerCase() !== deployer.address.toLowerCase()) {
		console.error('❌ You are not the owner of this contract');
		process.exit(1);
	}

	try {
		// Get current state
		const totalSupply = await nft.totalSupply();
		const maxSupply = await nft.MAX_SUPPLY();
		console.log('📊 Current supply:', totalSupply.toString());
		console.log('📊 Max supply:', maxSupply.toString());
		console.log('');

		// Define recipients and their NFTs
		const mintsToPerform = [
			{
				to: deployer.address,
				name: 'MATTERN42 Genesis #1',
				description:
					'The first MATTERN42 NFT with the iconic BADGER42 character. This NFT represents the beginning of the MATTERN42 collection with fully on-chain metadata and image storage.',
				artist: 'lmattern',
				attributes:
					'{"traits": [{"trait_type": "Type", "value": "Genesis"}, {"trait_type": "Character", "value": "BADGER42"}, {"trait_type": "Rarity", "value": "Legendary"}, {"trait_type": "Edition", "value": "1/4242"}]}',
			},
			{
				to: deployer.address,
				name: 'MATTERN42 Founder Edition',
				description: 'A special founder edition of the MATTERN42 collection. Features the original BADGER42 artwork with enhanced metadata for early supporters.',
				artist: 'lmattern',
				attributes:
					'{"traits": [{"trait_type": "Type", "value": "Founder"}, {"trait_type": "Character", "value": "BADGER42"}, {"trait_type": "Rarity", "value": "Epic"}, {"trait_type": "Background", "value": "Original"}]}',
			},
			{
				to: deployer.address,
				name: 'MATTERN42 Developer Special',
				description: 'A unique NFT created during the development phase. Showcases the full capabilities of on-chain metadata storage and the BADGER42 character design.',
				artist: 'lmattern',
				attributes:
					'{"traits": [{"trait_type": "Type", "value": "Developer"}, {"trait_type": "Character", "value": "BADGER42"}, {"trait_type": "Rarity", "value": "Rare"}, {"trait_type": "Phase", "value": "Development"}]}',
			},
		];

		console.log('🚀 Starting minting process...');
		console.log('');

		for (let i = 0; i < mintsToPerform.length; i++) {
			const mintData = mintsToPerform[i];

			console.log(`🎨 Minting NFT ${i + 1}/${mintsToPerform.length}:`);
			console.log(`   📝 Name: ${mintData.name}`);
			console.log(`   👤 Recipient: ${mintData.to}`);
			console.log(`   🎭 Artist: ${mintData.artist}`);

			// Mint with on-chain metadata (empty imageData to use default BADGER42)
			const mintTx = await nft.mintOnChain(
				mintData.to,
				mintData.name,
				mintData.description,
				mintData.artist,
				'', // Use default BADGER42 image
				mintData.attributes
			);

			console.log(`   ⏳ Transaction sent: ${mintTx.hash}`);
			await mintTx.wait();

			const currentTokenId = await nft.getCurrentTokenId();
			const tokenId = currentTokenId - 1n;

			console.log(`   ✅ Minted Token ID: ${tokenId.toString()}`);

			// Verify the mint
			const tokenOwner = await nft.ownerOf(tokenId);
			const tokenURI = await nft.tokenURI(tokenId);
			const metadata = await nft.getOnChainMetadata(tokenId);

			console.log(`   ✅ Owner: ${tokenOwner}`);
			console.log(`   ✅ Metadata stored on-chain: ${metadata.isOnChain}`);
			console.log(`   ✅ Using default image: ${metadata.imageData.includes('BADGER42') || metadata.imageData.includes('data:image/svg')}`);
			console.log('');

			// Small delay between mints
			if (i < mintsToPerform.length - 1) {
				console.log('   ⏳ Waiting before next mint...');
				await new Promise((resolve) => setTimeout(resolve, 2000));
			}
		}

		// Final statistics
		const finalSupply = await nft.totalSupply();
		const deployerBalance = await nft.balanceOf(deployer.address);

		console.log('📊 Minting completed!');
		console.log('');
		console.log('📈 Final Statistics:');
		console.log(`   🎯 Total Supply: ${finalSupply.toString()}`);
		console.log(`   👤 Deployer Balance: ${deployerBalance.toString()}`);
		console.log(`   📍 Contract Address: ${contractAddress}`);
		console.log('');

		// Save minting report
		const reportDir = path.join(__dirname, '../reports');
		if (!fs.existsSync(reportDir)) {
			fs.mkdirSync(reportDir, { recursive: true });
		}

		const mintingReport = {
			timestamp: new Date().toISOString(),
			network: hre.network.name,
			contractAddress: contractAddress,
			minter: deployer.address,
			totalMinted: mintsToPerform.length,
			finalSupply: finalSupply.toString(),
			maxSupply: maxSupply.toString(),
			nftsMinted: mintsToPerform.map((mint, index) => ({
				tokenId: (Number(finalSupply) - mintsToPerform.length + index + 1).toString(),
				name: mint.name,
				recipient: mint.to,
				artist: mint.artist,
			})),
		};

		const reportFile = path.join(reportDir, `minting-report-${Date.now()}.json`);
		fs.writeFileSync(reportFile, JSON.stringify(mintingReport, null, 2));
		console.log('💾 Minting report saved to:', reportFile);
		console.log('');

		console.log('🎉 All NFTs minted successfully!');
		console.log('');
		console.log('🔗 You can now:');
		console.log('1. View your NFTs on OpenSea (testnet)');
		console.log('2. Test the website interface');
		console.log('3. Verify contract on Etherscan');
		console.log('');
	} catch (error) {
		console.error('❌ Minting failed:', error.message);
		console.error('Full error:', error);
		process.exit(1);
	}
}

main()
	.then(() => process.exit(0))
	.catch((error) => {
		console.error('❌ Minting script failed:', error);
		process.exit(1);
	});
