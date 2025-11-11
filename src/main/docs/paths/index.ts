// src/main/docs/paths/index.ts
import { commonPaths } from './commonPaths';
import { userAuthPaths } from './userAuthPaths';

export const allPaths = {
  ...commonPaths,
  ...userAuthPaths,
};