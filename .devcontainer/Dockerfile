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
RUN npm install -g typescript 
COPY . .
RUN npx prisma generate
RUN tsc --project tsconfig.prod.json

# ---- VERSÃO OTIMIZADA RECOMENDADA ----
FROM node:20-bookworm AS prod
WORKDIR /workspace

ENV NODE_ENV=production

# 1. Copiar apenas o package.json e o lockfile
COPY --from=builder /workspace/package.json ./
COPY --from=builder /workspace/package-lock.json* ./

# 2. Instalar APENAS as dependências de produção (agora inclui o 'prisma')
RUN npm install --production

# 3. Copiar o código transpilado
COPY --from=builder /workspace/dist ./dist

# 4. Copiar o schema do prisma para o container de produção
COPY --from=builder /workspace/prisma ./prisma

RUN npx prisma generate

EXPOSE 3000

# 5. ALTERE O CMD PARA EXECUTAR AS MIGRAÇÕES ANTES DE INICIAR
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/main/server.js"]