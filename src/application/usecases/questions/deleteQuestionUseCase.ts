// src/application/usecases/questions/deleteQuestionUseCase.ts
import { DomainError } from '../../../domain/errors/DomainError';
import { IQuestionRepository, QuestionWithIncludes } from '../../../domain/repositories/IQuestionRepository';

export class DeleteQuestionUseCase {
  constructor(private questionRepository: IQuestionRepository) {}

  async execute(id: string): Promise<QuestionWithIncludes> {
    const question = await this.questionRepository.delete(id);

    if (!question) {
      throw new DomainError('Questão não encontrada.', 404);
    }
    
    return question;
  }
}