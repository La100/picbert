import { createClient } from '@/lib/supabase/server';
import { createServiceClient } from '@/lib/supabase/server';
import { INITIAL_USER_TOKENS } from '@/lib/constants';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  
  if (code) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    
    // If this is a new user (first sign in), create a credits record with initial tokens
    if (!error && data?.user) {
      try {
        // Use service client to bypass RLS policies
        const serviceClient = createServiceClient();
        
        // Check if user already has a credits record
        const { data: existingCredits } = await serviceClient
          .from("credits")
          .select("*")
          .eq("user_id", data.user.id)
          .single();
        
        // Only create credits record if user doesn't have one yet
        if (!existingCredits) {
          const { error: creditsError } = await serviceClient
            .from("credits")
            .insert([{ 
              user_id: data.user.id, 
              tokens: INITIAL_USER_TOKENS 
            }]);
          
          if (creditsError) {
            console.error("Failed to create initial credits:", creditsError.message);
          } else {
            console.log(`Created initial credits (${INITIAL_USER_TOKENS} tokens) for OAuth user: ${data.user.id}`);
          }
        }
      } catch (creditsError) {
        console.error("Error creating initial credits for OAuth user:", creditsError);
      }
    }
  }

  // URL to redirect to after sign in process completes
  return NextResponse.redirect(new URL('/dashboard', request.url));
} 