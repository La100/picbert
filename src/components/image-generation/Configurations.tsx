"use client";
import React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Smartphone } from "lucide-react";
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
      const finalPrompt = values.selfie 
        ? values.prompt + ", selfie, full body visible, 4k high resolution"
        : values.prompt;
        
      const output = await fal.subscribe("fal-ai/flux-pro/v1.1-ultra", {
        input: {
          prompt: finalPrompt,
          aspect_ratio: values.aspect_ratio,
          raw: true,
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
        className="grid w-full items-start gap-6"
      >
        <fieldset className="grid gap-6 rounded-lg border p-4 bg-white">
          <legend className="-ml-1 px-1 text-base font-medium">Image Generation</legend>

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

          <Button type="submit" disabled={loading} className="font-medium">
            {loading ? "Generating..." : "Generate"}
          </Button>
        </fieldset>
      </form>
    </Form>
  );
};

export default Configurations;
