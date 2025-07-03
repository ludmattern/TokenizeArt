require('@nomicfoundation/hardhat-toolbox');
require('dotenv').config();

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
	solidity: {
		version: '0.8.19',
		settings: {
			optimizer: {
				enabled: true,
				runs: 200,
			},
		},
	},
	networks: {
		hardhat: {
			chainId: 31337,
		},
		sepolia: {
			url: `https://sepolia.infura.io/v3/${process.env.INFURA_API_KEY}`,
			accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
			chainId: 11155111,
			timeout: 120000,
			gasPrice: process.env.GAS_PRICE ? parseInt(process.env.GAS_PRICE) * 1000000000 : undefined, // Convert gwei to wei
			gas: process.env.GAS_LIMIT ? parseInt(process.env.GAS_LIMIT) : undefined,
			maxFeePerGas: process.env.MAX_FEE_PER_GAS ? parseInt(process.env.MAX_FEE_PER_GAS) * 1000000000 : undefined,
			maxPriorityFeePerGas: process.env.MAX_PRIORITY_FEE_PER_GAS ? parseInt(process.env.MAX_PRIORITY_FEE_PER_GAS) * 1000000000 : undefined,
		},
	},
	etherscan: {
		apiKey: process.env.ETHERSCAN_API_KEY,
	},
	gasReporter: {
		enabled: process.env.REPORT_GAS === 'true',
		currency: 'USD',
	},
	paths: {
		sources: './contracts',
		tests: './test',
		cache: './cache',
		artifacts: './artifacts',
	},
};
