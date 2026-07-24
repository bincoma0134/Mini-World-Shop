import type { D1Database, R2Bucket } from '@cloudflare/workers-types';

export type Bindings = {
  DB: D1Database;
  ASSETS_BUCKET: R2Bucket;
  ENVIRONMENT: string;
  JWT_SECRET: string;
};

export type JWTPayload = {
  id: string;
  username: string;
  role: string;
  exp: number;
};