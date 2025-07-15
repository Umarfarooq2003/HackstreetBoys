#!/bin/bash

# Auto-Dock It - Automated Docker Setup Script
# Usage: ./auto-dock.sh <github-repo-url> [port]

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Default values
DEFAULT_PORT=3000
WORK_DIR="$HOME/auto-dock-workspace"
LOG_FILE="$WORK_DIR/auto-dock.log"

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1" | tee -a "$LOG_FILE"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1" | tee -a "$LOG_FILE"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1" | tee -a "$LOG_FILE"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1" | tee -a "$LOG_FILE"
}

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to validate GitHub URL
validate_github_url() {
    local url=$1
    if [[ ! $url =~ ^https://github\.com/[^/]+/[^/]+/?$ ]]; then
        print_error "Invalid GitHub URL format. Expected: https://github.com/username/repository"
        exit 1
    fi
}

# Function to extract repo info from URL
extract_repo_info() {
    local url=$1
    # Remove trailing slash and .git if present
    url=$(echo "$url" | sed 's/\/$//g' | sed 's/\.git$//g')
    
    # Extract owner and repo name
    REPO_OWNER=$(echo "$url" | sed 's/.*github\.com\///g' | cut -d'/' -f1)
    REPO_NAME=$(echo "$url" | sed 's/.*github\.com\///g' | cut -d'/' -f2)
    REPO_DIR="$WORK_DIR/$REPO_NAME"
}

# Function to check prerequisites
check_prerequisites() {
    print_status "Checking prerequisites..."
    
    local missing_tools=()
    
    if ! command_exists git; then
        missing_tools+=("git")
    fi
    
    if ! command_exists docker; then
        missing_tools+=("docker")
    fi
    
    if ! command_exists node; then
        missing_tools+=("node")
    fi
    
    if ! command_exists npm; then
        missing_tools+=("npm")
    fi
    
    if [ ${#missing_tools[@]} -ne 0 ]; then
        print_error "Missing required tools: ${missing_tools[*]}"
        print_error "Please install the missing tools and try again."
        exit 1
    fi
    
    # Check if Docker is running
    if ! docker info >/dev/null 2>&1; then
        print_error "Docker is not running. Please start Docker and try again."
        exit 1
    fi
    
    print_success "All prerequisites are met"
}

# Function to setup workspace
setup_workspace() {
    print_status "Setting up workspace..."
    
    # Create workspace directory if it doesn't exist
    mkdir -p "$WORK_DIR"
    
    # Initialize log file
    echo "Auto-Dock It Log - $(date)" > "$LOG_FILE"
    
    print_success "Workspace ready at $WORK_DIR"
}

# Function to clone repository
clone_repository() {
    local repo_url=$1
    
    print_status "Cloning repository: $repo_url"
    
    # Remove existing directory if it exists
    if [ -d "$REPO_DIR" ]; then
        print_warning "Directory $REPO_DIR already exists. Removing..."
        rm -rf "$REPO_DIR"
    fi
    
    # Clone the repository
    if git clone "$repo_url" "$REPO_DIR" >> "$LOG_FILE" 2>&1; then
        print_success "Repository cloned successfully"
    else
        print_error "Failed to clone repository. Check if the URL is correct and the repository is public."
        exit 1
    fi
}

# Function to analyze project structure
analyze_project() {
    print_status "Analyzing project structure..."
    
    cd "$REPO_DIR"
    
    # Check for package.json (Node.js project)
    if [ -f "package.json" ]; then
        PROJECT_TYPE="nodejs"
        print_success "Detected Node.js project"
        
        # Extract start script and dependencies
        if command_exists jq; then
            START_SCRIPT=$(jq -r '.scripts.start // "node index.js"' package.json)
            BUILD_SCRIPT=$(jq -r '.scripts.build // ""' package.json)
            DEV_SCRIPT=$(jq -r '.scripts.dev // ""' package.json)
        else
            START_SCRIPT="npm start"
            BUILD_SCRIPT="npm run build"
            DEV_SCRIPT="npm run dev"
        fi
        
        return 0
    fi
    
    # Check for other project types
    if [ -f "requirements.txt" ] || [ -f "setup.py" ]; then
        PROJECT_TYPE="python"
        print_success "Detected Python project"
        return 0
    fi
    
    if [ -f "pom.xml" ]; then
        PROJECT_TYPE="java"
        print_success "Detected Java project"
        return 0
    fi
    
    if [ -f "go.mod" ]; then
        PROJECT_TYPE="go"
        print_success "Detected Go project"
        return 0
    fi
    
    print_warning "Could not determine project type. Assuming Node.js..."
    PROJECT_TYPE="nodejs"
}

# Function to generate Dockerfile for Node.js
generate_nodejs_dockerfile() {
    print_status "Generating Dockerfile for Node.js project..."
    
    # Determine Node.js version
    local node_version="18"
    if [ -f ".nvmrc" ]; then
        node_version=$(cat .nvmrc | tr -d 'v')
    elif [ -f "package.json" ] && command_exists jq; then
        local engines_node=$(jq -r '.engines.node // ""' package.json)
        if [ "$engines_node" != "" ]; then
            node_version=$(echo "$engines_node" | sed 's/[^0-9.]//g' | cut -d'.' -f1)
        fi
    fi
    
    # Determine if it's a build-required project (React, Vue, etc.)
    local needs_build=false
    if [ -f "package.json" ]; then
        if grep -q "react\|vue\|angular\|vite\|webpack\|next" package.json; then
            needs_build=true
        fi
    fi
    
    # Generate Dockerfile
    cat > Dockerfile << EOF
# Auto-generated Dockerfile by Auto-Dock It
FROM node:${node_version}-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

EOF

    # Add build step if needed
    if [ "$needs_build" = true ] && [ "$BUILD_SCRIPT" != "" ] && [ "$BUILD_SCRIPT" != "null" ]; then
        cat >> Dockerfile << EOF
# Build the application
RUN npm run build

EOF
    fi
    
    cat >> Dockerfile << EOF
# Expose port
EXPOSE $PORT

# Add health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \\
    CMD curl -f http://localhost:$PORT/health || curl -f http://localhost:$PORT || exit 1

# Start the application
CMD ["$START_SCRIPT"]
EOF

    # Fix CMD format
    if [[ "$START_SCRIPT" == npm* ]]; then
        sed -i 's/CMD \["\(npm.*\)"\]/CMD \1/' Dockerfile
        sed -i 's/CMD npm/CMD ["npm",/' Dockerfile
        sed -i 's/npm start/npm", "start"]/' Dockerfile
        sed -i 's/npm run \(.*\)/npm", "run", "\1"]/' Dockerfile
    fi
    
    print_success "Dockerfile generated successfully"
}

# Function to generate Docker Compose file
generate_docker_compose() {
    print_status "Generating docker-compose.yml..."
    
    cat > docker-compose.yml << EOF
version: '3.8'

services:
  app:
    build: .
    ports:
      - "$PORT:$PORT"
    environment:
      - NODE_ENV=production
      - PORT=$PORT
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:$PORT"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s

EOF
    
    print_success "docker-compose.yml generated successfully"
}

# Function to build Docker image
build_docker_image() {
    print_status "Building Docker image..."
    
    local image_name=$(echo "$REPO_NAME" | tr '[:upper:]' '[:lower:]')
    IMAGE_NAME="auto-dock-$image_name"
    
    if docker build -t "$IMAGE_NAME" . >> "$LOG_FILE" 2>&1; then
        print_success "Docker image built successfully: $IMAGE_NAME"
    else
        print_error "Failed to build Docker image. Check the log file: $LOG_FILE"
        print_error "Common issues:"
        print_error "  - Missing package.json or invalid Node.js setup"
        print_error "  - Build errors in the application"
        print_error "  - Network issues during npm install"
        exit 1
    fi
}

# Function to stop existing container
stop_existing_container() {
    local container_name="auto-dock-$REPO_NAME"
    
    if docker ps -q -f name="$container_name" | grep -q .; then
        print_status "Stopping existing container..."
        docker stop "$container_name" >> "$LOG_FILE" 2>&1
        docker rm "$container_name" >> "$LOG_FILE" 2>&1
        print_success "Existing container stopped and removed"
    fi
}

# Function to run Docker container
run_docker_container() {
    print_status "Running Docker container..."
    
    local container_name="auto-dock-$REPO_NAME"
    
    # Stop existing container if running
    stop_existing_container
    
    # Run new container
    if docker run -d \
        --name "$container_name" \
        -p "$PORT:$PORT" \
        -e NODE_ENV=production \
        -e PORT="$PORT" \
        "$IMAGE_NAME" >> "$LOG_FILE" 2>&1; then
        
        print_success "Container started successfully"
        print_success "Application should be available at: http://localhost:$PORT"
        
        # Wait a moment for the container to start
        sleep 5
        
        # Check if container is still running
        if docker ps -q -f name="$container_name" | grep -q .; then
            print_success "Container is running healthy"
            
            # Try to test the endpoint
            if command_exists curl; then
                print_status "Testing application endpoint..."
                if curl -f "http://localhost:$PORT" >/dev/null 2>&1; then
                    print_success "Application is responding at http://localhost:$PORT"
                else
                    print_warning "Application may still be starting up. Please check http://localhost:$PORT in a few moments."
                fi
            fi
        else
            print_error "Container failed to start or exited immediately"
            print_error "Container logs:"
            docker logs "$container_name" 2>&1 | tail -20
            exit 1
        fi
    else
        print_error "Failed to run Docker container"
        exit 1
    fi
}

# Function to show summary
show_summary() {
    echo ""
    echo "=================================="
    echo "🚀 AUTO-DOCK IT - DEPLOYMENT COMPLETE"
    echo "=================================="
    echo ""
    echo "Repository: $REPO_URL"
    echo "Project Type: $PROJECT_TYPE"
    echo "Container Name: auto-dock-$REPO_NAME"
    echo "Image Name: $IMAGE_NAME"
    echo "Port: $PORT"
    echo ""
    echo "🌐 Application URL: http://localhost:$PORT"
    echo ""
    echo "📋 Useful Commands:"
    echo "  View logs:     docker logs auto-dock-$REPO_NAME"
    echo "  Stop container: docker stop auto-dock-$REPO_NAME"
    echo "  Remove container: docker rm auto-dock-$REPO_NAME"
    echo "  Remove image:   docker rmi $IMAGE_NAME"
    echo ""
    echo "📁 Project files: $REPO_DIR"
    echo "📄 Log file: $LOG_FILE"
    echo ""
    echo "=================================="
}

# Main execution function
main() {
    # Parse arguments
    if [ $# -eq 0 ]; then
        echo "Usage: $0 <github-repo-url> [port]"
        echo "Example: $0 https://github.com/user/repo 3000"
        exit 1
    fi
    
    REPO_URL=$1
    PORT=${2:-$DEFAULT_PORT}
    
    # Start execution
    echo "🐳 Auto-Dock It - Automated Docker Setup"
    echo "========================================"
    
    # Validate inputs
    validate_github_url "$REPO_URL"
    extract_repo_info "$REPO_URL"
    
    # Execute setup steps
    check_prerequisites
    setup_workspace
    clone_repository "$REPO_URL"
    analyze_project
    
    # Generate Docker files if needed
    if [ ! -f "$REPO_DIR/Dockerfile" ]; then
        cd "$REPO_DIR"
        case $PROJECT_TYPE in
            "nodejs")
                generate_nodejs_dockerfile
                ;;
            *)
                print_error "Automatic Dockerfile generation not supported for $PROJECT_TYPE projects yet"
                exit 1
                ;;
        esac
        generate_docker_compose
    else
        print_status "Dockerfile already exists, using existing configuration"
        cd "$REPO_DIR"
    fi
    
    # Build and run
    build_docker_image
    run_docker_container
    
    # Show summary
    show_summary
}

# Execute main function with all arguments
main "$@"