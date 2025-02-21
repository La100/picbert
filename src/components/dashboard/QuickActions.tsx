"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CreditCardIcon, Wand2Icon, VideoIcon } from "lucide-react";
import Link from "next/link";

export function QuickActions() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Quick Actions</CardTitle>
        <CardDescription className="text-base">Get started with common actions</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        <Link href="/image-generation" className="w-full">
          <Button className="w-full text-base">
            <Wand2Icon className="mr-2 h-4 w-4" />
            Generate Image
          </Button>
        </Link>

        <Link href="/video-generation" className="w-full">
          <Button className="w-full text-base">
            <VideoIcon className="mr-2 h-4 w-4" />
            Generate Video
          </Button>
        </Link>

        <Link href="/billing" className="w-full">
          <Button variant="secondary" className="w-full text-base">
            <CreditCardIcon className="mr-2 h-4 w-4" />
            Billing
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}
