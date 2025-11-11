// src/main/docs/paths/userAuthPaths.ts
export const userAuthPaths = {
  // --- Password ---
  "/api/password/request": {
    post: {
      tags: ["Password"],
      summary: "Solicitar Link de Redefinição de Senha",
      description: "Envia um link de redefinição para o email fornecido, se o usuário existir. Resposta de sucesso é retornada por segurança, mesmo que o email não exista.",
      requestBody: { required: true, content: { "application/json": { schema: { $ref: "#/components/schemas/RequestResetDTO" } } } },
      responses: {
        "200": { description: "Link de redefinição enviado (ou simulado) com sucesso.", content: { "application/json": { schema: { $ref: "#/components/schemas/MessageResponse" } } } },
        "500": { description: "Erro interno do servidor (ex: falha no serviço de email).", content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } } },
      },
    },
  },
  "/api/password/reset": {
    post: {
      tags: ["Password"],
      summary: "Redefinir Senha",
      description: "Aplica a nova senha após a validação do token recebido por email.",
      requestBody: { required: true, content: { "application/json": { schema: { $ref: "#/components/schemas/ResetPasswordDTO" } } } },
      responses: {
        "200": { description: "Senha redefinida com sucesso.", content: { "application/json": { schema: { $ref: "#/components/schemas/MessageResponse" } } } },
        "400": { description: "Token, userId, ou nova senha inválidos/ausentes.", content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } } },
      },
    },
  },

  // --- Auth ---
  "/api/auth": {
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
  "/api/sessions/validate": {
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

  // --- Users ---
  "/api/users": {
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
  "/api/users/{id}": {
    get: {
      tags: ["Users"],
      summary: "Busca um usuário pelo ID",
      description: "Retorna um usuário específico com base no seu ID. Requer autenticação.",
      security: [{ BearerAuth: [] }],
      parameters: [{ name: "id", in: "path", description: "ID do usuário a ser buscado", required: true, schema: { type: "string", format: "uuid" } }],
      responses: {
        "200": { description: "Usuário encontrado com sucesso.", content: { "application/json": { schema: { $ref: "#/components/schemas/UserResponse" } } } },
        "400": { description: "ID do usuário é inválido.", content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } } },
        "401": { description: "Não autorizado (Token ausente ou inválido).", content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } } },
        "404": { description: "Usuário não encontrado.", content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } } },
      },
    },
    put: {
      tags: ["Users"],
      summary: "Edita o perfil do usuário",
      description: "Atualiza o nome ou email do usuário logado. Requer autenticação e só pode editar o próprio perfil.",
      security: [{ BearerAuth: [] }],
      parameters: [{ name: "id", in: "path", description: "ID do usuário a ser editado (deve ser o ID do usuário logado)", required: true, schema: { type: "string", format: "uuid" } }],
      requestBody: { required: true, content: { "application/json": { schema: { $ref: "#/components/schemas/EditUserDTO" } } } },
      responses: {
        "200": { description: "Perfil atualizado com sucesso.", content: { "application/json": { schema: { $ref: "#/components/schemas/UserResponse" } } } },
        "400": { description: "Erro de validação (ex: Novo email já em uso).", content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } } },
        "401": { description: "Não autorizado (Token inválido).", content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } } },
        "403": { description: "Proibido (Tentativa de editar perfil de outro usuário).", content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } } },
        "404": { description: "Usuário não encontrado.", content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } } },
      },
    },
  },
};