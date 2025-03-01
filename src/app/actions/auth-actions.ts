"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { INITIAL_USER_TOKENS } from "@/lib/constants";
import { createServiceClient } from "@/lib/supabase/server";

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

  const data = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  };

  const { data: signupData, error } = await supabase.auth.signUp(data);

  // If signup was successful, create a credits record with initial tokens
  if (!error && signupData?.user) {
    try {
      // Use service client to bypass RLS policies
      const serviceClient = createServiceClient();
      
      // Create a credits record with initial tokens
      const { error: creditsError } = await serviceClient
        .from("credits")
        .insert([{ 
          user_id: signupData.user.id, 
          tokens: INITIAL_USER_TOKENS 
        }]);
      
      if (creditsError) {
        console.error("Failed to create initial credits:", creditsError.message);
      } else {
        console.log(`Created initial credits (${INITIAL_USER_TOKENS} tokens) for user: ${signupData.user.id}`);
      }
    } catch (creditsError) {
      console.error("Error creating initial credits:", creditsError);
    }
  }

  return {
    error: error?.message || "There was an error signing up!",
    success: !error,
    data: signupData || null,
  };
}

export async function resetPassword(
  values: { email: string },
): Promise<AuthResponse> {
  const supabase = await createClient();

  // Determine the base URL based on environment
  let baseUrl = process.env.NEXT_PUBLIC_SITE_URL;
  
  // If we're in development and have an ngrok URL, use it
  if (process.env.NODE_ENV === 'development' && process.env.NGROK_HOST) {
    baseUrl = process.env.NGROK_HOST;
  }
  
  // Fallback to localhost if no URL is set
  if (!baseUrl) {
    baseUrl = 'http://localhost:3000';
  }

  const { data, error } = await supabase.auth.resetPasswordForEmail(
    values.email,
    {
      redirectTo: `${baseUrl}/reset-password`,
    }
  );

  return {
    error: error?.message ||
      "There was an error sending the reset password email!",
    success: !error,
    data: data || null,
  };
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
