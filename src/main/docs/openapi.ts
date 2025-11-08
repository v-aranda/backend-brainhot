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
    components: {
      schemas: {
        // 1. O que entra no requestBody
        CreateUserDTO: {
          type: "object",
          properties: {
            name: {
              type: "string",
              example: "John Doe",
            },
            email: {
              type: "string",
              format: "email",
              example: "john.doe@example.com",
            },
            password: {
              type: "string",
              format: "password",
              example: "strongpassword123",
            },
          },
          required: ["name", "email", "password"],
        },

        // 2. O que sai na resposta de sucesso
        UserResponse: {
          type: "object",
          properties: {
            id: {
              type: "string",
              format: "uuid",
              example: "123e4567-e89b-12d3-a456-426614174000",
            },
            name: {
              type: "string",
              example: "John Doe",
            },
            email: {
              type: "string",
              format: "email",
              example: "john.doe@example.com",
            },
            createdAt: {
              type: "string",
              format: "date-time",
              example: "2025-11-08T00:30:00Z",
            },
          },
        },

        // 3. O que sai na resposta de erro
        ErrorResponse: {
          type: "object",
          properties: {
            message: {
              type: "string",
              example: "User with this email already exists.",
            },
          },
        },
      },
    },
    paths: {
      "/health": {
        get: {
          tags: ["Health"],
          summary: "Health check",
          responses: {
            200: {
              description: "OK",
            },
          },
        },
      },
      "/api/users": {
        post: {
          tags: ["Users"],
          summary: "Cria um novo usuário",
          description: "Registra um novo usuário no sistema.",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/CreateUserDTO",
                },
              },
            },
          },
          responses: {
            "201": {
              description: "Usuário criado com sucesso.",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/UserResponse",
                  },
                },
              },
            },
            "400": {
              description: "Erro de validação (ex: email já existe).",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/ErrorResponse",
                  },
                },
              },
            },
          },
        },

        // --- ADICIONADO: GET /api/users (Listar Todos) ---
        get: {
          tags: ["Users"],
          summary: "Lista todos os usuários",
          description: "Retorna um array com todos os usuários cadastrados.",
          responses: {
            "200": {
              description: "Lista de usuários retornada com sucesso.",
              content: {
                "application/json": {
                  schema: {
                    // Retorna um ARRAY de UserResponse
                    type: "array",
                    items: {
                      $ref: "#/components/schemas/UserResponse",
                    },
                  },
                },
              },
            },
            "500": {
              description: "Erro interno do servidor.",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/ErrorResponse",
                  },
                },
              },
            },
          },
        },
        // --- FIM DA ADIÇÃO ---
      },

      // --- ADICIONADO: GET /api/users/{id} (Buscar por ID) ---
      "/api/users/{id}": {
        get: {
          tags: ["Users"],
          summary: "Busca um usuário pelo ID",
          description: "Retorna um usuário específico com base no seu ID.",
          parameters: [
            {
              name: "id",
              in: "path",
              description: "ID do usuário a ser buscado",
              required: true,
              schema: {
                type: "string",
                format: "uuid", // Assumindo que o ID é um UUID
              },
            },
          ],
          responses: {
            "200": {
              description: "Usuário encontrado com sucesso.",
              content: {
                "application/json": {
                  schema: {
                    // Retorna um ÚNICO UserResponse
                    $ref: "#/components/schemas/UserResponse",
                  },
                },
              },
            },
            "400": {
              description: "ID do usuário é inválido.",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/ErrorResponse",
                  },
                },
              },
            },
            "404": {
              description: "Usuário não encontrado.",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/ErrorResponse",
                  },
                },
              },
            },
          },
        },
      },
      // --- FIM DA ADIÇÃO ---
    },
  },
  apis: [], // Se você usa 'apis', aponte para seus arquivos de rota
});