// src/main/docs/paths/index.ts
import { commonPaths } from './commonPaths';
import { userAuthPaths } from './userAuthPaths';
import { modulePaths } from './modulePaths';

export const allPaths = {
  ...commonPaths,
  ...userAuthPaths,
  ...modulePaths,
};