"use client";
import React, { useEffect } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Info } from "lucide-react";
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "../ui/button";
import useGenerateStore from "@/store/useGenerateStore";
import { fal } from "@/lib/fal";
import { toast } from "sonner";

const formSchema = z.object({
  prompt: z.string().min(1, { message: "Prompt is required" }),
  aspect_ratio: z.enum(["1:1", "9:16", "16:9"], {
    required_error: "Aspect ratio is required",
  }),
  output_format: z.string().default("jpeg"),
  raw: z.boolean().default(true),
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
 
      output_format: "jpeg",
      raw: true,
    },
  });

  async function onSubmit(values: FormValues) {
    try {
      setLoading(true);
      const output = await fal.subscribe("fal-ai/flux-pro/v1.1-ultra", {
        input: {
          prompt: values.prompt,
          num_images: 1,
          aspect_ratio: values.aspect_ratio,
          raw: values.raw,
        },
        logs: true,
      });

      if (!output.data?.images?.[0]?.url) {
        throw new Error("No image URL in response");
      }

      const image = output.data.images[0];
      const imageData = [{
        url: image.url,
        width: image.width,
        height: image.height,
        prompt: values.prompt,
        aspect_ratio: values.aspect_ratio,
        raw: values.raw,
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
    <TooltipProvider>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="grid w-full items-start gap-6"
        >
          <fieldset className="grid gap-6 rounded-lg border p-4 bg-background">
            <legend className="-ml-1 px-1 text-sm font-medium">Settings</legend>

            <FormField
              control={form.control}
              name="aspect_ratio"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    Aspect Ratio{" "}
                    <Tooltip>
                      <TooltipTrigger>
                        <Info className="w-4 h-4" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Aspect ratio for the generated image</p>
                      </TooltipContent>
                    </Tooltip>
                  </FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select an aspect ratio" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="1:1">1:1</SelectItem>
                      <SelectItem value="9:16">9:16</SelectItem>
                      <SelectItem value="16:9">16:9</SelectItem>
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
                  <FormLabel className="flex items-center gap-2">
                    Prompt{" "}
                    <Tooltip>
                      <TooltipTrigger>
                        <Info className="w-4 h-4" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Describe the image you want to generate</p>
                      </TooltipContent>
                    </Tooltip>
                  </FormLabel>
                  <FormControl>
                    <Textarea {...field} rows={6} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" disabled={loading} className="font-medium">
              {loading ? "Generowanie..." : "Generuj"}
            </Button>
          </fieldset>
        </form>
      </Form>
    </TooltipProvider>
  );
};

export default Configurations;
