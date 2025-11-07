import swaggerJSDoc from 'swagger-jsdoc';

export const swaggerSpec = swaggerJSDoc({
  definition: {
    openapi: '3.0.3',
    info: {
      title: 'Proint 1 API',
      version: '1.0.0',
      description: 'API documentation'
    },
    servers: [
      { url: 'https://brainhot.varanda.dev.br/' },
      { url: 'http://localhost:3000' }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            name: { type: 'string' },
            email: { type: 'string', format: 'email' }
          }
        }
      }
    },
    paths: {
      '/health': {
        get: {
          tags: ['Health'],
          summary: 'Health check',
          responses: {
            200: {
              description: 'OK'
            }
          }
        }
      },
      '/auth/register': {
        post: {
          tags: ['Auth'],
          summary: 'Register new user',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['name', 'email', 'password'],
                  properties: {
                    name: { type: 'string' },
                    email: { type: 'string', format: 'email' },
                    password: { type: 'string', format: 'password' }
                  }
                }
              }
            }
          },
          responses: {
            201: {
              description: 'Created',
              content: { 'application/json': { schema: { $ref: '#/components/schemas/User' } } }
            },
            400: { description: 'Bad Request' }
          }
        }
      },
      '/auth/login': {
        post: {
          tags: ['Auth'],
          summary: 'Login',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['email', 'password'],
                  properties: {
                    email: { type: 'string', format: 'email' },
                    password: { type: 'string', format: 'password' }
                  }
                }
              }
            }
          },
          responses: {
            200: {
              description: 'OK',
              content: { 'application/json': { schema: { type: 'object', properties: { token: { type: 'string' } } } } }
            },
            401: { description: 'Unauthorized' }
          }
        }
      },
      '/api/users': {
        get: {
          tags: ['Users'],
          summary: 'List users',
          responses: {
            200: {
              description: 'OK',
              content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/User' } } } }
            }
          }
        },
        post: {
          tags: ['Users'],
          summary: 'Create user (demo)',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['name', 'email'],
                  properties: {
                    name: { type: 'string' },
                    email: { type: 'string', format: 'email' }
                  }
                }
              }
            }
          },
          responses: {
            201: {
              description: 'Created',
              content: { 'application/json': { schema: { $ref: '#/components/schemas/User' } } }
            },
            400: { description: 'Bad Request' }
          }
        }
      }
    }
  },
  apis: []
});


