import { SupabaseClient } from '@supabase/supabase-js';
import { cache } from 'react';
import { createClient } from './client';

// The cache function is used to cache the results of the function.
// It is used to improve the performance of the application by avoiding the need to re-fetch the data from the database.
export const getUser = cache(async (supabase: SupabaseClient) => {
  const {
    data: { user }
  } = await supabase.auth.getUser();
  return user;
});

export const getSubscription = cache(async (supabase: SupabaseClient) => {
  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('*, prices(*, products(*))')
    .in('status', ['trialing', 'active'])
    .maybeSingle();

  return subscription;
});

// Check if user has an active subscription
export const hasActiveSubscription = async (supabase: SupabaseClient) => {
  const subscription = await getSubscription(supabase);
  return !!subscription;
};

export const getProducts = cache(async (supabase: SupabaseClient) => {
  const { data: products } = await supabase
    .from('products')
    .select('*, prices(*)')
    .eq('active', true)
    .eq('prices.active', true)
    .order('unit_amount', { referencedTable: 'prices' });

  // Sort products in the desired order: Hobby, Pro, Business
  if (products) {
    const productOrder = { 'Hobby': 1, 'Pro': 2, 'Business': 3 };
    products.sort((a, b) => {
      return (productOrder[a.name as keyof typeof productOrder] || 999) - 
             (productOrder[b.name as keyof typeof productOrder] || 999);
    });
  }

  return products;
});

export const getUserDetails = cache(async (supabase: SupabaseClient) => {
  const { data: userDetails } = await supabase
    .from('users')
    .select('*')
    .single();
  return userDetails;
});

/**
 * Upload an input image to the Supabase storage bucket
 * @param userId - The authenticated user's ID
 * @param file - The file to upload
 * @param fileName - The name to give the file
 * @returns The URL of the uploaded file
 */
export async function uploadInputImage(userId: string, file: File, fileName: string) {
  const supabase = createClient();
  const fileExt = fileName.split('.').pop();
  const filePath = `${userId}/${Date.now()}.${fileExt}`;
  
  const { /* data */error } = await supabase
    .storage
    .from('inputimage')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false
    });

  if (error) {
    throw error;
  }

  const { data: urlData } = supabase
    .storage
    .from('inputimage')
    .getPublicUrl(filePath);

  return urlData.publicUrl;
}
