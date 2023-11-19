'use server';

import { db } from '@/app/db/client';
import { custom, z } from 'zod';
import { invoices } from '../db/schema';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { eq } from 'drizzle-orm';

const FormSchema = z.object({
  id: z.string(),
  customerId: z.string(),
  amount: z.coerce.number(),
  status: z.enum(['pending', 'paid']),
  date: z.string(),
});

const CreateInvoice = FormSchema.omit({ id: true, date: true });

export async function createInvoice(formData: FormData) {
  const { customerId, amount, status } = CreateInvoice.parse({
    customerId: formData.get('customerId'),
    amount: formData.get('amount'),
    status: formData.get('status'),
  });

  const amountInCents = amount * 100;
  const date = new Date().toISOString().split('T')[0];

  try {
    await db().insert(invoices).values({
      customerId,
      amount: amountInCents,
      status,
      date,
    });
  } catch (error) {
    return {
      message: 'DB Error: Failed to Create Invoice',
    };
  }
  revalidatePath('/dashboard/invoices');
  redirect('/dashboard/invoices');
}

// Use Zod to update the expected types
const UpdateInvoice = FormSchema.omit({ id: true, date: true });

export async function updateInvoice(id: string, formData: FormData) {
  const { customerId, amount, status } = UpdateInvoice.parse({
    customerId: formData.get('customerId'),
    amount: formData.get('amount'),
    status: formData.get('status'),
  });

  const amountInCents = amount * 100;

  try {
    await db()
      .update(invoices)
      .set({
        customerId: customerId,
        amount: amountInCents,
        status,
      })
      .where(eq(invoices.id, id));
  } catch (error) {
    return {
      message: 'DB Error: Failed to Update Invoice',
    };
  }

  revalidatePath('/dashboard/invoices');
  redirect('/dashboard/invoices');
}

export async function deleteInvoice(id: string) {
  throw new Error('Failed to Delete Invoice');

  try {
    await db().delete(invoices).where(eq(invoices.id, id));
  } catch (error) {
    return { message: 'DB Error: Failed to Delete Invoice' };
  }

  revalidatePath('/dashboard/invoices');
}
