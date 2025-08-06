.PHONY: help install compile deploy verify start stop clean status setup quickstart

# Default target
help:
	@echo "TokenizeArt - MATTERN42 NFT Collection"
	@echo "========================================"
	@echo "Available commands:"
	@echo ""
	@echo "  setup     - Install dependencies and compile contracts"
	@echo "  compile   - Compile smart contracts"
	@echo "  deploy    - Deploy contract to Sepolia testnet"
	@echo "  verify    - Verify contract source code on Etherscan"
	@echo "  start     - Start production server"
	@echo "  stop      - Stop all running servers"
	@echo "  clean     - Clean build artifacts"
	@echo "  status    - Show project overview"
	@echo "  install   - Install all dependencies"
	@echo ""
	@echo "Quick commands:"
	@echo "  quickstart - Complete setup: install → compile → deploy → start"
	@echo ""

# Install all dependencies
install:
	@echo "Installing deployment dependencies..."
	cd deployment && npm install
	@echo "Installing Etherscan verification plugin..."
	cd deployment && npm install --save-dev @nomicfoundation/hardhat-verify
	@echo "Installing website dependencies..."
	cd website && npm install
	@echo "All dependencies installed!"

# Compile contracts
compile:
	@echo "Compiling smart contracts..."
	cd deployment && npx hardhat compile

# Deploy contract to Sepolia testnet
deploy:
	@echo "Deploying contract to Sepolia..."
	cd deployment && npx hardhat run scripts/deploy.js --network sepolia

# Verify contract source code on Etherscan
verify:
	@echo "Verifying contract on Etherscan..."
	cd deployment && npx hardhat run scripts/verify.js --network sepolia

# Start production server
start:
	@echo "Starting MATTERN42 NFT server..."
	@echo "Open http://localhost:3000 in your browser"
	cd website && node server.js

# Stop all Node.js servers
stop:
	@echo "Stopping all Node.js servers..."
	pkill -f "node.*server.js" || echo "No servers running"
	pkill -f "nodemon.*server.js" || echo "No dev servers running"

# Clean all build artifacts and dependencies
clean:
	@echo "🧹 Cleaning project..."
	rm -rf deployment/node_modules
	rm -rf deployment/artifacts
	rm -rf deployment/cache
	rm -rf website/node_modules
	@echo "Project cleaned!"

# Show project status
status:
	@echo "MATTERN42 NFT Project Status:"
	@echo ""
	@echo "Project Structure:"
	@ls -la | grep -E "(deployment|website|mint|code|documentation)" || echo "Missing directories"
	@echo ""
	@echo "Environment Variables:"
	@if [ -f .env ]; then \
		echo ".env file exists"; \
		if grep -q "TOKEN_ADDRESS=." .env; then \
			echo "Contract deployed"; \
		else \
			echo "Contract not deployed yet"; \
		fi; \
	else \
		echo ".env file not found"; \
	fi
	@echo ""
	@echo "Server Status:"
	@pgrep -f "node.*server.js" > /dev/null && echo "Server running (PID: $$(pgrep -f 'node.*server.js'))" || echo "Server not running"

# Complete project setup
setup: clean install compile
	@echo ""
	@echo "MATTERN42 NFT setup complete!"
	@echo ""
	@echo "Next steps:"
	@echo "1. Deploy contract: make deploy"
	@echo "2. Verify on Etherscan: make etherscan-verify"
	@echo "3. Start server: make start"
	@echo ""

# Complete flow from setup to running
quickstart: setup deploy verify start
