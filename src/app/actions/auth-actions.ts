"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

interface AuthResponse {
  error: null | string;
  success: boolean;
  data: unknown | null;
}

export async function login(formData: FormData): Promise<AuthResponse> {
  const supabase = await createClient();
  const data = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  };

  const { data: loginData, error } = await supabase.auth.signInWithPassword(
    data,
  );

  return {
    error: error?.message || "There was an error logging in!",
    success: !error,
    data: loginData || null,
  };
}

export async function signup(formData: FormData): Promise<AuthResponse> {
  const supabase = await createClient();

  // Get form data
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const turnstileToken = formData.get("turnstileToken") as string;

  // Verify Turnstile token
  if (!turnstileToken) {
    return {
      error: "CAPTCHA verification failed. Please try again.",
      success: false,
      data: null,
    };
  }

  try {
    // Verify the token with Cloudflare
    const turnstileResponse = await verifyTurnstileToken(turnstileToken);
    
    if (!turnstileResponse.success) {
      console.error("Turnstile verification failed:", turnstileResponse);
      return {
        error: "CAPTCHA verification failed. Please try again.",
        success: false,
        data: null,
      };
    }

    // Proceed with signup
    const { data: signupData, error } = await supabase.auth.signUp({
      email,
      password,
    });

    return {
      error: error?.message || "There was an error signing up!",
      success: !error,
      data: signupData || null,
    };
  } catch (error) {
    console.error("Error during signup:", error);
    return {
      error: "An unexpected error occurred during signup.",
      success: false,
      data: null,
    };
  }
}

// Function to verify Turnstile token with Cloudflare
async function verifyTurnstileToken(token: string) {
  const secretKey = process.env.CLOUDFLARE_TURNSTILE_SECRET_KEY;
  if (!secretKey) {
    throw new Error("Cloudflare Turnstile secret key is not configured");
  }

  const formData = new URLSearchParams();
  formData.append("secret", secretKey);
  formData.append("response", token);

  const response = await fetch(
    "https://challenges.cloudflare.com/turnstile/v0/siteverify",
    {
      method: "POST",
      body: formData,
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    }
  );

  return await response.json();
}

export async function resetPassword(
  values: { email: string },
): Promise<AuthResponse> {
  console.log("Starting password reset email process for:", values.email);
  const supabase = await createClient();

  // Use only the site URL from environment variables
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  const resetPasswordUrl = `${baseUrl}/reset-password`;
  
  console.log("Using reset password URL:", resetPasswordUrl);

  try {
    const { data, error } = await supabase.auth.resetPasswordForEmail(
      values.email,
      {
        redirectTo: resetPasswordUrl,
      }
    );

    if (error) {
      console.error("Failed to send reset password email:", error);
      return {
        error: error.message,
        success: false,
        data: null,
      };
    }

    console.log("Password reset email sent successfully");
    console.log("Reset password flow:", {
      email: values.email,
      redirectUrl: resetPasswordUrl,
      timestamp: new Date().toISOString()
    });

    return {
      error: null,
      success: true,
      data: data || null,
    };
  } catch (error) {
    console.error("Unexpected error during password reset:", error);
    return {
      error: "There was an unexpected error sending the reset password email!",
      success: false,
      data: null,
    };
  }
}

export async function updateProfile(
  values: { fullName: string },
): Promise<AuthResponse> {
  const supabase = await createClient();
  const full_name = values.fullName;

  const { data, error } = await supabase.auth.updateUser({
    data: { full_name },
  });

  if (!error) {
    const { error: profileError } = await supabase
      .from("users")
      .update({ full_name })
      .eq("id", data?.user?.id);

    if (profileError) {
      return {
        error: profileError.message,
        success: false,
        data: null,
      };
    }
  }

  return {
    error: error?.message || "There was an error updating the profile!",
    success: !error,
    data: data || null,
  };
}

export async function logout(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

export async function changePassword(
  newPassword: string,
): Promise<AuthResponse> {
  const supabase = await createClient();

  const { error, data } = await supabase.auth.updateUser({
    password: newPassword,
  });

  return {
    error: error?.message || "There was an error changing the password!",
    success: !error,
    data: data || null,
  };
}

export async function loginWithGoogle(): Promise<void> {
  const supabase = await createClient();
  
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
    },
  });

  if (error) {
    throw new Error(error.message);
  }

  redirect(data.url);
}
