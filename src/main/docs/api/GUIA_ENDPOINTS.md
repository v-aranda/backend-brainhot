# Guia de Criação de Novos Endpoints

Este guia descreve o fluxo para adicionar um novo endpoint seguindo a arquitetura limpa do projeto, incluindo ajustes de banco com Prisma e testes de integração.

## Visão geral da arquitetura
- `src/domain`: entidades e contratos (interfaces de repositório)
- `src/application`: casos de uso (regras de negócio)
- `src/infrastructure`: implementações (Prisma, adapters)
- `src/interface/http`: controllers e rotas
- `src/main`: composição da aplicação (app/server/env)
- `prisma/`: schema e migrações
- `tests/integration`: testes end-to-end da API com Supertest

## Passo a passo

1) Modelagem de domínio
- Crie/atualize a entidade em `src/domain/entities`.
- Se necessário, crie/atualize a interface de repositório em `src/domain/repositories`.

2) Atualizar schema do Prisma
- Edite `prisma/schema.prisma` adicionando o novo modelo ou campos.
- Gere o client:
  - Dev Container: `npm run db:generate`
  - Compose manual: `docker compose -f .devcontainer/docker-compose.yml exec app npx prisma generate`
- Crie a migração (primeira vez do endpoint):
  - Dev Container: `npm run db:migrate`
  - Compose manual: `docker compose -f .devcontainer/docker-compose.yml exec app npm run db:migrate`

3) Implementar repositório (infrastructure)
- Em `src/infrastructure/repositories`, crie uma implementação usando o Prisma Client.
- Respeite as interfaces de `src/domain/repositories`.

4) Casos de uso (application)
- Em `src/application/usecases`, crie o(s) caso(s) de uso que orquestram regras de negócio e repositórios.
- Garanta validações e mensagens de erro claras.

5) Controller e rotas (interface/http)
- Crie um controller em `src/interface/http/controllers` que consome o caso de uso.
- Adicione um arquivo de rotas em `src/interface/http/routes`.
- Faça o wire no app em `src/main/config/app.ts` (importando rotas e injetando repositórios quando necessário).

6) Testes de integração
- Crie testes em `tests/integration/`, usando `createApp()` para levantar a aplicação sem rede externa.
- Exemplo de estrutura:
```ts
import request from 'supertest';
import { createApp } from '../../src/main/config/app';

const app = createApp();

describe('Meu recurso (integration)', () => {
  it('deve criar e listar', async () => {
    const create = await request(app).post('/api/meu-recurso').send({ campo: 'valor' });
    expect(create.status).toBe(201);

    const list = await request(app).get('/api/meu-recurso');
    expect(list.status).toBe(200);
  });
});
```
- Execute os testes:
  - Dev Container: `npm test`
  - Compose manual: `docker compose -f .devcontainer/docker-compose.yml exec app npm test`

## Dicas
- Evite acoplar controllers diretamente ao Prisma; prefira casos de uso e interfaces de repositório.
- Mensagens de erro do caso de uso devem ser tratadas no controller (status HTTP adequados).
- Para endpoints autenticados, crie um middleware que valide o JWT e anexe o `userId` ao `Request`.
- Lembre-se de versionar as migrações Prisma (`prisma/migrations`).


