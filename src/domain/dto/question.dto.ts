// src/domain/dto/question.dto.ts

/**
 * Define a estrutura de uma alternativa
 * como ela "chega" do front-end (sem ID).
 */
export interface AlternativeInputDTO {
  text: string;
  isCorrect: boolean;
}

/**
 * DTO para CRIAR uma nova Questão.
 * Baseado no 'questoes.test.ts'.
 */
export interface CreateQuestionDTO {
  text: string;
  subjectId: string;   // Disciplina principal
  topicIds: string[];  // Array de IDs de Tópicos (relação N-N)
  alternatives: AlternativeInputDTO[]; // Array de alternativas
}

/**
 * DTO para EDITAR uma Questão.
 * Todos os campos são opcionais.
 */
export interface UpdateQuestionDTO {
  text?: string;
  subjectId?: string;
  topicIds?: string[];
  alternatives?: AlternativeInputDTO[];
}