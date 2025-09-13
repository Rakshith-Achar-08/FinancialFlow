@echo off
echo Starting Financial Transparency Platform...
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo Error: Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

REM Check if Docker is running
docker --version >nul 2>&1
if %errorlevel% neq 0 (
    echo Warning: Docker is not available. You can still run manually.
    echo.
    goto :manual_start
)

echo Docker detected. Choose startup method:
echo 1. Docker Compose (Recommended)
echo 2. Manual startup
echo 3. Exit
set /p choice="Enter your choice (1-3): "

if "%choice%"=="1" goto :docker_start
if "%choice%"=="2" goto :manual_start
if "%choice%"=="3" exit /b 0
goto :start

:docker_start
echo.
echo Starting with Docker Compose...
echo This will start PostgreSQL, Backend, and Frontend services.
echo.
docker-compose up -d
if %errorlevel% equ 0 (
    echo.
    echo ✅ Services started successfully!
    echo.
    echo 🌐 Frontend: http://localhost:3000
    echo 🔧 Backend API: http://localhost:5000
    echo 📊 Public Dashboard: http://localhost:3000/public
    echo.
    echo To stop services, run: docker-compose down
) else (
    echo ❌ Failed to start services with Docker
    echo Falling back to manual startup...
    goto :manual_start
)
goto :end

:manual_start
echo.
echo Starting manually...
echo.

REM Create .env file if it doesn't exist
if not exist "backend\.env" (
    echo Creating backend .env file...
    copy "backend\.env.example" "backend\.env"
    echo ⚠️  Please edit backend\.env with your database credentials
)

echo Installing backend dependencies...
cd backend
call npm install
if %errorlevel% neq 0 (
    echo ❌ Failed to install backend dependencies
    pause
    exit /b 1
)

echo.
echo Installing frontend dependencies...
cd ..\frontend
call npm install
if %errorlevel% neq 0 (
    echo ❌ Failed to install frontend dependencies
    pause
    exit /b 1
)

echo.
echo ✅ Dependencies installed successfully!
echo.
echo To start the application:
echo 1. Start PostgreSQL database
echo 2. Run 'npm start' in the backend folder
echo 3. Run 'npm start' in the frontend folder
echo.
echo 🌐 Frontend will be available at: http://localhost:3000
echo 🔧 Backend API will be available at: http://localhost:5000

:end
echo.
echo Press any key to exit...
pause >nul
