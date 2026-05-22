# syntax=docker/dockerfile:1

# ============================================================
# Base — OS deps for native modules (argon2, bcrypt, pg) + Chromium
# ============================================================
FROM node:22-bookworm-slim AS base
WORKDIR /app
ENV PUPPETEER_SKIP_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium
RUN apt-get update && apt-get install -y --no-install-recommends \
      python3 make g++ \
      chromium fonts-liberation \
      curl \
 && rm -rf /var/lib/apt/lists/*

# ============================================================
# Dependencies — ALL deps (incl. dev) for build + watch mode
# ============================================================
FROM base AS deps
COPY package.json package-lock.json ./
RUN npm ci --legacy-peer-deps

# ============================================================
# Build — compile TypeScript -> dist/
# ============================================================
FROM deps AS build
COPY . .
RUN npm run build

# ============================================================
# Development — hot-reload watch mode
# ============================================================
FROM deps AS development
ENV NODE_ENV=development
COPY . .
EXPOSE 4002
CMD ["npm", "run", "start:dev"]

# ============================================================
# Production dependencies — runtime deps only
# ============================================================
FROM base AS prod-deps
COPY package.json package-lock.json ./
RUN npm ci --omit=dev --legacy-peer-deps

# ============================================================
# Production — minimal runtime image
# ============================================================
FROM node:22-bookworm-slim AS production
WORKDIR /app
ENV NODE_ENV=production \
    PUPPETEER_SKIP_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium
RUN apt-get update && apt-get install -y --no-install-recommends \
      chromium fonts-liberation curl \
 && rm -rf /var/lib/apt/lists/*
COPY --from=prod-deps /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY package.json ./
RUN mkdir -p uploads dist/image \
 && chown -R node:node /app
USER node
EXPOSE 4002
CMD ["node", "dist/src/main.js"]
