"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { toast } from "sonner";
import { useRouter, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { AuthError } from "@supabase/supabase-js";

const passwordValidationRegex = new RegExp(
  "^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])(?=.{8,})"
);

const formSchema = z
  .object({
    password: z
      .string({
        required_error: "Password is required",
      })
      .min(8, {
        message: "Password must be at least 8 characters long.",
      })
      .regex(passwordValidationRegex, {
        message:
          "Password must contain at least 8 characters, 1 uppercase letter, 1 lowercase letter, 1 number, and 1 special character.",
      }),
    confirmPassword: z.string({
      required_error: "Confirm password is required",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type FormValues = z.infer<typeof formSchema>;

export function ChangePasswordForm({ 
  className = ""
}: { 
  className?: string;
}) {
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const [token, setToken] = React.useState<string | null>(null);
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });
  const toastId = React.useId();
  
  // Get token from URL on first render
  React.useEffect(() => {
    const tokenHash = searchParams.get('token_hash');
    const token = searchParams.get('token');
    const code = searchParams.get('code');
    const type = searchParams.get('type');
    
    console.log("Reset password parameters:", {
      tokenHash,
      token,
      code,
      type,
      allParams: Object.fromEntries(searchParams.entries())
    });
    
    // Try to get token in order of priority
    const resetToken = tokenHash || token || code;
    
    if (resetToken) {
      console.log("Reset password token found:", resetToken);
      setToken(resetToken);
    } else {
      console.warn("No reset password token found in URL");
      toast.error("Invalid password reset link. Please request a new one.");
      router.push('/login');
    }
  }, [searchParams, router]);

  async function onSubmit(values: FormValues) {
    setIsLoading(true);
    console.log("Starting password reset process...");
    toast.loading("Changing password...", { id: toastId });

    try {
      const supabase = createClient();
      
      if (!token) {
        console.error("No reset token found in state");
        throw new Error("Invalid password reset link. Please request a new one.");
      }

      console.log("Attempting to verify reset token");
      
      // First verify the token
      const { error: verifyError } = await supabase.auth.verifyOtp({
        token_hash: token,
        type: 'email',
      });

      if (verifyError) {
        console.error("Failed to verify reset token:", verifyError);
        throw verifyError;
      }

      console.log("Reset token verified, updating password");

      // Update the password
      const { error: updateError } = await supabase.auth.updateUser({
        password: values.password
      });

      if (updateError) {
        console.error("Failed to update password:", updateError);
        throw updateError;
      }

      console.log("Password updated successfully");
      toast.success("Password changed successfully! Please log in with your new password.", { id: toastId });
      router.push("/login");
    } catch (error) {
      console.error("Password reset error:", error);
      const errorMessage = error instanceof AuthError 
        ? error.message 
        : "Failed to change password. Please try again or request a new reset link.";
      console.error("Displaying error to user:", errorMessage);
      toast.error(errorMessage, { id: toastId });
    } finally {
      console.log("Password reset process completed");
      setIsLoading(false);
    }
  }

  return (
    <div className={cn("grid gap-6", className)}>
      <div className="flex flex-col space-y-2 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">
          Change Password
        </h1>
        <p className="text-sm text-muted-foreground">
          Enter your new password below to change your password.
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>New Password</FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    placeholder="Enter new password"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Confirm New Password</FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    placeholder="Confirm new password"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="pt-4">
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isLoading ? "Changing Password..." : "Change Password"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
