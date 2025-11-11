// src/interface/http/routes/subjectRouter.ts
import { Router } from 'express';

// --- Infraestrutura ---
import { PrismaSubjectRepository } from '../../../infrastructure/repositories/prismaSubjectRepository';
// [NECESSÁRIO P/ AUTH] Importe o repositório de usuário
import { PrismaUserRepository } from '../../../infrastructure/repositories/PrismaUserRepository'; 
// [NECESSÁRIO P/ AUTH] Importe seu gerador de token (ajuste o nome)
import { FastJwtTokenGenerator } from '../../../infrastructure/services/FastJwtGenerator'; 

// --- Aplicação (Use Cases) ---
// 🚀 SEGUINDO SEU PADRÃO (Plural 'subjects')
import { CreateSubjectUseCase } from '../../../application/usecases/subjects/createSubjectUseCase';
import { ListSubjectsUseCase } from '../../../application/usecases/subjects/listSubjectsUseCase';
import { UpdateSubjectUseCase } from '../../../application/usecases/subjects/updateSubjectsUseCase';


// --- Interface (Controller & Middleware) ---
import { SubjectController, SubjectUseCases } from '../controllers/subjectController';
import { createAuthMiddleware } from '../middleware/authMiddleware'; // A fábrica

const router = Router();

// --- [PADRÃO V2] Resolução da Injeção de Dependência LOCALMENTE ---

// 1. Instancia Repositórios
const subjectRepository = new PrismaSubjectRepository();
const userRepository = new PrismaUserRepository(); // (Dependência do Auth)

// 2. Instancia Serviços
// (Ajuste 'JwtTokenGenerator' e a 'secret' conforme seu projeto)
const tokenGenerator = new FastJwtTokenGenerator(process.env.JWT_SECRET!); // (Dependência do Auth)

// 3. Instancia os UseCases (do Subject)
const useCases: SubjectUseCases = {
  createSubject: new CreateSubjectUseCase(subjectRepository),
  listSubjects: new ListSubjectsUseCase(subjectRepository),
  updateSubject: new UpdateSubjectUseCase(subjectRepository),
};

// 4. Instancia o Controller (do Subject)
const controller = new SubjectController(useCases);

// 5. 🚀 CORREÇÃO CRÍTICA: Chama a FÁBRICA para criar o handler do middleware
//    Nós executamos a função 'createAuthMiddleware' injetando as dependências.
const authMiddlewareHandler = createAuthMiddleware(tokenGenerator, userRepository);

// 6. Define as Rotas (usando o handler)
//    (Note que é só 'authMiddlewareHandler', e não 'authMiddleware.handle')
router.post('/subjects', authMiddlewareHandler, controller.create);
router.get('/subjects', authMiddlewareHandler, controller.list);
router.put('/subjects/:id', authMiddlewareHandler, controller.update);

export { router as subjectRouter };