import { type NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  console.log("Password reset route handler called");
  const requestUrl = new URL(request.url)
  const { searchParams } = requestUrl
  
  // Sprawdź wszystkie możliwe parametry z Supabase
  const token = searchParams.get('token')
  const type = searchParams.get('type')
  const code = searchParams.get('code')
  
  console.log("Received reset password request:", {
    url: request.url,
    hasToken: !!token,
    type: type,
    hasCode: !!code,
    allParams: Object.fromEntries(searchParams.entries()),
    timestamp: new Date().toISOString()
  });
  
  // Jeśli mamy token z Supabase verify endpoint
  if (token && type === 'recovery') {
    const redirectUrl = new URL(`/reset-password?code=${token}`, request.url);
    console.log("Redirecting to reset password page with token:", redirectUrl.toString());
    return NextResponse.redirect(redirectUrl);
  }
  
  // Jeśli mamy bezpośredni kod
  if (code) {
    const redirectUrl = new URL(`/reset-password?code=${code}`, request.url);
    console.log("Redirecting to reset password page with code:", redirectUrl.toString());
    return NextResponse.redirect(redirectUrl);
  }
  
  // Jeśli nie ma ani tokenu ani kodu, przekieruj do logowania
  console.warn("No reset token or code provided, redirecting to login");
  return NextResponse.redirect(new URL('/login', request.url));
} 