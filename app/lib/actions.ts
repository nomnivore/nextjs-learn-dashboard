'use server';

import { db } from '@/app/db/client';
import { custom, z } from 'zod';
import { invoices } from '../db/schema';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { eq } from 'drizzle-orm';
import { signIn } from '@/auth';

const FormSchema = z.object({
  id: z.string(),
  customerId: z.string({
    invalid_type_error: 'Please select a customer',
  }),
  amount: z.coerce.number().gt(0, { message: 'Amount must be greater than 0' }),
  status: z.enum(['pending', 'paid'], {
    invalid_type_error: 'Please select a status',
  }),
  date: z.string(),
});

const CreateInvoice = FormSchema.omit({ id: true, date: true });

export type State = {
  errors?: {
    customerId?: string[];
    amount?: string[];
    status?: string[];
  };
  message?: string | null;
};

export async function createInvoice(prevState: State, formData: FormData) {
  const validated = CreateInvoice.safeParse({
    customerId: formData.get('customerId'),
    amount: formData.get('amount'),
    status: formData.get('status'),
  });

  if (!validated.success) {
    return {
      errors: validated.error.flatten().fieldErrors,
      message: 'Missing Fields. Failed to Create Invoice.',
    };
  }

  const { customerId, amount, status } = validated.data;
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
  try {
    await db().delete(invoices).where(eq(invoices.id, id));
  } catch (error) {
    return { message: 'DB Error: Failed to Delete Invoice' };
  }

  revalidatePath('/dashboard/invoices');
}

export async function authenticate(
  prevState: string | undefined,
  formData: FormData,
) {
  //
  try {
    await signIn('credentials', Object.fromEntries(formData));
  } catch (err) {
    if ((err as Error).message.includes('CredentialsSignin')) {
      return 'CredentialsSignin';
    }
    throw err;
  }
}
