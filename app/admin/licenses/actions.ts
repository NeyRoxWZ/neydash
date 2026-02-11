'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { v4 as uuidv4 } from 'uuid';

export async function getLicensesAction() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('licenses')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

export async function createLicenseAction(durationDays: number | string) {
  const supabase = await createClient();
  
  // Generate a random 16-char license key
  const licenseKey = Math.random().toString(36).substring(2, 10).toUpperCase() + 
                     Math.random().toString(36).substring(2, 10).toUpperCase();

  let expiresAt = null;
  if (typeof durationDays === 'number') {
    expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + durationDays);
  } else if (typeof durationDays === 'string' && !isNaN(parseInt(durationDays))) {
    // Custom minutes
    expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + parseInt(durationDays));
  }

  const { data, error } = await supabase
    .from('licenses')
    .insert({
      license_key: licenseKey,
      status: 'pending',
      expiresat: expiresAt?.toISOString() || null
    })
    .select()
    .single();

  if (error) throw error;
  revalidatePath('/admin/licenses');
  return data;
}

export async function updateLicenseAction(licenseKey: string, expiresAt: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from('licenses')
    .update({ expiresat: expiresAt })
    .eq('license_key', licenseKey);

  if (error) throw error;
  revalidatePath('/admin/licenses');
  return { success: true };
}

export async function deleteLicenseAction(licenseKey: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from('licenses')
    .delete()
    .eq('license_key', licenseKey);

  if (error) throw error;
  revalidatePath('/admin/licenses');
  return { success: true };
}
