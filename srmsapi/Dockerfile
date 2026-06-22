# Build stage
FROM node:18-alpine AS builder

WORKDIR /app/server

# Copy package files
COPY server/package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY server/src ./src

# Copy start script (needed for runtime)
COPY server/start.sh ./

# Runtime stage
FROM node:18-alpine

WORKDIR /app/server

# Install additional tools for health checks and wait scripts
RUN apk add --no-cache \
    curl \
    wget \
    mongodb-tools \
    redis

# Copy from builder
COPY --from=builder /app/server/node_modules ./node_modules
COPY --from=builder /app/server/src ./src
COPY --from=builder /app/server/start.sh ./start.sh

# Make start script executable
RUN chmod +x ./start.sh

# Create non-root user
RUN addgroup -g 1001 -S nodejs && adduser -S nodejs -u 1001
USER nodejs

# Expose port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost:5000/api/health || exit 1

# Start server with wait script
CMD ["./start.sh"]

