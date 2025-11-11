// src/domain/repositories/ISubjectRepository.ts
import { Subject } from '@prisma/client'; // Usando o tipo do Prisma
import { CreateSubjectDTO, UpdateSubjectDTO } from '../dto/subject.dto';

export interface ISubjectRepository {
  create(data: CreateSubjectDTO): Promise<Subject>;
  findByName(name: string): Promise<Subject | null>;
  findById(id: string): Promise<Subject | null>;
  findAll(): Promise<Subject[]>;
  update(id: string, data: UpdateSubjectDTO): Promise<Subject | null>;
  delete(id: string): Promise<Subject | null>;
}