// src/domain/entities/question.ts
import { Alternative } from './alternative';

export class Question {
  id!: string;
  text!: string;
  subjectId!: string;
  alternatives!: Alternative[];
}