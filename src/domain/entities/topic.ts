// src/domain/entities/topic.ts
export class Topic {
  id: string;
  name: string;
  subjectId: string; // Um tópico pertence a uma disciplina
}