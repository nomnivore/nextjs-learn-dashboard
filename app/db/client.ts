import { drizzle } from 'drizzle-orm/libsql';
import { createClient } from '@libsql/client';
import * as schema from './schema';

export function makeClient(url: string, authToken: string) {
  const client = createClient({
    url,
    authToken,
  });

  return drizzle(client, { schema: schema });
}

export const db = makeClient(process.env.TURSO_URL!, process.env.TURSO_TOKEN!);
