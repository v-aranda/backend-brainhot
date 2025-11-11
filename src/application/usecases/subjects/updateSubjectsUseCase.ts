// src/application/usecases/subject/updateSubjectUseCase.ts
import { Subject } from '@prisma/client';
import { UpdateSubjectDTO } from '../../../domain/dto/subject.dto';
import { ISubjectRepository } from '../../../domain/repositories/ISubjectRepository';
import { DomainError } from '../../../domain/errors/DomainError';

export class UpdateSubjectUseCase {
  constructor(private subjectRepository: ISubjectRepository) {}

  async execute(id: string, data: UpdateSubjectDTO): Promise<Subject> {
    // Regra de Negócio: Checar se o *novo* nome já existe
    if (data.name) {
      const existing = await this.subjectRepository.findByName(data.name);
      if (existing && existing.id !== id) {
        throw new DomainError('Uma disciplina com este nome já existe.');
      }
    }

    const subject = await this.subjectRepository.update(id, data);
    if (!subject) {
      throw new DomainError('Disciplina não encontrada.', 404);
    }
    
    return subject;
  }
}