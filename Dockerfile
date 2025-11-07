FROM node:20-bookworm

ENV DEBIAN_FRONTEND=noninteractive

RUN apt-get update \
  && apt-get install -y --no-install-recommends \
    git \
    curl \
    ca-certificates \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /workspace

# Install dependencies (dev) stage
FROM node:20-bookworm AS deps
WORKDIR /workspace
COPY package.json package-lock.json* ./
RUN npm install

# Development stage: keep source mounted, have node_modules available and a sleep command
FROM node:20-bookworm AS dev
WORKDIR /workspace
COPY --from=deps /workspace/node_modules ./node_modules
COPY . .
ENV NODE_ENV=development
CMD ["sh", "-c", "sleep infinity"]

# Builder stage: compile/prepare artifacts for production
FROM node:20-bookworm AS builder
WORKDIR /workspace
COPY package.json package-lock.json* ./
RUN npm install
COPY . .
RUN npm run build

# Production stage: minimal image containing only built artifacts and production deps
FROM node:20-bookworm AS prod
WORKDIR /workspace
# copy built files and node_modules from builder
COPY --from=builder /workspace/dist ./dist
COPY --from=builder /workspace/node_modules ./node_modules
COPY package.json ./
ENV NODE_ENV=production
EXPOSE 3000
CMD ["node", "dist/main/server.js"]


