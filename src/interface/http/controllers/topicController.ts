// src/interface/http/controllers/topicController.ts
import { Request, Response } from 'express';
import { CreateTopicUseCase } from '../../../application/usecases/topics/createTopicUseCase';
import { ListTopicsUseCase } from '../../../application/usecases/topics/listTopicsUseCase';
import { UpdateTopicUseCase } from '../../../application/usecases/topics/updateTopicUseCase';
import { GetTopicByIdUseCase } from '../../../application/usecases/topics/getTopicByIdUseCase';
import { DeleteTopicUseCase } from '../../../application/usecases/topics/deleteTopicUseCase';
import { DomainError } from '../../../domain/errors/DomainError';

export interface TopicUseCases {
  createTopic: CreateTopicUseCase;
  listTopics: ListTopicsUseCase;
  updateTopic: UpdateTopicUseCase;
  getTopicById: GetTopicByIdUseCase;
  deleteTopic: DeleteTopicUseCase;
}

export class TopicController {
  constructor(private useCases: TopicUseCases) {}

  private handleError(res: Response, error: any, defaultStatus: number = 500) {
    if (error instanceof DomainError) {
      return res.status(error.statusCode).json({ error: error.message });
    }
    return res.status(defaultStatus).json({ error: 'Erro interno do servidor.' });
  }

  // POST /api/topics
  public create = async (req: Request, res: Response) => {
    try {
      const topic = await this.useCases.createTopic.execute(req.body);
      return res.status(201).json(topic);
    } catch (error: any) {
      return this.handleError(res, error);
    }
  };

  // GET /api/topics
  public list = async (req: Request, res: Response) => {
    try {
      const topics = await this.useCases.listTopics.execute();
      return res.status(200).json(topics);
    } catch (error: any) {
      return this.handleError(res, error);
    }
  };

  // GET /api/topics/:id
  public getById = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const topic = await this.useCases.getTopicById.execute(id);
      return res.status(200).json(topic);
    } catch (error: any) {
      return this.handleError(res, error, 404);
    }
  };

  // PUT /api/topics/:id
  public update = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const topic = await this.useCases.updateTopic.execute(id, req.body);
      return res.status(200).json(topic);
    } catch (error: any) {
      return this.handleError(res, error, 404);
    }
  };

  // DELETE /api/topics/:id
  public delete = async (req: Request, res: Response) => {
     try {
      const { id } = req.params;
      await this.useCases.deleteTopic.execute(id);
      return res.status(204).send();
    } catch (error: any) {
      return this.handleError(res, error, 404);
    }
  };
}