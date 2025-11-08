import { Router } from 'express';

import { AuthController } from '../controllers/AuthController';

import { AuthenticateUserUseCase } from '../../../application/usecases/AuthenticateUserUseCase';
import { PrismaUserRepository } from '../../../infrastructure/repositories/PrismaUserRepository';

import { FastJwtTokenGenerator } from '../../../infrastructure/services/FastJwtGenerator';
import { BcryptPasswordHasher } from '../../../infrastructure/services/BycriptPasswordHasher';
import { env } from 'process';



const userRepository = new PrismaUserRepository();
const passwordHasher = new BcryptPasswordHasher();

const jwtSecret = env.JWT_SECRET;
if (!jwtSecret) {
  throw new Error('JWT_SECRET is not defined in environment variables.');
}
const tokenGenerator = new FastJwtTokenGenerator(jwtSecret, '1h');


const authenticateUserUseCase = new AuthenticateUserUseCase(userRepository, passwordHasher, tokenGenerator);

const authController = new AuthController(authenticateUserUseCase);

const authRouter = Router();

authRouter.post('/auth', authController.handleAuthenticate.bind(authController)); 

export { authRouter };