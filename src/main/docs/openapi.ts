// src/main/docs/openapi.ts
import swaggerJSDoc from "swagger-jsdoc";
import { allSchemas } from './schemas'; // 🚀 IMPORTA SCHEMAS
import { allPaths } from './paths';     // 🚀 IMPORTA PATHS

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
      // 🚀 USA OS SCHEMAS IMPORTADOS
      schemas: allSchemas,
    },
    
    // --- PATHS (Rotas) ---
    // 🚀 USA OS PATHS IMPORTADOS
    paths: allPaths,
  },
  apis: [], // Mantemos vazio
});