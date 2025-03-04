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
import { resetPassword } from "@/app/actions/auth-actions"
import { toast } from "sonner"

const formSchema = z.object({
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
})

type FormValues = z.infer<typeof formSchema>

export function ResetPasswordForm() {
  const [isLoading, setIsLoading] = React.useState<boolean>(false)
  const toastId = React.useId()

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
    },
  })

  async function onSubmit(values: FormValues) {
    toast.loading("Sending reset email...", { id: toastId })
    setIsLoading(true)
    try {
      const {success, error} = await resetPassword({ email: values.email })
      if (!success) {
        toast.error(String(error), { id: toastId })
      } else {
        toast.dismiss(toastId)
        toast.success("We have sent you a password reset email. Please check your inbox and spam folder.", {
          duration: 5000 // Show for 5 seconds
        })
      }
    } catch (error: unknown) {
      console.error(error)
      toast.error("Failed to send reset email", { id: toastId })
    } finally {
      setIsLoading(false)
    }
  }

  return (
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
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Reset Password
        </Button>
      </form>
    </Form>
  )
}