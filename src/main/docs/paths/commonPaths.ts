// src/main/docs/paths/commonPaths.ts
export const commonPaths = {
  "/health": {
    get: { tags: ["Health"], summary: "Health check", responses: { "200": { description: "OK" } } },
  },
};