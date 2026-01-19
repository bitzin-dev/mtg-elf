#!/bin/bash

# Define colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}===========================================${NC}"
echo -e "${BLUE}  PORTAL MTG ELF - Dev Launcher (Linux/Mac)${NC}"
echo -e "${BLUE}===========================================${NC}"

# 1. Check and create .env in backend
if [ ! -f "backend/.env" ]; then
    echo -e "${GREEN}[INFO] Creating default backend/.env...${NC}"
    echo "MONGODB_URI=mongodb://localhost:27017" > backend/.env
else
    echo -e "${GREEN}[INFO] .env file already exists.${NC}"
fi

# Function to handle script exit
cleanup() {
    echo -e "${BLUE}[INFO] Stopping servers...${NC}"
    kill $(jobs -p) 2>/dev/null
}
trap cleanup EXIT INT

# 2. Start Backend
echo -e "${GREEN}[INFO] Starting Backend (Bun)...${NC}"
(cd backend && bun install && bun run dev) &
BACKEND_PID=$!

# 3. Start Frontend
echo -e "${GREEN}[INFO] Starting Frontend (Node)...${NC}"
(cd front-end && npm install && npm run dev) &
FRONTEND_PID=$!

echo -e "\n${BLUE}===========================================${NC}"
echo -e "  Servers are starting..."
echo -e "  Frontend: http://localhost:5173"
echo -e "  Backend:  http://localhost:3000"
echo -e "  Press Ctrl+C to stop both servers."
echo -e "${BLUE}===========================================${NC}\n"

# Wait for both processes
wait $BACKEND_PID $FRONTEND_PID
