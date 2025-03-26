"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Loader2 } from "lucide-react"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { signup, loginWithGoogle } from "@/app/actions/auth-actions"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { Turnstile } from "@marsidev/react-turnstile"

const passwordValidationRegex = new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])(?=.{8,})');
// The above regex ensures that the password must contain at least 8 characters, 1 uppercase letter, 1 lowercase letter, 1 number, and 1 special character.

const formSchema = z.object({
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  password: z.string({
    required_error: 'Password is required',
  }).min(8, {
    message: "Password must be at least 8 characters long.",
  }).regex(passwordValidationRegex, {
    message: "Password must contain at least 8 characters, 1 uppercase letter, 1 lowercase letter, 1 number, and 1 special character.",
  }), 

  confirmPassword: z.string({
    required_error: 'Confirm password is required',
  }),
  turnstileToken: z.string({
    required_error: 'Please complete the CAPTCHA verification',
  }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
})

type FormValues = z.infer<typeof formSchema>

export function SignupForm() {
  const router = useRouter()
  const [isLoading, setIsLoading] = React.useState<boolean>(false)
  const [isGoogleLoading, setIsGoogleLoading] = React.useState<boolean>(false)
  const [turnstileToken, setTurnstileToken] = React.useState<string>("")

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
      turnstileToken: "",
    },
  })
  const toastId = React.useId();

  React.useEffect(() => {
    if (turnstileToken) {
      form.setValue("turnstileToken", turnstileToken);
    }
  }, [turnstileToken, form]);

  async function onSubmit(values: FormValues) {
    setIsLoading(true)
    toast.loading("Signing up...", { id: toastId })
    const formData = new FormData()
    formData.append("email", values.email)
    formData.append("password", values.password)
    formData.append("turnstileToken", values.turnstileToken)
    const {success, error} = await signup(formData);
    if (!success) {
      toast.error(String(error), { id: toastId })
      setIsLoading(false)
    } else {
      toast.success("Signed up successfully! Please confirm your email address.", { id: toastId })
      router.push("/login")
      setIsLoading(false)
    }
  }

  async function handleGoogleLogin() {
    setIsGoogleLoading(true)
    try {
      await loginWithGoogle()
    } catch (err) {
      toast.error("Failed to login with Google")
      console.error("Google login error:", err)
    } finally {
      setIsGoogleLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <Button 
        variant="default" 
        type="button" 
        disabled={isGoogleLoading} 
        onClick={handleGoogleLogin}
        className="w-full py-6 text-base font-medium bg-blue-600 hover:bg-blue-700 relative mt-8 lg:mt-0"
      >
        <div className="absolute left-4 top-1/2 transform -translate-y-1/2 flex items-center justify-center bg-white rounded-sm w-8 h-8">
          <svg width="18" height="18" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
        </div>
        {isGoogleLoading ? (
          <Loader2 className="mr-3 h-5 w-5 animate-spin" />
        ) : (
          <span className="ml-4">Sign Up with Google</span>
        )}
      </Button>
      
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">
            Or continue with
          </span>
        </div>
      </div>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input placeholder="name@example.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input type="password" placeholder="add password" {...field} />
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
                <FormLabel>Confirm Password</FormLabel>
                <FormControl>
                  <Input type="password" placeholder="confirm your password" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="turnstileToken"
            render={() => (
              <FormItem>
                <FormLabel>Verification</FormLabel>
                <FormControl>
                  <div className="flex justify-center">
                    <Turnstile 
                      siteKey={process.env.NEXT_PUBLIC_CLOUDFLARE_TURNSTILE_SITE_KEY || '1x00000000000000000000AA'}
                      onSuccess={(token) => setTurnstileToken(token)}
                      options={{
                        theme: 'light',
                        size: 'flexible',
                      }}
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" className="w-full" disabled={isLoading || !turnstileToken}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Sign Up with Email
          </Button>
        </form>
      </Form>
    </div>
  )
}