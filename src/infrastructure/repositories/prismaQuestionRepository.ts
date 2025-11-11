// src/infrastructure/repositories/prismaQuestionRepository.ts
import { PrismaClient } from '@prisma/client';
import { prismaClient } from '../prisma/client'; // Importa o singleton
import {
  IQuestionRepository,
  QuestionWithIncludes, // Nosso tipo de retorno
} from '../../domain/repositories/IQuestionRepository';
import {
  CreateQuestionDTO,
  UpdateQuestionDTO,
} from '../../domain/dto/question.dto';

export class PrismaQuestionRepository implements IQuestionRepository {
  
  // [PADRÃO] Recebe o prisma via Injeção de Dependência
  constructor(private prisma: PrismaClient = prismaClient) {}

  // Define o 'include' padrão para reutilização
  private get questionIncludes() {
    return {
      alternatives: true,
      topics: true,
      subject: true,
    };
  }

  /**
   * Criação de Questão (Transacional)
   */
  public async create(data: CreateQuestionDTO): Promise<QuestionWithIncludes> {
    const { text, subjectId, topicIds, alternatives } = data;

    // Usamos $transaction para garantir que ou tudo (Questão + Alternativas + Tópicos)
    // é criado, ou nada é.
    return this.prisma.$transaction(async (tx) => {
      const question = await tx.question.create({
        data: {
          text,
          // Conecta a disciplina principal
          subject: {
            connect: { id: subjectId },
          },
          // Conecta os tópicos (N-N)
          topics: {
            connect: topicIds.map((id) => ({ id })),
          },
          // Cria as alternativas (1-N)
          alternatives: {
            create: alternatives.map((alt) => ({
              text: alt.text,
              isCorrect: alt.isCorrect,
            })),
          },
        },
        include: this.questionIncludes, // Inclui tudo na resposta
      });
      return question;
    });
  }

  /**
   * Edição de Questão (Transacional)
   * A lógica de "edição" de alternativas é "deletar todas as antigas e criar as novas"
   * (conforme o DTO)
   */
  public async update(id: string, data: UpdateQuestionDTO): Promise<QuestionWithIncludes | null> {
    const { text, subjectId, topicIds, alternatives } = data;

    try {
      return this.prisma.$transaction(async (tx) => {
        // 1. Deleta as alternativas antigas (se novas alternativas foram fornecidas)
        // Isso é crucial para garantir que o gabarito novo substitua o antigo.
        if (alternatives) {
          await tx.alternative.deleteMany({
            where: { questionId: id },
          });
        }

        // 2. Atualiza a Questão principal
        const updatedQuestion = await tx.question.update({
          where: { id },
          data: {
            text, // Atualiza o texto (se fornecido)
            // Atualiza a disciplina (se fornecida)
            subject: subjectId ? { connect: { id: subjectId } } : undefined,
            // Atualiza os tópicos (se fornecidos)
            topics: topicIds ? { set: topicIds.map((id) => ({ id })) } : undefined,
            // Cria as novas alternativas (se fornecidas)
            alternatives: alternatives
              ? {
                  create: alternatives.map((alt) => ({
                    text: alt.text,
                    isCorrect: alt.isCorrect,
                  })),
                }
              : undefined,
          },
          include: this.questionIncludes,
        });

        return updatedQuestion;
      });
    } catch (error) {
      // Pega erros (ex: P2025 Not Found, se o 'id' não existir)
      return null;
    }
  }

  /**
   * Busca por ID
   */
  public async findById(id: string): Promise<QuestionWithIncludes | null> {
    return this.prisma.question.findUnique({
      where: { id },
      include: this.questionIncludes,
    });
  }

  /**
   * Deleta por ID
   */
  public async delete(id: string): Promise<QuestionWithIncludes | null> {
    try {
      // O 'onDelete: Cascade' no schema vai cuidar de deletar as 'Alternatives'
      return await this.prisma.question.delete({
        where: { id },
        include: this.questionIncludes,
      });
    } catch (error) {
      return null;
    }
  }
}