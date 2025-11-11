// src/infrastructure/repositories/prismaTopicRepository.ts
import { PrismaClient, Topic } from '@prisma/client';
import { prismaClient } from '../prisma/client'; // Importa o singleton
import { ITopicRepository } from '../../domain/repositories/ITopicRepository';
import { CreateTopicDTO, UpdateTopicDTO } from '../../domain/dto/topic.dto';

export class PrismaTopicRepository implements ITopicRepository {
  
  // [PADRÃO] Recebe o prisma via Injeção de Dependência
  constructor(private prisma: PrismaClient = prismaClient) {}

  public async create(data: CreateTopicDTO): Promise<Topic> {
    return this.prisma.topic.create({ data });
  }

  public async findByNameAndSubject(name: string, subjectId: string): Promise<Topic | null> {
    return this.prisma.topic.findFirst({
      where: {
        name,
        subjectId,
      },
    });
  }

  public async findById(id: string): Promise<Topic | null> {
    return this.prisma.topic.findUnique({ where: { id } });
  }

  public async findAll(): Promise<Topic[]> {
    return this.prisma.topic.findMany({
      orderBy: { name: 'asc' },
      include: { subject: true }, // [BÔNUS] Já traz a disciplina
    });
  }

  public async update(id: string, data: UpdateTopicDTO): Promise<Topic | null> {
    try {
      return await this.prisma.topic.update({
        where: { id },
        data,
      });
    } catch (error) {
      return null;
    }
  }

  public async delete(id: string): Promise<Topic | null> {
    try {
      return await this.prisma.topic.delete({
        where: { id },
      });
    } catch (error) {
      return null;
    }
  }
}