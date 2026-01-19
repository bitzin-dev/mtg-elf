@echo off
echo ===========================================
echo   PORTAL MTG ELF - Dev Launcher (Windows)
echo ===========================================

REM 1. Check and create .env in backend
if not exist "backend\.env" (
    echo [INFO] Creating default backend/.env...
    echo MONGODB_URI=mongodb://localhost:27017 > backend\.env
) else (
    echo [INFO] .env file already exists.
)

REM 2. Start Backend (in new window)
echo [INFO] Starting Backend (Bun)...
start "MTG Backend" cmd /k "cd backend && bun install && bun run dev"

REM 3. Start Frontend (in new window)
echo [INFO] Starting Frontend (Node)...
start "MTG Frontend" cmd /k "cd front-end && npm install && npm run dev"

echo.
echo ===========================================
echo   Servers are starting in separate windows!
echo   Please wait for loading...
echo.
echo   Frontend: http://localhost:5173
echo   Backend:  http://localhost:3000
echo ===========================================
echo.
pause
