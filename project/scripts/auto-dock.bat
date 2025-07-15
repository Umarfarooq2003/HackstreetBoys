@echo off
REM Auto-Dock It - Automated Docker Setup Script for Windows
REM Usage: auto-dock.bat <github-repo-url> [port]

setlocal enabledelayedexpansion

REM Default values
set DEFAULT_PORT=3000
set WORK_DIR=%USERPROFILE%\auto-dock-workspace
set LOG_FILE=%WORK_DIR%\auto-dock.log

REM Colors (limited in batch)
set RED=[91m
set GREEN=[92m
set YELLOW=[93m
set BLUE=[94m
set NC=[0m

REM Function to print status
:print_status
echo %BLUE%[INFO]%NC% %~1
echo [INFO] %~1 >> "%LOG_FILE%"
goto :eof

:print_success
echo %GREEN%[SUCCESS]%NC% %~1
echo [SUCCESS] %~1 >> "%LOG_FILE%"
goto :eof

:print_warning
echo %YELLOW%[WARNING]%NC% %~1
echo [WARNING] %~1 >> "%LOG_FILE%"
goto :eof

:print_error
echo %RED%[ERROR]%NC% %~1
echo [ERROR] %~1 >> "%LOG_FILE%"
goto :eof

REM Function to check if command exists
:command_exists
where %1 >nul 2>&1
goto :eof

REM Main execution
if "%~1"=="" (
    echo Usage: %0 ^<github-repo-url^> [port]
    echo Example: %0 https://github.com/user/repo 3000
    exit /b 1
)

set REPO_URL=%1
if "%~2"=="" (
    set PORT=%DEFAULT_PORT%
) else (
    set PORT=%2
)

echo 🐳 Auto-Dock It - Automated Docker Setup
echo ========================================

REM Extract repo info
for /f "tokens=4,5 delims=/" %%a in ("%REPO_URL%") do (
    set REPO_OWNER=%%a
    set REPO_NAME=%%b
)

set REPO_DIR=%WORK_DIR%\%REPO_NAME%

REM Check prerequisites
call :print_status "Checking prerequisites..."

call :command_exists git
if errorlevel 1 (
    call :print_error "Git is not installed or not in PATH"
    exit /b 1
)

call :command_exists docker
if errorlevel 1 (
    call :print_error "Docker is not installed or not in PATH"
    exit /b 1
)

call :command_exists node
if errorlevel 1 (
    call :print_error "Node.js is not installed or not in PATH"
    exit /b 1
)

call :command_exists npm
if errorlevel 1 (
    call :print_error "npm is not installed or not in PATH"
    exit /b 1
)

REM Check if Docker is running
docker info >nul 2>&1
if errorlevel 1 (
    call :print_error "Docker is not running. Please start Docker and try again."
    exit /b 1
)

call :print_success "All prerequisites are met"

REM Setup workspace
call :print_status "Setting up workspace..."
if not exist "%WORK_DIR%" mkdir "%WORK_DIR%"
echo Auto-Dock It Log - %date% %time% > "%LOG_FILE%"
call :print_success "Workspace ready at %WORK_DIR%"

REM Clone repository
call :print_status "Cloning repository: %REPO_URL%"
if exist "%REPO_DIR%" (
    call :print_warning "Directory %REPO_DIR% already exists. Removing..."
    rmdir /s /q "%REPO_DIR%"
)

git clone "%REPO_URL%" "%REPO_DIR%" >> "%LOG_FILE%" 2>&1
if errorlevel 1 (
    call :print_error "Failed to clone repository. Check if the URL is correct and the repository is public."
    exit /b 1
)
call :print_success "Repository cloned successfully"

REM Navigate to repo directory
cd /d "%REPO_DIR%"

REM Analyze project
call :print_status "Analyzing project structure..."
if exist "package.json" (
    set PROJECT_TYPE=nodejs
    call :print_success "Detected Node.js project"
) else (
    call :print_warning "Could not determine project type. Assuming Node.js..."
    set PROJECT_TYPE=nodejs
)

REM Generate Dockerfile if not exists
if not exist "Dockerfile" (
    call :print_status "Generating Dockerfile for Node.js project..."
    
    (
        echo # Auto-generated Dockerfile by Auto-Dock It
        echo FROM node:18-alpine
        echo.
        echo # Set working directory
        echo WORKDIR /app
        echo.
        echo # Install serve globally for production serving
        echo RUN npm install -g serve
        echo.
        echo # Copy package files
        echo COPY package*.json ./
        echo.
        echo # Install all dependencies ^(including devDependencies for build^)
        echo RUN npm ci
        echo.
        echo # Copy source code
        echo COPY . .
        echo.
        echo # Build the application ^(if package.json has build script^)
        echo RUN npm run build 2^>nul ^|^| echo "No build script found"
        echo.
        echo # Expose port
        echo EXPOSE %PORT%
        echo.
        echo # Create a non-root user
        echo RUN addgroup -g 1001 -S nodejs
        echo RUN adduser -S nextjs -u 1001
        echo USER nextjs
        echo.
        echo # Add health check
        echo HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
        echo     CMD wget --no-verbose --tries=1 --spider http://localhost:%PORT% ^|^| exit 1
        echo.
        echo # Start the application ^(try serve for built apps, fallback to npm start^)
        echo CMD ["sh", "-c", "if [ -d 'build' ]; then serve -s build -l %PORT%; else HOST=0.0.0.0 PORT=%PORT% npm start; fi"]
    ) > Dockerfile
    
    call :print_success "Dockerfile generated successfully"
    
    REM Generate docker-compose.yml
    call :print_status "Generating docker-compose.yml..."
    (
        echo version: '3.8'
        echo.
        echo services:
        echo   app:
        echo     build: .
        echo     ports:
        echo       - "%PORT%:%PORT%"
        echo     environment:
        echo       - NODE_ENV=production
        echo       - PORT=%PORT%
        echo     restart: unless-stopped
        echo     healthcheck:
        echo       test: ["CMD", "curl", "-f", "http://localhost:%PORT%"]
        echo       interval: 30s
        echo       timeout: 10s
        echo       retries: 3
        echo       start_period: 40s
    ) > docker-compose.yml
    
    call :print_success "docker-compose.yml generated successfully"
) else (
    call :print_status "Dockerfile already exists, using existing configuration"
)

REM Build Docker image
call :print_status "Building Docker image..."
set IMAGE_NAME=auto-dock-%REPO_NAME%
docker build -t "%IMAGE_NAME%" . >> "%LOG_FILE%" 2>&1
if errorlevel 1 (
    call :print_error "Failed to build Docker image. Check the log file: %LOG_FILE%"
    exit /b 1
)
call :print_success "Docker image built successfully: %IMAGE_NAME%"

REM Stop existing container
set CONTAINER_NAME=auto-dock-%REPO_NAME%
docker ps -q -f name="%CONTAINER_NAME%" >nul 2>&1
if not errorlevel 1 (
    call :print_status "Stopping existing container..."
    docker stop "%CONTAINER_NAME%" >> "%LOG_FILE%" 2>&1
    docker rm "%CONTAINER_NAME%" >> "%LOG_FILE%" 2>&1
    call :print_success "Existing container stopped and removed"
)

REM Run Docker container
call :print_status "Running Docker container..."
docker run -d --name "%CONTAINER_NAME%" -p %PORT%:%PORT% -e NODE_ENV=production -e PORT=%PORT% "%IMAGE_NAME%" >> "%LOG_FILE%" 2>&1
if errorlevel 1 (
    call :print_error "Failed to run Docker container"
    exit /b 1
)

call :print_success "Container started successfully"
call :print_success "Application should be available at: http://localhost:%PORT%"

REM Wait for container to start
timeout /t 5 /nobreak >nul

REM Check if container is running
docker ps -q -f name="%CONTAINER_NAME%" >nul 2>&1
if errorlevel 1 (
    call :print_error "Container failed to start or exited immediately"
    call :print_error "Container logs:"
    docker logs "%CONTAINER_NAME%"
    exit /b 1
) else (
    call :print_success "Container is running healthy"
)

REM Show summary
echo.
echo ==================================
echo 🚀 AUTO-DOCK IT - DEPLOYMENT COMPLETE
echo ==================================
echo.
echo Repository: %REPO_URL%
echo Project Type: %PROJECT_TYPE%
echo Container Name: %CONTAINER_NAME%
echo Image Name: %IMAGE_NAME%
echo Port: %PORT%
echo.
echo 🌐 Application URL: http://localhost:%PORT%
echo.
echo 📋 Useful Commands:
echo   View logs:      docker logs %CONTAINER_NAME%
echo   Stop container: docker stop %CONTAINER_NAME%
echo   Remove container: docker rm %CONTAINER_NAME%
echo   Remove image:   docker rmi %IMAGE_NAME%
echo.
echo 📁 Project files: %REPO_DIR%
echo 📄 Log file: %LOG_FILE%
echo.
echo ==================================

endlocal