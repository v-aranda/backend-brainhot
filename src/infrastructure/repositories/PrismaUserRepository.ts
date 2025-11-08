// 1. Importações da Infra (Prisma)
import { PrismaClient } from "@prisma/client";
import { prismaClient } from "../prisma/client"; // Nosso cliente instanciado

// 2. Importações do Domínio
import { User } from "../../domain/entities/User";
import { UserRepository } from "../../domain/repositories/UserRepository";

export class PrismaUserRepository implements UserRepository {
  // Recebe o cliente Prisma (ou usa o padrão)
  constructor(private prisma: PrismaClient = prismaClient) {}
  async save(user: User): Promise<void> {
    // "Traduz" a Entidade de Domínio para os dados
    // que o Prisma espera.
    const data = {
      id: user.id,
      name: user.name,
      email: user.email,
      passwordHash: user.passwordhash,
      createdAt: user.createdAt,
    };

    // 'upsert' é uma operação do Prisma que cria ou atualiza
    await this.prisma.user.upsert({
      where: { id: user.id },
      update: data,
      create: data,
    });
  }
  async findByEmail(email: string): Promise<User | null> {
    // busca no banco pelo email fornecido
    const userFromDb = await this.prisma.user.findUnique({
      where: { email },
    });

    // Se não encontrou, retorne null
    if (!userFromDb) {
      return null;
    }

    // Se encontrou, "traduz" os dados do DB para o formato da Entidade de Domínio
    return User.create({
      id: userFromDb.id,
      name: userFromDb.name,
      email: userFromDb.email,
      passwordhash: userFromDb.passwordHash,
      createdAt: userFromDb.createdAt,
    });
  }

  async findById(id: string): Promise<User | null> {
    const userFromDb = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!userFromDb) {
      return null;
    }

    return User.create({
      id: userFromDb.id,
      name: userFromDb.name,
      email: userFromDb.email,
      passwordhash: userFromDb.passwordHash,
      createdAt: userFromDb.createdAt,
    });
  }
  async findAll(): Promise<User[]> {
    const usersFromDb = await this.prisma.user.findMany();

    return usersFromDb.map((userFromDb) =>
      User.create({
        id: userFromDb.id,
        name: userFromDb.name,
        email: userFromDb.email,
        passwordhash: userFromDb.passwordHash,
        createdAt: userFromDb.createdAt,
      })
    );
  }
}
