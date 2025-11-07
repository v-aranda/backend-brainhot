import { User } from "../../domain/entities/User";
import { UserRepository } from "../../domain/repositories/UserRepository";
import { prisma } from "../prisma/client";

export class PrismaUserRepository implements UserRepository {
  async create(user: User): Promise<void> {
    await prisma.user.create({
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        // passwordHash must be set by use case responsible for auth
        passwordHash: 'UNSET'
      }
    });
  }

  async findByEmail(email: string): Promise<User | null> {
    const row = await prisma.user.findUnique({ where: { email } });
    if (!row) return null;
    return new User({ id: row.id, name: row.name, email: row.email });
  }

  async list(): Promise<User[]> {
    const rows = await prisma.user.findMany();
    return rows.map(r => new User({ id: r.id, name: r.name, email: r.email }));
  }
}


