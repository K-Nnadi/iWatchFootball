# =========================================
# 🏗️  Stage 1: Builder
# =========================================
FROM node:20-alpine AS builder

WORKDIR /app

# Install specific PNPM version to match your local one
# 👉 Run `pnpm -v` locally and use the same version here.
# (Example: 9.7.1 — adjust if needed)
RUN npm install -g pnpm@9.7.1

# Copy workspace manifests
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY backend/package.json ./backend/
COPY clients/package.json ./clients/
COPY libraries/base/package.json ./libraries/base/

# Install all dependencies
RUN pnpm install --frozen-lockfile --ignore-scripts

# Copy source code
COPY . .

# Build shared library first
RUN pnpm --filter @iWatchFootball/base-tools build

# Build the backend next
RUN pnpm --filter @iWatchFootball/api build


# =========================================
# 🚀 Stage 2: Production
# =========================================
FROM node:20-alpine AS production

WORKDIR /app

# Install same PNPM version to match lockfile
RUN npm install -g pnpm@9.7.1

# Copy workspace manifests
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY backend/package.json ./backend/
COPY clients/package.json ./clients/
COPY libraries/base/package.json ./libraries/base/

# Install only production dependencies
RUN pnpm install --prod --frozen-lockfile --ignore-scripts

# Copy compiled output & runtime files from builder
COPY --from=builder /app/backend/dist ./backend/dist
COPY --from=builder /app/clients ./clients
COPY --from=builder /app/libraries ./libraries

# Create non-root user
RUN addgroup -S nodejs && adduser -S nestjs -G nodejs
USER nestjs

# Expose Cloud Run default port
EXPOSE 8080

# Health check (optional endpoint /health)
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:8080/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"

# Run the backend service
CMD ["node", "backend/dist/main.js"]
