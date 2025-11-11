// src/domain/entities/question.ts
import { Alternative } from './alternative';

export class Question {
  id: string;
  text: string;
  subjectId: string; // ID da Disciplina principal

  // Relacionamentos
  alternatives: Alternative[];
  // topics: Topic[]; // Relação N-N, podemos omitir da entidade pura
}