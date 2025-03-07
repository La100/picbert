import { type EmailOtpType } from '@supabase/supabase-js'
import { type NextRequest, NextResponse } from 'next/server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

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