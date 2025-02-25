'use server'

import { createClient } from "@/lib/supabase/server";
import { hasActiveSubscription } from "@/lib/supabase/queries";

export async function checkSubscriptionStatus(): Promise<{ 
  isSubscribed: boolean;
  error: string | null;
}> {
  try {
    const supabase = await createClient();
    const isSubscribed = await hasActiveSubscription(supabase);
    
    return {
      isSubscribed,
      error: null
    };
  } catch (error) {
    console.error("Error checking subscription status:", error);
    return {
      isSubscribed: false,
      error: "Failed to check subscription status"
    };
  }
} 