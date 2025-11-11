// tests/integration/questions.test.ts
import supertest from 'supertest';
import { createApp } from '../../../src/main/config/app';
import { PrismaClient, Subject, Topic, Question, Alternative } from '@prisma/client';

// [PADRÃO] Instancia o app e o prisma
const app = createApp();
const prisma = new PrismaClient();
const request = supertest(app);

// [PADRÃO] Variáveis globais
let token: string;
let subjectId: string; // Disciplina PAI
let topicId: string;   // Tópico PAI
let questionId: string; // ID da questão criada no POST/PUT

/**
 * Setup: Antes de TUDO, limpa o banco e cria os dados base:
 * 1. Limpa tabelas na ordem correta
 * 2. Cria Usuário e obtém Token
 * 3. Cria Subject (Disciplina) e Topic (Tópico) base
 */
beforeAll(async () => {
  // 1. Limpa o banco na ordem correta
  await prisma.alternative.deleteMany();
  await prisma.question.deleteMany();
  await prisma.topic.deleteMany();
  await prisma.subject.deleteMany();
  await prisma.passwordResetToken.deleteMany();
  await prisma.user.deleteMany();

  // 2. Cria usuário e obtém token
  const userData = {
    name: 'Test User Question',
    email: 'question-admin@test.com',
    password: 'password123',
  };
  await request.post('/api/users').send(userData);
  const loginResponse = await request.post('/api/auth').send({
    email: userData.email,
    password: userData.password,
  });
  token = loginResponse.body.token;

  // 3. Cria Subject e Topic base
  const subject = await prisma.subject.create({
    data: { name: 'Subject Base (Question)' },
  });
  const topic = await prisma.topic.create({
    data: { name: 'Topic Base (Question)', subjectId: subject.id },
  });
  subjectId = subject.id;
  topicId = topic.id;
});

/**
 * Limpa as tabelas transacionais (Questao, Alternativa)
 * antes de CADA teste.
 */
beforeEach(async () => {
  await prisma.alternative.deleteMany();
  await prisma.question.deleteMany();
});

// Desconecta o Prisma no final
afterAll(async () => {
  await prisma.$disconnect();
});

/**
 * --- Testes de Criação (POST /api/questions) ---
 */
describe('POST /api/questions (Protegido)', () => {
  // DTO Base (em inglês)
  const dto = {
    text: 'Quanto é 2 + 2?',
    subjectId: '', // Será preenchido
    topicIds: [], // Será preenchido
    alternatives: [
      { text: '3', isCorrect: false },
      { text: '4', isCorrect: true },
    ],
  };

  it('deve retornar 401 se nenhum token for fornecido', async () => {
    const response = await request.post('/api/questions').send(dto);
    expect(response.status).toBe(401);
  });

  it('deve criar uma nova questão e retornar 201 (Caminho Feliz)', async () => {
    const validDto = {
      ...dto,
      subjectId: subjectId, // Usa o ID do beforeAll
      topicIds: [topicId], // Usa o ID do beforeAll
    };

    const response = await request
      .post('/api/questions')
      .set('Authorization', `Bearer ${token}`)
      .send(validDto);

    // Assert da Resposta
    expect(response.status).toBe(201);
    expect(response.body.id).toBeDefined();
    expect(response.body.text).toBe('Quanto é 2 + 2?');
    expect(response.body.alternatives).toHaveLength(2);
    expect(response.body.topics).toHaveLength(1);
    expect(response.body.subject.id).toBe(subjectId);

    // Salva o ID para outros testes
    questionId = response.body.id;

    // Assert do Banco de Dados
    const questionInDb = await prisma.question.findUnique({
      where: { id: response.body.id },
      include: { alternatives: true, topics: true },
    });
    expect(questionInDb).toBeTruthy();
    expect(questionInDb?.topics[0].id).toBe(topicId);
    const gabaritoDb = questionInDb?.alternatives.find((a) => a.isCorrect);
    expect(gabaritoDb?.text).toBe('4');
  });

  it('deve retornar 400 se faltar gabarito (Regra de Negócio)', async () => {
    const invalidDto = {
      ...dto,
      subjectId: subjectId,
      topicIds: [topicId],
      alternatives: [
        { text: '10', isCorrect: false }, // Sem gabarito
        { text: '11', isCorrect: false },
      ],
    };

    const response = await request
      .post('/api/questions')
      .set('Authorization', `Bearer ${token}`)
      .send(invalidDto);

    expect(response.status).toBe(400);
    expect(response.body.error).toBe('A questão deve ter exatamente 1 alternativa correta.');
  });

  it('deve retornar 404 se o subjectId for inválido (Regra de App)', async () => {
    const invalidDto = {
      ...dto,
      subjectId: '00000000-0000-0000-0000-000000000000', // ID Falso
      topicIds: [topicId],
    };
    const response = await request
      .post('/api/questions')
      .set('Authorization', `Bearer ${token}`)
      .send(invalidDto);
    
    expect(response.status).toBe(404);
    expect(response.body.error).toBe('Disciplina (Subject) não encontrada.');
  });
});

/**
 * --- Testes de Edição (PUT /api/questions/:id) ---
 */
describe('PUT /api/questions/:id (Protegido)', () => {
  let questionToEditId: string;

  // Antes de CADA teste de PUT, cria uma questão limpa
  beforeEach(async () => {
    const question = await prisma.question.create({
      data: {
        text: 'Questão Original',
        subject: { connect: { id: subjectId } },
        topics: { connect: { id: topicId } },
        alternatives: {
          create: [
            { text: 'A', isCorrect: true },
            { text: 'B', isCorrect: false },
          ],
        },
      },
    });
    questionToEditId = question.id;
  });

  it('deve editar uma questão com sucesso (novo gabarito) e retornar 200 (Caminho Feliz)', async () => {
    const dtoEdicao = {
      text: 'Texto Editado',
      alternatives: [ // [PADRÃO] O update DELETA as alternativas antigas e cria estas
        { text: 'Novo A', isCorrect: false },
        { text: 'Novo B', isCorrect: false },
        { text: 'Novo C (Gabarito)', isCorrect: true },
      ],
    };

    const response = await request
      .put(`/api/questions/${questionToEditId}`)
      .set('Authorization', `Bearer ${token}`)
      .send(dtoEdicao);

    // Assert da Resposta
    expect(response.status).toBe(200);
    expect(response.body.text).toBe('Texto Editado');
    expect(response.body.alternatives).toHaveLength(3);
    const gabaritoApi = response.body.alternatives.find((a: Alternative) => a.isCorrect);
    expect(gabaritoApi?.text).toBe('Novo C (Gabarito)');

    // Assert do Banco de Dados
    const questionInDb = await prisma.question.findUnique({
      where: { id: questionToEditId },
      include: { alternatives: true },
    });
    expect(questionInDb?.alternatives).toHaveLength(3);
    const gabaritoDb = questionInDb?.alternatives.find((a) => a.isCorrect);
    expect(gabaritoDb?.text).toBe('Novo C (Gabarito)');
    expect(gabaritoDb?.questionId).toBe(questionToEditId); // Garante que as novas foram criadas
  });

  it('deve retornar 404 se a questão não existir (para Update)', async () => {
    const fakeId = '00000000-0000-0000-0000-000000000000';
    const response = await request
      .put(`/api/questions/${fakeId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ text: 'Inexistente' });

    expect(response.status).toBe(404);
    expect(response.body.error).toBe('Questão não encontrada.');
  });
});


/**
 * --- Testes de Busca (GET /api/questions/:id) ---
 */
describe('GET /api/questions/:id (Protegido)', () => {
  let questionToGetId: string;

  beforeEach(async () => {
     const question = await prisma.question.create({
      data: {
        text: 'Questão para Buscar',
        subject: { connect: { id: subjectId } },
        topics: { connect: { id: topicId } },
        alternatives: { create: [{ text: 'Gabarito', isCorrect: true }] },
      },
    });
    questionToGetId = question.id;
  });

  it('deve buscar uma questão completa por ID e retornar 200 (Caminho Feliz)', async () => {
    const response = await request
      .get(`/api/questions/${questionToGetId}`)
      .set('Authorization', `Bearer ${token}`);
      
    expect(response.status).toBe(200);
    expect(response.body.text).toBe('Questão para Buscar');
    // Checa se os 'includes' do repositório vieram
    expect(response.body.alternatives).toHaveLength(1);
    expect(response.body.topics).toHaveLength(1);
    expect(response.body.subject).toBeDefined();
    expect(response.body.alternatives[0].text).toBe('Gabarito');
  });

  it('deve retornar 404 se a questão não existir (para GET)', async () => {
    const fakeId = '00000000-0000-0000-0000-000000000000';
    const response = await request
      .get(`/api/questions/${fakeId}`)
      .set('Authorization', `Bearer ${token}`);
      
    expect(response.status).toBe(404);
    expect(response.body.error).toBe('Questão não encontrada.');
  });
});

/**
 * --- Testes de Deleção (DELETE /api/questions/:id) ---
 */
describe('DELETE /api/questions/:id (Protegido)', () => {
  let questionToDeleteId: string;

  beforeEach(async () => {
     const question = await prisma.question.create({
      data: {
        text: 'Questão para Deletar',
        subject: { connect: { id: subjectId } },
        alternatives: { create: [{ text: 'Gabarito', isCorrect: true }] },
      },
    });
    questionToDeleteId = question.id;
  });

  it('deve deletar uma questão e suas alternativas (cascade) e retornar 204 (Caminho Feliz)', async () => {
    const response = await request
      .delete(`/api/questions/${questionToDeleteId}`)
      .set('Authorization', `Bearer ${token}`);
      
    expect(response.status).toBe(204); // No Content

    // Assert do Banco de Dados
    const questionInDb = await prisma.question.findUnique({ where: { id: questionToDeleteId }});
    const alternativesInDb = await prisma.alternative.findMany({ where: { questionId: questionToDeleteId }});
    
    expect(questionInDb).toBeNull();
    expect(alternativesInDb).toHaveLength(0); // [PADRÃO] Cascade delete funcionou
  });
});