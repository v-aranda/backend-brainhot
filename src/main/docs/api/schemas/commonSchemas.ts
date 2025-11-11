// src/main/docs/schemas/commonSchemas.ts
export const commonSchemas = {
  // Resposta de Mensagem (Comum para Sucesso ou Erro)
  MessageResponse: {
    type: "object",
    properties: {
      message: { type: "string", example: "Se o email estiver registrado, o link de redefinição será enviado." },
    },
  },

  // Resposta de Erro
  ErrorResponse: {
    type: "object",
    properties: {
      error: { type: "string", example: "Email ou token inválido." },
    },
  },
};