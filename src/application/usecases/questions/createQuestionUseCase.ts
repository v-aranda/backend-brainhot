// src/application/usecases/questions/createQuestionUseCase.ts
import {
  CreateQuestionDTO,
  AlternativeInputDTO,
} from '../../../domain/dto/question.dto';
import { DomainError } from '../../../domain/errors/DomainError';
import { IQuestionRepository, QuestionWithIncludes } from '../../../domain/repositories/IQuestionRepository';
import { ISubjectRepository } from '../../../domain/repositories/ISubjectRepository';
import { ITopicRepository } from '../../../domain/repositories/ITopicRepository';

export class CreateQuestionUseCase {
  constructor(
    private questionRepository: IQuestionRepository,
    private subjectRepository: ISubjectRepository,
    private topicRepository: ITopicRepository
  ) {}

  /**
   * Valida o gabarito (deve ter exatamente 1 resposta correta)
   */
  private validateAlternatives(alternatives: AlternativeInputDTO[]): void {
    if (!alternatives || alternatives.length === 0) {
      throw new DomainError('A questão deve ter pelo menos uma alternativa.');
    }
    
    const correctAnswers = alternatives.filter((alt) => alt.isCorrect).length;
    if (correctAnswers !== 1) {
      // [PADRÃO] Mensagem em Português
      throw new DomainError('A questão deve ter exatamente 1 alternativa correta.');
    }
  }

  async execute(data: CreateQuestionDTO): Promise<QuestionWithIncludes> {
    // 1. [Lógica de Negócio] Valida o gabarito
    this.validateAlternatives(data.alternatives);

    // 2. [Lógica de App] Valida se a Disciplina (Subject) existe
    const subjectExists = await this.subjectRepository.findById(data.subjectId);
    if (!subjectExists) {
      throw new DomainError('Disciplina (Subject) não encontrada.', 404);
    }

    // 3. [Lógica de App] Valida se TODOS os Tópicos existem
    for (const topicId of data.topicIds) {
      const topicExists = await this.topicRepository.findById(topicId);
      if (!topicExists) {
        throw new DomainError(`Tópico com ID ${topicId} não encontrado.`, 404);
      }
    }

    // 4. Se tudo estiver válido, manda o repositório criar (em transação)
    return this.questionRepository.create(data);
  }
}