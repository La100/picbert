'use server'

import { createClientWithOptions } from "@/lib/supabase/server-fetch";
import { Tables } from "@database.types";
import { getUser } from "@/lib/supabase/queries";

interface CreditResponse {
  error: string | null;
  success: boolean;
  data: Tables<'credits'> | null;
}

export async function getCredits(): Promise<CreditResponse> {
  const cacheOptions = {
    cache: 'force-cache',
    next: {
      tags: ['credits'],
      revalidate: 300 // 5 minutes
    }
  }

  const supabase = await createClientWithOptions(cacheOptions);
  const user = await getUser(supabase);
  
  if (!user) {
    return {
      error: "Unauthorized",
      success: false,
      data: null
    };
  }

  const { data, error } = await supabase
  .from('credits')
  .select('*')
  .eq('user_id', user.id)
  .single();

  if (error) {
    return {
      error: error?.message || null,
      success: false,
      data: null
    };
  }

  return {
    error: null,
    success: true,
    data: data || null
  };
}
