// src/interface/http/routes/topicRouter.ts
import { Router } from 'express';

// --- Infraestrutura ---
import { prismaClient } from '../../../infrastructure/prisma/client'; 
import { PrismaTopicRepository } from '../../../infrastructure/repositories/prismaTopicRepository';
import { PrismaSubjectRepository } from '../../../infrastructure/repositories/prismaSubjectRepository'; // NOVA INJEÇÃO
import { PrismaUserRepository } from '../../../infrastructure/repositories/PrismaUserRepository'; 
import { FastJwtTokenGenerator } from '../../../infrastructure/services/FastJwtGenerator'; 

// --- Aplicação (Use Cases) ---
import { CreateTopicUseCase } from '../../../application/usecases/topics/createTopicUseCase';
import { ListTopicsUseCase } from '../../../application/usecases/topics/listTopicsUseCase';
import { UpdateTopicUseCase } from '../../../application/usecases/topics/updateTopicUseCase';
import { GetTopicByIdUseCase } from '../../../application/usecases/topics/getTopicByIdUseCase';
import { DeleteTopicUseCase } from '../../../application/usecases/topics/deleteTopicUseCase';

// --- Interface (Controller & Middleware) ---
import { TopicController, TopicUseCases } from '../controllers/topicController';
import { createAuthMiddleware } from '../middleware/authMiddleware';

const router = Router();

// --- [PADRÃO V2] Resolução da Injeção de Dependência LOCALMENTE ---

// 1. Instancia Serviços
const tokenGenerator = new FastJwtTokenGenerator(process.env.JWT_SECRET!);

// 2. Instancia Repositórios (Note os 3 repositórios agora)
const topicRepository = new PrismaTopicRepository(prismaClient);
const subjectRepository = new PrismaSubjectRepository(prismaClient); // NECESSÁRIO
const userRepository = new PrismaUserRepository(prismaClient);

// 3. Instancia os UseCases (Create e Update recebem 2 repositórios)
const useCases: TopicUseCases = {
  createTopic: new CreateTopicUseCase(topicRepository, subjectRepository),
  listTopics: new ListTopicsUseCase(topicRepository),
  updateTopic: new UpdateTopicUseCase(topicRepository, subjectRepository),
  getTopicById: new GetTopicByIdUseCase(topicRepository),
  deleteTopic: new DeleteTopicUseCase(topicRepository),
};

// 4. Instancia o Controller
const controller = new TopicController(useCases);

// 5. Cria o handler do Middleware
const authMiddlewareHandler = createAuthMiddleware(tokenGenerator, userRepository);

// 6. Define as Rotas (SEM /api)
router.post('/topics', authMiddlewareHandler, controller.create);
router.get('/topics', authMiddlewareHandler, controller.list);
router.get('/topics/:id', authMiddlewareHandler, controller.getById);
router.put('/topics/:id', authMiddlewareHandler, controller.update);
router.delete('/topics/:id', authMiddlewareHandler, controller.delete);

export { router as topicRouter };