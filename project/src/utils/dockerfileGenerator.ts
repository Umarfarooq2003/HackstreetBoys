export class DockerfileGenerator {
  static generate(techStack: string): string {
    switch (techStack.toLowerCase()) {
      case 'node.js':
      case 'nodejs':
      case 'node':
        return this.generateNodeDockerfile();
      case 'python':
        return this.generatePythonDockerfile();
      case 'java':
        return this.generateJavaDockerfile();
      case 'go':
      case 'golang':
        return this.generateGoDockerfile();
      case 'php':
        return this.generatePHPDockerfile();
      case 'ruby':
        return this.generateRubyDockerfile();
      case 'rust':
        return this.generateRustDockerfile();
      case '.net':
      case 'dotnet':
        return this.generateDotNetDockerfile();
      default:
        return this.generateNodeDockerfile();
    }
  }

  private static generateNodeDockerfile(): string {
    return `# Multi-stage build for Node.js application
# Build stage
FROM node:18-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production && npm cache clean --force

# Copy source code
COPY . .

# Build the application (if applicable)
RUN npm run build 2>/dev/null || echo "No build script found"

# Production stage
FROM node:18-alpine AS production

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \\
    adduser -S nextjs -u 1001

# Set working directory
WORKDIR /app

# Copy built application from builder stage
COPY --from=builder --chown=nextjs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nextjs:nodejs /app/package*.json ./
COPY --from=builder --chown=nextjs:nodejs /app .

# Switch to non-root user
USER nextjs

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \\
  CMD curl -f http://localhost:3000/health || exit 1

# Set environment
ENV NODE_ENV=production
ENV PORT=3000

# Start the application
ENTRYPOINT ["dumb-init", "--"]
CMD ["npm", "start"]`;
  }

  private static generatePythonDockerfile(): string {
    return `# Multi-stage build for Python application
# Build stage
FROM python:3.11-slim AS builder

# Set working directory
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \\
    build-essential \\
    curl \\
    && rm -rf /var/lib/apt/lists/*

# Copy requirements first for better caching
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir --user -r requirements.txt

# Production stage
FROM python:3.11-slim AS production

# Install runtime dependencies
RUN apt-get update && apt-get install -y \\
    curl \\
    && rm -rf /var/lib/apt/lists/* \\
    && apt-get clean

# Create non-root user
RUN useradd --create-home --shell /bin/bash app

# Set working directory
WORKDIR /app

# Copy installed packages from builder
COPY --from=builder /root/.local /home/app/.local

# Copy application code
COPY --chown=app:app . .

# Switch to non-root user
USER app

# Update PATH
ENV PATH=/home/app/.local/bin:$PATH

# Expose port
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \\
  CMD curl -f http://localhost:8000/health || exit 1

# Set environment variables
ENV PYTHONPATH=/app
ENV PYTHONUNBUFFERED=1

# Start the application
CMD ["python", "app.py"]`;
  }

  private static generateJavaDockerfile(): string {
    return `# Multi-stage build for Java application
# Build stage
FROM openjdk:17-jdk-slim AS builder

# Set working directory
WORKDIR /app

# Copy build files
COPY pom.xml .
COPY mvnw .
COPY .mvn .mvn

# Download dependencies
RUN ./mvnw dependency:resolve

# Copy source code
COPY src src

# Build the application
RUN ./mvnw clean package -DskipTests

# Production stage
FROM openjdk:17-jre-slim AS production

# Install curl for health checks
RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*

# Create non-root user
RUN useradd --create-home --shell /bin/bash app

# Set working directory
WORKDIR /app

# Copy JAR file from builder stage
COPY --from=builder --chown=app:app /app/target/*.jar app.jar

# Switch to non-root user
USER app

# Expose port
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \\
  CMD curl -f http://localhost:8080/actuator/health || exit 1

# Set JVM options
ENV JAVA_OPTS="-Xmx512m -Xms256m"

# Start the application
CMD ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]`;
  }

  private static generateGoDockerfile(): string {
    return `# Multi-stage build for Go application
# Build stage
FROM golang:1.21-alpine AS builder

# Install git (may be needed for dependencies)
RUN apk add --no-cache git

# Set working directory
WORKDIR /app

# Copy go mod files
COPY go.mod go.sum ./

# Download dependencies
RUN go mod download

# Copy source code
COPY . .

# Build the application
RUN CGO_ENABLED=0 GOOS=linux go build -a -installsuffix cgo -o main .

# Production stage
FROM alpine:latest AS production

# Install ca-certificates for HTTPS requests
RUN apk --no-cache add ca-certificates curl

# Create non-root user
RUN adduser -D -s /bin/sh app

# Set working directory
WORKDIR /root/

# Copy binary from builder stage
COPY --from=builder /app/main .

# Switch to non-root user
USER app

# Expose port
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \\
  CMD curl -f http://localhost:8080/health || exit 1

# Start the application
CMD ["./main"]`;
  }

  private static generatePHPDockerfile(): string {
    return `# PHP application Dockerfile
FROM php:8.2-fpm-alpine AS production

# Install system dependencies
RUN apk add --no-cache \\
    curl \\
    libpng-dev \\
    libxml2-dev \\
    zip \\
    unzip

# Install PHP extensions
RUN docker-php-ext-install pdo_mysql mbstring exif pcntl bcmath gd

# Install Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Create non-root user
RUN adduser -D -s /bin/sh app

# Set working directory
WORKDIR /var/www

# Copy composer files
COPY composer.json composer.lock ./

# Install PHP dependencies
RUN composer install --no-dev --optimize-autoloader

# Copy application code
COPY --chown=app:app . .

# Set permissions
RUN chown -R app:app /var/www

# Switch to non-root user
USER app

# Expose port
EXPOSE 9000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \\
  CMD curl -f http://localhost:9000/health || exit 1

# Start PHP-FPM
CMD ["php-fpm"]`;
  }

  private static generateRubyDockerfile(): string {
    return `# Ruby application Dockerfile
FROM ruby:3.2-alpine AS production

# Install system dependencies
RUN apk add --no-cache \\
    build-base \\
    curl \\
    postgresql-dev \\
    tzdata

# Create non-root user
RUN adduser -D -s /bin/sh app

# Set working directory
WORKDIR /app

# Copy Gemfile
COPY Gemfile Gemfile.lock ./

# Install gems
RUN bundle config --global frozen 1 && \\
    bundle install

# Copy application code
COPY --chown=app:app . .

# Switch to non-root user
USER app

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \\
  CMD curl -f http://localhost:3000/health || exit 1

# Set environment
ENV RAILS_ENV=production

# Start the application
CMD ["bundle", "exec", "rails", "server", "-b", "0.0.0.0"]`;
  }

  private static generateRustDockerfile(): string {
    return `# Multi-stage build for Rust application
# Build stage
FROM rust:1.70 AS builder

# Set working directory
WORKDIR /app

# Copy manifest files
COPY Cargo.toml Cargo.lock ./

# Build dependencies (cached layer)
RUN mkdir src && echo "fn main() {}" > src/main.rs && \\
    cargo build --release && \\
    rm -rf src

# Copy source code
COPY src src

# Build the application
RUN cargo build --release

# Production stage
FROM debian:bookworm-slim AS production

# Install runtime dependencies
RUN apt-get update && apt-get install -y \\
    ca-certificates \\
    curl \\
    && rm -rf /var/lib/apt/lists/*

# Create non-root user
RUN useradd --create-home --shell /bin/bash app

# Set working directory
WORKDIR /app

# Copy binary from builder stage
COPY --from=builder --chown=app:app /app/target/release/app .

# Switch to non-root user
USER app

# Expose port
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \\
  CMD curl -f http://localhost:8080/health || exit 1

# Start the application
CMD ["./app"]`;
  }

  private static generateDotNetDockerfile(): string {
    return `# Multi-stage build for .NET application
# Build stage
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS builder

# Set working directory
WORKDIR /app

# Copy project files
COPY *.csproj ./

# Restore dependencies
RUN dotnet restore

# Copy source code
COPY . .

# Build the application
RUN dotnet publish -c Release -o out

# Production stage
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS production

# Install curl for health checks
RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*

# Create non-root user
RUN useradd --create-home --shell /bin/bash app

# Set working directory
WORKDIR /app

# Copy published app from builder stage
COPY --from=builder --chown=app:app /app/out .

# Switch to non-root user
USER app

# Expose port
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \\
  CMD curl -f http://localhost:80/health || exit 1

# Start the application
ENTRYPOINT ["dotnet", "app.dll"]`;
  }
}