// src/interface/http/controllers/questionController.ts
import { Request, Response } from 'express';
// 🚀 Importa TODOS os 4 use cases
import { CreateQuestionUseCase } from '../../../application/usecases/questions/createQuestionUseCase';
import { UpdateQuestionUseCase } from '../../../application/usecases/questions/updateQuestionUseCase';
import { GetQuestionByIdUseCase } from '../../../application/usecases/questions/getQuestionByIdUseCase';
import { DeleteQuestionUseCase } from '../../../application/usecases/questions/deleteQuestionUseCase';
import { DomainError } from '../../../domain/errors/DomainError';

// 🚀 Define o "pacote" de UseCases
export interface QuestionUseCases {
  createQuestion: CreateQuestionUseCase;
  updateQuestion: UpdateQuestionUseCase;
  getQuestionById: GetQuestionByIdUseCase;
  deleteQuestion: DeleteQuestionUseCase;
}

export class QuestionController {
  constructor(private useCases: QuestionUseCases) {}

  // [PADRÃO] Handler de erro centralizado
  private handleError(res: Response, error: any, defaultStatus: number = 500) {
    if (error instanceof DomainError || (error.name === 'DomainError')) {
      return res.status(error.statusCode || 400).json({ error: error.message });
    }
    return res.status(defaultStatus).json({ error: 'Erro interno do servidor.' });
  }

  // POST /api/questions
  public create = async (req: Request, res: Response) => {
    try {
      const question = await this.useCases.createQuestion.execute(req.body);
      return res.status(201).json(question);
    } catch (error: any) {
      return this.handleError(res, error);
    }
  };

  // PUT /api/questions/:id
  public update = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const question = await this.useCases.updateQuestion.execute(id, req.body);
      return res.status(200).json(question);
    } catch (error: any) {
      return this.handleError(res, error, 404);
    }
  };

  // GET /api/questions/:id
  public getById = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const question = await this.useCases.getQuestionById.execute(id);
      return res.status(200).json(question);
    } catch (error: any) {
      return this.handleError(res, error, 404);
    }
  };

  // DELETE /api/questions/:id
  public delete = async (req: Request, res: Response) => {
     try {
      const { id } = req.params;
      await this.useCases.deleteQuestion.execute(id);
      return res.status(204).send();
    } catch (error: any) {
      return this.handleError(res, error, 404);
    }
  };
}