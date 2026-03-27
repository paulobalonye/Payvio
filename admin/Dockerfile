# ============================================================
# Payvio Admin Dashboard — Production Dockerfile
# Deploys to Azure Container Apps at admin.payvio.com
# ============================================================

FROM node:22-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# --- Production ---
FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup -g 1001 -S payvio && \
    adduser -S payvio -u 1001

COPY --from=builder /app/public ./public
COPY --from=builder --chown=payvio:payvio /app/.next/standalone ./
COPY --from=builder --chown=payvio:payvio /app/.next/static ./.next/static

USER payvio

EXPOSE 3001

ENV PORT=3001
ENV HOSTNAME="0.0.0.0"

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3001/ || exit 1

CMD ["node", "server.js"]
