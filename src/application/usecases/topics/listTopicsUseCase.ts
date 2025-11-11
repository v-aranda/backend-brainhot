// src/application/usecases/topics/listTopicsUseCase.ts
import { Topic } from '@prisma/client';
import { ITopicRepository } from '../../../domain/repositories/ITopicRepository';

export class ListTopicsUseCase {
  constructor(private topicRepository: ITopicRepository) {}

  async execute(): Promise<Topic[]> {
    // O PrismaTopicRepository que criamos já faz o 'include: { subject: true }'
    return this.topicRepository.findAll();
  }
}