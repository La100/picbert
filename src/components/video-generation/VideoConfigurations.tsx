"use client";
import React, { useCallback } from "react";
import { Upload, Sparkles } from "lucide-react";
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

import { revalidateTag } from "next/cache";
import { queueVideoGeneration, getVideoRequestStatus } from "@/app/actions/video-actions";
import { GalleryImagePicker } from "@/components/gallery/GalleryImagePicker";
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
  const loading = useVideoGenerateStore((state) => state.loading);
  const setLoading = useVideoGenerateStore((state) => state.setLoading);
  const [isUploading, setIsUploading] = React.useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      prompt: "",
      input_image: "",
      aspect_ratio: "9:16",
      duration: "5",
    },
  });

  const handleFileUpload = useCallback(async (file: File) => {
    try {
      setIsUploading(true);
      const url = await fal.storage.upload(file);
      form.setValue("input_image", url);
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Failed to upload image. Please try again.");
    } finally {
      setIsUploading(false);
    }
  }, [form]);

  async function onSubmit(values: FormValues) {
    try {
      setLoading(true);
      toast.info("Starting video generation. This process takes around 5 minutes...", {
        duration: 10000,
      });

      // Queue the video generation
      const result = await queueVideoGeneration({
        prompt: values.prompt,
        input_image: values.input_image,
        aspect_ratio: values.aspect_ratio,
        duration: values.duration,
      });

      if (!result.success || result.error) {
        throw new Error(result.error || "Failed to queue video generation");
      }

      if (!result.data?.request_id) {
        throw new Error("No request ID returned");
      }

      // Start polling for status
      const requestId = result.data.request_id as string;
      const pollInterval = setInterval(async () => {
        const status = await getVideoRequestStatus(requestId);
        
        if (status.error) {
          clearInterval(pollInterval);
          setLoading(false);
          toast.error(status.error);
          return;
        }

        // Handle different statuses
        switch (status.data?.status) {
          case "processing":
            toast.info("Processing your video...", { id: "video-status" });
            break;
          case "completed":
            clearInterval(pollInterval);
            setLoading(false);
            toast.success("Video generated successfully!");
            // Trigger a refresh of the video list
            revalidateTag("gallery-videos");
            revalidateTag("dashboard-videos");
            break;
          case "failed":
            clearInterval(pollInterval);
            setLoading(false);
            toast.error(String(status.error || "Failed to generate video"));
            break;
          case "pending":
            toast.info("Your video is queued...", { id: "video-status" });
            break;
          default:
            toast.info("Checking video status...", { id: "video-status" });
        }
      }, 5000); // Poll every 5 seconds

      // Clean up interval after 10 minutes (failsafe)
      setTimeout(() => {
        clearInterval(pollInterval);
        if (loading) {
          setLoading(false);
          toast.error("Video generation timed out. Please try again.");
        }
      }, 10 * 60 * 1000);

    } catch (error) {
      console.error("Failed to generate video:", error);
      toast.error("Failed to generate video. Please try again.");
      setLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="grid w-full items-start gap-6 xl:pt-20"
      >
        <fieldset className="grid gap-6 rounded-lg border p-4 bg-white">
          <legend className="-ml-1 px-1 text-base font-medium">Video Generation</legend>

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
                    className="flex items-center gap-2 bg-white font-medium"
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
                  <div className="mt-2 relative h-[200px] w-full">
                    <Image
                      src={field.value} 
                      alt="Selected input" 
                      fill
                      className="rounded-md object-contain"
                      sizes="(max-width: 768px) 100vw, 50vw"
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
                      <SelectTrigger className="bg-white font-medium">
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
                      <SelectTrigger className="bg-white font-medium">
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
                  <Textarea 
                    {...field} 
                    rows={6} 
                    placeholder="Describe your imagination..."
                    className="bg-white font-medium"
                  />
                </FormControl>
                <FormMessage className="font-medium" />
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
            <div className="flex items-center justify-center text-base text-muted-foreground font-medium">
              <span>Video generation takes around 5 minutes</span>
            </div>
          </div>
        </fieldset>
      </form>
    </Form>
  );
}

export default VideoConfigurations; 