import React from "react";
import { Progress } from "../ui/progress";
import { Badge } from "../ui/badge";
import { Card, CardContent } from "../ui/card";
import { Tables } from "@database.types";
import { User } from "@supabase/supabase-js";
import { format } from "date-fns";
import ManageBillingButton from "./ManageBillingButton";
import { CreditCard, Zap, Calendar, AlertCircle } from "lucide-react";

type Subscription = Tables<"subscriptions">;
type Product = Tables<"products">;
type Price = Tables<"prices">;
interface ProductWithPrices extends Product {
  prices: Price[];
}
interface PriceWithProduct extends Price {
  products: Product | null;
}
interface SubscriptionWithProduct extends Subscription {
  prices: PriceWithProduct | null;
}
interface PlanSummaryProps {
  credits: Tables<"credits"> | null;
  subscription: SubscriptionWithProduct | null;
  user: User | null;
  products: ProductWithPrices[] | null;
  targetId?: string;
}

const PlanSummary = ({
  credits,
  subscription,
}: PlanSummaryProps) => {
  const {
    products: subscriptionProduct,
    unit_amount,
    currency,
  } = subscription?.prices ?? {};

  const hasActiveSubscription = subscription && subscription.status === "active";

  // Only render for active subscriptions
  if (!hasActiveSubscription) {
    return null;
  }

  const imageGenerationCount = credits?.image_generation_count ?? 0;
  const maxImageGenerationCount = credits?.max_image_generation_count ?? 0;
  const percentUsed = maxImageGenerationCount > 0 ? (imageGenerationCount / maxImageGenerationCount) * 100 : 0;
  
  const priceString = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency!,
    minimumFractionDigits: 0,
  }).format((unit_amount || 0) / 100);
  
  return (
    <Card className="max-w-5xl mx-auto border-primary/20 shadow-sm">
      <CardContent className="px-4 sm:px-6 py-5 sm:py-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-4 sm:mb-6">
          <h3 className="text-lg sm:text-xl font-semibold flex flex-wrap items-center gap-x-2">
            <span>Current Plan</span>
            <Badge className="bg-primary/10 text-primary border-primary/20">
              {subscriptionProduct?.name} Plan
            </Badge>
          </h3>
          
          <ManageBillingButton className="bg-background w-full sm:w-auto" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          <div className="flex flex-col space-y-3 sm:space-y-4">
            <div>
              <span className="text-sm font-medium text-muted-foreground">
                Image Generation Credits
              </span>
              <div className="flex items-center justify-between mt-1">
                <span className="text-xl sm:text-2xl font-bold">{imageGenerationCount}</span>
                <span className="text-sm text-muted-foreground">of {maxImageGenerationCount} available</span>
              </div>
              <div className="mt-2">
                <Progress 
                  value={percentUsed} 
                  className={`h-2 ${percentUsed < 30 ? 'bg-green-100' : percentUsed < 70 ? 'bg-amber-100' : 'bg-red-100'}`} 
                />
              </div>
            </div>
            
            {percentUsed > 80 && (
              <div className="bg-amber-50 p-3 rounded-lg border border-amber-200 flex items-start">
                <AlertCircle className="h-5 w-5 text-amber-500 mr-2 flex-shrink-0 mt-0.5" />
                <p className="text-xs sm:text-sm text-amber-800">
                  You&apos;re running low on credits. Your plan will renew automatically on {format(new Date(subscription.current_period_end), "MMMM d, yyyy")}.
                </p>
              </div>
            )}
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 bg-muted/30 p-3 sm:p-4 rounded-lg">
            <div className="flex flex-col">
              <div className="flex items-center text-sm font-medium text-muted-foreground mb-1">
                <CreditCard className="h-4 w-4 mr-1" />
                <span>Price</span>
              </div>
              <span className="text-base sm:text-lg font-semibold">{priceString}/mo</span>
            </div>
            
            <div className="flex flex-col">
              <div className="flex items-center text-sm font-medium text-muted-foreground mb-1">
                <Zap className="h-4 w-4 mr-1" />
                <span>Credits</span>
              </div>
              <span className="text-base sm:text-lg font-semibold">{maxImageGenerationCount}</span>
            </div>
            
            <div className="flex flex-col">
              <div className="flex items-center text-sm font-medium text-muted-foreground mb-1">
                <Calendar className="h-4 w-4 mr-1" />
                <span>Renews</span>
              </div>
              <span className="text-base sm:text-lg font-semibold">
                {format(new Date(subscription.current_period_end), "MMM d")}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PlanSummary;
