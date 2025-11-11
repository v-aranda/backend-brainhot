// src/interface/http/routes/questionRouter.ts
import { Router } from 'express';

// --- Infraestrutura (Imports) ---
import { prismaClient } from '../../../infrastructure/prisma/client'; 
// Repositórios necessários
import { PrismaQuestionRepository } from '../../../infrastructure/repositories/prismaQuestionRepository';
import { PrismaSubjectRepository } from '../../../infrastructure/repositories/prismaSubjectRepository';
import { PrismaTopicRepository } from '../../../infrastructure/repositories/prismaTopicRepository';
import { PrismaUserRepository } from '../../../infrastructure/repositories/PrismaUserRepository'; 
// Serviços necessários
import { FastJwtTokenGenerator } from '../../../infrastructure/services/FastJwtGenerator'; // [SEU PADRÃO]

// --- Aplicação (Imports) ---
import { CreateQuestionUseCase } from '../../../application/usecases/questions/createQuestionUseCase';
import { UpdateQuestionUseCase } from '../../../application/usecases/questions/updateQuestionUseCase';
import { GetQuestionByIdUseCase } from '../../../application/usecases/questions/getQuestionByIdUseCase';
import { DeleteQuestionUseCase } from '../../../application/usecases/questions/deleteQuestionUseCase';

// --- Interface (Imports) ---
import { QuestionController, QuestionUseCases } from '../controllers/questionController';
import { createAuthMiddleware } from '../middleware/authMiddleware';

const router = Router();

// --- [PADRÃO V2] Resolução da Injeção de Dependência LOCALMENTE ---

// 1. Instancia Serviços (Para o Auth)
const tokenGenerator = new FastJwtTokenGenerator(process.env.JWT_SECRET!);

// 2. Instancia Repositórios (Injetando o singleton do Prisma)
//    (Note que precisamos de TODOS os 4 repositórios aqui)
const questionRepository = new PrismaQuestionRepository(prismaClient);
const subjectRepository = new PrismaSubjectRepository(prismaClient);
const topicRepository = new PrismaTopicRepository(prismaClient);
const userRepository = new PrismaUserRepository(prismaClient);

// 3. Instancia os UseCases (Injetando as dependências de repo)
const useCases: QuestionUseCases = {
  createQuestion: new CreateQuestionUseCase(
    questionRepository,
    subjectRepository,
    topicRepository
  ),
  updateQuestion: new UpdateQuestionUseCase(
    questionRepository,
    subjectRepository,
    topicRepository
  ),
  getQuestionById: new GetQuestionByIdUseCase(questionRepository),
  deleteQuestion: new DeleteQuestionUseCase(questionRepository),
};

// 4. Instancia o Controller (Injetando os UseCases)
const controller = new QuestionController(useCases);

// 5. Cria o handler do Middleware (Injetando dependências do Auth)
const authMiddlewareHandler = createAuthMiddleware(tokenGenerator, userRepository);

// 6. Define as Rotas (SEM /api, [PADRÃO])
router.post('/questions', authMiddlewareHandler, controller.create);
router.put('/questions/:id', authMiddlewareHandler, controller.update);
router.get('/questions/:id', authMiddlewareHandler, controller.getById);
router.delete('/questions/:id', authMiddlewareHandler, controller.delete);

export { router as questionRouter };