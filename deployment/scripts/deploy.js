const { ethers } = require('hardhat');
const fs = require('fs');
const path = require('path');

async function main() {
	console.log('🚀 Starting MATTERN42NFT deployment...\n');

	// Get the deployer account
	const [deployer] = await ethers.getSigners();
	console.log('📋 Deploying contracts with the account:', deployer.address);

	// Check balance
	const balance = await ethers.provider.getBalance(deployer.address);
	console.log('💰 Account balance:', ethers.formatEther(balance), 'ETH\n');

	if (balance < ethers.parseEther('0.01')) {
		console.warn('⚠️  Warning: Low balance. Make sure you have enough ETH for deployment.\n');
	}

	// Contract deployment parameters
	const NFT_NAME = 'MATTERN42 NFT Collection';
	const NFT_SYMBOL = 'M42NFT';
	const BASE_URI = 'https://ipfs.io/ipfs/'; // Fallback URI

	console.log('📝 Contract parameters:');
	console.log('   Name:', NFT_NAME);
	console.log('   Symbol:', NFT_SYMBOL);
	console.log('   Base URI:', BASE_URI);
	console.log('');

	// Get the contract factory
	console.log('📦 Getting contract factory...');
	const MATTERN42NFT = await ethers.getContractFactory('MATTERN42NFT');

	// Deploy the contract
	console.log('🔨 Deploying contract...');
	const nft = await MATTERN42NFT.deploy(NFT_NAME, NFT_SYMBOL, BASE_URI);

	// Wait for deployment
	console.log('⏳ Waiting for deployment confirmation...');
	await nft.waitForDeployment();

	console.log('✅ Contract deployed successfully!');
	console.log('📍 Contract address:', await nft.getAddress());
	console.log('🔗 Transaction hash:', nft.deploymentTransaction().hash);
	console.log('⛽ Gas used:', nft.deploymentTransaction().gasLimit.toString());
	console.log('');

	// Wait for confirmations (adjust based on network)
	console.log('⏳ Waiting for block confirmations...');
	const deploymentTx = nft.deploymentTransaction();
	const confirmations = hre.network.name === 'hardhat' || hre.network.name === 'localhost' ? 1 : 2;
	await deploymentTx.wait(confirmations);
	console.log('✅ Contract confirmed on blockchain\n');

	// Verify contract details
	console.log('🔍 Verifying contract details...');
	const name = await nft.name();
	const symbol = await nft.symbol();
	const owner = await nft.owner();
	const maxSupply = await nft.MAX_SUPPLY();

	console.log('   Contract Name:', name);
	console.log('   Contract Symbol:', symbol);
	console.log('   Owner:', owner);
	console.log('   Max Supply:', maxSupply.toString());
	console.log('');

	// Save deployment information
	const contractAddress = await nft.getAddress();

	const deploymentInfo = {
		network: hre.network.name,
		contractAddress: contractAddress,
		deployerAddress: deployer.address,
		transactionHash: deploymentTx.hash,
		blockNumber: deploymentTx.blockNumber,
		gasUsed: deploymentTx.gasLimit.toString(),
		timestamp: new Date().toISOString(),
		contractDetails: {
			name: name,
			symbol: symbol,
			owner: owner,
			maxSupply: maxSupply.toString(),
			baseURI: BASE_URI,
		},
	};

	// Save to deployment history
	const deploymentDir = path.join(__dirname, '../deployments');
	if (!fs.existsSync(deploymentDir)) {
		fs.mkdirSync(deploymentDir, { recursive: true });
	}

	const deploymentFile = path.join(deploymentDir, `${hre.network.name}-${Date.now()}.json`);
	fs.writeFileSync(deploymentFile, JSON.stringify(deploymentInfo, null, 2));

	// Update .env file with contract address
	const envPath = path.join(__dirname, '../../.env');
	if (fs.existsSync(envPath)) {
		let envContent = fs.readFileSync(envPath, 'utf8');
		envContent = envContent.replace(/TOKEN_ADDRESS=.*/, `TOKEN_ADDRESS=${contractAddress}`);
		fs.writeFileSync(envPath, envContent);
		console.log('📝 Updated .env file with contract address');
	}

	console.log('💾 Deployment info saved to:', deploymentFile);
	console.log('');

	// Display next steps
	console.log('🎉 Deployment completed successfully!');
	console.log('');
	console.log('📋 Next steps:');
	console.log('1. Verify the contract on Etherscan (optional):');
	console.log(`   npx hardhat verify --network ${hre.network.name} ${contractAddress} "${NFT_NAME}" "${NFT_SYMBOL}" "${BASE_URI}"`);
	console.log('');
	console.log('2. Test the contract:');
	console.log(`   npx hardhat run scripts/test-contract.js --network ${hre.network.name}`);
	console.log('');
	console.log('3. Update your frontend with the contract address:');
	console.log(`   Contract Address: ${contractAddress}`);
	console.log('');

	return {
		contract: nft,
		address: contractAddress,
		deploymentInfo,
	};
}

// Error handling
main()
	.then(() => process.exit(0))
	.catch((error) => {
		console.error('❌ Deployment failed:', error);
		process.exit(1);
	});
