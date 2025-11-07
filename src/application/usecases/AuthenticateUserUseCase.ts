import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../../infrastructure/prisma/client';
import { env } from '../../main/config/env';

export class AuthenticateUserUseCase {
  async execute(input: { email: string; password: string }): Promise<{ token: string }> {
    const user = await prisma.user.findUnique({ where: { email: input.email } });
    if (!user) {
      throw new Error('Credenciais inválidas');
    }
    const ok = await bcrypt.compare(input.password, user.passwordHash);
    if (!ok) {
      throw new Error('Credenciais inválidas');
    }
    const token = jwt.sign({ sub: user.id, email: user.email }, env.jwtSecret, { expiresIn: '1h' });
    return { token };
  }
}


