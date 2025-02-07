"use client";

import AdCreationForm from "@/components/ad-creation/AdCreationForm"
import { useEffect, useRef, useState, useCallback } from "react";
import { toast } from "sonner";
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';
import { saveAd } from "@/app/actions/ad-actions";

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
  const ffmpegRef = useRef<FFmpeg | null>(null);
  const [isShowingFirstVideo, setIsShowingFirstVideo] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [ffmpegMessage, setFFmpegMessage] = useState("");
  const [mergedVideoUrl, setMergedVideoUrl] = useState<string>("");
  const [isDownloadReady, setIsDownloadReady] = useState(false);
  const [isFFmpegLoaded, setIsFFmpegLoaded] = useState(false);
  const [processingMetrics, setProcessingMetrics] = useState<ProcessingMetrics>({
    progress: 0,
    time: '00:00:00'
  });

  // Initialize FFmpeg
  const initFFmpeg = useCallback(async () => {
    try {
      if (ffmpegRef.current) {
        setIsFFmpegLoaded(true);
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
      setIsFFmpegLoaded(true);
    } catch (error) {
      console.error('Error initializing FFmpeg:', error);
      toast.error('Failed to initialize video processing tools');
      setIsFFmpegLoaded(false);
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

  const handleDownload = () => {
    if (!mergedVideoUrl) return;
    
    const a = document.createElement('a');
    a.href = mergedVideoUrl;
    a.download = `merged-ad-${Date.now()}.mp4`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleSaveAd = async () => {
    if (!preview.videoId || !preview.clientVideoId) {
      toast.error("Please select both videos before saving");
      return;
    }

    if (!isFFmpegLoaded || !ffmpegRef.current) {
      toast.error("Video processing tools are not ready yet");
      return;
    }

    setIsProcessing(true);
    setIsDownloadReady(false);
    
    try {
      const ffmpeg = ffmpegRef.current;
      
      // Download videos and font
      const video1Data = await fetchFile(preview.videoId);
      const video2Data = await fetchFile(preview.clientVideoId);
      const fontData = await fetchFile('https://raw.githubusercontent.com/ffmpegwasm/testdata/master/arial.ttf');
      
      // Write files to FFmpeg's virtual filesystem
      await ffmpeg.writeFile('video1.mp4', video1Data);
      await ffmpeg.writeFile('video2.mp4', video2Data);
      await ffmpeg.writeFile('arial.ttf', fontData);
      
      // Process first video with text
      const text1Y = preview.ugcTextPosition === 'top' ? 10 : 
                     preview.ugcTextPosition === 'middle' ? '(h-text_h)/2' : 
                     'h-th-10';
      
      await ffmpeg.exec([
        '-i', 'video1.mp4',
        '-vf', `drawtext=fontfile=/arial.ttf:text='${preview.ugcText}':x=(w-text_w)/2:y=${text1Y}:fontsize=24:fontcolor=white:box=1:boxcolor=black@0.5:boxborderw=5`,
        '-threads', '0',
        '-preset', 'ultrafast',
        'video1_text.mp4'
      ]);
      
      // Process second video with text
      const text2Y = preview.clientTextPosition === 'top' ? 10 : 
                     preview.clientTextPosition === 'middle' ? '(h-text_h)/2' : 
                     'h-th-10';
      
      await ffmpeg.exec([
        '-i', 'video2.mp4',
        '-vf', `drawtext=fontfile=/arial.ttf:text='${preview.clientText}':x=(w-text_w)/2:y=${text2Y}:fontsize=24:fontcolor=white:box=1:boxcolor=black@0.5:boxborderw=5`,
        '-threads', '0',
        '-preset', 'ultrafast',
        'video2_text.mp4'
      ]);
      
      // Create a file list for concatenation
      await ffmpeg.writeFile('list.txt', 'file video1_text.mp4\nfile video2_text.mp4');
      
      // Concatenate the videos
      await ffmpeg.exec([
        '-f', 'concat',
        '-safe', '0',
        '-i', 'list.txt',
        '-c', 'copy',
        '-threads', '0',
        '-preset', 'ultrafast',
        'output.mp4'
      ]);
      
      // Read and clean up the merged video file
      const mergedData = await ffmpeg.readFile('output.mp4');
      const mergedBlob = new Blob([mergedData], { type: 'video/mp4' });
      const url = URL.createObjectURL(mergedBlob);
      
      // Clean up files
      await ffmpeg.deleteFile('video1.mp4');
      await ffmpeg.deleteFile('video2.mp4');
      await ffmpeg.deleteFile('video1_text.mp4');
      await ffmpeg.deleteFile('video2_text.mp4');
      await ffmpeg.deleteFile('list.txt');
      await ffmpeg.deleteFile('output.mp4');
      
      // Save the merged video URL
      setMergedVideoUrl(url);
      
      // Save ad to database
      const result = await saveAd({
        ugcVideoUrl: preview.videoId,
        clientVideoUrl: preview.clientVideoId
      });

      if (result.error) {
        throw new Error(result.error);
      }

      setIsDownloadReady(true);
      toast.success("Ad created successfully! Click download to save.");
    } catch (error) {
      console.error('Error merging videos:', error);
      toast.error('Failed to create ad');
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
          <AdCreationForm onPreview={setPreview} onSave={handleSaveAd} />
          {isDownloadReady && (
            <button
              onClick={handleDownload}
              className="mt-4 w-full bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-md"
            >
              Download Merged Video
            </button>
          )}
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