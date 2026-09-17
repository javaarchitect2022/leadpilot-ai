# ==============================================================================
# LeadPilot AI — Production Multi-Stage Dockerfile with Chromium & Puppeteer Support
# ==============================================================================

# Stage 1: Base Dependencies
FROM node:20-slim AS base
ENV NODE_ENV=production
WORKDIR /app

# Install system dependencies required for Puppeteer / Chromium
RUN apt-get update && apt-get install -y --no-install-recommends \
    chromium \
    fonts-freefont-ttf \
    fonts-liberation \
    ca-certificates \
    procps \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Inform Puppeteer to use the installed Chromium
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium

# Stage 2: Install dependencies and build
FROM base AS builder
WORKDIR /app

# Copy package manifests and Prisma schema first to leverage Docker layer caching
COPY package*.json ./
COPY prisma ./prisma/

# Install all dependencies (including devDependencies for build)
RUN npm ci

# Generate Prisma Client for PostgreSQL
RUN npx prisma generate

# Copy source code
COPY . .

# Build Next.js production bundle
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# Stage 3: Production Runner
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Create a non-root user for security
RUN groupadd -g 1001 nodejs && \
    useradd -u 1001 -g nodejs -s /bin/bash -m nextjs

# Create public document directories and set permissions
RUN mkdir -p /app/public/documents/properties && \
    chown -R nextjs:nodejs /app/public/documents

# Copy built application and node_modules from builder
COPY --from=builder --chown=nextjs:nodejs /app/package*.json ./
COPY --from=builder --chown=nextjs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next ./.next
COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma
COPY --from=builder --chown=nextjs:nodejs /app/next.config.mjs ./next.config.mjs

USER nextjs

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD curl -f http://localhost:3000/api/auth/me || exit 1

CMD ["npm", "start"]

