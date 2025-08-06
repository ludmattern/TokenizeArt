const { ethers, run } = require("hardhat");
require('dotenv').config({ path: '../../.env' });

async function main() {
    console.log("🔍 Verifying contract on Etherscan...\n");

    const contractAddress = process.env.TOKEN_ADDRESS;
    const etherscanApiKey = process.env.ETHERSCAN_API_KEY;
    
    if (!contractAddress) {
        console.error("❌ TOKEN_ADDRESS not found in .env file");
        process.exit(1);
    }
    
    if (!etherscanApiKey) {
        console.error("❌ ETHERSCAN_API_KEY not found in .env file");
        console.error("Please add your Etherscan API key to verify the contract");
        process.exit(1);
    }

    console.log(`📋 Contract Address: ${contractAddress}`);
    console.log(`🔑 Using Etherscan API Key: ${etherscanApiKey.substring(0, 8)}...`);
    
    try {
        console.log("\n⏳ Submitting contract for verification...");
        
        // Verify the contract on Etherscan
        await run("verify:verify", {
            address: contractAddress,
            constructorArguments: [], // MATTERN42NFT constructor has no arguments
            contract: "contracts/MATTERN42NFT.sol:MATTERN42NFT"
        });
        
        console.log("✅ Contract verified successfully on Etherscan!");
        console.log(`🔗 View verified contract: https://sepolia.etherscan.io/address/${contractAddress}#code`);
        
    } catch (error) {
        if (error.message.includes("Already Verified")) {
            console.log("✅ Contract is already verified on Etherscan!");
            console.log(`🔗 View verified contract: https://sepolia.etherscan.io/address/${contractAddress}#code`);
        } else {
            console.error("❌ Verification failed:");
            console.error(error.message);
            
            // Common solutions
            console.log("\n💡 Possible solutions:");
            console.log("1. Wait a few minutes after deployment before verifying");
            console.log("2. Make sure your Etherscan API key is valid");
            console.log("3. Check that the contract address is correct");
            console.log("4. Ensure the contract is deployed on Sepolia network");
            
            process.exit(1);
        }
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
