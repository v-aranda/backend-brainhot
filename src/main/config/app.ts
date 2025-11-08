import express from "express";
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from '../docs/openapi';

//Rotas
import { userRouter } from '../../interface/http/routes/userRouter';



export const createApp = () => {
  const app = express();
  app.use(express.json());
  app.use(cors());

  app.get("/health", (_req, res) => res.json({ status: "ok" }));
  app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

  
  app.use('/api', userRouter);

  return app;
};


