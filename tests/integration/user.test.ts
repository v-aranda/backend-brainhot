import supertest from 'supertest';
import { createApp } from '../../src/main/config/app'; 
import { PrismaClient } from '@prisma/client'; 

const app = createApp();
const prisma = new PrismaClient();
const request = supertest(app);

beforeEach(async () => {
  await prisma.user.deleteMany();
});

afterAll(async () => {
  await prisma.$disconnect();
});

/**
 * --- Testes de Criação (Rotas Públicas) ---
 */
describe('Criação de usuários (Público)', () => {

  it('should create a new user and return status 201', async () => {
    const userData = {
      name: 'Integration Test User',
      email: 'integration@test.com',
      password: 'strongpassword123',
    };

    const response = await request
      .post('/api/users')
      .send(userData);
      
    expect(response.status).toBe(201);
    expect(response.body.id).toBeDefined();
    expect(response.body.name).toBe(userData.name);
    
    const userInDb = await prisma.user.findUnique({
      where: { email: userData.email },
    });
    expect(userInDb).toBeTruthy();
  });

  it('should return 400 if email is already in use', async () => {
    await request.post('/api/users').send({
      name: 'First User',
      email: 'duplicate@test.com',
      password: 'password123',
    });

    const response = await request.post('/api/users').send({
      name: 'Second User',
      email: 'duplicate@test.com',
      password: 'password456',
    });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe('User with this email already exists.');
  });
});

/**
 * --- Testes de Listagem (Rotas Protegidas) ---
 */
describe('Listagem de usuários (Protegido)', () => {
  
  let token: string;
  let userId: string;

  // Antes de CADA teste neste bloco, criar um usuário e logar
  beforeEach(async () => {
    // 1. Criar usuário
    const userData = {
      name: 'Test User List',
      email: 'test-list@example.com',
      password: 'password123',
    };
    const createResponse = await request.post('/api/users').send(userData);
    userId = createResponse.body.id; // Salva o ID para o teste de "busca por ID"

    // 2. Fazer login para obter o token
    const loginResponse = await request.post('/api/auth').send({
      email: userData.email,
      password: userData.password,
    });
    
    token = loginResponse.body.token; // Salva o token para os testes usarem
  });
  
  it('should return 401 if no token is provided (GET /users)', async () => {
    const response = await request.get('/api/users');
    expect(response.status).toBe(401);
    expect(response.body.message).toBe('Token not provided.');
  });

  it('should return 401 if no token is provided (GET /users/:id)', async () => {
    const response = await request.get(`/api/users/${userId}`);
    expect(response.status).toBe(401);
    expect(response.body.message).toBe('Token not provided.');
  });

  it('should return a list of users when authenticated', async () => {
    // Act: Faça a requisição ENVIANDO O TOKEN
    const response = await request.get('/api/users')
      .set('Authorization', `Bearer ${token}`); // <-- Enviando o token

    // Assert: Verifique a resposta
    expect(response.status).toBe(200);
    expect(response.body.length).toBe(1);
    expect(response.body[0].email).toBe('test-list@example.com');
  });

  it('should return a user by ID when authenticated', async () => {
    // Act: Faça a requisição ENVIANDO O TOKEN
    const response = await request.get(`/api/users/${userId}`)
      .set('Authorization', `Bearer ${token}`); // <-- Enviando o token

    // Assert: Verifique a resposta
    expect(response.status).toBe(200);
    expect(response.body.email).toBe('test-list@example.com');
  });

  it('should return 404 when the user does not exist (but token is valid)', async () => {
    const fakeId = '00000000-0000-0000-0000-000000000000';

    const response = await request.get(`/api/users/${fakeId}`)
      .set('Authorization', `Bearer ${token}`); // <-- Enviando o token
    
    expect(response.status).toBe(404);
    expect(response.body.message).toBe('User not found.');
  });
});