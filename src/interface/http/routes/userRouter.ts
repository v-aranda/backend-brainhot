import { Router } from 'express';
import { env } from 'process';

// Camada de Aplicação (Lógica)
import { CreateUserUseCase } from '../../../application/usecases/CreateUserUseCase';
import { FindUserByIdUseCase } from '../../../application/usecases/FindUserByIdUseCase';
import { FindAllUsersUseCase } from '../../../application/usecases/FindAllUsersUseCase';
// --- NOVO: Edição ---
import { EditUserUseCase } from '../../../application/usecases/EditUserUseCase'; 

// Camada de Infraestrutura (Implementações Concretas)
import { PrismaUserRepository } from '../../../infrastructure/repositories/PrismaUserRepository';
import { BcryptPasswordHasher } from '../../../infrastructure/services/BycriptPasswordHasher';

// Camada de Interface (Controller)
import { UserController } from '../controllers/UserContoller';

// Imports para o Middleware de Autenticação
import { createAuthMiddleware } from '../middleware/authMiddleware';
import { FastJwtTokenGenerator } from '../../../infrastructure/services/FastJwtGenerator';

// --- A MÁGICA DA INJEÇÃO DE DEPENDÊNCIA ---

// 2. Crie as instâncias concretas (as "ferramentas")
const userRepository = new PrismaUserRepository(); 
const passwordHasher = new BcryptPasswordHasher(); 

// 3. Crie os Casos de Uso e injete as ferramentas
const createUserUseCase = new CreateUserUseCase(userRepository, passwordHasher);
const findUserByIdUseCase = new FindUserByIdUseCase(userRepository);
const findAllUsersUseCase = new FindAllUsersUseCase(userRepository);
// --- NOVO: Instancie o Use Case de Edição ---
const editUserUseCase = new EditUserUseCase(userRepository); 

// 4. Crie o Controller e injete TODOS os Casos de Uso
const userController = new UserController(
  createUserUseCase,
  findUserByIdUseCase,
  findAllUsersUseCase,
  editUserUseCase // <--- NOVO: Injeção do EditUserUseCase
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

// ROTA PÚBLICA (Criação)
userRouter.post('/users', userController.handleCreateUser.bind(userController));

// ROTAS PROTEGIDAS (Listagem e Busca)
userRouter.get('/users/:id', auth, userController.handleGetUserByID.bind(userController));
userRouter.get('/users', auth, userController.handleGetAllUsers.bind(userController));

// --- ROTA PROTEGIDA DE EDIÇÃO ---
userRouter.put('/users/:id', auth, userController.handleEdit.bind(userController)); 


// 6. Exporte o roteador pronto
export { userRouter };