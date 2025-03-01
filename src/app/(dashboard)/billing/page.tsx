import { createClient } from "@/lib/supabase/server";
import { getUser, getProducts, getSubscription } from "@/lib/supabase/queries";
import PlanSummary from "@/components/billing/PlanSummary";
import { getCredits } from "@/app/actions/credit-actions";
import Pricing from "@/components/billing/Pricing";
import { Metadata } from "next";
import { redirect } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle, Zap } from "lucide-react";

export const metadata: Metadata = {
  title: "Billing | Pictoria AI",
  description: "Billing for Pictoria AI",
};

export default async function BillingPage() {
  const supabase = await createClient();
  const [user, products, subscription] = await Promise.all([
    getUser(supabase),
    getProducts(supabase),
    getSubscription(supabase),
  ]);
  if (!user) {
    return redirect("/login");
  }

  const { data: credits } = await getCredits();
  const hasActiveSubscription = subscription && subscription.status === "active";

  return (
    <div className="container mx-auto py-6 md:py-8 space-y-8 md:space-y-12 relative px-4 sm:px-6">
      <div className="absolute inset-0 bg-grid-pattern opacity-5 pointer-events-none" />
      
      <div className="text-center max-w-3xl mx-auto relative">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-2 md:mb-3">Plans & Billing</h1>
        <p className="text-muted-foreground text-base md:text-lg">
          {hasActiveSubscription 
            ? "Manage your subscription and billing information" 
            : "Choose the perfect plan for your needs and get started"}
        </p>
      </div>

      <div className="grid gap-8 md:gap-12 relative">
        {hasActiveSubscription ? (
          <>
            <PlanSummary
              credits={Array.isArray(credits) ? credits[0] : credits}
              subscription={subscription}
              user={user}
              products={products ?? []}
              targetId="other-plans"
            />
            
            <div id="other-plans" className="bg-muted/50 py-8 md:py-10 px-4 rounded-xl border border-border/40 shadow-sm">
              <div className="text-center max-w-2xl mx-auto mb-6 md:mb-8">
                <h2 className="text-xl md:text-2xl font-bold mb-2 md:mb-3">Other Available Plans</h2>
                <p className="text-muted-foreground text-sm md:text-base">
                  Compare your current plan with other options
                </p>
              </div>
              
              <Pricing
                user={user}
                products={products ?? []}
                subscription={subscription}
                showInterval={true}
                className="!p-0 max-w-full"
                activeProduct={
                  subscription?.prices?.products?.name?.toLowerCase() || ""
                }
                mostPopularProduct="pro"
              />
            </div>
          </>
        ) : (
          <>
            <Card className="max-w-5xl mx-auto border-2 border-dashed">
              <CardContent className="px-4 sm:px-6 py-5 sm:py-6">
                <div className="flex flex-col md:flex-row gap-6 items-start">
                  <div className="flex-1">
                    <h2 className="text-xl font-semibold mb-2">Welcome to Pictoria AI</h2>
                    <div className="bg-muted/50 p-3 sm:p-4 rounded-lg flex items-start">
                      <AlertCircle className="h-5 w-5 text-amber-500 mr-2 flex-shrink-0 mt-0.5" />
                      <div className="space-y-2">
                        <p className="text-sm">
                          You currently don&apos;t have an active subscription. Choose a plan below to unlock all features and start creating amazing AI-generated images.
                        </p>
                        <ul className="text-sm list-disc pl-5 space-y-1">
                          <li>Generate high-quality AI images</li>
                          <li>Access to premium features and higher quality outputs</li>
                          <li>Create more images with higher credit limits</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-center w-full md:w-auto">
                    <a href="#pricing-plans" className="block w-full md:w-auto">
                      <div className="bg-primary/5 p-4 rounded-lg text-center hover:bg-primary/10 transition-colors cursor-pointer">
                        <Zap className="h-8 w-8 text-primary mx-auto mb-2" />
                        <p className="text-sm font-medium mb-1">Ready to get started?</p>
                        <p className="text-xs text-muted-foreground">Choose a plan below</p>
                      </div>
                    </a>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="bg-muted/50 py-8 md:py-10 px-4 rounded-xl border border-border/40 shadow-sm">
              <div className="text-center max-w-2xl mx-auto mb-6 md:mb-8">
                <h2 className="text-xl md:text-2xl font-bold mb-2 md:mb-3">Available Plans</h2>
                <p className="text-muted-foreground text-sm md:text-base">
                  Select the plan that best fits your creative needs and budget
                </p>
              </div>
              
              <Pricing
                user={user}
                products={products ?? []}
                subscription={subscription}
                showInterval={true}
                className="!p-0 max-w-full"
                activeProduct=""
                mostPopularProduct="pro"
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
