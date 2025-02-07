import { FFmpeg } from '@ffmpeg/ffmpeg';
import { toBlobURL, fetchFile } from '@ffmpeg/util';

let ffmpeg: FFmpeg | null = null;
let loaded = false;

export const loadFFmpeg = async (onProgress?: (message: string) => void) => {
  if (loaded) return ffmpeg;

  ffmpeg = new FFmpeg();
  
  if (onProgress) {
    ffmpeg.on('log', ({ message }) => {
      onProgress(message);
      console.log(message);
    });
  }

  // Load ffmpeg.wasm-core
  const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd';
  await ffmpeg.load({
    coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
    wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
  });

  loaded = true;
  return ffmpeg;
};

export const mergeVideosWithText = async (
  video1Url: string,
  video2Url: string,
  text1: string,
  text2: string,
  onProgress?: (message: string) => void
): Promise<string> => {
  const ffmpeg = await loadFFmpeg(onProgress);
  if (!ffmpeg) throw new Error('FFmpeg not loaded');
  
  // Download videos and font
  const video1Data = await fetchFile(video1Url);
  const video2Data = await fetchFile(video2Url);
  const fontData = await fetchFile('https://raw.githubusercontent.com/ffmpegwasm/testdata/master/arial.ttf');
  
  // Write files to FFmpeg's virtual filesystem
  await ffmpeg.writeFile('video1.mp4', video1Data);
  await ffmpeg.writeFile('video2.mp4', video2Data);
  await ffmpeg.writeFile('arial.ttf', fontData);
  
  // Process first video with text
  await ffmpeg.exec([
    '-i', 'video1.mp4',
    '-vf', `drawtext=fontfile=/arial.ttf:text='${text1}':x=10:y=10:fontsize=24:fontcolor=white`,
    'video1_text.mp4'
  ]);
  
  // Process second video with text
  await ffmpeg.exec([
    '-i', 'video2.mp4',
    '-vf', `drawtext=fontfile=/arial.ttf:text='${text2}':x=10:y=10:fontsize=24:fontcolor=white`,
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
    'output.mp4'
  ]);
  
  // Read the merged video file
  const mergedData = await ffmpeg.readFile('output.mp4');
  const mergedBlob = new Blob([mergedData], { type: 'video/mp4' });
  
  // Create a URL for the merged video
  return URL.createObjectURL(mergedBlob);
}; 