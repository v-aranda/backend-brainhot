// src/domain/entities/alternative.ts
export class Alternative {
  id!: string;
  text!: string;
  isCorrect!: boolean;
  questionId!: string;
}