import { makeClient } from '@/app/db/client';
import { loadEnvConfig } from '@next/env';
import bcrypt from 'bcrypt';
import * as data from '@/app/lib/placeholder-data';
import { customers, invoices, revenue, users } from '@/app/db/schema';

// for now, assume db is migrated by drizzle-kit

type DrizzleClient = ReturnType<typeof makeClient>;
async function seedUsers(client: DrizzleClient) {
  const inserted = await Promise.all(
    data.users.map(async (user) => {
      const hashedPassword = await bcrypt.hash(user.password, 10);

      const res = await client
        .insert(users)
        .values({
          id: user.id,
          name: user.name,
          email: user.email,
          password: hashedPassword,
        })
        .onConflictDoNothing()
        .returning({ insertedId: users.id });

      return res[0]?.insertedId;
    }),
  );

  console.log(`Seeded ${inserted.length} users`);
}

async function seedInvoices(client: DrizzleClient) {
  const res = await client
    .insert(invoices)
    .values(
      data.invoices.map((invoice) => ({
        customerId: invoice.customer_id,
        amount: invoice.amount,
        status: invoice.status,
        date: invoice.date,
      })),
    )
    .onConflictDoNothing();

  console.log(`Seeded ${res.rowsAffected} invoices`);
}

async function seedCustomers(client: DrizzleClient) {
  const res = await client
    .insert(customers)
    .values(
      data.customers.map((customer) => ({
        id: customer.id,
        name: customer.name,
        email: customer.email,
        imageUrl: customer.image_url,
      })),
    )
    .onConflictDoNothing();

  console.log(`Seeded ${res.rowsAffected} customers`);
}

async function seedRevenue(client: DrizzleClient) {
  const res = await client
    .insert(revenue)
    .values(data.revenue)
    .onConflictDoNothing();

  console.log(`Seeded ${res.rowsAffected} revenue`);
}

async function main() {
  // set up env variables, same as nextjs
  const cwd = process.cwd();
  loadEnvConfig(cwd);
  const db = makeClient(process.env.TURSO_URL!, process.env.TURSO_TOKEN!);

  await seedUsers(db);
  await seedCustomers(db);
  await seedInvoices(db);
  await seedRevenue(db);
}

main().catch((err) => {
  console.error(
    'An error occurred while attempting to seed the database:',
    err,
  );
});
