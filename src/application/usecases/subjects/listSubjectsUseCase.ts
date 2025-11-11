// src/application/usecases/subject/listSubjectsUseCase.ts
import { Subject } from '@prisma/client';
import { ISubjectRepository } from '../../../domain/repositories/ISubjectRepository';

export class ListSubjectsUseCase {
  constructor(private subjectRepository: ISubjectRepository) {}

  async execute(): Promise<Subject[]> {
    return this.subjectRepository.findAll();
  }
}