import { type EmailOtpType } from '@supabase/supabase-js'
import { type NextRequest, NextResponse } from 'next/server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/server'
import { INITIAL_USER_TOKENS } from '@/lib/constants'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const { searchParams } = requestUrl
  const token_hash = searchParams.get('token_hash')
  const type = searchParams.get('type') as EmailOtpType | null
  const next = searchParams.get('next') ?? '/dashboard'

  if (token_hash && type) {
    const supabase = await createClient()

    const { data, error } = await supabase.auth.verifyOtp({
      type,
      token_hash,
    })
    
    if (!error && data?.user) {
      try {
        // Use service client to bypass RLS policies
        const serviceClient = createServiceClient()
        
        // Check if user already has a credits record
        const { data: existingCredits } = await serviceClient
          .from("credits")
          .select("*")
          .eq("user_id", data.user.id)
          .single()
        
        // Only create credits record if user doesn't have one yet
        if (!existingCredits) {
          const { error: creditsError } = await serviceClient
            .from("credits")
            .insert([{ 
              user_id: data.user.id, 
              tokens: INITIAL_USER_TOKENS 
            }])
          
          if (creditsError) {
            console.error("Failed to create initial credits:", creditsError.message)
          } else {
            console.log(`Created initial credits (${INITIAL_USER_TOKENS} tokens) for confirmed user: ${data.user.id}`)
          }
        }
      } catch (creditsError) {
        console.error("Error creating initial credits for confirmed user:", creditsError)
      }

      // Handle password recovery flow
      if (type === "recovery") {
        const response = NextResponse.redirect(new URL("/reset-password", request.url));
        
        // Set a secure cookie to allow password reset
        response.cookies.set({
          name: "auth",
          value: "ALLOWED_TO_RESET_PASSWORD",
          httpOnly: true,
          path: '/',
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: 60 * 5 // 5 minutes
        });

        return response;
      }
      
      // For email verification, redirect to dashboard
      if (type === "signup") {
        return NextResponse.redirect(new URL("/dashboard", request.url));
      }
      
      // For other flows, use the specified redirect URL
      return NextResponse.redirect(new URL(next, request.url));
    }
  }

  // redirect the user to an error page with some instructions
  redirect('/error')
}