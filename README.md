# Proint 1 API

API Node.js com Clean Architecture, TypeScript, Prisma (Postgres), Jest e Supertest.

## Requisitos
- Docker e Docker Compose
- (Opcional) VS Code com extensão "Dev Containers"

## Primeira execução (recomendado: Dev Container)
1. Abra o projeto no VS Code.
2. Pressione F1 → "Dev Containers: Reopen in Container".
3. Aguarde o setup automático (instala dependências e roda `prisma generate`).
4. Rode as migrações (primeira vez):
   - No terminal do container:
     - `npm run db:migrate`
5. Inicie a API (no container):
   - `npm run dev`
6. Teste rápido:
   - `GET http://localhost:3000/health` → `{ "status": "ok" }`

## Primeira execução (Docker Compose manual)
Sem usar o recurso de Dev Container do VS Code.

1. Suba os serviços com Docker Compose (usa a mesma config do devcontainer):
   - `docker compose -f .devcontainer/docker-compose.yml up -d`
2. Gere o Prisma Client (dentro do container `app`):
   - `docker compose -f .devcontainer/docker-compose.yml exec app npx prisma generate`
3. Rode as migrações (dentro do container `app`):
   - `docker compose -f .devcontainer/docker-compose.yml exec app npm run db:migrate`
4. A API já inicia em modo dev automaticamente (comando do serviço `app` é `npm run dev`).
5. Teste rápido:
   - `GET http://localhost:3000/health`

## Variáveis de ambiente
O `docker-compose` já define as principais variáveis:
- `PORT=3000`
- `DATABASE_URL=postgresql://postgres:postgres@db:5432/appdb`
- `NODE_ENV=development`
- `JWT_SECRET` (default interno: `dev-secret`). Para produção, defina um segredo forte.

## Endpoints principais
- `GET /health` → health-check
- Autenticação básica (Prisma + bcrypt + JWT):
  - `POST /auth/register` { name, email, password } → cria usuário
  - `POST /auth/login` { email, password } → `{ token }`
- Usuários (runtime via Prisma):
  - `POST /api/users` { name, email }
  - `GET /api/users`

## Testes
- No Dev Container: `npm test`
- Via Docker Compose:
  - `docker compose -f .devcontainer/docker-compose.yml exec app npm test`

## Build/Start fora do container (opcional)
Se tiver Postgres local e `DATABASE_URL` configurada:
- `npm install`
- `npx prisma generate`
- `npm run db:migrate`
- Dev: `npm run dev`
- Prod: `npm run build && npm start`


