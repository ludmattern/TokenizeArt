# MATTERN42 NFT - Professional Makefile
# Usage: make <command>

.PHONY: help install deploy start stop clean test status

# Default target
help:
	@echo "🦡 MATTERN42 NFT - Available Commands:"
	@echo ""
	@echo "📦 Setup & Installation:"
	@echo "  make install     - Install all dependencies"
	@echo "  make clean       - Clean node_modules and artifacts"
	@echo ""
	@echo "🚀 Smart Contract:"
	@echo "  make deploy      - Deploy contract to Sepolia testnet"
	@echo "  make compile     - Compile smart contracts"
	@echo ""
	@echo "🌐 Web Application:"
	@echo "  make start       - Start production server"
	@echo "  make stop        - Stop all running servers"
	@echo ""
	@echo "📊 Utilities:"
	@echo "  make status      - Show project status"
	@echo "  make logs        - Show server logs"
	@echo ""

# Install all dependencies
install:
	@echo "📦 Installing deployment dependencies..."
	cd deployment && npm install
	@echo "📦 Installing website dependencies..."
	cd website && npm install
	@echo "✅ All dependencies installed!"

# Deploy smart contract
deploy:
	@echo "🚀 Deploying MATTERN42 NFT contract to Sepolia..."
	cd deployment && npx hardhat run scripts/deploy.js --network sepolia

# Compile contracts
compile:
	@echo "⚡ Compiling smart contracts..."
	cd deployment && npx hardhat compile

# Start production server
start:
	@echo "🌐 Starting MATTERN42 NFT server..."
	@echo "📱 Open http://localhost:3000 in your browser"
	cd website && node server.js

# Stop all Node.js processes (be careful!)
stop:
	@echo "🛑 Stopping all Node.js servers..."
	pkill -f "node.*server.js" || echo "No servers running"
	pkill -f "nodemon.*server.js" || echo "No dev servers running"

# Clean all node_modules and build artifacts
clean:
	@echo "🧹 Cleaning project..."
	rm -rf deployment/node_modules
	rm -rf deployment/artifacts
	rm -rf deployment/cache
	rm -rf website/node_modules
	@echo "✅ Project cleaned!"

# Show project status
status:
	@echo "📊 MATTERN42 NFT Project Status:"
	@echo ""
	@echo "📁 Project Structure:"
	@ls -la | grep -E "(deployment|website|mint|code)"
	@echo ""
	@echo "📋 Environment Variables:"
	@if [ -f .env ]; then \
		echo "✅ .env file exists"; \
		grep -E "(TOKEN_ADDRESS|PINATA_API_KEY)" .env | sed 's/=.*/=***/' || echo "⚠️  Some variables missing"; \
	else \
		echo "❌ .env file not found"; \
	fi
	@echo ""
	@echo "🔗 Contract Address:"
	@if [ -f .env ]; then \
		grep "TOKEN_ADDRESS" .env | cut -d= -f2 || echo "❌ Not deployed yet"; \
	else \
		echo "❌ .env not found"; \
	fi
	@echo ""
	@echo "🌐 Server Status:"
	@pgrep -f "node.*server.js" > /dev/null && echo "✅ Server running (PID: $$(pgrep -f 'node.*server.js'))" || echo "❌ Server not running"

# Show server logs (if running in background)
logs:
	@echo "📋 Server Logs:"
	@if pgrep -f "node.*server.js" > /dev/null; then \
		echo "✅ Server is running"; \
	else \
		echo "❌ No server running. Use 'make start' or 'make dev'"; \
	fi

# Quick development setup
setup: install compile
	@echo ""
	@echo "🎉 MATTERN42 NFT setup complete!"
	@echo ""
	@echo "Next steps:"
	@echo "1. Configure your .env file with:"
	@echo "   - PRIVATE_KEY (your wallet private key)"
	@echo "   - INFURA_API_KEY (for Sepolia network)"
	@echo "   - PINATA_API_KEY & PINATA_SECRET (for IPFS)"
	@echo ""
	@echo "2. Deploy contract: make deploy"
	@echo "3. Start server: make start"
	@echo ""

# Quick start for development
quickstart: setup deploy start
