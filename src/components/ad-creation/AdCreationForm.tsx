"use client";

import React from "react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Info } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import VideoSelector from "./VideoSelector";
import { getVideos } from "@/app/actions/video-actions";
import { Tables } from "@database.types";

const formSchema = z.object({
  videoId: z.string({
    required_error: "Please select a video",
  }),
  text: z.string().max(150, "Text must be less than 150 characters"),
});

type FormValues = z.infer<typeof formSchema>;

type VideoProps = {
  url: string | undefined;
} & Tables<"generated_videos">;

interface AdCreationFormProps {
  onPreview: (values: { videoId: string; text: string }) => void;
}

export default function AdCreationForm({ onPreview }: AdCreationFormProps) {
  const [videos, setVideos] = React.useState<VideoProps[]>([]);

  React.useEffect(() => {
    const loadVideos = async () => {
      const response = await getVideos();
      if (response.success && response.data) {
        setVideos(response.data);
      }
    };
    loadVideos();
  }, []);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      videoId: "",
      text: "",
    },
  });

  // Update preview in real-time as form values change
  React.useEffect(() => {
    const subscription = form.watch((value) => {
      const selectedVideo = videos.find(v => v.id.toString() === value.videoId);
      onPreview({
        videoId: selectedVideo?.url || "",
        text: value.text || ""
      });
    });
    return () => subscription.unsubscribe();
  }, [form, onPreview, videos]);

  async function onSubmit(values: FormValues) {
    console.log(values);
    // TODO: Implement save/publish logic
  }

  return (
    <TooltipProvider>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-6">
          <div className="grid gap-6">
            <div className="flex flex-col gap-2">
              <h3 className="text-lg font-semibold">Create Your Story</h3>
              <p className="text-sm text-muted-foreground">Select a video and add your text</p>
            </div>

            <FormField
              control={form.control}
              name="videoId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    Choose Video{" "}
                    <Tooltip>
                      <TooltipTrigger>
                        <Info className="w-4 h-4" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Select a video for your story</p>
                      </TooltipContent>
                    </Tooltip>
                  </FormLabel>
                  <VideoSelector
                    videos={videos}
                    selectedVideo={field.value}
                    onSelect={field.onChange}
                  />
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="text"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    Text Overlay{" "}
                    <Tooltip>
                      <TooltipTrigger>
                        <Info className="w-4 h-4" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Add text that will appear over your video</p>
                      </TooltipContent>
                    </Tooltip>
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="Enter text to display over your video..."
                      className="resize-none"
                      rows={4}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <Button type="submit">Save Ad</Button>
        </form>
      </Form>
    </TooltipProvider>
  );
} 