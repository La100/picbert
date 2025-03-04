import { createClient } from "@/lib/supabase/server";
import { getUser } from "@/lib/supabase/queries";
import { AccountForm } from "@/components/account/AccountForm";
import { DataDeletionSettings } from "@/components/account/DataDeletionSettings";
import { Metadata } from 'next'
import { redirect } from "next/navigation";


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
        <DataDeletionSettings user={user} />
      </div>
    </div>
  );
}
