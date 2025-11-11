// src/application/usecases/questions/updateQuestionUseCase.ts
import {
  UpdateQuestionDTO,
  AlternativeInputDTO,
} from '../../../domain/dto/question.dto';
import { DomainError } from '../../../domain/errors/DomainError';
import { IQuestionRepository, QuestionWithIncludes } from '../../../domain/repositories/IQuestionRepository';
import { ISubjectRepository } from '../../../domain/repositories/ISubjectRepository';
import { ITopicRepository } from '../../../domain/repositories/ITopicRepository';

export class UpdateQuestionUseCase {
  constructor(
    private questionRepository: IQuestionRepository,
    private subjectRepository: ISubjectRepository,
    private topicRepository: ITopicRepository
  ) {}

  /**
   * Valida o gabarito (deve ter exatamente 1 resposta correta)
   */
  private validateAlternatives(alternatives: AlternativeInputDTO[]): void {
    if (alternatives.length === 0) {
      throw new DomainError('A questão deve ter pelo menos uma alternativa.');
    }
    const correctAnswers = alternatives.filter((alt) => alt.isCorrect).length;
    if (correctAnswers !== 1) {
      throw new DomainError('A questão deve ter exatamente 1 alternativa correta.');
    }
  }

  async execute(id: string, data: UpdateQuestionDTO): Promise<QuestionWithIncludes> {
    // 1. Garante que a Questão que queremos editar existe
    const questionExists = await this.questionRepository.findById(id);
    if (!questionExists) {
      throw new DomainError('Questão não encontrada.', 404);
    }

    // 2. [Lógica Condicional] Se o update incluiu alternativas, valida o gabarito
    if (data.alternatives) {
      this.validateAlternatives(data.alternatives);
    }

    // 3. [Lógica Condicional] Se o update incluiu um novo subjectId, valida ele
    if (data.subjectId) {
      const subjectExists = await this.subjectRepository.findById(data.subjectId);
      if (!subjectExists) {
        throw new DomainError('Disciplina (Subject) não encontrada.', 404);
      }
    }

    // 4. [Lógica Condicional] Se o update incluiu novos topicIds, valida eles
    if (data.topicIds) {
      for (const topicId of data.topicIds) {
        const topicExists = await this.topicRepository.findById(topicId);
        if (!topicExists) {
          throw new DomainError(`Tópico com ID ${topicId} não encontrado.`, 404);
        }
      }
    }

    // 5. Manda o repositório atualizar (em transação)
    const updatedQuestion = await this.questionRepository.update(id, data);
    
    // O update() do repo retorna null se não achar, mas já checamos no passo 1.
    // Esta checagem é uma segurança extra.
    if (!updatedQuestion) {
       throw new DomainError('Falha ao atualizar a questão.', 500);
    }

    return updatedQuestion;
  }
}