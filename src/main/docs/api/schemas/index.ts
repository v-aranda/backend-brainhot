// src/main/docs/schemas/index.ts
import { commonSchemas } from './commonSchemas';
import { userAuthSchemas } from './userAuthSchemas';
import { subjectSchemas } from './subjectSchemas';
import { topicSchemas } from './topicSchemas';
import { questionSchemas } from './questionSchemas';

export const allSchemas = {
  ...commonSchemas,
  ...userAuthSchemas,
  ...subjectSchemas,
  ...topicSchemas,
  ...questionSchemas,
};