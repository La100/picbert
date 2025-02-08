"use client";

import React, { useState, useEffect } from "react";
import VideoSelector from "./VideoSelector";
import { getVideos } from "@/app/actions/video-actions";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import ClientVideoSelector from "./ClientVideoSelector";
// import { toast } from "sonner";
// import { saveAd } from "@/app/actions/ad-actions";

interface PreviewData {
  videoId: string;
  clientVideoId: string;
  ugcText: string;
  clientText: string;
  ugcTextPosition: 'top' | 'middle' | 'bottom';
  clientTextPosition: 'top' | 'middle' | 'bottom';
}

interface AdCreationFormProps {
  onPreview: (data: PreviewData) => void;
}

export default function AdCreationForm({ onPreview }: AdCreationFormProps) {
  const [videos, setVideos] = useState<{ url: string }[]>([]);
  const [selectedVideo, setSelectedVideo] = useState<string>("");
  const [selectedClientVideo, setSelectedClientVideo] = useState<string>("");
  const [ugcText, setUgcText] = useState("");
  const [clientText, setClientText] = useState("");
  const [ugcTextPosition, setUgcTextPosition] = useState<'top' | 'middle' | 'bottom'>('bottom');
  const [clientTextPosition, setClientTextPosition] = useState<'top' | 'middle' | 'bottom'>('bottom');
  // const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const loadVideos = async () => {
      const response = await getVideos();
      if (response.success && response.data) {
        setVideos(response.data.map(video => ({ url: video.url || "" })));
      }
    };
    loadVideos();
  }, []);

  // Update preview whenever any value changes
  useEffect(() => {
    // Always send current state to preview
    onPreview({
      videoId: selectedVideo,
      clientVideoId: selectedClientVideo,
      ugcText,
      clientText,
      ugcTextPosition,
      clientTextPosition,
    });
  }, [selectedVideo, selectedClientVideo, ugcText, clientText, ugcTextPosition, clientTextPosition, onPreview]);

  // const handleSaveAd = async () => {
  //   if (!selectedVideo || !selectedClientVideo) {
  //     toast.error("Please select both videos before saving");
  //     return;
  //   }

  //   setIsSaving(true);
  //   try {
  //     const response = await saveAd({
  //       ugcVideoUrl: selectedVideo,
  //       clientVideoUrl: selectedClientVideo,
    
  //     });

  //     if (response.error) {
  //       toast.error(response.error);
  //     } else {
  //       toast.success("Ad saved successfully!");
  //     }
  //   } catch (error) {
  //     toast.error("Failed to save ad");
  //     console.error("Failed to save ad:", error);
  //   } finally {
  //     setIsSaving(false);
  //   }
  // };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-semibold mb-4">1. Select UGC Video</h2>
        <VideoSelector
          videos={videos}
          selectedVideo={selectedVideo}
          onSelect={setSelectedVideo}
        />
      </div>

      <div>
        <h2 className="text-2xl font-semibold mb-4">2. Add UGC Text</h2>
        <div className="space-y-4">
          <div>
            <Label htmlFor="ugcText">UGC Video Text</Label>
            <Input
              id="ugcText"
              value={ugcText}
              onChange={(e) => setUgcText(e.target.value)}
              placeholder="Enter text for UGC video"
            />
          </div>

          <div>
            <Label>Text Position</Label>
            <RadioGroup
              value={ugcTextPosition}
              onValueChange={(value) => setUgcTextPosition(value as 'top' | 'middle' | 'bottom')}
              className="flex gap-4 mt-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="top" id="ugcTop" />
                <Label htmlFor="ugcTop">Top</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="middle" id="ugcMiddle" />
                <Label htmlFor="ugcMiddle">Middle</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="bottom" id="ugcBottom" />
                <Label htmlFor="ugcBottom">Bottom</Label>
              </div>
            </RadioGroup>
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-semibold mb-4">3. Select Client Video</h2>
        <ClientVideoSelector onSelect={setSelectedClientVideo} />
      </div>

      <div>
        <h2 className="text-2xl font-semibold mb-4">4. Add Client Video Text</h2>
        <div className="space-y-4">
          <div>
            <Label htmlFor="clientText">Client Video Text</Label>
            <Input
              id="clientText"
              value={clientText}
              onChange={(e) => setClientText(e.target.value)}
              placeholder="Enter text for client video"
            />
          </div>

          <div>
            <Label>Text Position</Label>
            <RadioGroup
              value={clientTextPosition}
              onValueChange={(value) => setClientTextPosition(value as 'top' | 'middle' | 'bottom')}
              className="flex gap-4 mt-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="top" id="clientTop" />
                <Label htmlFor="clientTop">Top</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="middle" id="clientMiddle" />
                <Label htmlFor="clientMiddle">Middle</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="bottom" id="clientBottom" />
                <Label htmlFor="clientBottom">Bottom</Label>
              </div>
            </RadioGroup>
          </div>
        </div>
      </div>
    </div>
  );
} 