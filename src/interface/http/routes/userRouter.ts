import { Router } from 'express';
import { env } from 'process'; // <-- ADICIONADO

// Camada de Aplicação (Lógica)
import { CreateUserUseCase } from '../../../application/usecases/CreateUserUseCase';
import { FindUserByIdUseCase } from '../../../application/usecases/FindUserByIdUseCase';
import { FindAllUsersUseCase } from '../../../application/usecases/FindAllUsersUseCase';

// Camada de Infraestrutura (Implementações Concretas)
import { PrismaUserRepository } from '../../../infrastructure/repositories/PrismaUserRepository';
import { BcryptPasswordHasher } from '../../../infrastructure/services/BycriptPasswordHasher';

// Camada de Interface (Controller)
import { UserController } from '../controllers/UserContoller';

// --- ADICIONAR IMPORTS DE AUTENTICAÇÃO ---
import { createAuthMiddleware } from '../middleware/authMiddleware';
import { FastJwtTokenGenerator } from '../../../infrastructure/services/FastJwtGenerator';

// --- A MÁGICA DA INJEÇÃO DE DEPENDÊNCIA ---

// 2. Crie as instâncias concretas (as "ferramentas")
const userRepository = new PrismaUserRepository(); // <-- Usa Prisma
const passwordHasher = new BcryptPasswordHasher(); // <-- Usa Bcrypt

// 3. Crie o Caso de Uso e injete as ferramentas nele
const createUserUseCase = new CreateUserUseCase(
  userRepository,
  passwordHasher
);
const findUserByIdUseCase = new FindUserByIdUseCase(userRepository);
const findAllUsersUseCase = new FindAllUsersUseCase(userRepository);

// 4. Crie o Controller e injete o Caso de Uso nele
const userController = new UserController(
  createUserUseCase,
  findUserByIdUseCase,
  findAllUsersUseCase
);

// --- 5. INSTANCIAR O MIDDLEWARE DE AUTENTICAÇÃO ---
const jwtSecret = env.JWT_SECRET;
if (!jwtSecret) {
  throw new Error('JWT_SECRET is not defined in environment variables.');
}
const tokenGenerator = new FastJwtTokenGenerator(jwtSecret, '1h');
const auth = createAuthMiddleware(tokenGenerator, userRepository);
// --------------------------------------------------

// --- CONFIGURAÇÃO DAS ROTAS ---

const userRouter = Router();

// 6. Conecte o método do controller à rota
// Usamos .bind() para garantir que o 'this' do controller
// funcione corretamente quando o Express o chamar.

// ROTA PÚBLICA
userRouter.post('/users', userController.handleCreateUser.bind(userController));

// ROTAS PROTEGIDAS (agora usam o 'auth')
userRouter.get('/users/:id', auth, userController.handleGetUserByID.bind(userController));
userRouter.get('/users', auth, userController.handleGetAllUsers.bind(userController));


// 7. Exporte o roteador pronto
export { userRouter };