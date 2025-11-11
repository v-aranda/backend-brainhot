// src/application/usecases/topics/getTopicByIdUseCase.ts
import { Topic } from '@prisma/client';
import { ITopicRepository } from '../../../domain/repositories/ITopicRepository';
import { DomainError } from '../../../domain/errors/DomainError';

export class GetTopicByIdUseCase {
  constructor(private topicRepository: ITopicRepository) {}

  async execute(id: string): Promise<Topic> {
    const topic = await this.topicRepository.findById(id);

    if (!topic) {
      // [PADRÃO] Mensagem em Português
      throw new DomainError('Tópico não encontrado.', 404);
    }
    
    return topic;
  }
}