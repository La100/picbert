import { type NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const { searchParams } = requestUrl
  const token = searchParams.get('token')
  
  // If we have a token, redirect to the reset-password page with the token
  if (token) {
    return NextResponse.redirect(
      new URL(`/reset-password?token=${token}`, request.url)
    )
  }
  
  // If no token is provided, redirect to the login page
  return NextResponse.redirect(new URL('/login', request.url))
} 