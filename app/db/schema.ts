import { randomUUID } from 'crypto';
import { relations } from 'drizzle-orm';
import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

const id = text('id')
  .primaryKey()
  .$defaultFn(() => randomUUID());

export const users = sqliteTable('users', {
  id,
  name: text('name'),
  email: text('email').notNull().unique(),
  password: text('password').notNull(),
});

export const invoices = sqliteTable('invoices', {
  id,
  customerId: text('customer_id')
    .notNull()
    .references(() => customers.id),
  amount: integer('amount').notNull(),
  status: text('status').notNull(),
  date: text('date').notNull(),
});

export const invoicesRelations = relations(invoices, ({ one }) => ({
  customer: one(customers, {
    fields: [invoices.customerId],
    references: [customers.id],
  }),
}));

export const customers = sqliteTable('customers', {
  id,
  name: text('name').notNull(),
  email: text('email').notNull(),
  imageUrl: text('image_url').notNull(),
});

export const customersRelations = relations(customers, ({ many }) => ({
  invoices: many(invoices),
}));

export const revenue = sqliteTable('revenue', {
  month: text('month').notNull(),
  revenue: integer('revenue').notNull(),
});
