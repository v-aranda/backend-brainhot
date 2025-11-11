// src/main/docs/paths/modulePaths.ts
export const modulePaths = {
  // --- Subjects ---
  "/api/subjects": {
    post: {
      tags: ["Subjects"],
      summary: "Cria uma nova Disciplina",
      security: [{ BearerAuth: [] }],
      requestBody: { required: true, content: { "application/json": { schema: { $ref: "#/components/schemas/CreateSubjectDTO" } } } },
      responses: {
        "201": { description: "Disciplina criada", content: { "application/json": { schema: { $ref: "#/components/schemas/SubjectResponse" } } } },
        "400": { description: "Erro de validação (ex: nome duplicado)", content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } } },
        "401": { description: "Não autorizado", content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } } },
      },
    },
    get: {
      tags: ["Subjects"],
      summary: "Lista todas as Disciplinas",
      security: [{ BearerAuth: [] }],
      responses: {
        "200": { description: "Lista de disciplinas", content: { "application/json": { schema: { type: "array", items: { $ref: "#/components/schemas/SubjectResponse" } } } } },
        "401": { description: "Não autorizado", content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } } },
      },
    },
  },
  "/api/subjects/{id}": {
    get: {
      tags: ["Subjects"],
      summary: "Busca uma Disciplina por ID",
      security: [{ BearerAuth: [] }],
      parameters: [{ name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } }],
      responses: {
        "200": { description: "Disciplina encontrada", content: { "application/json": { schema: { $ref: "#/components/schemas/SubjectResponse" } } } },
        "404": { description: "Disciplina não encontrada", content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } } },
        "401": { description: "Não autorizado", content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } } },
      },
    },
    put: {
      tags: ["Subjects"],
      summary: "Atualiza uma Disciplina",
      security: [{ BearerAuth: [] }],
      parameters: [{ name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } }],
      requestBody: { required: true, content: { "application/json": { schema: { $ref: "#/components/schemas/UpdateSubjectDTO" } } } },
      responses: {
        "200": { description: "Disciplina atualizada", content: { "application/json": { schema: { $ref: "#/components/schemas/SubjectResponse" } } } },
        "404": { description: "Disciplina não encontrada", content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } } },
        "400": { description: "Erro de validação", content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } } },
        "401": { description: "Não autorizado", content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } } },
      },
    },
    delete: {
      tags: ["Subjects"],
      summary: "Deleta uma Disciplina",
      security: [{ BearerAuth: [] }],
      parameters: [{ name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } }],
      responses: {
        "204": { description: "Deletado com sucesso" },
        "404": { description: "Disciplina não encontrada", content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } } },
        "401": { description: "Não autorizado", content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } } },
      },
    },
  },

  // --- Topics ---
  "/api/topics": {
    post: {
      tags: ["Topics"],
      summary: "Cria um novo Tópico",
      security: [{ BearerAuth: [] }],
      requestBody: { required: true, content: { "application/json": { schema: { $ref: "#/components/schemas/CreateTopicDTO" } } } },
      responses: {
        "201": { description: "Tópico criado", content: { "application/json": { schema: { $ref: "#/components/schemas/TopicResponse" } } } },
        "404": { description: "Disciplina (Subject) não encontrada", content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } } },
        "400": { description: "Erro de validação", content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } } },
        "401": { description: "Não autorizado", content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } } },
      },
    },
    get: {
      tags: ["Topics"],
      summary: "Lista todos os Tópicos",
      security: [{ BearerAuth: [] }],
      responses: {
        "200": { description: "Lista de tópicos", content: { "application/json": { schema: { type: "array", items: { $ref: "#/components/schemas/TopicResponse" } } } } },
        "401": { description: "Não autorizado", content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } } },
      },
    },
  },
  "/api/topics/{id}": {
    get: {
      tags: ["Topics"],
      summary: "Busca um Tópico por ID",
      security: [{ BearerAuth: [] }],
      parameters: [{ name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } }],
      responses: {
        "200": { description: "Tópico encontrado", content: { "application/json": { schema: { $ref: "#/components/schemas/TopicResponse" } } } },
        "404": { description: "Tópico não encontrado", content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } } },
        "401": { description: "Não autorizado", content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } } },
      },
    },
    put: {
      tags: ["Topics"],
      summary: "Atualiza um Tópico",
      security: [{ BearerAuth: [] }],
      parameters: [{ name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } }],
      requestBody: { required: true, content: { "application/json": { schema: { $ref: "#/components/schemas/UpdateTopicDTO" } } } },
      responses: {
        "200": { description: "Tópico atualizado", content: { "application/json": { schema: { $ref: "#/components/schemas/TopicResponse" } } } },
        "404": { description: "Tópico ou Disciplina não encontrada", content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } } },
        "400": { description: "Erro de validação", content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } } },
        "401": { description: "Não autorizado", content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } } },
      },
    },
    delete: {
      tags: ["Topics"],
      summary: "Deleta um Tópico",
      security: [{ BearerAuth: [] }],
      parameters: [{ name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } }],
      responses: {
        "204": { description: "Deletado com sucesso" },
        "404": { description: "Tópico não encontrado", content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } } },
        "401": { description: "Não autorizado", content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } } },
      },
    },
  },

  // --- Questions ---
  "/api/questions": {
    post: {
      tags: ["Questions"],
      summary: "Cria uma nova Questão (RF006)",
      security: [{ BearerAuth: [] }],
      requestBody: { required: true, content: { "application/json": { schema: { $ref: "#/components/schemas/CreateQuestionDTO" } } } },
      responses: {
        "201": { description: "Questão criada", content: { "application/json": { schema: { $ref: "#/components/schemas/QuestionResponse" } } } },
        "404": { description: "Disciplina ou Tópico não encontrado", content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } } },
        "400": { description: "Erro de validação (ex: gabarito inválido)", content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } } },
        "401": { description: "Não autorizado", content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } } },
      },
    },
  },
  "/api/questions/{id}": {
    get: {
      tags: ["Questions"],
      summary: "Busca uma Questão por ID",
      security: [{ BearerAuth: [] }],
      parameters: [{ name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } }],
      responses: {
        "200": { description: "Questão encontrada", content: { "application/json": { schema: { $ref: "#/components/schemas/QuestionResponse" } } } },
        "404": { description: "Questão não encontrada", content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } } },
        "401": { description: "Não autorizado", content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } } },
      },
    },
    put: {
      tags: ["Questions"],
      summary: "Atualiza uma Questão (RF006)",
      security: [{ BearerAuth: [] }],
      parameters: [{ name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } }],
      requestBody: { required: true, content: { "application/json": { schema: { $ref: "#/components/schemas/UpdateQuestionDTO" } } } },
      responses: {
        "200": { description: "Questão atualizada", content: { "application/json": { schema: { $ref: "#/components/schemas/QuestionResponse" } } } },
        "404": { description: "Questão, Disciplina ou Tópico não encontrado", content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } } },
        "400": { description: "Erro de validação (ex: gabarito inválido)", content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } } },
        "401": { description: "Não autorizado", content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } } },
      },
    },
    delete: {
      tags: ["Questions"],
      summary: "Deleta uma Questão",
      security: [{ BearerAuth: [] }],
      parameters: [{ name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } }],
      responses: {
        "204": { description: "Deletado com sucesso" },
        "404": { description: "Questão não encontrada", content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } } },
        "401": { description: "Não autorizado", content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } } },
      },
    },
  },
};