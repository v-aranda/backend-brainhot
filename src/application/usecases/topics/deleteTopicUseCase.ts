// src/application/usecases/topics/deleteTopicUseCase.ts
import { Topic } from '@prisma/client';
import { ITopicRepository } from '../../../domain/repositories/ITopicRepository';
import { DomainError } from '../../../domain/errors/DomainError';

export class DeleteTopicUseCase {
  constructor(private topicRepository: ITopicRepository) {}

  async execute(id: string): Promise<Topic> {
    // [PADRÃO] O repo.delete retorna o objeto deletado
    const topic = await this.topicRepository.delete(id);

    if (!topic) {
      // O delete falhou (provavelmente não encontrou)
      throw new DomainError('Tópico não encontrado.', 404);
    }
    
    return topic;
  }
}