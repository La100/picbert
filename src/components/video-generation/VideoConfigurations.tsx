"use client";
import React, { useCallback } from "react";
import { Info, Upload } from "lucide-react";
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
import useVideoGenerateStore from "@/store/useVideoGenerateStore";
import { fal } from "@/lib/fal";
import { toast } from "sonner";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { createClient } from "@/lib/supabase/client";
import { GalleryImagePicker } from "../gallery/GalleryImagePicker";
import Image from "next/image";
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

const VideoConfigurations = () => {
  const generateVideo = useVideoGenerateStore((state) => state.generateVideo);
  const loading = useVideoGenerateStore((state) => state.loading);
  const setLoading = useVideoGenerateStore((state) => state.setLoading);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      prompt: "",
      input_image: "",
      aspect_ratio: "16:9",
      duration: "5",
    },
  });

  const handleFileUpload = useCallback(async (file: File) => {
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Unauthorized");

      const fileName = `${Date.now()}_${file.name}`;
      const filePath = `${user.id}/${fileName}`;

      const { error: uploadError} = await supabase.storage
        .from("input_images")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) throw uploadError;

      const { data: urlData } = await supabase.storage
        .from("input_images")
        .createSignedUrl(filePath, 3600);

      if (!urlData?.signedUrl) throw new Error("Failed to get signed URL");

      form.setValue("input_image", urlData.signedUrl);
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Failed to upload image. Please try again.");
    }
  }, [form]);

  async function onSubmit(values: FormValues) {
    try {
      setLoading(true);
      const output = await fal.subscribe("fal-ai/kling-video/v1.6/pro/image-to-video", {
        input: {
          prompt: values.prompt,
          image_url: values.input_image,
          aspect_ratio: values.aspect_ratio,
          duration: values.duration,
        },
        logs: true,
      });

      if (!output.data?.video?.url) {
        throw new Error("No video URL in response");
      }

      const videoData = {
        url: output.data.video.url,
        prompt: values.prompt,
        input_image: values.input_image,
        aspect_ratio: values.aspect_ratio,
        duration: values.duration,
      };

      await generateVideo({
        data: { video: videoData },
      });
    } catch (error) {
      console.error("Failed to generate video:", error);
      toast.error("Failed to generate video. Please try again.");
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
              name="input_image"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    Input Image{" "}
                    <Tooltip>
                      <TooltipTrigger>
                        <Info className="w-4 h-4" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Upload an image, provide a URL, or select from gallery</p>
                      </TooltipContent>
                    </Tooltip>
                  </FormLabel>
                  <div className="flex gap-2">
                    <FormControl>
                      <Input {...field} placeholder="Image URL" />
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
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => document.getElementById("image-upload")?.click()}
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      Upload
                    </Button>
                    <GalleryImagePicker onImageSelect={(imageUrl) => form.setValue("input_image", imageUrl)} />
                  </div>
                  {field.value && (
                    <div className="mt-2">
                      <Image
                        src={field.value} 
                        alt="Selected input" 
                        className="max-h-[200px] rounded-md object-contain"
                      />
                    </div>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />

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
                        <p>Aspect ratio for the generated video</p>
                      </TooltipContent>
                    </Tooltip>
                  </FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select an aspect ratio" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="16:9">16:9</SelectItem>
                      <SelectItem value="9:16">9:16</SelectItem>
                      <SelectItem value="1:1">1:1</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="duration"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    Duration{" "}
                    <Tooltip>
                      <TooltipTrigger>
                        <Info className="w-4 h-4" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Duration of the generated video in seconds</p>
                      </TooltipContent>
                    </Tooltip>
                  </FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select duration" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="5">5 seconds</SelectItem>
                      <SelectItem value="10">10 seconds</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
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
                        <p>Describe how you want the image to be animated</p>
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
              {loading ? "Generating..." : "Generate"}
            </Button>
          </fieldset>
        </form>
      </Form>
    </TooltipProvider>
  );
}

export default VideoConfigurations; 