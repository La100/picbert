"use client";
import React, { useEffect, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Download, Smartphone, Sparkles, Video } from "lucide-react";
import { Textarea } from "../ui/textarea";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "../ui/button";
import useGenerateStore from "@/store/useGenerateStore";
import { fal } from "@/lib/fal";
import { toast } from "sonner";
import { PromptStarterSelector } from "./PromptStarter";
import { Checkbox } from "../ui/checkbox";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import { checkSubscriptionStatus } from "@/app/actions/subscription-actions";
import { getCredits } from "@/app/actions/credit-actions";
import { IMAGE_TOKEN_COST } from "@/lib/constants";
import { createClient } from "@/lib/supabase/client";
import { storeImageRequest } from "@/app/actions/image-actions";
import { deductTokens } from "@/app/actions/token-actions";
import { Card, CardContent } from "../ui/card";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import { motion, AnimatePresence } from "framer-motion";

const formSchema = z.object({
  prompt: z.string().min(1, { message: "Prompt is required" }),
  aspect_ratio: z.enum(["1:1", "9:16", "16:9"], {
    required_error: "Aspect ratio is required",
  }),
  output_format: z.string().default("jpeg"),
  raw: z.boolean().default(true),
  selfie: z.boolean().default(false),
});

type FormValues = z.infer<typeof formSchema>;

interface GeneratedImage {
  url: string;
  width: number;
  height: number;
  output_format?: string;
  id?: string;
  requestId?: string;
  prompt?: string;
}

const ImageGenerator = () => {
  const generateImage = useGenerateStore((state) => state.generateImage);
  const loading = useGenerateStore((state) => state.loading);
  const setLoading = useGenerateStore((state) => state.setLoading);
  const images = useGenerateStore((state) => state.images);
  const [isSubscribed, setIsSubscribed] = useState<boolean | null>(null);
  const [tokenCount, setTokenCount] = useState<number | null>(null);
  
  useEffect(() => {
    const checkStatus = async () => {
      const { isSubscribed } = await checkSubscriptionStatus();
      setIsSubscribed(isSubscribed);
      
      const credits = await getCredits();
      if (credits.success && credits.data) {
        setTokenCount(credits.data.tokens || 0);
      }
    };
    
    checkStatus();
  }, []);
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      prompt: "",
      aspect_ratio: "9:16",
      output_format: "jpeg",
      raw: true,
      selfie: true,
    },
  });

  const handlePromptSelect = (prompt: string) => {
    form.setValue("prompt", prompt);
  };

  const handleDownload = (image: GeneratedImage) => {
    const fileExtension = image?.output_format?.toLowerCase() || 'png';
    fetch(image.url)
      .then((response) => response.blob())
      .then((blob) => {
        const url = window.URL.createObjectURL(new Blob([blob]));
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute(
          "download",
          `generated-image-${Date.now()}.${fileExtension}`
        );

        document.body.appendChild(link);
        link.click();
        link.parentNode?.removeChild(link);
        window.URL.revokeObjectURL(url);
      })
      .catch((error) => console.error("Error downloading the image:", error));
  };

  async function onSubmit(values: FormValues) {
    try {
      setLoading(true);
      
      // Get user ID
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error("User not authenticated");
        setLoading(false);
        return;
      }

      // Check tokens...
      if (tokenCount !== null && tokenCount < IMAGE_TOKEN_COST) {
        toast.error(`Not enough tokens. Image generation requires ${IMAGE_TOKEN_COST} tokens.`);
        setLoading(false);
        return;
      }

      // Create request ID
      const request_id = crypto.randomUUID();

      try {
        // Store request first
        const initialResult = await storeImageRequest({
          user_id: user.id,
          request_id,
          prompt: values.prompt,
          aspect_ratio: values.aspect_ratio
        });
        
        console.log("Initial store result:", initialResult);
        
        if (!initialResult.success) {
          toast.error(`Failed to create image request: ${initialResult.error}`);
          setLoading(false);
          return;
        }
      } catch (storeError) {
        console.error("Error storing initial request:", storeError);
        toast.error("Failed to initialize image generation");
        setLoading(false);
        return;
      }

      const finalPrompt = values.selfie 
        ? values.prompt + ", selfie, full body visible, 4k high resolution"
        : values.prompt;
        
      const output = await fal.subscribe("fal-ai/flux-pro/v1.1-ultra", {
        input: {
          prompt: finalPrompt,
          aspect_ratio: values.aspect_ratio,
          raw: true,
          enable_safety_checker: false,
          safety_tolerance:"6"
        },
        logs: true,
      });

      if (!output.data?.images?.[0]?.url) {
        // Update request status to error
        try {
          const updateResult = await supabase
            .from("image_requests")
            .update({ status: 'error', error: "No image URL in response" })
            .eq('request_id', request_id);
            
          console.log("Error update result:", updateResult);
        } catch (updateError) {
          console.error("Failed to update error status:", updateError);
        }
        
        throw new Error("No image URL in response");
      }

      // Check for NSFW content
      if (output.data.has_nsfw_concepts?.[0] === true) {
        // Update request status to error
        try {
          const nsfwUpdateResult = await supabase
            .from("image_requests")
            .update({ 
              status: 'error', 
              error: "The generated image was flagged as NSFW content." 
            })
            .eq('request_id', request_id);
            
          console.log("NSFW update result:", nsfwUpdateResult);
        } catch (nsfwError) {
          console.error("Failed to update NSFW error status:", nsfwError);
        }
        
        toast.error("The generated image was flagged as NSFW content. Please try a different prompt.");
        setLoading(false);
        return;
      }

      const image = output.data.images[0];
      
      // Update request with output image and status
      try {
        console.log("Updating image request with data:", {
          status: 'completed',
          request_id
        });
        
        // First update only status, which should always work
        const statusUpdateResult = await supabase
          .from("image_requests")
          .update({ 
            status: 'completed'
          })
          .eq('request_id', request_id);
          
        console.log("Status update result:", statusUpdateResult);
        
        // Try to update additional fields, continue if it fails
        try {
          const additionalDataResult = await supabase
            .from("image_requests")
            .update({ 
              output_image: image.url,
              width: image.width || 0,
              height: image.height || 0
            })
            .eq('request_id', request_id);
            
          console.log("Additional data update result:", additionalDataResult);
        } catch (additionalDataError) {
          console.warn("Could not update additional fields, continuing anyway:", additionalDataError);
        }
      } catch (finalUpdateError) {
        console.error("Failed to update image request with result:", finalUpdateError);
        // We'll continue anyway to show the image to the user
      }

      const imageData = [{
        url: image.url,
        width: image.width ?? 0,
        height: image.height ?? 0,
        safety_checker: true,
        prompt: values.prompt,
        aspect_ratio: values.aspect_ratio,
        request_id: request_id
      }];

      // Deduct tokens after successful generation
      const deductResult = await deductTokens(IMAGE_TOKEN_COST);
      console.log("Token deduction result:", deductResult);
      
      if (deductResult.success && deductResult.tokensRemaining !== null) {
        setTokenCount(deductResult.tokensRemaining);
        
        // Update request with token usage
        try {
          const tokenUpdateResult = await supabase
            .from("image_requests")
            .update({ 
              tokens_used: IMAGE_TOKEN_COST
            })
            .eq('request_id', request_id);
            
          console.log("Token usage update result:", tokenUpdateResult);
        } catch (tokenUpdateError) {
          console.warn("Could not update token usage, continuing anyway:", tokenUpdateError);
        }
      } else {
        console.error("Token deduction failed but generation succeeded:", deductResult.error);
      }

      await generateImage({
        ...values,
        data: { images: imageData },
        requestId: request_id
      });
    } catch (error) {
      console.error("Failed to generate image:", error);
      toast.error("Failed to generate image. Please try again.");
      setLoading(false);
    }
  }

  // Get only the most recent image
  const latestImage = images.length > 0 ? images[0] : null;

  return (
    <div className="grid w-full max-w-2xl mx-auto items-start gap-8">
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="w-full"
        >
          {isSubscribed === false && (
            <Alert className="bg-amber-50 border-amber-200 mb-6">
              <AlertTitle className="text-amber-800">Free Account Limitations</AlertTitle>
              <AlertDescription className="text-amber-700">
                Free users have limited tokens. You currently have {tokenCount || 0} tokens.
                <br />
                <a href="/billing" className="underline font-medium">Subscribe</a> to unlock more tokens and additional features.
              </AlertDescription>
            </Alert>
          )}
          
          <fieldset className="grid gap-6 rounded-lg border p-4 bg-gradient-to-tl from-background to-muted/50 border-primary/10 shadow-lg">
            <legend className="-ml-1 px-1 text-base font-medium">Image Generation</legend>

            <div className="flex justify-between items-center">
              <div className="text-sm font-medium">Available Tokens: <span className="font-bold">{tokenCount}</span></div>
              <div className="text-sm bg-blue-50 text-blue-700 px-3 py-1 rounded-full font-medium">
                Cost: {IMAGE_TOKEN_COST} tokens per image
              </div>
            </div>

            <div className="space-y-2">
              <FormLabel className="font-medium">Prompt Starters</FormLabel>
              <PromptStarterSelector onSelect={handlePromptSelect} />
            </div>

            <FormField
              control={form.control}
              name="aspect_ratio"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-medium">Aspect Ratio</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="font-medium">
                        <SelectValue placeholder="Select an aspect ratio" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="bg-white">
                      <SelectItem value="1:1" className="font-medium">Square</SelectItem>
                      <SelectItem value="9:16" className="font-medium">Mobile</SelectItem>
                      <SelectItem value="16:9" className="font-medium">Landscape</SelectItem>
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="prompt"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-medium">Prompt</FormLabel>
                  <FormControl>
                    <Textarea {...field} rows={6} className="font-medium"  />
                  </FormControl>
                  <FormMessage className="font-medium" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="selfie"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center space-x-2 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      className="bg-white"
                    />
                  </FormControl>
                  <FormLabel className="font-medium flex items-center gap-2">
                    Selfie mode<Smartphone className="w-4 h-4" />
                  </FormLabel>
                </FormItem>
              )}
            />

            <div className="space-y-2">
              <Button type="submit" disabled={loading} className="w-full font-medium gap-2">
                {loading ? "Generating..." : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Generate
                  </>
                )}
              </Button>
            </div>
          </fieldset>
        </form>
      </Form>

      <AnimatePresence mode="wait">
        {(loading || latestImage) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="w-full"
          >
            <div className="w-full">
              {loading && (
                <Card className="w-full border bg-gradient-to-tl from-background to-muted/50 border-primary/10 shadow-lg">
                  <CardContent className="p-4 flex items-center justify-center min-h-[400px]">
                    <div className="w-48 h-48">
                      <DotLottieReact
                        src="/animations/animation.json"
                        autoplay
                        loop
                      />
                    </div>
                  </CardContent>
                </Card>
              )}
              
              {latestImage && !loading && (
                <motion.div
                  key={latestImage.requestId || "latest"}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card className="w-full border bg-gradient-to-tl from-background to-muted/50 border-primary/10 shadow-lg">
                    <CardContent className="p-1">
                      <div className="relative flex flex-col items-center justify-center rounded-lg overflow-hidden min-h-[400px]">
                        <motion.img
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ duration: 0.3 }}
                          src={latestImage.url}
                          alt={`Generated image for: ${latestImage.prompt || 'No prompt'}`}
                          width={latestImage.width}
                          height={latestImage.height}
                          className="object-contain"
                        />
                        
                        <div className="absolute bottom-4 right-4 flex gap-2">
                          <Button
                            variant="default"
                            size="sm"
                            className="w-fit"
                            onClick={() => handleDownload(latestImage)}
                          >
                            <Download className="mr-2 h-4 w-4" />
                            Download
                          </Button>
                          {latestImage.id && (
                            <Button
                              variant="default"
                              size="sm"
                              className="w-fit"
                              onClick={() => {
                                window.location.href = `/video-generation?input_image=${encodeURIComponent(latestImage.url)}`;
                              }}
                            >
                              <Video className="mr-2 h-4 w-4" />
                              Video
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ImageGenerator; 