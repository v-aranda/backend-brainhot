import { randomUUID } from 'crypto';
import bcrypt from 'bcryptjs';
import { prisma } from '../../infrastructure/prisma/client';
import { User } from '../../domain/entities/User';

export class RegisterUserUseCase {
  async execute(input: { name: string; email: string; password: string }): Promise<User> {
    const existing = await prisma.user.findUnique({ where: { email: input.email } });
    if (existing) {
      throw new Error('E-mail já cadastrado');
    }
    const passwordHash = await bcrypt.hash(input.password, 10);
    const id = randomUUID();
    const created = await prisma.user.create({
      data: { id, name: input.name, email: input.email, passwordHash }
    });
    return new User({ id: created.id, name: created.name, email: created.email });
  }
}


