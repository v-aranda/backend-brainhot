// src/main/docs/schemas/questionSchemas.ts
export const questionSchemas = {
  // --- Schemas "Filhos" ---
  AlternativeInputDTO: {
    type: "object",
    description: "Estrutura de uma alternativa para criação/edição",
    properties: {
      text: { type: "string", example: "Opção 1" },
      isCorrect: { type: "boolean", example: false },
    },
    required: ["text", "isCorrect"],
  },
  AlternativeResponse: {
    type: "object",
    description: "Estrutura de uma alternativa na resposta da API",
    properties: {
      id: { type: "string", format: "uuid", example: "alt-123-uuid" },
      text: { type: "string", example: "Opção 1" },
      isCorrect: { type: "boolean", example: false },
      questionId: { type: "string", format: "uuid", example: "qst-123-uuid" },
    },
  },

  // --- Schemas Principais ---
  CreateQuestionDTO: {
    type: "object",
    description: "DTO para criação de uma nova questão",
    properties: {
      text: { type: "string", example: "Quanto é 2 + 2?" },
      subjectId: { type: "string", format: "uuid", example: "sub-123-uuid" },
      topicIds: {
        type: "array",
        items: { type: "string", format: "uuid" },
        example: ["top-123-uuid", "top-456-uuid"],
      },
      alternatives: {
        type: "array",
        items: { $ref: "#/components/schemas/AlternativeInputDTO" },
        description: "Array de alternativas (deve conter exatamente 1 'isCorrect: true')."
      },
    },
    required: ["text", "subjectId", "topicIds", "alternatives"],
  },
  UpdateQuestionDTO: {
    type: "object",
    description: "DTO para edição de uma questão (campos opcionais)",
    properties: {
      text: { type: "string", example: "Quanto é 5 + 5?" },
      subjectId: { type: "string", format: "uuid", example: "sub-456-uuid" },
      topicIds: {
        type: "array",
        items: { type: "string", format: "uuid" },
      },
      alternatives: {
        type: "array",
        items: { $ref: "#/components/schemas/AlternativeInputDTO" },
      },
    },
  },
  QuestionResponse: {
    type: "object",
    description: "Resposta da API para uma questão (com 'includes')",
    properties: {
      id: { type: "string", format: "uuid", example: "qst-123-uuid" },
      text: { type: "string", example: "Quanto é 2 + 2?" },
      subjectId: { type: "string", format: "uuid", example: "sub-123-uuid" },
      // Includes
      alternatives: {
        type: "array",
        items: { $ref: "#/components/schemas/AlternativeResponse" },
      },
      topics: {
        type: "array",
        items: { $ref: "#/components/schemas/TopicResponse" },
      },
      subject: { $ref: "#/components/schemas/SubjectResponse" },
    },
  },
};