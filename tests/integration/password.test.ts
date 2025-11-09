import supertest from 'supertest';
import { createApp } from '../../src/main/config/app';
import { PrismaClient } from '@prisma/client';
import { fakeEmailService } from '../../src/infrastructure/services/FakeEmailService';
// 🌟 Imports adicionados para setup e verificação
import { CryptoTokenHasher } from '../../src/infrastructure/services/CryptoTokenHasher';
import { BcryptPasswordHasher } from '../../src/infrastructure/services/BycriptPasswordHasher';

const app = createApp(fakeEmailService); 
const prisma = new PrismaClient();
const request = supertest(app);

// 🌟 Instanciando os hashers para usar nos testes
const tokenHasher = new CryptoTokenHasher();
const passwordHasher = new BcryptPasswordHasher();

describe('🔑 Password Reset (Integration)', () => {

  // Limpa as tabelas e os emails enviados antes de cada teste
  beforeEach(async () => {
    // A ordem é importante por causa da chave estrangeira
    await prisma.passwordResetToken.deleteMany();
    await prisma.user.deleteMany();
    fakeEmailService.clearSentEmails();
  });

  // Desconecta do banco de dados após todos os testes
  afterAll(async () => {
    await prisma.$disconnect();
  });

  /**
   * --- Teste de Solicitação de Redefinição de Senha (Bloco 1) ---
   */
  describe('POST /api/password/request', () => {

    it('should return 200 and send a reset email if the user exists', async () => {
      // 1. Arrange: Criar um usuário no banco
      const user = await prisma.user.create({
        data: {
          name: 'Test User',
          email: 'registered@example.com',
          passwordHash: 'hashedpassword',
        },
      });

      // 2. Act
      const response = await request
        .post('/api/password/request')
        .send({ email: 'registered@example.com' });

      // 3. Assert (API Response)
      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Se o email estiver registrado, o link de redefinição será enviado.');

      // 4. Assert (Email Sent)
      const sentEmail = fakeEmailService.getLastSentEmail();
      expect(sentEmail).toBeDefined();
      expect(sentEmail?.to).toBe('registered@example.com');
      expect(sentEmail?.body).toContain('token='); 

      // 5. Assert (Database Token)
      const tokenInDb = await prisma.passwordResetToken.findFirst({
        where: { userId: user.id },
      });
      expect(tokenInDb).toBeTruthy();
      expect(tokenInDb?.userId).toBe(user.id);
    });

    it('should return 200 but NOT send an email if the user does NOT exist', async () => {
      // 1. Arrange (Nenhum usuário)
      // 2. Act
      const response = await request
        .post('/api/password/request')
        .send({ email: 'unregistered@example.com' });

      // 3. Assert (API Response)
      expect(response.status).toBe(200);

      // 4. Assert (Email Not Sent)
      expect(fakeEmailService.sentEmails.length).toBe(0);

      // 5. Assert (Database Token)
      const tokenCount = await prisma.passwordResetToken.count();
      expect(tokenCount).toBe(0);
    });
  });


  /**
   * --- 🌟 NOVO: Teste de Redefinição de Senha (Bloco 2) ---
   */
  describe('POST /api/password/reset', () => {

    /**
     * Função helper para criar um usuário e um token válido para os testes
     */
    const setupValidToken = async (props: { used?: boolean; expiresAt?: Date }) => {
      const user = await prisma.user.create({
        data: {
          name: 'Reset User',
          email: 'reset@example.com',
          passwordHash: 'oldPasswordHash',
        },
      });

      const tokenData = tokenHasher.generateToken(); // Gera token limpo e hash
      const expiresAt = props.expiresAt || new Date(Date.now() + 20 * 60 * 1000); // Válido por 20 min
      const used = props.used || false;

      await prisma.passwordResetToken.create({
        data: {
          userId: user.id,
          tokenHash: tokenData.tokenHash, // Salva o hash
          expiresAt: expiresAt,
          used: used,
        },
      });

      return { user, token: tokenData.token }; // Retorna o token limpo
    };

    it('should return 200 and reset the password with a valid token (Happy Path)', async () => {
      // 1. Arrange
      const { user, token } = await setupValidToken({});
      const newPassword = 'myNewStrongPassword123';

      // 2. Act
      const response = await request
        .post('/api/password/reset')
        .send({
          userId: user.id,
          token: token, // Envia o token limpo
          newPassword: newPassword,
        });

      // 3. Assert (API Response)
      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Senha redefinida com sucesso.');

      // 4. Assert (Database Password)
      const updatedUser = await prisma.user.findUnique({ where: { id: user.id } });
      const isPasswordCorrect = await passwordHasher.compare(newPassword, updatedUser!.passwordHash);
      expect(isPasswordCorrect).toBe(true);
      expect(updatedUser!.passwordHash).not.toBe('oldPasswordHash');

      // 5. Assert (Database Token)
      const usedToken = await prisma.passwordResetToken.findFirst({ where: { userId: user.id } });
      expect(usedToken!.used).toBe(true); // Token deve ser marcado como usado
    });

    it('should return 400 if the token is invalid or does not exist', async () => {
      // 1. Arrange
      const { user } = await setupValidToken({}); // Cria um usuário e um token válido
      
      // 2. Act (Envia um token inventado)
      const response = await request
        .post('/api/password/reset')
        .send({
          userId: user.id,
          token: 'invalid_token_string', 
          newPassword: 'newPassword123',
        });
      
      // 3. Assert
      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Token de redefinição inválido.');
    });

    it('should return 400 if the token is expired', async () => {
      // 1. Arrange (Cria um token que expirou 10 minutos atrás)
      const expiresAt = new Date(Date.now() - 10 * 60 * 1000); 
      const { user, token } = await setupValidToken({ expiresAt: expiresAt });

      // 2. Act
      const response = await request
        .post('/api/password/reset')
        .send({
          userId: user.id,
          token: token,
          newPassword: 'newPassword123',
        });
      
      // 3. Assert
      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Token expiration date must be in the future.');
    });

    it('should return 400 if the token was already used', async () => {
      // 1. Arrange (Cria um token válido, mas marca como 'used: true')
      const { user, token } = await setupValidToken({ used: true });

      // 2. Act
      const response = await request
        .post('/api/password/reset')
        .send({
          userId: user.id,
          token: token,
          newPassword: 'newPassword123',
        });
      
      // 3. Assert
      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Token de redefinição já foi utilizado.');
    });

    it('should return 400 if required fields are missing', async () => {
      // 1. Arrange (Vazio)
      // 2. Act
      const response = await request
        .post('/api/password/reset')
        .send({ userId: 'some-id', token: 'some-token' }); // Falta newPassword

      // 3. Assert
      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Campos userId, token e newPassword são obrigatórios.');
    });

  });
});