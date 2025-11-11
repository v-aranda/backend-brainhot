// src/application/usecases/topics/createTopicUseCase.ts
import { Topic } from '@prisma/client';
import { CreateTopicDTO } from '../../../domain/dto/topic.dto';
import { ITopicRepository } from '../../../domain/repositories/ITopicRepository';
import { ISubjectRepository } from '../../../domain/repositories/ISubjectRepository'; // NOVA INJEÇÃO
import { DomainError } from '../../../domain/errors/DomainError';

export class CreateTopicUseCase {
  // [NOVO] Injeta os dois repositórios
  constructor(
    private topicRepository: ITopicRepository,
    private subjectRepository: ISubjectRepository 
  ) {}

  async execute(data: CreateTopicDTO): Promise<Topic> {
    // 1. [NOVO] Valida se a Disciplina (Subject) existe
    const subjectExists = await this.subjectRepository.findById(data.subjectId);
    if (!subjectExists) {
      throw new DomainError('Disciplina (Subject) não encontrada.', 404);
    }

    // 2. Valida se o Tópico já existe *dentro* daquela Disciplina
    const existingTopic = await this.topicRepository.findByNameAndSubject(data.name, data.subjectId);
    if (existingTopic) {
      throw new DomainError('Um tópico com este nome já existe nesta disciplina.');
    }

    return this.topicRepository.create(data);
  }
}