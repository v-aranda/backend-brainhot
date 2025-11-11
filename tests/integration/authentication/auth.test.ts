import supertest from "supertest";
import { createApp } from '../../../src/main/config/app';
import { PrismaClient } from "@prisma/client";
import * as bcrypt from 'bcrypt';

const app = createApp();
const prisma = new PrismaClient();
const request = supertest(app);

beforeEach(async () => {
  await prisma.user.deleteMany();
});

afterAll(async () => {
  await prisma.$disconnect();
});

describe("Autenticação de Usuário", () => {
  
  it("Deve autenticar um usuário com credenciais válidas", async () => {
    // --- Arrange ---
    const passwordHash = await bcrypt.hash("password123", 10);
    await prisma.user.create({
      data: {
        name: "Test User",
        email: "user@example.com",
        passwordHash: passwordHash,
      },
    });

    // --- Act ---
    const response = await request.post("/api/auth").send({ // Rota corrigida
      email: "user@example.com",
      password: "password123",
    });

    // --- Assert ---
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("token");
  });

  it("Deve validar uma sessão com um token válido", async () => {
    // --- Arrange ---
    // 1. Criar usuário
    const passwordHash = await bcrypt.hash("password123", 10);
    const user = await prisma.user.create({
      data: {
        name: "Validate User",
        email: "validate@example.com",
        passwordHash: passwordHash,
      },
    });

    // 2. Fazer login para obter o token
    const loginResponse = await request.post("/api/auth").send({
      email: "validate@example.com",
      password: "password123",
    });
    const token = loginResponse.body.token;

    // --- Act ---
    // 3. Tentar validar a sessão
    const response = await request.get("/api/sessions/validate")
      .set('Authorization', `Bearer ${token}`); // Envia o token

    // --- Assert ---
    expect(response.status).toBe(200);
    expect(response.body.id).toBe(user.id);
    expect(response.body.email).toBe(user.email);
  });

  it("Deve retornar 401 ao tentar validar uma sessão sem token", async () => {
    // --- Act ---
    const response = await request.get("/api/sessions/validate");

    // --- Assert ---
    expect(response.status).toBe(401);
    expect(response.body.message).toBe('Token not provided.');
  });
});