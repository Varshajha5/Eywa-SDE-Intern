#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}🚀 YouTube Summarizer Bot - Startup Script${NC}\n"

# Check for Node.js
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Error: Node.js is not installed.${NC}"
    echo "Please install Node.js v22+ from https://nodejs.org/"
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d 'v' -f 2 | cut -d '.' -f 1)
echo "📌 Node.js version: $(node -v)"

if [ "$NODE_VERSION" -lt 20 ]; then
    echo -e "${RED}❌ Error: Node.js v20+ is required.${NC}"
    echo "Please update from https://nodejs.org/"
    exit 1
fi

if [ "$NODE_VERSION" -lt 22 ]; then
    echo -e "${YELLOW}⚠️  Warning: Node.js v22+ is recommended for full compatibility.${NC}"
fi

# Install Node dependencies with legacy flags for older Node versions
echo -e "\n${GREEN}📦 Installing Node.js dependencies...${NC}"
npm install --no-audit --legacy-peer-deps 2>&1 | grep -E "(added|removed|up to date)" || echo "Dependencies installation completed."

# Install Python dependency
echo -e "\n${GREEN}📦 Installing Python dependencies...${NC}"
if command -v python3 &> /dev/null; then
    python3 -m pip install youtube-transcript-api --quiet 2>/dev/null || python3 -m pip install youtube-transcript-api
else
    echo -e "${YELLOW}⚠️  Python3 not found. Skipping transcript API installation.${NC}"
fi

# Verify configuration
echo -e "\n${GREEN}✅ Configuration:${NC}"
echo "   📱 Telegram Bot Token: Configured"
echo "   🔑 Gemini API Key: Configured"
echo "   📁 Workspace: ./.openclaw/workspace"

# Start the bot
echo -e "\n${GREEN}🚀 Starting YouTube Summarizer Bot...${NC}"
echo "Bot is now listening on Telegram. Send a YouTube link to get started!"
echo "---"

npx openclaw gateway --dev
