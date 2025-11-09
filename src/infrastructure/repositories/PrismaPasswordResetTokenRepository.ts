import { PrismaClient } from '@prisma/client';
import { prismaClient } from '../prisma/client';

import { PasswordResetToken } from '../../domain/entities/PasswordResetToken';
import { PasswordResetTokenRepository } from '../../domain/repositories/PasswordResetTokenRepository';

export class PrismaPasswordResetTokenRepository implements PasswordResetTokenRepository {
  constructor(private prisma: PrismaClient = prismaClient) {}

  async save(token: PasswordResetToken): Promise<void> {
    await this.prisma.passwordResetToken.upsert({
      where: { id: token.id },
      update: {
        tokenHash: token.tokenHash,
        expiresAt: token.expiresAt,
        used: token.used,
      },
      create: {
        id: token.id,
        tokenHash: token.tokenHash,
        userId: token.userId,
        expiresAt: token.expiresAt,
        used: token.used,
      },
    });
  }

  async findByTokenHash(tokenHash: string): Promise<PasswordResetToken | null> {
    const tokenFromDb = await this.prisma.passwordResetToken.findUnique({
      where: { tokenHash },
      include: { user: true },
    });

    if (!tokenFromDb) {
      return null;
    }

    return PasswordResetToken.create({
      id: tokenFromDb.id,
      tokenHash: tokenFromDb.tokenHash,
      userId: tokenFromDb.userId,
      expiresAt: tokenFromDb.expiresAt,
      used: tokenFromDb.used,
      createdAt: tokenFromDb.createdAt,
    });
  }

  async findById(id: string): Promise<PasswordResetToken | null> {
    const tokenFromDb = await this.prisma.passwordResetToken.findUnique({
      where: { id },
    });

    if (!tokenFromDb) {
      return null;
    }

    return PasswordResetToken.create({
      id: tokenFromDb.id,
      tokenHash: tokenFromDb.tokenHash,
      userId: tokenFromDb.userId,
      expiresAt: tokenFromDb.expiresAt,
      used: tokenFromDb.used,
      createdAt: tokenFromDb.createdAt,
    });
  }
}