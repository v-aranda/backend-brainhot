// src/domain/repositories/ITopicRepository.ts
import { Topic } from '@prisma/client';
import { CreateTopicDTO, UpdateTopicDTO } from '../dto/topic.dto';

export interface ITopicRepository {
  create(data: CreateTopicDTO): Promise<Topic>;
  // Vamos checar o nome dentro de uma disciplina específica
  findByNameAndSubject(name: string, subjectId: string): Promise<Topic | null>;
  findById(id: string): Promise<Topic | null>;
  findAll(): Promise<Topic[]>;
  update(id: string, data: UpdateTopicDTO): Promise<Topic | null>;
  delete(id: string): Promise<Topic | null>;
}