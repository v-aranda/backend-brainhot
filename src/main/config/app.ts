import express, { Request, Response } from "express";
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from '../docs/openapi';
import { EmailService } from '../../application/services/EmailService'; // Importar o Type

// Rotas
import { userRouter } from '../../interface/http/routes/userRouter';
import { authRouter } from '../../interface/http/routes/AuthRouter';
import { createPasswordRouter } from '../../interface/http/routes/PasswordRouter'; // 🌟 MUDANÇA AQUI: Será uma função

// 💡 Defina uma instância Padrão (de produção) para uso normal
// Você precisará definir o serviço de e-mail padrão aqui (pode ser o fakeService ou um real)
// Por enquanto, vamos importar o fake para garantir que funcione se for o padrão de dev
import { NodemailerEmailService } from '../../infrastructure/services/NodemailerEmailService';

// Defina o serviço de email padrão para produção
const productionEmailService: EmailService = new NodemailerEmailService();


export const createApp = (emailServiceOverride?: EmailService) => { // Aceita um override
  const app = express();
  app.use(express.json());
  app.use(cors());

  const currentEmailService = emailServiceOverride || productionEmailService; // Use o override ou o padrão

  app.get("/health", (_req: Request, res: Response) => res.json({ status: "ok" }));
  app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

  
  app.use('/api', userRouter);
  app.use('/api', authRouter);

  // 🌟 MUDANÇA AQUI: Chama a função para criar o router, injetando o serviço
  app.use('/api', createPasswordRouter(currentEmailService));

  return app;
};