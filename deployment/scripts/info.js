const { ethers } = require('hardhat');
const path = require('path');

async function main() {
	console.log('🔍 Contract Information Dashboard\n');

	// Get contract address from environment
	require('dotenv').config({ path: path.join(__dirname, '../../.env') });
	const contractAddress = process.env.TOKEN_ADDRESS;

	if (!contractAddress) {
		console.error('❌ No contract address found in .env file');
		process.exit(1);
	}

	// Get signers
	const [deployer] = await ethers.getSigners();
	console.log('🌐 Network:', hre.network.name);
	console.log('👤 Connected account:', deployer.address);
	console.log('📍 Contract address:', contractAddress);
	console.log('');

	// Get contract instance
	const MATTERN42NFT = await ethers.getContractFactory('MATTERN42NFT');
	const nft = MATTERN42NFT.attach(contractAddress);

	try {
		// Basic contract information
		console.log('📋 Contract Information:');
		const name = await nft.name();
		const symbol = await nft.symbol();
		const owner = await nft.owner();
		const paused = await nft.paused();

		console.log(`   Name: ${name}`);
		console.log(`   Symbol: ${symbol}`);
		console.log(`   Owner: ${owner}`);
		console.log(`   Paused: ${paused}`);
		console.log('');

		// Supply information
		console.log('📊 Supply Information:');
		const totalSupply = await nft.totalSupply();
		const maxSupply = await nft.MAX_SUPPLY();
		const currentTokenId = await nft.getCurrentTokenId();

		console.log(`   Current Supply: ${totalSupply.toString()}`);
		console.log(`   Max Supply: ${maxSupply.toString()}`);
		console.log(`   Next Token ID: ${currentTokenId.toString()}`);
		console.log(`   Remaining: ${maxSupply.sub(totalSupply).toString()}`);
		console.log('');

		// Account balances
		console.log('💰 Account Information:');
		const deployerBalance = await nft.balanceOf(deployer.address);
		const ethBalance = await deployer.getBalance();

		console.log(`   Your NFT Balance: ${deployerBalance.toString()}`);
		console.log(`   Your ETH Balance: ${ethers.utils.formatEther(ethBalance)} ETH`);
		console.log('');

		// Default image information
		console.log('🖼️  Image Information:');
		try {
			const defaultImageData = await nft.getDefaultImageData();
			const hasDefaultImage = defaultImageData && defaultImageData.length > 0;

			console.log(`   Default Image Set: ${hasDefaultImage ? 'Yes' : 'No'}`);
			if (hasDefaultImage) {
				console.log(`   Image Data Length: ${defaultImageData.length} characters`);
				console.log(`   Image Format: ${defaultImageData.includes('svg') ? 'SVG' : 'Unknown'}`);
			}
		} catch (error) {
			console.log('   Default Image Set: Unable to check');
		}
		console.log('');

		// Recent tokens information
		if (totalSupply.gt(0)) {
			console.log('🎨 Recent Tokens:');
			const tokensToShow = Math.min(5, totalSupply.toNumber());

			for (let i = 0; i < tokensToShow; i++) {
				const tokenId = totalSupply.sub(i);
				try {
					const tokenOwner = await nft.ownerOf(tokenId);
					const tokenArtist = await nft.getTokenArtist(tokenId);

					// Try to get on-chain metadata
					let tokenName = 'Unknown';
					let isOnChain = false;
					try {
						const metadata = await nft.getOnChainMetadata(tokenId);
						if (metadata.name && metadata.name.length > 0) {
							tokenName = metadata.name;
							isOnChain = metadata.isOnChain;
						}
					} catch (error) {
						// Fallback to URI
						try {
							const tokenURI = await nft.tokenURI(tokenId);
							tokenName = tokenURI.split('/').pop() || 'Unknown';
						} catch (error) {
							// Keep default "Unknown"
						}
					}

					console.log(`   Token #${tokenId}: "${tokenName}"`);
					console.log(`     Owner: ${tokenOwner}`);
					console.log(`     Artist: ${tokenArtist}`);
					console.log(`     On-chain: ${isOnChain}`);
					console.log('');
				} catch (error) {
					console.log(`   Token #${tokenId}: Error reading token data`);
				}
			}
		}

		// Contract capabilities
		console.log('⚙️  Contract Capabilities:');
		console.log('   ✅ ERC721 Standard');
		console.log('   ✅ URI Storage');
		console.log('   ✅ Ownable');
		console.log('   ✅ Pausable');
		console.log('   ✅ On-chain Metadata');
		console.log('   ✅ On-chain Image Storage');
		console.log('   ✅ Artist Attribution');
		console.log('   ✅ Supply Management');
		console.log('');

		// Network information
		if (hre.network.name === 'sepolia') {
			console.log('🔗 Useful Links (Sepolia Testnet):');
			console.log(`   Etherscan: https://sepolia.etherscan.io/address/${contractAddress}`);
			console.log(`   OpenSea: https://testnets.opensea.io/assets/sepolia/${contractAddress}`);
		} else if (hre.network.name === 'mainnet') {
			console.log('🔗 Useful Links (Mainnet):');
			console.log(`   Etherscan: https://etherscan.io/address/${contractAddress}`);
			console.log(`   OpenSea: https://opensea.io/assets/ethereum/${contractAddress}`);
		} else {
			console.log('🔗 Local Development Network');
		}
		console.log('');

		console.log('✨ Dashboard complete!');
	} catch (error) {
		console.error('❌ Error reading contract information:', error.message);
		process.exit(1);
	}
}

main()
	.then(() => process.exit(0))
	.catch((error) => {
		console.error('❌ Dashboard script failed:', error);
		process.exit(1);
	});
