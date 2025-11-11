// tests/integration/subjects.test.ts
import supertest from 'supertest';
// [PADRÃO] Importa a fábrica de app
import { createApp } from '../../../src/main/config/app';
// [PADRÃO] Instancia o Prisma localmente
import { PrismaClient, Subject } from '@prisma/client';

// [PADRÃO] Instancia o app e o prisma
const app = createApp();
const prisma = new PrismaClient();
const request = supertest(app);

// [PADRÃO] Variáveis globais para token e IDs
let token: string;
let subjectId: string; // ID da disciplina criada no PUT/DELETE

/**
 * Setup: Antes de TUDO, limpa o banco e cria os dados base:
 * 1. Limpa todas as tabelas na ordem correta (filhas primeiro)
 * 2. Um Usuário (para autenticação)
 * 3. Faz login e salva o Token
 */
beforeAll(async () => {
  // 1. Limpa o banco na ordem correta
  await prisma.alternative.deleteMany();
  await prisma.question.deleteMany();
  await prisma.topic.deleteMany();
  await prisma.subject.deleteMany();
  await prisma.passwordResetToken.deleteMany();
  await prisma.user.deleteMany();

  // 2. Cria um usuário (via API, para garantir hash de senha correto)
  const userData = {
    name: 'Test User Subject',
    email: 'subject-admin@test.com',
    password: 'password123',
  };
  await request.post('/api/users').send(userData);

  // 3. Faz login para obter o token
  const loginResponse = await request.post('/api/auth').send({
    email: userData.email,
    password: userData.password,
  });

  token = loginResponse.body.token; // Salva o token global
});

/**
 * Limpa as tabelas transacionais (Subject, Topic, etc.)
 * antes de CADA teste, para evitar que um teste interfira no outro.
 */
beforeEach(async () => {
  // Limpa na ordem correta
  await prisma.alternative.deleteMany();
  await prisma.question.deleteMany();
  await prisma.topic.deleteMany();
  await prisma.subject.deleteMany();
});

// Desconecta o Prisma no final
afterAll(async () => {
  await prisma.$disconnect();
});

/**
 * --- Testes de Criação (POST) ---
 */
describe('POST /api/subjects (Protegido)', () => {
  it('deve retornar 401 se nenhum token for fornecido', async () => {
    const response = await request.post('/api/subjects').send({ name: 'Matemática' });
    expect(response.status).toBe(401);
  });

  it('deve criar uma nova disciplina (subject) e retornar 201 (Caminho Feliz)', async () => {
    const dto = { name: 'Matemática' };

    const response = await request
      .post('/api/subjects')
      .set('Authorization', `Bearer ${token}`) // [PADRÃO] Usa o token
      .send(dto);

    // Assert da Resposta
    expect(response.status).toBe(201);
    expect(response.body.id).toBeDefined();
    expect(response.body.name).toBe('Matemática');

    // Assert do Banco de Dados
    const subjectInDb = await prisma.subject.findUnique({
      where: { id: response.body.id },
    });
    expect(subjectInDb).toBeTruthy();
    expect(subjectInDb?.name).toBe('Matemática');
  });

  it('deve retornar 400 se o nome já existir (Regra de Negócio)', async () => {
    // 1. Cria a disciplina
    await prisma.subject.create({ data: { name: 'Matemática' } });

    // 2. Tenta criar de novo
    const dto = { name: 'Matemática' };
    const response = await request
      .post('/api/subjects')
      .set('Authorization', `Bearer ${token}`)
      .send(dto);

    // Assert da Resposta
    expect(response.status).toBe(400);
    expect(response.body.error).toBe('Uma disciplina com este nome já existe.');
  });
});

/**
 * --- Testes de Listagem (GET) ---
 */
describe('GET /api/subjects (Protegido)', () => {
  it('deve retornar 401 se nenhum token for fornecido', async () => {
    const response = await request.get('/api/subjects');
    expect(response.status).toBe(401);
  });

  it('deve retornar uma lista de disciplinas (subjects) e retornar 200', async () => {
    // 1. Cria dados de teste
    await prisma.subject.createMany({
      data: [{ name: 'Matemática' }, { name: 'Português' }],
    });

    // 2. Chama a API
    const response = await request
      .get('/api/subjects')
      .set('Authorization', `Bearer ${token}`);

    // Assert da Resposta
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body).toHaveLength(2);
    // Checa se os nomes estão na resposta
    expect(response.body).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ name: 'Matemática' }),
        expect.objectContaining({ name: 'Português' }),
      ])
    );
  });
});

/**
 * --- Testes de Edição (PUT) ---
 */
describe('PUT /api/subjects/:id (Protegido)', () => {
  let subjectToEdit: Subject;

  // Antes de CADA teste de PUT, cria uma disciplina limpa
  beforeEach(async () => {
    subjectToEdit = await prisma.subject.create({
      data: { name: 'Disciplina Original' },
    });
    subjectId = subjectToEdit.id;
  });

  it('deve retornar 401 se nenhum token for fornecido', async () => {
    const response = await request.put(`/api/subjects/${subjectId}`).send({ name: 'Editado' });
    expect(response.status).toBe(401);
  });

  it('deve editar uma disciplina com sucesso e retornar 200 (Caminho Feliz)', async () => {
    const dto = { name: 'Nome Editado' };

    const response = await request
      .put(`/api/subjects/${subjectId}`)
      .set('Authorization', `Bearer ${token}`)
      .send(dto);

    // Assert da Resposta
    expect(response.status).toBe(200);
    expect(response.body.name).toBe('Nome Editado');

    // Assert do Banco de Dados
    const subjectInDb = await prisma.subject.findUnique({
      where: { id: subjectId },
    });
    expect(subjectInDb?.name).toBe('Nome Editado');
  });

  it('deve retornar 404 se a disciplina não existir (para Update)', async () => {
    const fakeId = '00000000-0000-0000-0000-000000000000';
    const dto = { name: 'Inexistente' };

    const response = await request
      .put(`/api/subjects/${fakeId}`)
      .set('Authorization', `Bearer ${token}`)
      .send(dto);

    // [PADRÃO] O UseCase de Update deve retornar 404
    expect(response.status).toBe(404); 
    expect(response.body.error).toBe('Disciplina não encontrada.');
  });
  
  it('deve retornar 400 se tentar renomear para um nome que já existe', async () => {
    // 1. Cria uma segunda disciplina
    const otherSubject = await prisma.subject.create({
      data: { name: 'Nome Conflitante' },
    });

    // 2. Tenta renomear a original (subjectToEdit) para o nome da segunda
    const dto = { name: 'Nome Conflitante' };
    const response = await request
      .put(`/api/subjects/${subjectId}`) // subjectId é a 'Disciplina Original'
      .set('Authorization', `Bearer ${token}`)
      .send(dto);

    // Assert da Resposta
    expect(response.status).toBe(400);
    expect(response.body.error).toBe('Uma disciplina com este nome já existe.');
  });
});

// Adicione os testes para GET /:id e DELETE /:id aqui quando os implementar...