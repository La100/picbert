import { type NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const token_hash = searchParams.get('token_hash');
  const type = searchParams.get('type');
  
  console.log("OTP verification request:", {
    token_hash,
    type,
    allParams: Object.fromEntries(searchParams.entries())
  });

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

  // Handle other OTP types (signup, invite, etc.)
  return NextResponse.redirect(new URL("/", request.url));
} 