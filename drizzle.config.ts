import type { Config } from 'drizzle-kit';
import { loadEnvConfig } from '@next/env';

// set up env variables, same as nextjs
loadEnvConfig(process.cwd());

export default {
  schema: './app/db/schema.ts',
  driver: 'turso',
  out: './drizzle',
  dbCredentials: {
    url: process.env.TURSO_URL!,
    authToken: process.env.TURSO_TOKEN!,
  },
} satisfies Config;
