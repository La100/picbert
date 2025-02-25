"use client";
import { Tables } from "@database.types";
import { User } from "@supabase/supabase-js";
import { Loader2 } from "lucide-react";
import React, { useState } from "react";
import { Label } from "../ui/label";
import { Switch } from "../ui/switch";
import { cn } from "@/lib/utils";
import { Badge } from "../ui/badge";
import { usePathname, useRouter } from "next/navigation";
import { checkoutWithStripe, createStripePortal } from "@/lib/stripe/server";
import { getErrorRedirect } from "@/lib/helpers";
import { getStripe } from "@/lib/stripe/client";
import { Button } from "../ui/button";
import { toast } from "sonner";
import { revalidateTag } from "next/cache";

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

interface Props {
  user: User | null | undefined;
  products: ProductWithPrices[];
  subscription: SubscriptionWithProduct | null;
  children?: React.ReactNode;
  showInterval?: boolean;
  className?: string;
  activeProduct?: string;
  mostPopularProduct?: string;
}

type BillingInterval = "year" | "month";

const renderPricingButton = ({
  subscription,
  user,
  product,
  price,
  priceIdLoading,
  mostPopularProduct,
  handleStripePortalRequest,
  handleStripeCheckout,
}: {
  subscription: SubscriptionWithProduct | null;
  user: User | null | undefined;
  product: ProductWithPrices;
  price: Price;
  priceIdLoading: string | undefined;
  mostPopularProduct: string;
  handleStripePortalRequest: () => Promise<void>;
  handleStripeCheckout: (price: Price) => Promise<void>;
}) => {
  const isPopular = product.name?.toLowerCase() === mostPopularProduct.toLowerCase();
  const isCurrentPlan = user && subscription && subscription.prices?.products?.name?.toLowerCase() === product.name?.toLowerCase();
  
  // Case 1: User has active subscription for this product
  if (isCurrentPlan) {
    return (
      <Button
        className="mt-8 w-full font-semibold h-12"
        onClick={handleStripePortalRequest}
      >
        Manage Subscription
      </Button>
    );
  }
  // Case 2: User is logged in and has an active subscription for a different product
  if (user && subscription) {
    return (
      <Button 
        className="mt-8 w-full font-semibold h-12"
        onClick={handleStripePortalRequest}
        variant={isPopular ? "default" : "secondary"}
      >
        Switch to This Plan
      </Button>
    );
  }

  // Case 3: Logged in user with no subscription
  if (user && !subscription) {
    return (
      <Button
        className="mt-8 w-full font-semibold h-12"
        onClick={() => handleStripeCheckout(price)}
        variant={isPopular ? "default" : "secondary"}
        disabled={priceIdLoading === price.id}
      >
        {priceIdLoading === price.id && (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        )}
        Subscribe Now
      </Button>
    );
  }

  // Case 4: No user logged in
  return (
    <Button
      className="mt-8 w-full font-semibold h-12"
      variant={isPopular ? "default" : "secondary"}
      disabled={priceIdLoading === price.id}
      onClick={() => handleStripeCheckout(price)}
    >
      {priceIdLoading === price.id && (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      )}
      Subscribe
    </Button>
  );
};

const Pricing = ({
  user,
  products,
  subscription,
  showInterval = true,
  className = "",
  activeProduct = "",
  mostPopularProduct = "",
}: Props) => {

  const [billingInterval, setBillingInterval] =
    useState<BillingInterval>("month");
  const [priceIdLoading, setPriceIdLoading] = useState<string>();
  const currentPath = usePathname();
  const router = useRouter();


  const handleStripeCheckout = async (price: Price) => {
    setPriceIdLoading(price.id);

    if (!user) {
      setPriceIdLoading(undefined);
      return router.push("/login");
    }

    const { errorRedirect, sessionId } = await checkoutWithStripe(
      price,
      currentPath
    );

    if (errorRedirect) {
      setPriceIdLoading(undefined);
      return router.push(errorRedirect);
    }

    if (!sessionId) {
      setPriceIdLoading(undefined);
      return router.push(
        getErrorRedirect(
          currentPath,
          "An unknown error occurred.",
          "Please try again later or contact a system administrator."
        )
      );
    }

    const stripe = await getStripe();
    stripe?.redirectToCheckout({ sessionId });

    setPriceIdLoading(undefined);
    revalidateTag("credits");
  };

  const handleStripePortalRequest = async () => {
    toast.info("Redirecting to Stripe portal...");
    const redirectUrl = await createStripePortal(currentPath);
    return router.push(redirectUrl);
  };

  return (
    <div
      id="pricing-plans"
      className={cn(
        "max-w-7xl mx-auto py-8 sm:py-16 px-2 sm:px-4 md:px-6 lg:px-8 flex flex-col",
        className
      )}
    >
      {showInterval && (
        <div className="flex justify-center items-center space-x-4 mb-6 sm:mb-10">
          <Label
            htmlFor="yearly-pricing"
            className={`font-semibold text-sm sm:text-base ${billingInterval === "month" ? "text-foreground" : "text-muted-foreground"}`}
          >
            Monthly
          </Label>
          <Switch
            id="yearly-pricing"
            checked={billingInterval === "year"}
            onCheckedChange={(checked) =>
              setBillingInterval(checked ? "year" : "month")
            }
          />
          <Label
            htmlFor="yearly-pricing"
            className={`font-semibold text-sm sm:text-base ${billingInterval === "year" ? "text-foreground" : "text-muted-foreground"}`}
          >
            Yearly
          </Label>
        </div>
      )}

      <div className="space-y-6 sm:space-y-0 grid-cols-1 sm:grid sm:grid-cols-2 lg:grid-cols-2 sm:gap-4 md:gap-6 lg:gap-8 lg:max-w-4xl lg:mx-auto xl:max-w-none xl:mx-0 xl:grid-cols-3 place-items-center">
        {products.map((product) => {
          const price = product?.prices?.find(
            (price) => price.interval === billingInterval
          );
          if (!price) return null;
          const priceString = new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: price.currency!,
            minimumFractionDigits: 0,
          }).format((price?.unit_amount || 0) / 100);

          const isPopular = product.name?.toLowerCase() === mostPopularProduct.toLowerCase();
          const isActive = product.name?.toLowerCase() === activeProduct.toLowerCase();

          return (
            <div
              key={product.id}
              className={cn(
                "border bg-background rounded-xl shadow-sm divide-y divide-border h-fit w-full transition-all duration-200 hover:shadow-md mb-6 sm:mb-0",
                isActive
                  ? "border-primary bg-background ring-1 ring-primary/20"
                  : isPopular
                  ? "border-primary/30 sm:scale-105 shadow-md"
                  : "border-border hover:border-primary/20"
              )}
            >
              {isPopular && (
                <div className="bg-primary text-primary-foreground text-center py-1.5 text-xs sm:text-sm font-medium rounded-t-xl">
                  Most Popular
                </div>
              )}
              <div className="p-4 sm:p-6">
                <h2 className="text-xl sm:text-2xl leading-6 font-semibold text-foreground flex items-center justify-between flex-wrap gap-2">
                  {product.name}

                  {isActive && (
                    <Badge
                      className="bg-primary/10 text-primary border-primary/20 font-semibold"
                      variant={"outline"}
                    >
                      Current Plan
                    </Badge>
                  )}
                </h2>
                <p className="mt-3 sm:mt-4 text-sm text-muted-foreground">
                  {product.description}
                </p>
                <p className="mt-6 sm:mt-8 flex items-baseline">
                  <span className="text-3xl sm:text-4xl font-extrabold text-foreground">
                    {priceString}
                  </span>
                  <span className="text-sm sm:text-base font-medium text-muted-foreground ml-2">
                    /{billingInterval === "year" ? "year" : "month"}
                  </span>
                </p>

                {renderPricingButton({
                  subscription,
                  user,
                  product,
                  price,
                  priceIdLoading,
                  mostPopularProduct,
                  handleStripePortalRequest,
                  handleStripeCheckout,
                })}
              </div>
              <div className="pt-4 sm:pt-6 pb-6 sm:pb-8 px-4 sm:px-6">
                <h3 className="text-xs font-medium text-foreground tracking-wide uppercase mb-3 sm:mb-4">
                  What&apos;s included
                </h3>
                <ul role="list" className="mt-2 space-y-2 sm:space-y-3">
                  {Object.values(product.metadata || {}).map(
                    (feature, index) => {
                      if (feature) {
                        return (
                          <li key={index} className="flex items-start">
                            <div className="flex-shrink-0">
                              <svg className="h-5 w-5 text-primary" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                              </svg>
                            </div>
                            <p className="ml-3 text-xs sm:text-sm text-muted-foreground">
                              {feature ?? "Feature not available"}
                            </p>
                          </li>
                        );
                      }
                    }
                  )}
                </ul>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Pricing;
