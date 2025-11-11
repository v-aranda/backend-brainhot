// src/domain/repositories/IQuestionRepository.ts
// Usamos o GetPayload do Prisma para ter o tipo completo (com 'include')
import { Prisma } from '@prisma/client';
import { CreateQuestionDTO, UpdateQuestionDTO } from '../dto/question.dto';

// [PADRÃO] Define o tipo de Retorno da Questão (com 'include')
// Isso garante que nossos UseCases sempre recebam a questão com suas alternativas
const questionWithIncludes = Prisma.validator<Prisma.QuestionDefaultArgs>()({
  include: { alternatives: true, topics: true, subject: true },
});

// Exporta o tipo para ser usado nos UseCases
export type QuestionWithIncludes = Prisma.QuestionGetPayload<typeof questionWithIncludes>;


export interface IQuestionRepository {
  /**
   * Cria uma nova questão e suas relações (alternativas, tópicos).
   */
  create(data: CreateQuestionDTO): Promise<QuestionWithIncludes>;

  /**
   * Atualiza uma questão. A implementação deve lidar
   * com a deleção de alternativas antigas e criação de novas.
   */
  update(id: string, data: UpdateQuestionDTO): Promise<QuestionWithIncludes | null>;

  /**
   * Busca uma questão completa pelo ID.
   */
  findById(id: string): Promise<QuestionWithIncludes | null>;

  /**
   * Deleta uma questão (e suas alternativas, via 'onDelete: Cascade').
   */
  delete(id: string): Promise<QuestionWithIncludes | null>;
  
  // (Opcional: Adicionar um método 'findAll' se precisarmos listar questões)
  // findAll(): Promise<QuestionWithIncludes[]>;
}