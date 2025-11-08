import swaggerJSDoc from "swagger-jsdoc";

export const swaggerSpec = swaggerJSDoc({
  definition: {
    openapi: "3.0.3",
    info: {
      title: "Proint 1 API",
      version: "1.0.0",
      description: "API documentation",
    },
    servers: [
      { url: "https://brainhot.varanda.dev.br/" },
      { url: "http://localhost:3000" },
    ],
    // --- COMPONENTES ---
    components: {
      securitySchemes: {
        BearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Token JWT para autenticação.'
        }
      },
      schemas: {
        // ... (Schemas CreateUserDTO, LoginDTO, UserResponse, TokenResponse, ErrorResponse estão aqui, sem alterações)
        CreateUserDTO: {
          type: "object",
          properties: {
            name: { type: "string", example: "John Doe" },
            email: { type: "string", format: "email", example: "john.doe@example.com" },
            password: { type: "string", format: "password", example: "strongpassword123" },
          },
          required: ["name", "email", "password"],
        },
        LoginDTO: {
          type: "object",
          properties: {
            email: { type: "string", format: "email", example: "john.doe@example.com" },
            password: { type: "string", format: "password", example: "strongpassword123" },
          },
          required: ["email", "password"],
        },
        UserResponse: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid", example: "123e4567-e89b-12d3-a456-426614174000" },
            name: { type: "string", example: "John Doe" },
            email: { type: "string", format: "email", example: "john.doe@example.com" },
            createdAt: { type: "string", format: "date-time", example: "2025-11-08T00:30:00Z" },
          },
        },
        TokenResponse: {
          type: "object",
          properties: {
            token: { type: "string", example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjAwZTh..." },
          },
        },
        ErrorResponse: {
          type: "object",
          properties: {
            message: { type: "string", example: "Usuário com este email já existe." },
          },
        },
      },
    },
    
    // --- PATHS (Rotas Corrigidas) ---
    paths: {
      // Health Check
      "/health": {
        get: { tags: ["Health"], summary: "Health check", responses: { "200": { description: "OK" } } },
      },
      
      // Rotas de Autenticação (Login e Validação)
      "/api/auth": { // PREFIXO CORRIGIDO: Removido /v1
        post: {
          tags: ["Auth"],
          summary: "Login de Usuário",
          description: "Autentica um usuário e retorna um token JWT.",
          requestBody: { required: true, content: { "application/json": { schema: { $ref: "#/components/schemas/LoginDTO" } } } },
          responses: {
            "200": { description: "Autenticação bem-sucedida.", content: { "application/json": { schema: { $ref: "#/components/schemas/TokenResponse" } } } },
            "400": { description: "Credenciais inválidas.", content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } } },
          },
        },
      },

      "/api/sessions/validate": { // PREFIXO CORRIGIDO: Removido /v1
        get: {
          tags: ["Auth"],
          summary: "Validação de Sessão",
          description: "Verifica se o token JWT é válido e retorna os dados do usuário.",
          security: [{ BearerAuth: [] }],
          responses: {
            "200": { description: "Token válido.", content: { "application/json": { schema: { $ref: "#/components/schemas/UserResponse" } } } },
            "401": { description: "Token ausente, inválido ou expirado.", content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } } },
          },
        },
      },

      // Rotas de Usuário
      "/api/users": { // PREFIXO CORRIGIDO: Removido /v1
        post: {
          tags: ["Users"],
          summary: "Cria um novo usuário (Registro)",
          description: "Registra um novo usuário no sistema.",
          requestBody: { required: true, content: { "application/json": { schema: { $ref: "#/components/schemas/CreateUserDTO" } } } },
          responses: {
            "201": { description: "Usuário criado com sucesso.", content: { "application/json": { schema: { $ref: "#/components/schemas/UserResponse" } } } },
            "400": { description: "Erro de validação (ex: email já existe).", content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } } },
          },
        },
        
        get: {
          tags: ["Users"],
          summary: "Lista todos os usuários",
          description: "Retorna um array com todos os usuários cadastrados. Requer autenticação.",
          security: [{ BearerAuth: [] }],
          responses: {
            "200": { description: "Lista de usuários retornada com sucesso.", content: { "application/json": { schema: { type: "array", items: { $ref: "#/components/schemas/UserResponse" } } } } },
            "401": { description: "Não autorizado (Token ausente ou inválido).", content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } } },
            "500": { description: "Erro interno do servidor.", content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } } },
          },
        },
      },

      "/api/users/{id}": { // PREFIXO CORRIGIDO: Removido /v1
        get: {
          tags: ["Users"],
          summary: "Busca um usuário pelo ID",
          description: "Retorna um usuário específico com base no seu ID. Requer autenticação.",
          security: [{ BearerAuth: [] }],
          parameters: [
            { name: "id", in: "path", description: "ID do usuário a ser buscado", required: true, schema: { type: "string", format: "uuid" } },
          ],
          responses: {
            "200": { description: "Usuário encontrado com sucesso.", content: { "application/json": { schema: { $ref: "#/components/schemas/UserResponse" } } } },
            "400": { description: "ID do usuário é inválido.", content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } } },
            "401": { description: "Não autorizado (Token ausente ou inválido).", content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } } },
            "404": { description: "Usuário não encontrado.", content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } } },
          },
        },
      },
    },
  },
  apis: [],
});