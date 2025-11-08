#!/bin/sh
# Script de inicialização para o contêiner 'app' de desenvolvimento

# 1. Instala dependências
echo "Verificando dependências do Node (npm install)..."
npm install

# 2. Gera o Prisma Client (para o banco de dev 'appdb')
echo "Gerando Prisma Client para desenvolvimento..."
npx prisma generate

# 3. Aplica migrações no banco de TESTE ('meubanco_test')
echo "Aplicando migrações no banco de teste..."
npx dotenv -e .env.test -o -- prisma migrate deploy

# 4. Inicia o servidor de desenvolvimento
echo "Iniciando servidor de desenvolvimento (npm run dev)..."
npm run dev