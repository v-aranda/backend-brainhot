# Proint 1 API

API Node.js com Clean Architecture, TypeScript, Prisma (Postgres), Jest e Supertest.

## Requisitos
- Docker e Docker Compose
- (Opcional) VS Code com extensão "Dev Containers"

## Como executar (3 formas)

Você pode rodar o projeto de três maneiras comuns: (A) Dev Container (recomendado para desenvolvimento), (B) Docker Compose em modo dev (workflow atual), e (C) Docker Compose / imagem de produção (build do estágio `prod`). Abaixo as instruções para cada uma.


A) Dev Container (recomendado)

1. Abra o projeto no VS Code.
2. Pressione F1 → "Dev Containers: Reopen in Container".
3. Aguarde o setup automático (instala dependências e roda `prisma generate`).
4. Rode as migrações (primeira vez) dentro do container:
   - `npm run db:migrate`
5. Inicie a API (no container):
   - `npm run dev`
6. Teste rápido:
   - `GET http://localhost:3000/health` → `{ "status": "ok" }`


B) Docker Compose — modo desenvolvimento (padrão)

1. Suba os serviços (usa a config em `.devcontainer/docker-compose.yml`):
   - `docker compose -f .devcontainer/docker-compose.yml up -d`
2. Gere o Prisma Client (dentro do container `app`):
   - `docker compose -f .devcontainer/docker-compose.yml exec app npx prisma generate`
3. Rode as migrações (dentro do container `app`):
   - `docker compose -f .devcontainer/docker-compose.yml exec app npm run db:migrate`
4. A API já inicia em modo dev automaticamente (o serviço `app` executa o fluxo dev com volumes montados).
5. Teste rápido:
   - `GET http://localhost:3000/health`

Observações:
- O serviço `db` expõe a porta `5432` internamente; o compose mapeia `5433:5432` para o host. Quando executar comandos do Prisma no host (fora do container), aponte para `localhost:5433`.
- Quando executar comandos dentro do container `app`, a variável `DATABASE_URL` já aponta para `db:5432` e funciona sem ajustes.


C) Docker Compose — imagem de produção (estágio `prod`)

O repositório contém um Dockerfile multi-stage com estágios `dev`, `builder` e `prod`. O compose adiciona um serviço `app_prod` que builda o estágio `prod`.

1. Build da imagem de produção:
   - `docker compose -f .devcontainer/docker-compose.yml build app_prod`
2. Subir DB + app_prod:
   - `docker compose -f .devcontainer/docker-compose.yml up -d db app_prod`
3. A aplicação ficará disponível em `http://localhost:3001` (o `app_prod` foi mapeado para a porta 3001 do host para não conflitar com o `app` dev).

Notas para produção:
- Em produção execute `npx prisma migrate deploy` (não `migrate dev`) para aplicar migrations sem prompts interativos.
- Verifique as variáveis de ambiente sensíveis (por ex. `JWT_SECRET`) e não utilize valores padrão em produção.
- O `app_prod` não monta volumes com o código fonte — ele roda a versão buildada do `dist`.


## Variáveis de ambiente
O `docker-compose` já define as principais variáveis para desenvolvimento:
- `PORT=3000`
- `DATABASE_URL=postgresql://postgres:postgres@db:5432/appdb` (usada dentro da rede do compose)
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


