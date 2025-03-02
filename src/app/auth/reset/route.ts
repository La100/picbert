import { type NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const { searchParams } = requestUrl
  const code = searchParams.get('code')
  
  // If we have a code, redirect to the reset-password page with the code
  if (code) {
    return NextResponse.redirect(
      new URL(`/reset-password?code=${code}`, request.url)
    )
  }
  
  // If no code is provided, redirect to the login page
  return NextResponse.redirect(new URL('/login', request.url))
} 