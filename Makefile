# MATTERN42 NFT Project Makefile
.PHONY: help setup deploy test clean start-node setup-image info mint serve-website open-website stop-website full-demo export-address

# Colors
GREEN := \033[0;32m
YELLOW := \033[1;33m
BLUE := \033[0;34m
RED := \033[0;31m
NC := \033[0m

# Default target
all: help

help: ## Show help
	@echo "$(GREEN)MATTERN42 NFT Project$(NC)"
	@echo "$(YELLOW)Available Commands:$(NC)"
	@awk 'BEGIN {FS = ":.*##"} /^[a-zA-Z_-]+:.*##/ { printf "  $(GREEN)%-15s$(NC) %s\n", $$1, $$2 }' $(MAKEFILE_LIST)

# Setup
setup: ## Install dependencies and compile contracts
	@echo "$(GREEN)🔧 Setting up project...$(NC)"
	@cd deployment && npm install && npx hardhat compile
	@echo "$(GREEN)✅ Setup complete!$(NC)"

test: ## Run unit tests
	@echo "$(BLUE)🧪 Running tests...$(NC)"
	@cd deployment && npx hardhat test

clean: ## Clean artifacts and cache  
	@echo "$(YELLOW)🧹 Cleaning...$(NC)"
	@cd deployment && rm -rf cache artifacts deployments reports data

# Development

deploy: ## Deploy contract to Sepolia
	@echo "$(GREEN)🚀 Deploying to Sepolia...$(NC)"
	@cd deployment && npx hardhat run scripts/deploy.js --network sepolia
	@make export-address

export-address: ## Export contract address for website
	@echo "$(BLUE)📤 Exporting contract address...$(NC)"
	@cd deployment && npx hardhat run scripts/export-address.js --network sepolia

setup-image: ## Setup image data in contract
	@echo "$(BLUE)🖼️  Setting up image...$(NC)"
	@cd deployment && npx hardhat run scripts/setup-image.js --network sepolia

info: ## Show contract information
	@echo "$(BLUE)📊 Contract info...$(NC)"
	@cd deployment && npx hardhat run scripts/info.js --network sepolia

test-contract: ## Test deployed contract
	@echo "$(BLUE)🧪 Testing contract...$(NC)"
	@cd deployment && npx hardhat run scripts/test-contract.js --network sepolia

mint: ## Mint sample NFTs
	@echo "$(GREEN)🎨 Minting NFTs...$(NC)"
	@cd deployment && npx hardhat run scripts/mint-nfts.js --network sepolia

# Complete workflows
full-sepolia: ## Complete Sepolia workflow
	@echo "$(GREEN)🔄 Complete Sepolia workflow...$(NC)"
	@make setup
	@make deploy  
	@make setup-image
	@make test-contract
	@make mint
	@echo "$(GREEN)🎉 Sepolia workflow complete!$(NC)"

# Website
serve-website: ## Serve website locally
	@echo "$(BLUE)🌐 Starting website server...$(NC)"
	@cd website && python3 -m http.server 8080 || python -m SimpleHTTPServer 8080

open-website: ## Open website in browser
	@echo "$(BLUE)🌐 Opening website...$(NC)"
	@cd website && (python3 -m http.server 8080 & echo $$! > .server.pid) && sleep 2 && xdg-open http://localhost:8080 2>/dev/null || open http://localhost:8080 2>/dev/null || echo "Open http://localhost:8080 in your browser"

stop-website: ## Stop website server
	@echo "$(YELLOW)🛑 Stopping website server...$(NC)"
	@cd website && if [ -f .server.pid ]; then kill `cat .server.pid` 2>/dev/null && rm .server.pid; fi

# Complete workflow with website
full-demo: ## Complete demo with website on Sepolia
	@echo "$(GREEN)🔄 Complete demo workflow...$(NC)"
	@make setup
	@make deploy  
	@make setup-image
	@make test-contract
	@make mint
	@echo "$(GREEN)🌐 Starting website...$(NC)"
	@make open-website
	@echo "$(GREEN)🎉 Demo complete! Website running at http://localhost:8080$(NC)"
	@echo "$(YELLOW)💡 You can now mint NFTs on Sepolia through the web interface!$(NC)"

# Additional Sepolia commands
verify: ## Verify contract on Etherscan
	@echo "$(BLUE)✅ Verifying on Etherscan...$(NC)"
	@cd deployment && npx hardhat verify --network sepolia $$(grep 'TOKEN_ADDRESS=' ../.env | cut -d'=' -f2)