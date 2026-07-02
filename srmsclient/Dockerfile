# Build stage
FROM node:18-alpine AS builder
WORKDIR /app/client

# Copy package files
COPY client/package*.json ./

# Install dependencies. This project does not currently include a package-lock.json,
# so npm ci cannot be used until a lockfile is committed.
RUN npm install --no-audit --no-fund

# Copy source code
COPY client/ .

# Build the app
RUN npm run build

# Production stage
FROM nginx:alpine
# Copy the built app from the builder stage
COPY --from=builder /app/dist /usr/share/nginx/html
# Copy nginx configuration
COPY client/nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]

