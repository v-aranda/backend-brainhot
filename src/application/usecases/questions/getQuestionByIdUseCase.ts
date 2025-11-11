// src/application/usecases/questions/getQuestionByIdUseCase.ts
import { DomainError } from '../../../domain/errors/DomainError';
import { IQuestionRepository, QuestionWithIncludes } from '../../../domain/repositories/IQuestionRepository';

export class GetQuestionByIdUseCase {
  constructor(private questionRepository: IQuestionRepository) {}

  async execute(id: string): Promise<QuestionWithIncludes> {
    const question = await this.questionRepository.findById(id);

    if (!question) {
      throw new DomainError('Questão não encontrada.', 404);
    }
    
    return question;
  }
}