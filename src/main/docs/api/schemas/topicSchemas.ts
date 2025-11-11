// src/main/docs/schemas/topicSchemas.ts
export const topicSchemas = {
  CreateTopicDTO: {
    type: "object",
    properties: {
      name: { type: "string", example: "Álgebra" },
      subjectId: { type: "string", format: "uuid", example: "sub-123-uuid" },
    },
    required: ["name", "subjectId"],
  },
  UpdateTopicDTO: {
    type: "object",
    properties: {
      name: { type: "string", example: "Geometria" },
      subjectId: { type: "string", format: "uuid", example: "sub-456-uuid" },
    },
  },
  TopicResponse: {
    type: "object",
    properties: {
      id: { type: "string", format: "uuid", example: "top-123-uuid" },
      name: { type: "string", example: "Álgebra" },
      subjectId: { type: "string", format: "uuid", example: "sub-123-uuid" },
      // O 'include' que fizemos no repositório
      subject: { $ref: "#/components/schemas/SubjectResponse" }, 
    },
  },
};