// src/main/docs/schemas/index.ts
import { commonSchemas } from './commonSchemas';
import { userAuthSchemas } from './userAuthSchemas';

export const allSchemas = {
  ...commonSchemas,
  ...userAuthSchemas,
};