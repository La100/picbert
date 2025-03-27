import { createClient } from "@/lib/supabase/server";
import { getUser } from "@/lib/supabase/queries";
import { AccountForm } from "@/components/account/AccountForm";
import { DataDeletionSettings } from "@/components/account/DataDeletionSettings";
import { Metadata } from 'next'
import { redirect } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { History } from "lucide-react";


export const metadata: Metadata = {
  title: "Account Settings | Faces Factory",
  description: "Account settings for Faces Factory",
}

export default async function AccountSettingsPage() {
  const supabase = await createClient();
  const user = await getUser(supabase);

  if (!user) {
    return redirect("/login");
  }

  return (
    <div className="container mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Account Settings</h1>
        <p className="text-muted-foreground">
          Manage your account settings and preferences
        </p>
      </div>

      <div className="grid gap-8">
        <AccountForm user={user} />
        
        <Card>
          <CardHeader>
            <CardTitle>Requests History</CardTitle>
            <CardDescription>
              View history of your image and video generation requests
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-sm text-muted-foreground">
              Access your complete history of image and video generation requests, including status, prompts, and results.
            </p>
            <Button asChild>
              <Link href="/requests-history" className="flex items-center gap-2">
                <History className="h-4 w-4" />
                <span>View Requests History</span>
              </Link>
            </Button>
          </CardContent>
        </Card>
        
        <DataDeletionSettings user={user} />
      </div>
    </div>
  );
}
