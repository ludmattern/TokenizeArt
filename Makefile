# MATTERN42 NFT Project Makefile
.PHONY: help setup deploy status verify mint-nft test clean local-node

# Colors
GREEN := \033[0;32m
YELLOW := \033[1;33m
NC := \033[0m

help: ## Show help
	@echo "$(GREEN)MATTERN42 NFT Project$(NC)"
	@echo "$(YELLOW)Commands:$(NC)"
	@awk 'BEGIN {FS = ":.*##"} /^[a-zA-Z_-]+:.*##/ { printf "  $(GREEN)%-15s$(NC) %s\n", $$1, $$2 }' $(MAKEFILE_LIST)

# Development
setup: ## Install dependencies and compile
	@echo "$(GREEN)Setting up NFT project...$(NC)"
	@cd deployment && npm install && npx hardhat compile

test: ## Run tests
	@cd deployment && npx hardhat test

clean: ## Clean artifacts
	@cd deployment && rm -rf cache artifacts node_modules

# Deployment & Management (Sepolia)
deploy: ## Deploy NFT contract on Sepolia
	@cd deployment && node nft-manage.js deploy --network sepolia

status: ## Show NFT deployment status on Sepolia
	@cd deployment && node nft-manage.js status --network sepolia

verify: ## Verify NFT contract on Etherscan
	@cd deployment && node nft-manage.js verify --network sepolia

mint-nft: ## Mint NFT on Sepolia (use: make mint-nft RECIPIENT=0x... URI=ipfs://...)
	@cd deployment && node nft-manage.js mint RECIPIENT=$(RECIPIENT) URI=$(URI) ARTIST=$(or $(ARTIST),lmattern) --network sepolia

# Alternative mint using the mint folder script
mint-single: ## Mint single NFT using mint script (use: make mint-single TO=0x... URI=ipfs://...)
	@cd mint && node mint.js --to $(TO) --uri $(URI) --artist $(or $(ARTIST),lmattern) --network sepolia

mint-batch: ## Batch mint NFTs (use: make mint-batch TO=0x... FOLDER=./metadata)
	@cd mint && node mint.js --batch --to $(TO) --folder $(FOLDER) --artist $(or $(ARTIST),lmattern) --network sepolia

# Local development
local-node: ## Start local Hardhat node
	@cd deployment && npx hardhat node

deploy-local: ## Deploy on local network
	@cd deployment && node nft-manage.js deploy

status-local: ## Show status on local network  
	@cd deployment && node nft-manage.js status