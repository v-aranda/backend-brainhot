# -----------------------------------------------------------------
# Estágio de Dependências (Usado pelo 'dev' e 'builder')
# -----------------------------------------------------------------
FROM node:20-bookworm AS deps
WORKDIR /workspace
COPY package.json package-lock.json* ./
RUN npm install

# -----------------------------------------------------------------
# Estágio de Desenvolvimento (Otimizado)
# Não copia node_modules, pois o docker-compose usa um volume.
# -----------------------------------------------------------------
FROM node:20-bookworm AS dev
WORKDIR /workspace
ENV NODE_ENV=development

# Instala utilitários básicos
RUN apt-get update \
 && apt-get install -y --no-install-recommends \
    git \
    curl \
    ca-certificates \
 && rm -rf /var/lib/apt/lists/*

# Copia o código-fonte (será sobrescrito pelo volume, mas é bom ter)
COPY . .
# O 'command' é definido no docker-compose.yml


# -----------------------------------------------------------------
# Estágio Builder (PRODUÇÃO - Intacto)
# -----------------------------------------------------------------
FROM node:20-bookworm AS builder
WORKDIR /workspace
COPY package.json package-lock.json* ./
RUN npm install
RUN npm install -g typescript 
COPY . .
RUN npx prisma generate --no-engine
RUN tsc --project tsconfig.prod.json

# -----------------------------------------------------------------
# Estágio de Produção (PRODUÇÃO - Intacto)
# -----------------------------------------------------------------
FROM node:20-bookworm AS prod
WORKDIR /workspace
ENV NODE_ENV=production
COPY --from=builder /workspace/package.json ./
COPY --from=builder /workspace/package-lock.json* ./
RUN npm install --production
COPY --from=builder /workspace/dist ./dist
COPY --from=builder /workspace/prisma ./prisma
RUN npx prisma generate --no-engine
EXPOSE 3000
CMD ["sh", "-c", "npx prisma migrate deploy && npm run db:seed:prod && node dist/main/server.js"]