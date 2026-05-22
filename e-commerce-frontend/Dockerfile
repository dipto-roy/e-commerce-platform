# ─────────────────────────────────────────────
# Stage 1: base — shared node + workdir setup
# ─────────────────────────────────────────────
FROM node:20-alpine AS base
WORKDIR /app
# Install only package manifests first for layer caching
COPY package.json package-lock.json ./

# ─────────────────────────────────────────────
# Stage 2: deps — install all dependencies
# ─────────────────────────────────────────────
FROM base AS deps
RUN npm ci

# ─────────────────────────────────────────────
# Stage 3: development
#   - Source mounted as volume by compose (hot reload)
#   - node_modules baked into image (no host pollution)
# ─────────────────────────────────────────────
FROM base AS development
ENV NODE_ENV=development
ENV NEXT_TELEMETRY_DISABLED=1
# Polling-based watcher — required when Docker bind-mount
# doesn't propagate inotify events (Linux/WSL2/macOS)
ENV WATCHPACK_POLLING=true
ENV CHOKIDAR_USEPOLLING=true

RUN npm ci

# Source code is NOT copied here — compose mounts it at runtime
EXPOSE 3000

CMD ["npm", "run", "dev"]

# ─────────────────────────────────────────────
# Stage 4: builder — production build
# ─────────────────────────────────────────────
FROM deps AS builder
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
# Enable standalone output for minimal prod image
ENV NEXT_OUTPUT=standalone

COPY . .
RUN npm run build

# ─────────────────────────────────────────────
# Stage 5: production — lean runtime image
# ─────────────────────────────────────────────
FROM node:20-alpine AS production
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

# Non-root user for security
RUN addgroup --system --gid 1001 nodejs && \
    adduser  --system --uid 1001 nextjs

# Standalone build ships its own server.js + node_modules subset
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static    ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public          ./public

USER nextjs
EXPOSE 3000

CMD ["node", "server.js"]
