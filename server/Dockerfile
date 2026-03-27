# ============================================================
# Payvio API Server — Production Dockerfile
# Deploys to Azure Container Apps
# ============================================================

# --- Build stage ---
FROM node:22-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --ignore-scripts

COPY tsconfig.json prisma.config.ts ./
COPY prisma/ ./prisma/
RUN npx prisma generate

COPY src/ ./src/
RUN npx tsc

# --- Production stage ---
FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

# Install production deps only
COPY package.json package-lock.json ./
RUN npm ci --omit=dev --ignore-scripts

# Copy Prisma generated client + schema
COPY --from=builder /app/src/generated/ ./src/generated/
COPY --from=builder /app/prisma/ ./prisma/
COPY --from=builder /app/prisma.config.ts ./

# Copy compiled JS
COPY --from=builder /app/dist/ ./dist/

# Non-root user
RUN addgroup -g 1001 -S payvio && \
    adduser -S payvio -u 1001
USER payvio

EXPOSE 4000

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:4000/health || exit 1

CMD ["node", "dist/index.js"]
