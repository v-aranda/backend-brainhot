import { Router } from 'express';

// 1. Importe TUDO que precisa ser "construído"

// Camada de Aplicação (Lógica)
import { CreateUserUseCase } from '../../../application/usecases/CreateUserUseCase';
import { FindUserByIdUseCase } from '../../../application/usecases/FindUserByIdUseCase';
import { FindAllUsersUseCase } from '../../../application/usecases/FindAllUsersUseCase';

// Camada de Infraestrutura (Implementações Concretas)
import { PrismaUserRepository } from '../../../infrastructure/repositories/PrismaUserRepository';
import { BcryptPasswordHasher } from '../../../infrastructure/services/BycriptPasswordHasher';

// Camada de Interface (Controller)
import { UserController } from '../controllers/UserContoller';

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

// --- CONFIGURAÇÃO DAS ROTAS ---

const userRouter = Router();

// 5. Conecte o método do controller à rota
// Usamos .bind() para garantir que o 'this' do controller
// funcione corretamente quando o Express o chamar.
userRouter.post('/users', userController.handleCreateUser.bind(userController));
userRouter.get('/users/:id', userController.handleGetUserByID.bind(userController));
userRouter.get('/users', userController.handleGetAllUsers.bind(userController));


// 6. Exporte o roteador pronto
export { userRouter };