import { createClient } from "@/lib/supabase/server";
import { getUser, getProducts, getSubscription } from "@/lib/supabase/queries";
import PlanSummary from "@/components/billing/PlanSummary";
import { getCredits } from "@/app/actions/credit-actions";
import Pricing from "@/components/billing/Pricing";
import { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Billing | Faces Factory",
  description: "Billing for Faces Factory",
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
    <div className="container mx-auto  md:py-8 space-y-8 md:space-y-12 relative px-3 sm:px-4 md:px-6">
      <div className="absolute inset-0 bg-grid-pattern opacity-5 pointer-events-none" />
      
      <div className="grid gap-6 md:gap-12 relative">
        {hasActiveSubscription ? (
          <PlanSummary
            credits={Array.isArray(credits) ? credits[0] : credits}
            subscription={subscription}
            user={user}
            products={products ?? []}
            targetId="other-plans"
          />
        ) : (
          <>
            <div className="rounded-xl w-full">
              <div className="text-center max-w-3xl mx-auto mb-4 md:mb-8 px-2 sm:px-4">
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
