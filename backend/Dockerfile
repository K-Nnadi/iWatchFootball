# Multi-stage build for NestJS backend
FROM node:20-alpine AS builder

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy package files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY backend/package.json ./backend/
COPY clients/package.json ./clients/
COPY libraries/package.json ./libraries/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY . .

# Build the backend
RUN pnpm --filter backend build

# Production stage
FROM node:20-alpine AS production

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy package files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY backend/package.json ./backend/
COPY clients/package.json ./clients/
COPY libraries/base/package.json ./libraries/

# Install production dependencies only
RUN pnpm install --prod --frozen-lockfile

# Copy built backend from builder stage
COPY --from=builder /app/backend/dist ./backend/dist
COPY --from=builder /app/clients ./clients
COPY --from=builder /app/libraries ./libraries

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nestjs -u 1001

# Change ownership of the app directory
RUN chown -R nestjs:nodejs /app
USER nestjs

# Expose port (Cloud Run requires 8080)
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:8080/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"

# Start the application
CMD ["node", "backend/dist/main.js"]

