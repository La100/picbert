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

import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

const formSchema = z.object({
  videoId: z.string({
    required_error: "Please select a video",
  }).url("Please select a valid video"),
  text: z.string().max(90, "Text must be less than 90 characters"),
  textPosition: z.enum(['top', 'middle', 'bottom'], {
    required_error: "Please select text position",
  }),
});

type FormValues = z.infer<typeof formSchema>;

type VideoProps = {
  url: string;
};

interface AdCreationFormProps {
  onPreview: (values: { videoId: string; text: string; textPosition: 'top' | 'middle' | 'bottom' }) => void;
}

export default function AdCreationForm({ onPreview }: AdCreationFormProps) {
  const [videos, setVideos] = React.useState<VideoProps[]>([]);

  React.useEffect(() => {
    const loadVideos = async () => {
      const response = await getVideos();
      if (response.success && response.data) {
        // Convert to simpler format with just URLs
        setVideos(response.data.map(video => ({ url: video.url || "" })));
      }
    };
    loadVideos();
  }, []);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      videoId: "",
      text: "",
      textPosition: "bottom",
    },
  });

  // Update preview in real-time as form values change
  React.useEffect(() => {
    const subscription = form.watch((value) => {
      if (!value.videoId) return;

      onPreview({
        videoId: value.videoId, // videoId is now the URL directly
        text: value.text || "",
        textPosition: value.textPosition || "bottom"
      });
    });
    return () => subscription.unsubscribe();
  }, [form, onPreview]);

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
                        <p>Add text that will appear over your video (max 90 characters)</p>
                      </TooltipContent>
                    </Tooltip>
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Textarea
                        {...field}
                        placeholder="Enter text to display over your video..."
                        className="resize-none"
                        rows={4}
                        maxLength={90}
                      />
                      <div className="absolute bottom-2 right-2 text-xs text-muted-foreground">
                        {field.value?.length || 0}/90
                      </div>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="textPosition"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    Text Position{" "}
                    <Tooltip>
                      <TooltipTrigger>
                        <Info className="w-4 h-4" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Choose where to display the text on the video</p>
                      </TooltipContent>
                    </Tooltip>
                  </FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      value={field.value}
                      className="flex gap-4"
                    >
                      <FormItem className="flex items-center space-x-2">
                        <FormControl>
                          <RadioGroupItem value="top" />
                        </FormControl>
                        <FormLabel className="font-normal cursor-pointer">Top</FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-2">
                        <FormControl>
                          <RadioGroupItem value="middle" />
                        </FormControl>
                        <FormLabel className="font-normal cursor-pointer">Middle</FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-2">
                        <FormControl>
                          <RadioGroupItem value="bottom" />
                        </FormControl>
                        <FormLabel className="font-normal cursor-pointer">Bottom</FormLabel>
                      </FormItem>
                    </RadioGroup>
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