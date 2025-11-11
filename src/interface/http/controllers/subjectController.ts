// src/interface/http/controllers/subjectController.ts
import { Request, Response } from 'express';
import { CreateSubjectUseCase } from '../../../application/usecases/subjects/createSubjectUseCase';
import { ListSubjectsUseCase } from '../../../application/usecases/subjects/listSubjectsUseCase';
import { UpdateSubjectUseCase } from '../../../application/usecases/subjects/updateSubjectsUseCase';
// Importe os outros UseCases (GetById, Delete) aqui

// Classe para agrupar os UseCases
export interface SubjectUseCases {
  createSubject: CreateSubjectUseCase;
  listSubjects: ListSubjectsUseCase;
  updateSubject: UpdateSubjectUseCase;
  // getSubjectById: GetSubjectByIdUseCase;
  // deleteSubject: DeleteSubjectUseCase;
}

export class SubjectController {
  constructor(private useCases: SubjectUseCases) {}

  // POST /api/subjects
  create = async (req: Request, res: Response) => {
    try {
      const subject = await this.useCases.createSubject.execute(req.body);
      return res.status(201).json(subject);
    } catch (error: any) {
      // [PADRÃO] Mensagens em Português
      const status = error.statusCode || 400;
      return res.status(status).json({ error: error.message });
    }
  };

  // GET /api/subjects
  list = async (req: Request, res: Response) => {
    try {
      const subjects = await this.useCases.listSubjects.execute();
      return res.status(200).json(subjects);
    } catch (error: any) {
      return res.status(500).json({ error: 'Erro interno do servidor.' });
    }
  };

  // PUT /api/subjects/:id
  update = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const subject = await this.useCases.updateSubject.execute(id, req.body);
      return res.status(200).json(subject);
    } catch (error: any) {
      const status = error.statusCode || 400;
      return res.status(status).json({ error: error.message });
    }
  };
  
  // Adicione os métodos getById e delete aqui...
}