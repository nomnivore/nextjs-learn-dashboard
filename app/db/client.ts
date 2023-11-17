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

// memoized client..... idk
let _client: ReturnType<typeof makeClient> | undefined;

export const db = () => {
  if (!_client) {
    _client = makeClient(process.env.TURSO_URL!, process.env.TURSO_TOKEN!);
  }

  return _client;
};
