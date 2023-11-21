import NextAuth from 'next-auth';
import { authConfig } from './auth.config';
import Credentials from 'next-auth/providers/credentials';
import { z } from 'zod';
import type { User } from './app/lib/definitions';
import bcrypt from 'bcrypt';
import { db } from './app/db/client';

async function getUser(email: string): Promise<User | undefined> {
  try {
    const user = await db().query.users.findFirst({
      where: (users, { eq }) => eq(users.email, email),
    });
    return user as User | undefined;
  } catch (e) {
    console.error('Failed to get user:', e);
    throw new Error('Failed to get user');
  }
}

export const { auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      async authorize(cred) {
        const parsedCred = z
          .object({
            email: z.string().email(),
            password: z.string().min(6),
          })
          .safeParse(cred);

        if (parsedCred.success) {
          const { email, password } = parsedCred.data;
          const user = await getUser(email);
          if (!user) return null;
          const passwordsMatch = await bcrypt.compare(password, user.password);

          if (passwordsMatch) return user;
        }

        console.log('Invalid credentials');
        return null;
      },
    }),
  ],
});
