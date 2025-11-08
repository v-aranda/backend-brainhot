import { Request, Response, NextFunction } from 'express';
import { TokenGenerator, TokenPayload } from '../../../application/services/TokenGenerator';
import { UserRepository } from '../../../domain/repositories/UserRepository';

/**
 * Esta é uma "fábrica" de middleware.
 * Criamos ela para poder injetar nossas dependências (serviços)
 * no middleware, já que o Express não faz isso nativamente.
 */
export const createAuthMiddleware = (
  tokenGenerator: TokenGenerator,
  userRepository: UserRepository
) => {
  /**
   * Este é o middleware real que o Express vai usar.
   */
  return async (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;

    // 1. Verifica se o header de autorização existe
    if (!authHeader) {
      return res.status(401).json({ message: 'Token not provided.' });
    }

    // 2. Verifica o formato do token (Bearer xxxxx)
    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      return res.status(401).json({ message: 'Token malformatted.' });
    }

    const token = parts[1];

    try {
      // 3. Verifica se o token é válido (não expirado, assinatura correta)
      const payload = tokenGenerator.verify(token) as TokenPayload | null;

      if (!payload) {
        return res.status(401).json({ message: 'Token invalid or expired.' });
      }

      // 4. Verifica se o usuário do token ainda existe no banco
      const user = await userRepository.findById(payload.id);

      if (!user) {
        return res.status(401).json({ message: 'User not found.' });
      }

      // 5. Se tudo estiver OK, anexa o ID do usuário à requisição
      req.user = user;

      // Deixa a requisição continuar para o Controller
      return next();
    } catch (error) {
      return res.status(401).json({ message: 'Token invalid.' });
    }
  };
};