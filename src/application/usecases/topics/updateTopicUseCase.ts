// src/application/usecases/topics/updateTopicUseCase.ts
import { Topic } from '@prisma/client';
import { UpdateTopicDTO } from '../../../domain/dto/topic.dto';
import { ITopicRepository } from '../../../domain/repositories/ITopicRepository';
import { ISubjectRepository } from '../../../domain/repositories/ISubjectRepository'; // NOVA INJEÇÃO
import { DomainError } from '../../../domain/errors/DomainError';

export class UpdateTopicUseCase {
  constructor(
    private topicRepository: ITopicRepository,
    private subjectRepository: ISubjectRepository
  ) {}

  async execute(id: string, data: UpdateTopicDTO): Promise<Topic> {
    // 1. Garante que o tópico existe
    const topicToUpdate = await this.topicRepository.findById(id);
    if (!topicToUpdate) {
      throw new DomainError('Tópico não encontrado.', 404);
    }

    // 2. [NOVO] Se o subjectId está sendo alterado, valida se o novo subjectId existe
    if (data.subjectId && data.subjectId !== topicToUpdate.subjectId) {
      const subjectExists = await this.subjectRepository.findById(data.subjectId);
      if (!subjectExists) {
        throw new DomainError('Disciplina (Subject) não encontrada.', 404);
      }
    }

    // 3. Checa conflito de nome
    if (data.name) {
      const currentSubjectId = data.subjectId || topicToUpdate.subjectId;
      const existing = await this.topicRepository.findByNameAndSubject(data.name, currentSubjectId);
      if (existing && existing.id !== id) {
        throw new DomainError('Um tópico com este nome já existe nesta disciplina.');
      }
    }

    const updatedTopic = await this.topicRepository.update(id, data);
    if (!updatedTopic) {
      // Isso não deve acontecer por causa da checagem 1, mas é boa prática
      throw new DomainError('Tópico não encontrado.', 404);
    }
    
    return updatedTopic;
  }
}