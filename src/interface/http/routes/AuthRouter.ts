import { Router } from 'express';

import { AuthController } from '../controllers/AuthController';

import { AuthenticateUserUseCase } from '../../../application/usecases/AuthenticateUserUseCase';
import { PrismaUserRepository } from '../../../infrastructure/repositories/PrismaUserRepository';
import { JwtTokenGenerator } from '../../../infrastructure/services/JwtTokenGenerator';
import { BcryptPasswordHasher } from '../../../infrastructure/services/BycriptPasswordHasher';
import { env } from 'process';



const userRepository = new PrismaUserRepository();
const passwordHasher = new BcryptPasswordHasher();
const tokenGenerator = new JwtTokenGenerator(env.JWT_SECRET, '1h');


const authenticateUserUseCase = new AuthenticateUserUseCase(userRepository, passwordHasher, tokenGenerator);

const authController = new AuthController(authenticateUserUseCase);

const authRouter = Router();

authRouter.post('/auth', authController.handleAuthenticate.bind(authController)); 

export { authRouter };