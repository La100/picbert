"use client";


import {
  Card,
  CardContent,

} from "@/components/ui/card";
import { UsersIcon, Wand2Icon, VideoIcon } from "lucide-react";
import Link from "next/link";

export function QuickActions() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Link href="/image-generation" className="w-full">
        <Card className="h-full hover:bg-accent transition-colors bg-gradient-to-br from-background to-muted/50 border border-primary/10 shadow-lg">
          <CardContent className="flex flex-col items-center justify-center p-6 text-center h-full">
            <Wand2Icon className="h-8 w-8 mb-4" />
            <h3 className="font-semibold text-lg mb-2">Generate Image</h3>
            <p className="text-sm text-muted-foreground">Create unique AI-generated images</p>
          </CardContent>
        </Card>
      </Link>

      <Link href="/video-generation" className="w-full">
        <Card className="h-full hover:bg-accent transition-colors bg-gradient-to-tr from-background to-muted/50 border border-primary/10 shadow-lg">
          <CardContent className="flex flex-col items-center justify-center p-6 text-center h-full">
            <VideoIcon className="h-8 w-8 mb-4" />
            <h3 className="font-semibold text-lg mb-2">Generate Video</h3>
            <p className="text-sm text-muted-foreground">Create AI-powered videos</p>
          </CardContent>
        </Card>
      </Link>

      <Link href="/video-library" className="w-full">
        <Card className="h-full hover:bg-accent transition-colors bg-gradient-to-bl from-background to-muted/50 border border-primary/10 shadow-lg">
          <CardContent className="flex flex-col items-center justify-center p-6 text-center h-full">
            <UsersIcon className="h-8 w-8 mb-4" />
            <h3 className="font-semibold text-lg mb-2">AI People Library</h3>
            <p className="text-sm text-muted-foreground">Browse and manage AI characters</p>
          </CardContent>
        </Card>
      </Link>
    </div>
  );
}
