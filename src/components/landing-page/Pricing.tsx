"use client";
import { Tables } from "@database.types";
import { X, Coins, Film, FileCheck, Mail, Zap, Users } from "lucide-react";
import React, { useState } from "react";
import { Label } from "../ui/label";
import { Switch } from "../ui/switch";
import { cn } from "@/lib/utils";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import Link from "next/link";
import AnimatedGradientText from "../ui/animated-gradient-text";

type Product = Tables<"products">;
type Price = Tables<"prices">;
interface ProductWithPrices extends Product {
  prices: Price[];
}

interface Props {
  products: ProductWithPrices[];
  className?: string;
  mostPopularProduct?: string;
}

type BillingInterval = "year" | "month";

// Definicja funkcji dla każdego planu z ikonami
const planFeatures = {
  "Hobby": [
    { name: "1000 tokens per month", included: true, icon: Coins },
    { name: "Access to AI Library (200 videos)", included: true, icon: Film },
    { name: "Personal use license", included: true, icon: FileCheck },
    { name: "Standard email support", included: true, icon: Mail },
    { name: "Commercial license", included: false, icon: FileCheck },
    { name: "Express email support", included: false, icon: Zap },
  ],
  "Pro": [
    { name: "2500 tokens per month", included: true, icon: Coins },
    { name: "Access to AI Library (200 videos)", included: true, icon: Film },
    { name: "Commercial license", included: true, icon: FileCheck },
    { name: "Standard email support", included: true, icon: Mail },
    { name: "Express email support", included: false, icon: Zap },
    { name: "Priority feature requests", included: false, icon: Users },
  ],
  "Business": [
    { name: "5000 tokens per month", included: true, icon: Coins },
    { name: "Access to AI Library (200 videos)", included: true, icon: Film },
    { name: "Commercial license", included: true, icon: FileCheck },
    { name: "Express email support", included: true, icon: Zap },
    { name: "Priority feature requests", included: true, icon: Users },
    { name: "Dedicated account manager", included: true, icon: Users },
  ]
};

const Pricing = ({
  products,
  className = "",
  mostPopularProduct = "",
}: Props) => {
  const [billingInterval, setBillingInterval] =
    useState<BillingInterval>("month");

  return (
    <section
      id="pricing"
      className="w-full bg-muted flex flex-col items-center justify-center"
    >
      <div
        className={cn(
          "w-full  container px-6 xs:px-8 sm:px-0 sm:mx-8 lg:mx-auto py-32 flex flex-col items-center justify-center space-y-8",
          className
        )}
      >
        <div className="text-center flex flex-col items-center justify-center">
          <AnimatedGradientText className="bg-background backdrop-blur-0">
            <span
              className={cn(
                `inline animate-gradient bg-gradient-to-r from-[#ffaa40] via-[#9c40ff] to-[#ffaa40] bg-[length:var(--bg-size)_100%] bg-clip-text text-transparent`
              )}
            >
              Pricing
            </span>
          </AnimatedGradientText>
          <h1 className="subHeading mt-4 capitalize">
            Choose the Plan That Fits Your Needs
          </h1>
          <p className="subText mt-4 text-center">
            Choose an affordable plan that&apos;s packed with the best features
            for engaging your audience, creating customer loyalty, and driving
            sales.
          </p>
        </div>

        <div className="flex flex-col items-center space-y-2 py-4 sm:py-8">
          <div className="flex items-center space-x-4">
            <Label htmlFor="yearly-pricing" className={`font-semibold text-base ${billingInterval === "month" ? "text-foreground" : "text-muted-foreground"}`}>
              Monthly
            </Label>
            <div className="relative">
              <Switch
                id="yearly-pricing"
                checked={billingInterval === "year"}
                onCheckedChange={(checked) =>
                  setBillingInterval(checked ? "year" : "month")
                }
              />
              <Badge 
                variant="outline" 
                className={`absolute -top-6 -right-16 text-xs whitespace-nowrap transition-all duration-200 ${
                  billingInterval === "year" 
                    ? "bg-green-100 text-green-800 border-green-200" 
                    : "bg-muted text-muted-foreground border-muted-foreground/30"
                }`}
              >
                2 months free
              </Badge>
            </div>
            <Label htmlFor="yearly-pricing" className={`font-semibold text-base ${billingInterval === "year" ? "text-foreground" : "text-muted-foreground"}`}>
              Yearly
            </Label>
          </div>
          <p className="text-xs text-muted-foreground">
            Save 16% with yearly billing
          </p>
        </div>

        <div className="sm:space-y-0 grid grid-cols-1 lg:grid-cols-3 gap-y-8 sm:gap-8 lg:max-w-none lg:mx-0 place-items-center">
          {products.map((product) => {
            // console.log(product);
            const price = product?.prices?.find(
              (price) => price.interval === billingInterval
            );
            if (!price) return null;
            const priceString = new Intl.NumberFormat("en-US", {
              style: "currency",
              currency: price.currency!,
              minimumFractionDigits: 0,
            }).format((price?.unit_amount || 0) / 100);

            // Pobierz funkcje dla danego planu lub użyj pustej tablicy, jeśli nie znaleziono
            const features = planFeatures[product.name as keyof typeof planFeatures] || [];

            return (
              <div
                key={product.id}
                className={cn(
                  "border bg-background rounded-xl shadow-sm divide-y divide-border h-fit",
                  product.name?.toLowerCase() ===
                    mostPopularProduct.toLowerCase()
                    ? "border-primary bg-background drop-shadow-md scale-105"
                    : "border-border"
                )}
              >
                <div className="p-6">
                  <h2 className="text-2xl leading-6 font-semibold text-foreground flex items-center justify-between">
                    {product.name}

                    {product.name?.toLowerCase() ===
                    mostPopularProduct.toLowerCase() ? (
                      <Badge
                        className="border-border font-semibold"
                        variant={"default"}
                      >
                        Most Popular
                      </Badge>
                    ) : (
                      ""
                    )}
                  </h2>
                  <p className="mt-4 text-sm text-muted-foreground">
                    {product.description}
                  </p>
                  <p className="mt-8">
                    <span className="text-4xl font-extrabold text-foreground">
                      {priceString}
                    </span>
                    <span className="text-base font-medium text-muted-foreground">
                      /{billingInterval === "year" ? "year" : "month"}
                    </span>
                    {billingInterval === "year" && (
                      <span className="ml-2 text-sm text-green-600 font-medium">
                        Save 16%
                      </span>
                    )}
                  </p>

                  <Link href="/login?state=signup">
                    <Button
                      className="mt-8 w-full font-semibold"
                      variant={
                        product.name?.toLowerCase() ===
                        mostPopularProduct.toLowerCase()
                          ? "default"
                          : "secondary"
                      }
                    >
                      Subscribe
                    </Button>
                  </Link>
                </div>
                <div className="pt-6 pb-8 px-6">
                  <h3 className="text-xs font-medium text-foreground tracking-wide uppercase">
                    What&apos;s included
                  </h3>
                  <ul role="list" className="mt-6 space-y-4">
                    {features.map((feature, index) => (
                      <li key={index} className="flex space-x-3">
                        {feature.included ? (
                          <feature.icon
                            className="flex-shrink-0 h-5 w-5 text-primary"
                            aria-hidden="true"
                          />
                        ) : (
                          <X
                            className="flex-shrink-0 h-5 w-5 text-muted-foreground"
                            aria-hidden="true"
                          />
                        )}
                        <span className={cn(
                          "text-sm",
                          feature.included ? "text-muted-foreground" : "text-muted-foreground/60"
                        )}>
                          {feature.name}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Pricing;
