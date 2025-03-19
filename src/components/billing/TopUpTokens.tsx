'use client'

import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Loader2, Coins } from "lucide-react";
import { Tables } from "@database.types";
import { User } from "@supabase/supabase-js";
import { usePathname, useRouter } from "next/navigation";
import { getStripe } from "@/lib/stripe/client";
import { toast } from "sonner";
import { checkoutWithStripe } from "@/lib/stripe/server";
import { getErrorRedirect } from "@/lib/helpers";

interface TopUpTokensProps {
  user: User | null | undefined;
  product: Tables<"products"> | undefined;
  price: Tables<"prices"> | undefined;
}

export default function TopUpTokens({ user, product, price }: TopUpTokensProps) {
  const [isLoading, setIsLoading] = useState(false);
  const currentPath = usePathname();
  const router = useRouter();

  const handleTokenPurchase = async () => {
    if (!user || !price) {
      toast.error("You must be logged in to purchase tokens");
      return;
    }

    setIsLoading(true);

    try {
      const { errorRedirect, sessionId } = await checkoutWithStripe(
        price,
        currentPath
      );

      if (errorRedirect) {
        setIsLoading(false);
        return router.push(errorRedirect);
      }

      if (!sessionId) {
        setIsLoading(false);
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
    } catch (error) {
      console.error("Error purchasing tokens:", error);
      toast.error("Failed to process token purchase");
    } finally {
      setIsLoading(false);
    }
  };

  if (!price || !product) {
    return null;
  }

  const formattedPrice = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: price.currency || "USD",
    minimumFractionDigits: 0,
  }).format((price.unit_amount || 0) / 100);

  return (
    <Card className="bg-gradient-to-br from-background to-muted/50 border border-primary/10 shadow-lg">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <Coins className="h-6 w-6 text-primary" />
            <h3 className="text-xl font-semibold">{product.name}</h3>
          </div>
          <div className="text-2xl font-bold">{formattedPrice}</div>
        </div>
        
        <p className="text-muted-foreground mb-6">{product.description}</p>
        
        <Button
          onClick={handleTokenPurchase}
          disabled={isLoading}
          className="w-full"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            'Purchase Tokens'
          )}
        </Button>
      </CardContent>
    </Card>
  );
} 