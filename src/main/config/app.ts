import express from "express";
import cors from 'cors';
import { makeUserRouter } from "../../interface/http/routes/userRoutes";
import authRoutes from "../../interface/http/routes/authRoutes";
import { PrismaUserRepository } from "../../infrastructure/repositories/PrismaUserRepository";
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from '../docs/openapi';


export const createApp = () => {
  const app = express();
  app.use(express.json());
  app.use(cors());
  app.get("/health", (_req, res) => res.json({ status: "ok" }));
  app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  const userRepo = new PrismaUserRepository();
  app.use("/api", makeUserRouter(userRepo));
  app.use("/auth", authRoutes);

  return app;
};


