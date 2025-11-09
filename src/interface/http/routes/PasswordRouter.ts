import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

// Controllers
import { PasswordController } from '../controllers/PasswordController';
import { ResetPasswordController } from '../controllers/ResetPasswordController';

// Use Cases
import { RequestPasswordResetUseCase } from '../../../application/usecases/RequestPasswordResetUseCase';
import { ResetPasswordUseCase } from '../../../application/usecases/ResetPasswordUseCase';

// Repositories
import { PrismaUserRepository } from '../../../infrastructure/repositories/PrismaUserRepository';
import { PrismaPasswordResetTokenRepository } from '../../../infrastructure/repositories/PrismaPasswordResetTokenRepository';

// Services (Hashers e Email)
import { CryptoTokenHasher } from '../../../infrastructure/services/CryptoTokenHasher';
import { BcryptPasswordHasher } from '../../../infrastructure/services/BycriptPasswordHasher';
import { EmailService } from '../../../application/services/EmailService';

const prismaClient = new PrismaClient();
const passwordHasher = new BcryptPasswordHasher(); // Hasher de Senha (Bcrypt)

// Função de criação do Router que recebe o EmailService
export const createPasswordRouter = (emailService: EmailService): Router => {
    
    // --- Dependências Compartilhadas ---
    const userRepository = new PrismaUserRepository(prismaClient);
    const tokenRepository = new PrismaPasswordResetTokenRepository(prismaClient);
    const tokenHasher = new CryptoTokenHasher(); // Hasher de Token (Crypto)

    // --- Bloco 1: Solicitação de E-mail ---
    const requestPasswordResetUseCase = new RequestPasswordResetUseCase(
        userRepository,
        tokenRepository,
        tokenHasher,
        emailService // Injetado
    );
    const passwordController = new PasswordController(requestPasswordResetUseCase);

    // --- Bloco 2: Redefinição de Senha ---
    const resetPasswordUseCase = new ResetPasswordUseCase(
        userRepository,
        tokenRepository,
        passwordHasher, // Hasher de Senha (Bcrypt)
        tokenHasher     // Hasher de Token (Crypto)
    );
    const resetController = new ResetPasswordController(resetPasswordUseCase);

    
    // --- Configuração das Rotas ---
    const passwordRouter = Router();

    // Rota A: Solicitar link
    passwordRouter.post(
        '/password/request', 
        passwordController.handlePasswordRequest.bind(passwordController)
    );
    
    // Rota B: Redefinir a senha com o link
    passwordRouter.post(
        '/password/reset', 
        resetController.handle.bind(resetController)
    );

    return passwordRouter;
};