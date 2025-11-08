import supertest from 'supertest';
// Importa a função que cria seu app
import { createApp } from '../../src/main/config/app'; 
// Importa o cliente Prisma para podermos limpar o banco
import { PrismaClient } from '@prisma/client'; 

// 1. Crie uma instância do app e do prisma
const app = createApp();
const prisma = new PrismaClient();
const request = supertest(app); // O "agente" que faz as requisições

/**
 * --- Limpeza do Banco de Dados ---
 * * Isso é CRUCIAL. Antes de cada teste, limpamos a tabela
 * para que um teste não interfira no outro.
 */
beforeEach(async () => {
  // Use 'deleteMany' para limpar a tabela de usuários.
  // Em um projeto maior, você usaria 'prisma.$transaction'
  // para limpar MÚLTIPLAS tabelas.
  await prisma.user.deleteMany();
});

/**
 * --- Desconexão ---
 * Após TODOS os testes rodarem, fechamos a conexão com o banco.
 */
afterAll(async () => {
  await prisma.$disconnect();
});


/**
 * --- Testes ---
 */
describe('Criação de usuários', () => {

  it('should create a new user and return status 201', async () => {
    // --- 1. Arrange (Arrumar) ---
    const userData = {
      name: 'Integration Test User',
      email: 'integration@test.com',
      password: 'strongpassword123',
    };

    // --- 2. Act (Agir) ---
    // Faz a chamada HTTP simulada
    const response = await request
      .post('/api/users') // Sua rota
      .send(userData);      // O body da requisição

    // --- 3. Assert (Verificar) ---
    
    // A. A resposta HTTP está correta?
    expect(response.status).toBe(201);
    expect(response.body.id).toBeDefined(); // Verifica se um ID foi retornado
    expect(response.body.name).toBe(userData.name);
    expect(response.body.email).toBe(userData.email);
    expect(response.body.passwordHash).toBeUndefined(); // Garante que a SENHA não foi enviada

    // B. O banco de dados está correto?
    const userInDb = await prisma.user.findUnique({
      where: { email: userData.email },
    });
    
    expect(userInDb).toBeTruthy(); // Garante que o usuário existe no DB
    expect(userInDb?.name).toBe(userData.name);
  });

  it('should return 400 if email is already in use', async () => {
    // --- 1. Arrange (Arrumar) ---
    // Primeiro, crie um usuário manualmente (pode ser com o prisma ou com o supertest)
    await request.post('/api/users').send({
      name: 'First User',
      email: 'duplicate@test.com',
      password: 'password123',
    });

    // --- 2. Act (Agir) ---
    // Tente criar o usuário de NOVO com o mesmo email
    const response = await request.post('/api/users').send({
      name: 'Second User',
      email: 'duplicate@test.com', // Email repetido
      password: 'password456',
    });

    // --- 3. Assert (Verificar) ---
    expect(response.status).toBe(400); // Espera um "Bad Request"
    expect(response.body.message).toBe('User with this email already exists.');

    // B. O banco de dados está correto? (Garante que o 2º usuário não foi salvo)
    const usersInDb = await prisma.user.findMany({
      where: { email: 'duplicate@test.com' },
    });
    expect(usersInDb.length).toBe(1); // Só pode ter 1 usuário com esse email
  });

  // Você pode adicionar mais testes aqui (ex: senha faltando, email inválido)
});
describe('Listagem de usuários', () => {
    
  it('should return an empty list when no users exist', async () => {
    const response = await request.get('/api/users');
    expect(response.status).toBe(200);
    expect(response.body).toEqual([]);
  });
    it('should return a list of users when users exist', async () => {
    // Arrange: Crie alguns usuários no banco
    const usersData = [
      { name: 'User One', email: 'userone@test.com', password: 'password123' },
      { name: 'User Two', email: 'usertwo@test.com', password: 'password456' },
    ];

    for (const userData of usersData) {
      await request.post('/api/users').send(userData);
    }

    // Act: Faça a requisição para listar os usuários
    const response = await request.get('/api/users');

    // Assert: Verifique a resposta
    expect(response.status).toBe(200);
    expect(response.body.length).toBe(2);
    expect(response.body[0].email).toBe(usersData[0].email);
    expect(response.body[1].email).toBe(usersData[1].email);
  });

  it('should return a user by ID when the user exists', async () => {
    // Arrange: Crie um usuário no banco
    const userData = { name: 'User Three', email: 'userthree@test.com', password: 'password789' };
    const createResponse = await request.post('/api/users').send(userData);
    const userId = createResponse.body.id;

    // Act: Faça a requisição para buscar o usuário pelo ID
    const response = await request.get(`/api/users/${userId}`);

    // Assert: Verifique a resposta
    expect(response.status).toBe(200);
    expect(response.body.email).toBe(userData.email);
  });

  it('should return 404 when the user does not exist', async () => {
    // Act: Faça a requisição para um ID que não existe
    const response = await request.get('/api/users/non-existent-id');
    
    // Assert: Verifique a resposta
    expect(response.status).toBe(404);
    expect(response.body.message).toBe('User not found.');
  });
}); 