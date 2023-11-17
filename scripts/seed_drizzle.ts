import { makeClient } from '@/app/db/client';
import { loadEnvConfig } from '@next/env';

// set up env variables, same as nextjs
const cwd = process.cwd();
loadEnvConfig(cwd);

const db = makeClient(process.env.TURSO_URL!, process.env.TURSO_TOKEN!);

// for now, assume db is migrated by drizzle-kit
