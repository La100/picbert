"use client";
import React, { useCallback, useEffect, useState } from "react";
import { Upload, Sparkles } from "lucide-react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import useVideoGenerateStore from "@/store/useVideoGenerateStore";
import useTokenStore from "@/store/useTokenStore";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Textarea } from "../ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { queueVideoGeneration, getVideoRequestStatus } from "@/app/actions/video-actions";
import { GalleryImagePicker } from "@/components/gallery/GalleryImagePicker";
import Image from "next/image";
import { uploadInputImage } from "@/lib/supabase/queries";
import { getCredits } from "@/app/actions/credit-actions";
import { VIDEO_TOKEN_COST_5_SEC, VIDEO_TOKEN_COST_10_SEC } from "@/lib/constants";
import { createClient } from "@/lib/supabase/client";
import { checkSubscriptionStatus } from "@/app/actions/subscription-actions";

const formSchema = z.object({
  prompt: z.string().min(1, { message: "Prompt is required" }),
  input_image: z.string().min(1, { message: "Input image is required" }),
  aspect_ratio: z.enum(["16:9", "9:16", "1:1"], {
    required_error: "Aspect ratio is required",
  }),
  duration: z.enum(["5", "10"], {
    required_error: "Duration is required",
  }),
});

type FormValues = z.infer<typeof formSchema>;

const placeholderTexts = [
  "Girl showing thumbs up, smiling",
  "Woman being shocked"
];

const useTextCycling = (texts: string[], interval: number = 3000) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [text, setText] = useState(texts[0]);
  const [isDeleting, setIsDeleting] = useState(false);
  const [typingSpeed, setTypingSpeed] = useState(100);

  useEffect(() => {
    let timeout: NodeJS.Timeout;

    if (isDeleting) {
      if (text === '') {
        setIsDeleting(false);
        setCurrentIndex((prev) => (prev + 1) % texts.length);
        setTypingSpeed(100);
      } else {
        timeout = setTimeout(() => {
          setText(text.slice(0, -1));
        }, 50);
      }
    } else {
      const fullText = texts[currentIndex];
      if (text === fullText) {
        timeout = setTimeout(() => {
          setIsDeleting(true);
        }, interval);
      } else {
        timeout = setTimeout(() => {
          setText(fullText.slice(0, text.length + 1));
        }, typingSpeed);
      }
    }

    return () => clearTimeout(timeout);
  }, [text, currentIndex, isDeleting, texts, interval, typingSpeed]);

  return text;
};

const VideoConfigurations = () => {
  const loading = useVideoGenerateStore((state) => state.loading);
  const setLoading = useVideoGenerateStore((state) => state.setLoading);

  const { refreshTokens } = useTokenStore();
  const [isUploading, setIsUploading] = React.useState(false);
  const [tokenCount, setTokenCount] = useState<number | null>(null);
  const searchParams = useSearchParams();
  const router = useRouter();
  const inputImageFromUrl = searchParams.get('input_image');
  const [selectedDuration, setSelectedDuration] = useState<"5" | "10">("5");
  const [tokenCost, setTokenCost] = useState<number>(VIDEO_TOKEN_COST_5_SEC);
  const [isSubscribed, setIsSubscribed] = useState<boolean | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      prompt: "",
      input_image: inputImageFromUrl || "",
      aspect_ratio: "9:16",
      duration: "5",
    },
  });

  // Effect to handle URL parameters
  React.useEffect(() => {
    if (inputImageFromUrl) {
      form.setValue("input_image", inputImageFromUrl);
    }
  }, [inputImageFromUrl, form]);

  // Effect to update token cost when duration changes
  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name === "duration") {
        const duration = value.duration as "5" | "10";
        setSelectedDuration(duration);
        setTokenCost(duration === "5" ? VIDEO_TOKEN_COST_5_SEC : VIDEO_TOKEN_COST_10_SEC);
      }
    });
    
    // Set initial values
    const currentDuration = form.getValues("duration") as "5" | "10";
    setSelectedDuration(currentDuration);
    setTokenCost(currentDuration === "5" ? VIDEO_TOKEN_COST_5_SEC : VIDEO_TOKEN_COST_10_SEC);
    
    return () => subscription.unsubscribe();
  }, [form]);

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const { isSubscribed } = await checkSubscriptionStatus();
        setIsSubscribed(isSubscribed);
        
        const credits = await getCredits();
        if (credits.success && credits.data) {
          setTokenCount(credits.data.tokens || 0);
        }
      } catch (error) {
        console.error("Error checking status:", error);
      }
    };
    
    checkStatus();
  }, []);

  const handleFileUpload = useCallback(async (file: File) => {
    try {
      setIsUploading(true);
      
      // Get the current user ID
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error("User not authenticated");
      }
      
      // Upload to inputimage bucket instead of FAL
      const url = await uploadInputImage(user.id, file, file.name);
      form.setValue("input_image", url);
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Failed to upload image. Please try again.");
    } finally {
      setIsUploading(false);
    }
  }, [form]);

  const animatedPlaceholder = useTextCycling(placeholderTexts);

  async function onSubmit(values: FormValues) {
    try {
      setLoading(true);
      
      // Calculate token cost based on duration
      const cost = values.duration === "5" ? VIDEO_TOKEN_COST_5_SEC : VIDEO_TOKEN_COST_10_SEC;
      
      // Check if user has enough tokens for video generation
      if (tokenCount !== null && tokenCount < cost) {
        toast.error(`Not enough tokens. ${values.duration}-second video generation requires ${cost} tokens.`);
        setLoading(false);
        return;
      }

      // Deduct tokens first
      fetch('/api/credits/deduct', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ amount: cost }),
        cache: 'no-store',
      })
      .then(response => {
        if (!response.ok) {
          return response.text().then(errorText => {
            throw new Error(errorText || 'Failed to deduct tokens');
          });
        }
        return response.json();
      })
      .then(deductData => {
        // Update local token count
        setTokenCount(deductData.tokensRemaining);
        
        // Update global token state
        return import('@/store/useTokenStore').then(module => {
          const useTokenStore = module.default;
          useTokenStore.getState().setTokenCount(deductData.tokensRemaining);
        });
      })
      .catch(() => {
        toast.error('Failed to deduct tokens due to network error');
        setLoading(false);
        return;
      });

      const finalPrompt = values.prompt;

      // Show persistent loading toast
      const toastId = toast.loading("Starting video generation. This process takes around 5 minutes...");

      // Queue the video generation
      const result = await queueVideoGeneration({
        prompt: finalPrompt,
        input_image: values.input_image,
        aspect_ratio: values.aspect_ratio,
        duration: values.duration,
      });

      if (!result.success || result.error) {
        toast.error(result.error || "Failed to queue video generation", { id: toastId });
        throw new Error(result.error || "Failed to queue video generation");
      }

      if (!result.data?.request_id) {
        toast.error("No request ID returned", { id: toastId });
        throw new Error("No request ID returned");
      }

      // Start polling for status
      const requestId = result.data.request_id as string;
      const pollInterval = setInterval(async () => {
        const status = await getVideoRequestStatus(requestId);
        
        if (status.error) {
          clearInterval(pollInterval);
          setLoading(false);
          
          // Check if this is the NSFW filter case
          if (status.data?.error && typeof status.data.error === 'string' && status.data.error.includes("Content flagged by NSFW filter")) {
            toast.error("Content was flagged by NSFW filter. Only 10 tokens have been charged.", { 
              id: toastId,
              duration: 6000 
            });
            
            // Update token count after partial refund
            refreshTokens();
          } else {
            toast.error(status.error, { id: toastId });
          }
          return;
        }

        // Handle different statuses
        switch (status.data?.status) {
          case "processing":
            toast.loading("Processing your video...", { id: toastId });
            break;
          case "completed":
            clearInterval(pollInterval);
            setLoading(false);
            toast.success("Video generated successfully!", { id: toastId });
            
            // Refresh the route to update the UI
            router.refresh();
            break;
          case "failed":
            clearInterval(pollInterval);
            setLoading(false);
            toast.error(String(status.error || "Failed to generate video"), { id: toastId });
            break;
          case "pending":
            toast.loading("Your video is queued...", { id: toastId });
            break;
          default:
            toast.loading("Checking video status...", { id: toastId });
        }
      }, 5000); // Poll every 5 seconds

      // Clean up interval after 10 minutes (failsafe)
      setTimeout(() => {
        clearInterval(pollInterval);
        if (loading) {
          setLoading(false);
          toast.error("Video generation timed out. Please try again.", { id: toastId });
        }
      }, 10 * 60 * 1000);

    } catch (error) {
      console.error("Failed to generate video:", error);
      toast.error("Failed to generate video. Please try again.");
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      {isSubscribed === false && (
        <Alert className="bg-amber-50 border-amber-200">
          <AlertTitle className="text-amber-800">Free Account Limitations</AlertTitle>
          <AlertDescription className="text-amber-700">
            Free users have limited tokens. You currently have {tokenCount || 0} tokens.
            <br />
            <a href="/billing" className="underline font-medium">Subscribe</a> to unlock more tokens and additional features.
          </AlertDescription>
        </Alert>
      )}

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="grid w-full max-w-2xl mx-auto items-start gap-6 xl:pt-20"
        >
          <fieldset className="grid gap-6 rounded-lg border p-4 bg-gradient-to-tr from-background to-muted/50 border-primary/10 shadow-lg">
            <legend className="-ml-1 px-1 text-base font-medium">Video Generation</legend>

            <div className="flex justify-between items-center">
              <div className="text-sm font-medium ">Available Tokens: <span className="font-bold">{tokenCount }</span></div>
              <div className="text-sm bg-purple-50 text-purple-700 px-3 py-1 rounded-full font-medium">
                Cost: {tokenCost} tokens
              </div>
            </div>

            <FormField
              control={form.control}
              name="input_image"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-medium">Input Image</FormLabel>
                  <div className="flex gap-2">
                    <FormControl>
                      <Input {...field} type="hidden" />
                    </FormControl>
                    <Input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      id="image-upload"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleFileUpload(file);
                      }}
                      disabled={isUploading}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => document.getElementById("image-upload")?.click()}
                      disabled={isUploading}
                      className="flex items-center gap-2 font-medium"
                    >
                      {isUploading ? (
                        <>
                          <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-r-transparent" />
                          Uploading...
                        </>
                      ) : (
                        <>
                          <Upload className="w-4 h-4" />
                          Upload
                        </>
                      )}
                    </Button>
                    <GalleryImagePicker 
                      onImageSelect={(imageUrl) => {
                        form.setValue("input_image", imageUrl);
                      }}
                    />
                  </div>
                  {field.value && (
                    <div className="mt-2 relative w-[120px] sm:w-[140px] aspect-square">
                      <Image
                        src={field.value} 
                        alt="Selected input" 
                        fill
                        className="rounded-md object-cover"
                        sizes="140px"
                      />
                    </div>
                  )}
                  <FormMessage className="font-medium" />
                </FormItem>
              )}
            />

            <div className="flex gap-4">
              <FormField
                control={form.control}
                name="aspect_ratio"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel className="font-medium">Aspect Ratio</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="font-medium">
                          <SelectValue placeholder="Select aspect ratio" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-white">
                        <SelectItem value="16:9" className="font-medium">Landscape</SelectItem>
                        <SelectItem value="9:16" className="font-medium">Mobile</SelectItem>
                        <SelectItem value="1:1" className="font-medium">Square</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage className="font-medium" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="duration"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel className="font-medium">Duration</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="font-medium">
                          <SelectValue placeholder="Select duration" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-white">
                        <SelectItem value="5" className="font-medium">5 seconds</SelectItem>
                        <SelectItem value="10" className="font-medium">10 seconds</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage className="font-medium" />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="prompt"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-medium">Prompt</FormLabel>
                  <FormControl>
                    <Textarea {...field} rows={6} className="font-medium" placeholder={animatedPlaceholder} />
                  </FormControl>
                  <FormMessage className="font-medium" />
                </FormItem>
              )}
            />

            <div className="space-y-2">
              <Button 
                type="submit" 
                disabled={loading || isUploading} 
                className="w-full font-medium gap-2"
              >
                {loading ? "Processing..." : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Generate Video
                  </>
                )}
              </Button>
              {tokenCount !== null && tokenCount < tokenCost && (
                <p className="text-xs text-center text-muted-foreground">
                  Not enough tokens. You need {tokenCost} tokens to generate a {selectedDuration}-second video.
                </p>
              )}
            </div>
          </fieldset>
        </form>
      </Form>
    </div>
  );
}

export default VideoConfigurations; 