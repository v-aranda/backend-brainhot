// src/infrastructure/repositories/prismaSubjectRepository.ts
import { PrismaClient, Subject } from '@prisma/client';
// [CORREÇÃO] Importa a *instância* singleton, como no seu exemplo
import { prismaClient } from '../prisma/client'; 
import { ISubjectRepository } from '../../domain/repositories/ISubjectRepository';
import { CreateSubjectDTO, UpdateSubjectDTO } from '../../domain/dto/subject.dto';

export class PrismaSubjectRepository implements ISubjectRepository {
  
  // [CORREÇÃO] Recebe o prisma via Injeção de Dependência, usando o singleton como Padrão
  constructor(private prisma: PrismaClient = prismaClient) {}

  public async create(data: CreateSubjectDTO): Promise<Subject> {
    // [CORREÇÃO] Usa o 'this.prisma' injetado
    return this.prisma.subject.create({ data });
  }

  public async findByName(name: string): Promise<Subject | null> {
    return this.prisma.subject.findUnique({ where: { name } });
  }

  public async findById(id: string): Promise<Subject | null> {
    return this.prisma.subject.findUnique({ where: { id } });
  }

  public async findAll(): Promise<Subject[]> {
    return this.prisma.subject.findMany({
      orderBy: { name: 'asc' }
    });
  }

  public async update(id: string, data: UpdateSubjectDTO): Promise<Subject | null> {
    try {
      return await this.prisma.subject.update({
        where: { id },
        data,
      });
    } catch (error) {
      return null;
    }
  }

  public async delete(id: string): Promise<Subject | null> {
    try {
      return await this.prisma.subject.delete({
        where: { id },
      });
    } catch (error) {
      return null;
    }
  }
}