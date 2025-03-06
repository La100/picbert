'use client'
import React from "react";
import { Card, CardContent } from "../ui/card";
import { Tables } from "@database.types";
import { User } from "@supabase/supabase-js";
import { format } from "date-fns";
import ManageBillingButton from "./ManageBillingButton";

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
    interval
  } = subscription?.prices ?? {};

  const hasActiveSubscription = subscription && subscription.status === "active";

  // Only render for active subscriptions
  if (!hasActiveSubscription) {
    return null;
  }

  // Handle the case where these properties might not exist yet
  const tokenCount = credits?.tokens ?? 0;
  
  const priceString = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency!,
    minimumFractionDigits: 0,
  }).format((unit_amount || 0) / 100);
  
  // Check if this is a yearly subscription
  const isYearlySubscription = interval === 'year';
  
  return (
    <Card className="max-w-5xl mx-auto bg-gradient-to-br from-background to-muted/50 border border-primary/10 shadow-lg">
      <CardContent className="p-8">
        {/* Plan Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-10">
          <div className="space-y-1 mb-4 sm:mb-0">
            <h3 className="text-2xl font-bold tracking-tight">
              {subscriptionProduct?.name} Plan
            </h3>
            <p className="text-muted-foreground">
              {subscription.cancel_at_period_end 
                ? `Your subscription ends on ${format(new Date(subscription.current_period_end), "MMMM d, yyyy")}`
                : `Your subscription renews on ${format(new Date(subscription.current_period_end), "MMMM d, yyyy")}`
              }
            </p>
            {isYearlySubscription && (
              <p className="text-sm text-primary mt-1">
                Yearly subscription
              </p>
            )}
          </div>
          <ManageBillingButton className="bg-primary/10 hover:bg-primary/20 text-primary border-0" />
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Credits Card */}
          <div className="bg-background rounded-xl p-6 border border-border/50 shadow-sm">
            <div className="space-y-1 mb-4">
              <h4 className="text-sm font-medium text-muted-foreground">Available Credits</h4>
              <p className="text-3xl font-bold">{tokenCount}</p>
            </div>
            <p className="text-xs text-muted-foreground">
              1 image = 6 credits • 1 video = 50 credits
            </p>
          </div>

          {/* Price Card */}
          <div className="bg-background rounded-xl p-6 border border-border/50 shadow-sm">
            <div className="space-y-1 mb-4">
              <h4 className="text-sm font-medium text-muted-foreground">
                {isYearlySubscription ? "Yearly Price" : "Monthly Price"}
              </h4>
              <div className="flex items-baseline gap-1">
                <p className="text-3xl font-bold">{priceString}</p>
                <span className="text-muted-foreground">
                  {isYearlySubscription ? "/year" : "/mo"}
                </span>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              {subscription.cancel_at_period_end
                ? `Subscription valid until ${format(new Date(subscription.current_period_end), "MMM d, yyyy")}`
                : `Subscription renews on ${format(new Date(subscription.current_period_end), "MMM d, yyyy")}`
              }
            </p>
          </div>

          {/* Features Card */}
          <div className="bg-background rounded-xl p-6 border border-border/50 shadow-sm">
            <div className="space-y-1 mb-4">
              <h4 className="text-sm font-medium text-muted-foreground">Plan Features</h4>
              <ul className="space-y-2 mt-2">
                <li className="text-sm flex items-center gap-2">
                  <svg className="h-4 w-4 text-primary" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  High-quality AI generation
                </li>
                <li className="text-sm flex items-center gap-2">
                  <svg className="h-4 w-4 text-primary" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Priority support
                </li>
                <li className="text-sm flex items-center gap-2">
                  <svg className="h-4 w-4 text-primary" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Commercial license
                </li>
              </ul>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PlanSummary;
