@echo off
REM Auto-Dock It - Automated Docker Setup Script for Frontend Projects (e.g., Vite, React)
REM Usage: auto-dock.bat <github-repo-url> [port]

setlocal enabledelayedexpansion

REM Default values
set DEFAULT_PORT=3000
set WORK_DIR=%USERPROFILE%\auto-dock-workspace
set LOG_FILE=%WORK_DIR%\auto-dock.log

REM Function to print status
:print_status
echo [INFO] %~1
echo [INFO] %~1 >> "%LOG_FILE%"
goto :eof

:print_success
echo [SUCCESS] %~1
echo [SUCCESS] %~1 >> "%LOG_FILE%"
goto :eof

:print_warning
echo [WARNING] %~1
echo [WARNING] %~1 >> "%LOG_FILE%"
goto :eof

:print_error
echo [ERROR] %~1
echo [ERROR] %~1 >> "%LOG_FILE%"
goto :eof

REM Function to check if command exists
:command_exists
where %1 >nul 2>&1
goto :eof

REM Main execution
if "%~1"=="" (
    echo Usage: %0 ^<github-repo-url^> [port]
    exit /b 1
)

set REPO_URL=%1
if "%~2"=="" (
    set PORT=%DEFAULT_PORT%
) else (
    set PORT=%2
)

REM Extract repo info
for /f "tokens=4,5 delims=/" %%a in ("%REPO_URL%") do (
    set REPO_OWNER=%%a
    set REPO_NAME=%%b
)

set REPO_NAME=%REPO_NAME:.git=%
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

docker info >nul 2>&1
if errorlevel 1 (
    call :print_error "Docker is not running. Start Docker Desktop and try again."
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
    call :print_error "Failed to clone repository. Check the URL or if it's public."
    exit /b 1
)
call :print_success "Repository cloned successfully"

REM Navigate to repo directory
cd /d "%REPO_DIR%"

REM Analyze project type (simple)
call :print_status "Analyzing project structure..."
if exist "package.json" (
    set PROJECT_TYPE=frontend
    call :print_success "Detected frontend project (package.json found)"
) else (
    call :print_warning "Could not find package.json, assuming frontend"
    set PROJECT_TYPE=frontend
)

REM Always regenerate Dockerfile
if exist "Dockerfile" (
    del Dockerfile
)

    call :print_status "Generating Dockerfile for Vite-based frontend app..."

    (
        echo # Auto-generated Dockerfile by Auto-Dock It
        echo.
        echo # Build stage
        echo FROM node:18-alpine AS builder
        echo WORKDIR /app
        echo COPY . .
        echo RUN npm install
        echo RUN npm run build
        echo.
        echo # Production stage
        echo FROM node:18-alpine
        echo WORKDIR /app
        echo RUN npm install -g serve
        echo COPY --from=builder /app/dist ./dist
        echo EXPOSE %PORT%
       echo CMD ^["serve", "-s", "dist", "-l", "%PORT%"^]

    ) > Dockerfile

    call :print_success "Dockerfile generated successfully"
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

REM Stop and remove existing container
set CONTAINER_NAME=auto-dock-%REPO_NAME%
docker ps -q -f name="%CONTAINER_NAME%" >nul 2>&1
if not errorlevel 1 (
    call :print_status "Stopping existing container..."
    docker stop "%CONTAINER_NAME%" >> "%LOG_FILE%" 2>&1
    docker rm "%CONTAINER_NAME%" >> "%LOG_FILE%" 2>&1
    call :print_success "Old container stopped and removed"
)

REM Run new container
call :print_status "Running Docker container..."
docker run -d --name "%CONTAINER_NAME%" -p %PORT%:%PORT% "%IMAGE_NAME%" >> "%LOG_FILE%" 2>&1
if errorlevel 1 (
    call :print_error "Failed to run Docker container"
    exit /b 1
)

call :print_success "Container started successfully"
call :print_success "Application available at: http://localhost:%PORT%"

REM Wait a few seconds
timeout /t 5 /nobreak >nul

REM Final check
docker ps -q -f name="%CONTAINER_NAME%" >nul 2>&1
if errorlevel 1 (
    call :print_error "Container failed to start or exited"
    call :print_error "Showing logs..."
    docker logs "%CONTAINER_NAME%"
    exit /b 1
) else (
    call :print_success "Container is running and healthy"
)

REM Deployment complete
echo.
echo ================================
echo ✅ DEPLOYMENT COMPLETE!
echo ================================
echo Repository: %REPO_URL%
echo Container:  %CONTAINER_NAME%
echo Image:      %IMAGE_NAME%
echo Port:       %PORT%
echo URL:        http://localhost:%PORT%
echo ================================
echo View logs:   docker logs %CONTAINER_NAME%
echo Stop:        docker stop %CONTAINER_NAME%
echo Remove:      docker rm %CONTAINER_NAME%
echo ================================

endlocal
