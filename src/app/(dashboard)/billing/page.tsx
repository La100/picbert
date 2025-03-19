import { createClient } from "@/lib/supabase/server";
import { getUser, getProducts, getSubscription } from "@/lib/supabase/queries";
import PlanSummary from "@/components/billing/PlanSummary";
import { getCredits } from "@/app/actions/credit-actions";
import Pricing from "@/components/billing/Pricing";
import TopUpTokens from "@/components/billing/TopUpTokens";
import { Metadata } from "next";
import { redirect } from "next/navigation";
import { Tables } from "@database.types";

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

  // Find token top-up product and price
  const tokenTopUpProduct = products?.find((p: Tables<"products">) => p.name === "Token Top-Up");
  const tokenTopUpPrice = tokenTopUpProduct?.prices?.find(
    (p: Tables<"prices">) => p.unit_amount === 3500
  ); // $35.00

  return (
    <div className="container mx-auto  md:py-8 space-y-8 md:space-y-12 relative px-3 sm:px-4 md:px-6">
      <div className="absolute inset-0 bg-grid-pattern opacity-5 pointer-events-none" />
      
      <div className="grid gap-6 md:gap-12 relative">
        {hasActiveSubscription ? (
          <>
            <PlanSummary
              credits={Array.isArray(credits) ? credits[0] : credits}
              subscription={subscription}
              user={user}
              products={products ?? []}
              targetId="other-plans"
            />
            
            {tokenTopUpProduct && tokenTopUpPrice && (
              <div className="mt-8">
                <h2 className="text-2xl text-center font-bold mb-6">Need More Tokens?</h2>
                <div className="max-w-md mx-auto">
                  <TopUpTokens 
                    user={user}
                    product={tokenTopUpProduct}
                    price={tokenTopUpPrice}
                  />
                </div>
              </div>
            )}
          </>
        ) : (
          <>
            <div className="rounded-xl w-full">
              <div className="text-center max-w-3xl mx-auto mb-4 md:mb-8 px-2 sm:px-4">
                <h1 className="text-4xl md:text-4xl font-bold mb-6 md:mb-6 -mt-10">Choose your plan</h1>
               
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
