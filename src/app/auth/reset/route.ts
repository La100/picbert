import { type NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  console.log("Password reset route handler called");
  const requestUrl = new URL(request.url)
  const { searchParams } = requestUrl
  
  // Check all possible token parameters from Supabase
  const token = searchParams.get('token')
  const tokenHash = searchParams.get('token_hash')
  const type = searchParams.get('type')
  const code = searchParams.get('code')
  
  console.log("Received reset password request:", {
    url: request.url,
    hasToken: !!token,
    hasTokenHash: !!tokenHash,
    type: type,
    hasCode: !!code,
    allParams: Object.fromEntries(searchParams.entries()),
    timestamp: new Date().toISOString()
  });
  
  // Handle PKCE flow token
  if (tokenHash && type === 'email') {
    const redirectUrl = new URL('/reset-password', request.url);
    // Preserve all original parameters
    searchParams.forEach((value, key) => {
      redirectUrl.searchParams.set(key, value);
    });
    console.log("Redirecting to reset password page with all parameters:", redirectUrl.toString());
    
    // Create response with redirect
    const response = NextResponse.redirect(redirectUrl);
    
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
  
  // Handle recovery token
  if (token && type === 'recovery') {
    const redirectUrl = new URL('/reset-password', request.url);
    // Preserve all original parameters
    searchParams.forEach((value, key) => {
      redirectUrl.searchParams.set(key, value);
    });
    console.log("Redirecting to reset password page with all parameters:", redirectUrl.toString());
    
    // Create response with redirect
    const response = NextResponse.redirect(redirectUrl);
    
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
  
  // Handle direct code
  if (code) {
    const redirectUrl = new URL('/reset-password', request.url);
    // Preserve all original parameters
    searchParams.forEach((value, key) => {
      redirectUrl.searchParams.set(key, value);
    });
    console.log("Redirecting to reset password page with all parameters:", redirectUrl.toString());
    
    // Create response with redirect
    const response = NextResponse.redirect(redirectUrl);
    
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
  
  // If no valid token parameters found, redirect to login
  console.warn("No valid reset token parameters found, redirecting to login");
  return NextResponse.redirect(new URL('/login', request.url));
} 