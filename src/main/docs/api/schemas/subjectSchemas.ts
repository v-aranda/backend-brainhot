// src/main/docs/schemas/subjectSchemas.ts
export const subjectSchemas = {
  CreateSubjectDTO: {
    type: "object",
    properties: {
      name: { type: "string", example: "Matemática" },
    },
    required: ["name"],
  },
  UpdateSubjectDTO: {
    type: "object",
    properties: {
      name: { type: "string", example: "Biologia" },
    },
  },
  SubjectResponse: {
    type: "object",
    properties: {
      id: { type: "string", format: "uuid", example: "sub-123-uuid" },
      name: { type: "string", example: "Matemática" },
    },
  },
};