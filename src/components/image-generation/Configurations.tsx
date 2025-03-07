"use client";
import React, { useEffect, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Smartphone, Sparkles } from "lucide-react";
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


const Configurations = () => {
  const generateImage = useGenerateStore((state) => state.generateImage);
  const loading = useGenerateStore((state) => state.loading);
  const setLoading = useGenerateStore((state) => state.setLoading);
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

  async function onSubmit(values: FormValues) {
    try {
      setLoading(true);
      
      // Check if user has enough tokens for image generation
      if (tokenCount !== null && tokenCount < IMAGE_TOKEN_COST) {
        toast.error(`Not enough tokens. Image generation requires ${IMAGE_TOKEN_COST} tokens.`);
        setLoading(false);
        return;
      }

      // Deduct tokens first
      const deductResult = await fetch('/api/credits/deduct', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ amount: IMAGE_TOKEN_COST }),
      });

      if (!deductResult.ok) {
        const error = await deductResult.text();
        toast.error(error || 'Failed to deduct tokens');
        setLoading(false);
        return;
      }

      // Update local token count
      setTokenCount(prev => prev !== null ? prev - IMAGE_TOKEN_COST : null);

      const finalPrompt = values.selfie 
        ? values.prompt + ", selfie, full body visible, 4k high resolution"
        : values.prompt;
        
      const output = await fal.subscribe("fal-ai/flux-pro/v1.1-ultra", {
        input: {
          prompt: finalPrompt,
          aspect_ratio: values.aspect_ratio,
          raw: true,
          enable_safety_checker:false,
        },
        logs: true,
      });

      if (!output.data?.images?.[0]?.url) {
        throw new Error("No image URL in response");
      }

      // Check for NSFW content
      if (output.data.has_nsfw_concepts?.[0] === true) {
        toast.error("The generated image was flagged as NSFW content. Please try a different prompt.");
        setLoading(false);
        return;
      }

      const image = output.data.images[0];
      const imageData = [{
        url: image.url,
        width: image.width ?? 0,
        height: image.height ?? 0,
        safety_checker: true,
        prompt: values.prompt,
        aspect_ratio: values.aspect_ratio,
      }];

      await generateImage({
        ...values,
        data: { images: imageData },
      });
    } catch (error) {
      console.error("Failed to generate image:", error);
      toast.error("Failed to generate image. Please try again.");
      setLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="grid w-full max-w-2xl mx-auto items-start gap-6 xl:pt-20"
      >
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
        
        <fieldset className="grid gap-6 rounded-lg border p-4 bg-white">
          <legend className="-ml-1 px-1 text-base font-medium">Image Generation</legend>

          <div className="flex justify-between items-center">
            <div className="text-sm font-medium">Available Tokens: <span className="font-bold">{tokenCount || 0}</span></div>
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
                    <SelectTrigger className="bg-white font-medium">
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
                  <Textarea {...field} rows={6} className="bg-white font-medium" />
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
  );
};

export default Configurations;
