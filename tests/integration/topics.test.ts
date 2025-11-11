// tests/integration/topics.test.ts
import supertest from 'supertest';
import { createApp } from '../../src/main/config/app';
import { PrismaClient, Subject, Topic } from '@prisma/client'; // Importa os tipos

// [PADRÃO] Instancia o app e o prisma
const app = createApp();
const prisma = new PrismaClient();
const request = supertest(app);

// [PADRÃO] Variáveis globais para token e IDs
let token: string;
let subjectId: string; // ID da Disciplina PAI
let topicId: string; // ID do Tópico criado

/**
 * Setup: Antes de TUDO, limpa o banco e cria os dados base:
 * 1. Limpa todas as tabelas na ordem correta
 * 2. Um Usuário (para autenticação)
 * 3. Faz login e salva o Token
 * 4. [NOVO] Cria uma Disciplina (Subject) base para os testes
 */
beforeAll(async () => {
  // 1. Limpa o banco na ordem correta
  await prisma.alternative.deleteMany();
  await prisma.question.deleteMany();
  await prisma.topic.deleteMany();
  await prisma.subject.deleteMany();
  await prisma.passwordResetToken.deleteMany();
  await prisma.user.deleteMany();

  // 2. Cria um usuário (via API)
  const userData = {
    name: 'Test User Topic',
    email: 'topic-admin@test.com',
    password: 'password123',
  };
  await request.post('/api/users').send(userData);

  // 3. Faz login para obter o token
  const loginResponse = await request.post('/api/auth').send({
    email: userData.email,
    password: userData.password,
  });
  token = loginResponse.body.token;

  // 4. [NOVO] Cria a Disciplina (Subject) base direto no DB
  const subject = await prisma.subject.create({
    data: { name: 'Disciplina Base para Tópicos' },
  });
  subjectId = subject.id; // Salva o ID global
});

/**
 * Limpa as tabelas transacionais (Topic, Question, etc.)
 * antes de CADA teste.
 */
beforeEach(async () => {
  // Limpa na ordem correta (filhas primeiro)
  await prisma.alternative.deleteMany();
  await prisma.question.deleteMany();
  await prisma.topic.deleteMany();
  // Não limpa Subject nem User (são a base)
});

// Desconecta o Prisma no final
afterAll(async () => {
  await prisma.$disconnect();
});

/**
 * --- Testes de Criação (POST /api/topics) ---
 */
describe('POST /api/topics (Protegido)', () => {
  it('deve retornar 401 se nenhum token for fornecido', async () => {
    const response = await request.post('/api/topics').send({ name: 'Álgebra', subjectId });
    expect(response.status).toBe(401);
  });

  it('deve criar um novo tópico e retornar 201 (Caminho Feliz)', async () => {
    const dto = {
      name: 'Álgebra',
      subjectId: subjectId, // Usa o ID global do beforeAll
    };

    const response = await request
      .post('/api/topics')
      .set('Authorization', `Bearer ${token}`)
      .send(dto);

    // Assert da Resposta
    expect(response.status).toBe(201);
    expect(response.body.id).toBeDefined();
    expect(response.body.name).toBe('Álgebra');
    expect(response.body.subjectId).toBe(subjectId);

    // Assert do Banco de Dados
    const topicInDb = await prisma.topic.findUnique({
      where: { id: response.body.id },
    });
    expect(topicInDb).toBeTruthy();
    expect(topicInDb?.subjectId).toBe(subjectId);
  });

  it('deve retornar 404 se a Disciplina (subjectId) não existir (Regra de Negócio)', async () => {
    const fakeSubjectId = '00000000-0000-0000-0000-000000000000';
    const dto = {
      name: 'Tópico Órfão',
      subjectId: fakeSubjectId,
    };

    const response = await request
      .post('/api/topics')
      .set('Authorization', `Bearer ${token}`)
      .send(dto);

    // Assert da Resposta (Use Case deve validar)
    expect(response.status).toBe(404);
    expect(response.body.error).toBe('Disciplina (Subject) não encontrada.');
  });

  it('deve retornar 400 se o nome já existir (dentro da mesma Disciplina)', async () => {
    // 1. Cria o tópico "Álgebra"
    await prisma.topic.create({
      data: { name: 'Álgebra', subjectId: subjectId },
    });

    // 2. Tenta criar "Álgebra" de novo NA MESMA DISCIPLINA
    const dto = {
      name: 'Álgebra',
      subjectId: subjectId,
    };
    const response = await request
      .post('/api/topics')
      .set('Authorization', `Bearer ${token}`)
      .send(dto);

    // Assert da Resposta
    expect(response.status).toBe(400);
    expect(response.body.error).toBe('Um tópico com este nome já existe nesta disciplina.');
  });
});

/**
 * --- Testes de Listagem (GET /api/topics) ---
 */
describe('GET /api/topics (Protegido)', () => {
  it('deve retornar 401 se nenhum token for fornecido', async () => {
    const response = await request.get('/api/topics');
    expect(response.status).toBe(401);
  });

  it('deve retornar uma lista de tópicos (com subject) e retornar 200', async () => {
    // 1. Cria dados de teste
    await prisma.topic.createMany({
      data: [
        { name: 'Álgebra', subjectId: subjectId },
        { name: 'Geometria', subjectId: subjectId },
      ],
    });

    // 2. Chama a API
    const response = await request
      .get('/api/topics')
      .set('Authorization', `Bearer ${token}`);

    // Assert da Resposta
    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(2);

    // 🚀 CORREÇÃO: Checa se o array contém os itens, independente da ordem
    expect(response.body).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ name: 'Álgebra' }),
        expect.objectContaining({ name: 'Geometria' }),
      ])
    );

    // 🚀 CORREÇÃO: Procura o item para checar o 'include'
    const algebraTopic = response.body.find((t: any) => t.name === 'Álgebra');
    expect(algebraTopic.subject).toBeDefined();
    expect(algebraTopic.subject.name).toBe('Disciplina Base para Tópicos');
  });
});

/**
 * --- Testes de Edição (PUT /api/topics/:id) ---
 */
describe('PUT /api/topics/:id (Protegido)', () => {
  let topicToEdit: Topic;

  // Antes de CADA teste de PUT, cria um tópico limpo
  beforeEach(async () => {
    topicToEdit = await prisma.topic.create({
      data: { name: 'Tópico Original', subjectId: subjectId },
    });
    topicId = topicToEdit.id;
  });

  it('deve editar um tópico com sucesso (só o nome) e retornar 200 (Caminho Feliz)', async () => {
    const dto = { name: 'Nome Editado' };

    const response = await request
      .put(`/api/topics/${topicId}`)
      .set('Authorization', `Bearer ${token}`)
      .send(dto);

    // Assert da Resposta
    expect(response.status).toBe(200);
    expect(response.body.name).toBe('Nome Editado');
    expect(response.body.subjectId).toBe(subjectId); // Não mudou

    // Assert do Banco de Dados
    const topicInDb = await prisma.topic.findUnique({ where: { id: topicId } });
    expect(topicInDb?.name).toBe('Nome Editado');
  });

  it('deve editar um tópico (mudando a disciplina) e retornar 200', async () => {
    // 1. Cria uma SEGUNDA disciplina
    const otherSubject = await prisma.subject.create({
      data: { name: 'Outra Disciplina' },
    });

    const dto = {
      name: 'Tópico Movido',
      subjectId: otherSubject.id, // Move para a nova disciplina
    };

    const response = await request
      .put(`/api/topics/${topicId}`)
      .set('Authorization', `Bearer ${token}`)
      .send(dto);

    // Assert da Resposta
    expect(response.status).toBe(200);
    expect(response.body.name).toBe('Tópico Movido');
    expect(response.body.subjectId).toBe(otherSubject.id);

    // Assert do Banco de Dados
    const topicInDb = await prisma.topic.findUnique({ where: { id: topicId } });
    expect(topicInDb?.subjectId).toBe(otherSubject.id);
  });

  it('deve retornar 404 se o Tópico (topicId) não existir (para Update)', async () => {
    const fakeId = '00000000-0000-0000-0000-000000000000';
    const dto = { name: 'Inexistente' };

    const response = await request
      .put(`/api/topics/${fakeId}`)
      .set('Authorization', `Bearer ${token}`)
      .send(dto);

    expect(response.status).toBe(404);
    expect(response.body.error).toBe('Tópico não encontrado.');
  });
  
  it('deve retornar 404 se a nova Disciplina (subjectId) não existir (para Update)', async () => {
    const fakeSubjectId = '00000000-0000-0000-0000-000000000000';
    const dto = {
      subjectId: fakeSubjectId, // Tenta mover para uma disciplina inexistente
    };

    const response = await request
      .put(`/api/topics/${topicId}`)
      .set('Authorization', `Bearer ${token}`)
      .send(dto);

    expect(response.status).toBe(404);
    expect(response.body.error).toBe('Disciplina (Subject) não encontrada.');
  });
  
  it('deve retornar 400 se tentar renomear para um nome que já existe (na mesma disciplina)', async () => {
    // 1. Cria um segundo tópico
    const otherTopic = await prisma.topic.create({
      data: { name: 'Nome Conflitante', subjectId: subjectId },
    });

    // 2. Tenta renomear o 'Tópico Original' para 'Nome Conflitante'
    const dto = { name: 'Nome Conflitante' };
    const response = await request
      .put(`/api/topics/${topicId}`) // topicId é o 'Tópico Original'
      .set('Authorization', `Bearer ${token}`)
      .send(dto);

    // Assert da Resposta
    expect(response.status).toBe(400);
    expect(response.body.error).toBe('Um tópico com este nome já existe nesta disciplina.');
  });
});

// Adicione os testes para GET /:id e DELETE /:id aqui (são similares ao de Subject)