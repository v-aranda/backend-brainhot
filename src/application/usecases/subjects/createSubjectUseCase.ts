// src/application/usecases/subject/createSubjectUseCase.ts
import { Subject } from '@prisma/client';
import { CreateSubjectDTO } from '../../../domain/dto/subject.dto';
import { ISubjectRepository } from '../../../domain/repositories/ISubjectRepository';
import { DomainError } from '../../../domain/errors/DomainError';

export class CreateSubjectUseCase {
  constructor(private subjectRepository: ISubjectRepository) {}

  async execute(data: CreateSubjectDTO): Promise<Subject> {
    // Regra de Negócio: Não permitir nomes duplicados
    const existingSubject = await this.subjectRepository.findByName(data.name);
    if (existingSubject) {
      throw new DomainError('Uma disciplina com este nome já existe.');
    }

    return this.subjectRepository.create(data);
  }
}