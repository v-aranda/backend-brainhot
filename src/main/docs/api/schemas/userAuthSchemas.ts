// src/main/docs/schemas/userAuthSchemas.ts
export const userAuthSchemas = {
  // Esquema de Dados para Criação
  CreateUserDTO: {
    type: "object",
    properties: {
      name: { type: "string", example: "John Doe" },
      email: { type: "string", format: "email", example: "john.doe@example.com" },
      password: { type: "string", format: "password", example: "strongpassword123" },
    },
    required: ["name", "email", "password"],
  },
  
  // Esquema de Edição (Campos opcionais)
  EditUserDTO: {
    type: "object",
    properties: {
      name: { type: "string", example: "Jane Doe" },
      email: { type: "string", format: "email", example: "jane.doe.new@example.com" },
    },
  },
  
  // Esquema de Login
  LoginDTO: {
    type: "object",
    properties: {
      email: { type: "string", format: "email", example: "john.doe@example.com" },
      password: { type: "string", format: "password", example: "strongpassword123" },
    },
    required: ["email", "password"],
  },

  // Esquema para Solicitação de Redefinição de Senha
  RequestResetDTO: {
    type: "object",
    properties: {
      email: { type: "string", format: "email", example: "user@example.com" },
    },
    required: ["email"],
  },

  // Esquema para Aplicação de Nova Senha
  ResetPasswordDTO: {
    type: "object",
    properties: {
      userId: { type: "string", format: "uuid", example: "123e4567-e89b-12d3-a456-426614174000" },
      token: { type: "string", example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9" },
      newPassword: { type: "string", format: "password", example: "Nov4Senh@123" },
    },
    required: ["userId", "token", "newPassword"],
  },

  // Resposta do Usuário
  UserResponse: {
    type: "object",
    properties: {
      id: { type: "string", format: "uuid", example: "123e4567-e89b-12d3-a456-426614174000" },
      name: { type: "string", example: "John Doe" },
      email: { type: "string", format: "email", example: "john.doe@example.com" },
      createdAt: { type: "string", format: "date-time", example: "2025-11-08T00:30:00Z" },
    },
  },
  
  // Resposta do Token
  TokenResponse: {
    type: "object",
    properties: {
      token: { type: "string", example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjAwZTh..." },
    },
  },
};