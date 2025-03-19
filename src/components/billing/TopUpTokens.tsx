'use client'

import React, { useState } from "react";
import { Card, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import { Loader2, Coins, Plus, Minus } from "lucide-react";
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
  const [quantity, setQuantity] = useState(1);
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
        currentPath,
        quantity
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

  const incrementQuantity = () => {
    setQuantity(prev => Math.min(prev + 1, 10)); // Limit to max 10 units
  };

  const decrementQuantity = () => {
    setQuantity(prev => Math.max(prev - 1, 1)); // Minimum 1 unit
  };

  if (!price || !product) {
    return null;
  }

  const unitPrice = (price.unit_amount || 0) / 100;
  const totalPrice = unitPrice * quantity;
  
  const formattedUnitPrice = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: price.currency || "USD",
    minimumFractionDigits: 0,
  }).format(unitPrice);
  
  const formattedTotalPrice = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: price.currency || "USD",
    minimumFractionDigits: 0,
  }).format(totalPrice);

  // Extract token amount from price metadata
  const baseTokenAmount = (price.metadata as { tokens?: number })?.tokens ?? 1000;
  const totalTokenAmount = baseTokenAmount * quantity;

  return (
    <Card className="bg-gradient-to-br from-background to-muted/50 border border-primary/10 shadow-lg">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <Coins className="h-6 w-6 text-primary" />
            <h3 className="text-xl font-semibold">{product.name}</h3>
          </div>
          <div className="text-2xl font-bold">{formattedUnitPrice}</div>
        </div>
        
        <p className="text-muted-foreground mb-4">{product.description}</p>
        
        <div className="mb-6 text-center">
          <span className="text-xl font-bold text-primary">{totalTokenAmount.toLocaleString()}tokens</span>
        </div>
        
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2">
            <Button 
              variant="outline" 
              size="icon" 
              onClick={decrementQuantity} 
              disabled={quantity <= 1}
            >
              <Minus className="h-4 w-4" />
            </Button>
            <span className="w-8 text-center">{quantity}</span>
            <Button 
              variant="outline" 
              size="icon" 
              onClick={incrementQuantity} 
              disabled={quantity >= 10}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="text-lg font-semibold">
            Total: {formattedTotalPrice}
          </div>
        </div>
        
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
            `Purchase ${quantity > 1 ? quantity + ' x ' : ''}Tokens`
          )}
        </Button>
      </CardContent>
    </Card>
  );
} 