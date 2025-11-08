Com base em todas as mudanças que fizemos para automatizar e estabilizar seu ambiente de desenvolvimento, aqui está o `README.md` atualizado.

Ele remove completamente a menção ao "Dev Container" (que abolimos) e foca no novo fluxo 100% automatizado, que usa apenas o `docker-compose` e os scripts que criamos.

-----

# Proint 1 API

API Node.js com Clean Architecture, TypeScript, Prisma (Postgres), Jest e Supertest, rodando em um ambiente Docker automatizado.

## Requisitos

  * Docker e Docker Compose

-----

## 🚀 Como Executar (Desenvolvimento)

Este é o método principal e recomendado. O ambiente é 100% automatizado e consistente, ideal para desenvolvimento.

1.  **Inicie o ambiente:**
    (Na primeira vez, use `--build` para construir as imagens)

    ```bash
    docker-compose --file .docker/docker-compose.yml up --build -d
    ```

2.  **Pronto\!**

O script `.docker/entrypoint.dev.sh` (definido no `docker-compose`) cuida de tudo automaticamente **toda vez que o contêiner sobe**:

  * Instala as dependências (`npm install`).
  * Gera o Prisma Client.
  * Cria o banco de dados de teste (`meubanco_test`), caso não exista.
  * Aplica as migrações no banco de teste.
  * Inicia o servidor em modo de desenvolvimento (`npm run dev`).

A API estará disponível em `http://localhost:3000`.

Para parar o ambiente, rode:

```bash
docker-compose --file .docker/docker-compose.yml down
```

(Adicione `-v` ao final se quiser apagar os volumes do banco e `node_modules` para recomeçar do zero).

-----

## 🧪 Testes

Os testes rodam contra um banco de dados de teste (`meubanco_test`) que é criado e migrado automaticamente pelo `entrypoint.dev.sh`.

1.  Com o ambiente rodando (`docker-compose up`), abra um **novo terminal**.
2.  Execute o comando de teste:
    ```bash
    docker-compose --file .docker/docker-compose.yml exec app npm test
    ```
3.  Para rodar um arquivo de teste específico:
    ```bash
    docker-compose --file .docker/docker-compose.yml exec app npm test -- tests/integration/auth.test.ts
    ```

-----

## 📦 Build de Produção

O `Dockerfile` é multi-stage e contém os estágios `builder` e `prod` para seu deploy na nuvem. Este setup de desenvolvimento local **não** interfere no seu build de produção.

O seu provedor de cloud (como Coolify) irá ler o `Dockerfile` e construir o target `prod` automaticamente.

-----

## 🌎 Variáveis de Ambiente

As variáveis essenciais de desenvolvimento são definidas no `.docker/docker-compose.yml` (para o `app`) e no `.env.test` (para os testes).

  * `PORT=3000`
  * `DATABASE_URL=postgresql://postgres:postgres@db:5432/appdb` (Usada pelo app para se conectar ao serviço `db`)
  * `NODE_ENV=development`

**Importante:** Para o login funcionar, você **deve** adicionar sua `JWT_SECRET` na seção `environment` do serviço `app` no `.docker/docker-compose.yml`:

```yaml
# .docker/docker-compose.yml
services:
  app:
    # ...
    environment:
      # ... (outras vars)
      - JWT_SECRET=seu-segredo-forte-de-desenvolvimento
```

Não se esqueça de adicionar a mesma `JWT_SECRET` ao seu arquivo `.env.test`.

-----

## 🔌 Endpoints Principais

Todos os endpoints são prefixados com `/api/v1`.

  * `GET /health` → Health-check

### Usuários

  * `POST /api/v1/users`
      * Body: `{ "name", "email", "password" }`
      * Resposta: Cria um novo usuário.
  * `GET /api/v1/users`
      * Resposta: Lista todos os usuários.
  * `GET /api/v1/users/:id`
      * Resposta: Busca um usuário por ID.

### Autenticação

  * `POST /api/v1/sessions`
      * Body: `{ "email", "password" }`
      * Resposta: Autentica o usuário e retorna um `{ "token": "..." }`.

-----

## 🖥️ Executando Localmente (Sem Docker)

Se você prefere rodar fora do Docker (e tem o Postgres rodando localmente):

1.  Crie e configure um arquivo `.env` com `DATABASE_URL` e `JWT_SECRET`.
2.  `npm install`
3.  `npx prisma generate`
4.  `npx prisma migrate dev` (para criar e migrar seu banco)
5.  `npm run dev`