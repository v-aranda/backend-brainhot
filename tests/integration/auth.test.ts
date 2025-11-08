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

describe('Login do usuário', () => {
    it('Deve autenticar um usuário com credenciais válidas', async () => {
        // Primeiro, criamos um usuário diretamente no banco
        const newUser = await prisma.user.create({
            data: {
                email: 'user@example.com',
                password: 'password123',
            },
        });
        // Agora, tentamos autenticar com as credenciais corretas
        const response = await request.post('/api/auth').send({
            email: 'user@example.com',
            password: 'password123',
        });

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('token');
    });
});
    