"use client";

import AdCreationForm from "@/components/ad-creation/AdCreationForm"
import { useEffect, useRef, useState, useCallback } from "react";
import { toast } from "sonner";
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { toBlobURL } from '@ffmpeg/util';
import { saveAd } from "@/app/actions/ad-actions";
import { mergeVideosWithCloudinary } from "@/app/actions/video-actions";

interface PreviewData {
  videoId: string;
  clientVideoId: string;
  ugcText: string;
  clientText: string;
  ugcTextPosition: 'top' | 'middle' | 'bottom';
  clientTextPosition: 'top' | 'middle' | 'bottom';
}

interface ProcessingMetrics {
  progress: number;
  time: string;
}

export default function AdCreator() {
  const [preview, setPreview] = useState<PreviewData>({
    videoId: "",
    clientVideoId: "",
    ugcText: "",
    clientText: "",
    ugcTextPosition: 'bottom',
    clientTextPosition: 'bottom'
  });

  const firstVideoRef = useRef<HTMLVideoElement>(null);
  const secondVideoRef = useRef<HTMLVideoElement>(null);
  const outputVideoRef = useRef<HTMLVideoElement>(null);
  const ffmpegRef = useRef<FFmpeg | null>(null);
  const [isShowingFirstVideo, setIsShowingFirstVideo] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [ffmpegMessage, setFFmpegMessage] = useState("");
  const [processingMetrics, setProcessingMetrics] = useState<ProcessingMetrics>({
    progress: 0,
    time: '00:00:00'
  });

  // Initialize FFmpeg
  const initFFmpeg = useCallback(async () => {
    try {
      if (ffmpegRef.current) {
        return;
      }

      const ffmpeg = new FFmpeg();
      const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd';

      ffmpeg.on('log', ({ message }) => {
        setFFmpegMessage(message);
        console.log(message);
      });

      ffmpeg.on('progress', ({ progress, time }) => {
        const progressValue = Math.min(100, Math.max(0, Math.round(progress * 100)));
        setProcessingMetrics({
          progress: progressValue,
          time: String(time || '00:00:00')
        });
      });

      await ffmpeg.load({
        coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
        wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm')
      });

      ffmpegRef.current = ffmpeg;
    } catch (error) {
      console.error('Error initializing FFmpeg:', error);
      toast.error('Failed to initialize video processing tools');
    }
  }, []);

  // Load FFmpeg on component mount
  useEffect(() => {
    const loadFFmpeg = async () => {
      if (!ffmpegRef.current) {
        await initFFmpeg();
      }
    };
    loadFFmpeg();
  }, [initFFmpeg]);

  // Handle video sequence
  useEffect(() => {
    const firstVideo = firstVideoRef.current;
    const secondVideo = secondVideoRef.current;

    if (firstVideo && secondVideo) {
      firstVideo.onended = () => {
        if (preview.clientVideoId) {
          firstVideo.style.display = 'none';
          secondVideo.style.display = 'block';
          secondVideo.play();
          setIsShowingFirstVideo(false);
        } else {
          firstVideo.play();
        }
      };

      secondVideo.onended = () => {
        secondVideo.style.display = 'none';
        firstVideo.style.display = 'block';
        firstVideo.play();
        setIsShowingFirstVideo(true);
      };
    }
  }, [preview.videoId, preview.clientVideoId]);

  const handleCloudinaryMerge = async () => {
    if (!preview.videoId || !preview.clientVideoId) {
      toast.error("Please select both videos before merging");
      return;
    }

    setIsProcessing(true);
    try {
      const result = await mergeVideosWithCloudinary(
        preview.videoId,
        preview.clientVideoId,
        preview.ugcText,
        preview.clientText,
        preview.ugcTextPosition,
        preview.clientTextPosition
      );

      // Automatically download the merged video
      const response = await fetch(result.secure_url);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `merged-ad-${Date.now()}.mp4`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      // Reset video players
      if (firstVideoRef.current) {
        firstVideoRef.current.currentTime = 0;
        firstVideoRef.current.style.display = 'block';
      }
      if (secondVideoRef.current) {
        secondVideoRef.current.currentTime = 0;
        secondVideoRef.current.style.display = 'none';
      }
      setIsShowingFirstVideo(true);

      toast.success("Ad created and downloaded successfully!");
    } catch (error) {
      console.error('Error merging videos with Cloudinary:', error);
      toast.error('Failed to create ad with Cloudinary');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSaveToGallery = async () => {
    if (!preview.videoId || !preview.clientVideoId) {
      toast.error("Please select both videos before saving");
      return;
    }

    setIsProcessing(true);
    try {
      const result = await mergeVideosWithCloudinary(
        preview.videoId,
        preview.clientVideoId,
        preview.ugcText,
        preview.clientText,
        preview.ugcTextPosition,
        preview.clientTextPosition
      );

      // Save to ads gallery
      const saveResult = await saveAd({
        ugcVideoUrl: preview.videoId,
        clientVideoUrl: preview.clientVideoId,
        mergedVideoUrl: result.secure_url
      });

      if (saveResult.error) {
        throw new Error(saveResult.error);
      }

      // Reset video players
      if (firstVideoRef.current) {
        firstVideoRef.current.currentTime = 0;
        firstVideoRef.current.style.display = 'block';
      }
      if (secondVideoRef.current) {
        secondVideoRef.current.currentTime = 0;
        secondVideoRef.current.style.display = 'none';
      }
      setIsShowingFirstVideo(true);

      toast.success("Ad saved to gallery successfully!");
    } catch (error) {
      console.error('Error saving ad to gallery:', error);
      toast.error('Failed to save ad to gallery');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold">Make Ad</h1>
        <p className="text-muted-foreground mt-2">Create engaging advertisements with AI</p>
      </div>
      
      <div className="grid gap-8 lg:grid-cols-2">
        {/* Ad Creation Form */}
        <div>
          <AdCreationForm onPreview={setPreview} />
          <div className="space-y-4 mt-4">
            <button
              onClick={handleCloudinaryMerge}
              disabled={!preview.videoId || !preview.clientVideoId || isProcessing}
              className="w-full bg-blue-500 text-white hover:bg-blue-600 px-4 py-2 rounded-md disabled:opacity-50"
            >
              {isProcessing ? "Processing..." : "Create and Download"}
            </button>
            <button
              onClick={handleSaveToGallery}
              disabled={!preview.videoId || !preview.clientVideoId || isProcessing}
              className="w-full bg-green-500 text-white hover:bg-green-600 px-4 py-2 rounded-md disabled:opacity-50"
            >
              {isProcessing ? "Processing..." : "Save to Ads Gallery"}
            </button>
          </div>
        </div>

        {/* Preview Section */}
        <div className="flex flex-col items-center justify-start p-6">
          <h2 className="text-2xl font-semibold mb-6 self-start">Live Preview</h2>
          
          {/* Phone Frame */}
          <div className="relative w-[280px] h-[560px] bg-black rounded-[2.5rem] p-2 shadow-2xl">
            {/* Screen Content */}
            <div className="relative w-full h-full bg-background rounded-[2.2rem] overflow-hidden">
              {/* Video Content */}
              <div className="absolute inset-0">
                {isProcessing ? (
                  <div className="w-full h-full bg-muted flex flex-col items-center justify-center p-4">
                    <p className="text-muted-foreground text-center">Processing videos...</p>
                    <div className="w-full max-w-xs space-y-2">
                      <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-primary transition-all duration-300" 
                          style={{ width: `${processingMetrics.progress}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>{processingMetrics.progress}%</span>
                        <span>{processingMetrics.time}</span>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mt-2 text-center">{ffmpegMessage}</p>
                  </div>
                ) : preview.videoId ? (
                  <div className="relative w-full h-full">
                    {/* First Video (UGC) */}
                    <video
                      ref={firstVideoRef}
                      key={`ugc-${preview.videoId}`}
                      src={preview.videoId}
                      className="absolute inset-0 w-full h-full object-cover"
                      autoPlay
                      muted
                      playsInline
                    />
                    {/* Second Video (Client) - Only render if exists */}
                    {preview.clientVideoId && (
                      <video
                        ref={secondVideoRef}
                        key={`client-${preview.clientVideoId}`}
                        src={preview.clientVideoId}
                        className="absolute inset-0 w-full h-full object-cover hidden"
                        muted
                        playsInline
                      />
                    )}

                    {/* Output Video */}
                    <video
                      ref={outputVideoRef}
                      className="absolute inset-0 w-full h-full object-cover hidden"
                      controls
                      playsInline
                    />

                    {/* Text Overlay */}
                    {isShowingFirstVideo ? (
                      preview.ugcText && (
                        <div 
                          className={`absolute inset-x-0 p-6 ${
                            preview.ugcTextPosition === 'top' ? 'top-0' :
                            preview.ugcTextPosition === 'middle' ? 'top-1/2 -translate-y-1/2' :
                            'bottom-0'
                          }`}
                        >
                          <p className="text-white text-center text-lg font-medium [text-shadow:_0_1px_2px_rgb(0_0_0_/_0.9),_0_0_4px_rgb(0_0_0_/_0.4)]">
                            {preview.ugcText}
                          </p>
                        </div>
                      )
                    ) : (
                      preview.clientText && (
                        <div 
                          className={`absolute inset-x-0 p-6 ${
                            preview.clientTextPosition === 'top' ? 'top-0' :
                            preview.clientTextPosition === 'middle' ? 'top-1/2 -translate-y-1/2' :
                            'bottom-0'
                          }`}
                        >
                          <p className="text-white text-center text-lg font-medium [text-shadow:_0_1px_2px_rgb(0_0_0_/_0.9),_0_0_4px_rgb(0_0_0_/_0.4)]">
                            {preview.clientText}
                          </p>
                        </div>
                      )
                    )}
                  </div>
                ) : (
                  <div className="w-full h-full bg-muted flex items-center justify-center">
                    <p className="text-muted-foreground">Select a video to preview</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 