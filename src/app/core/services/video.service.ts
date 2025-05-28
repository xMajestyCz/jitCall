import { Injectable } from '@angular/core';
import { VideoRecorder, VideoRecorderCamera, VideoRecorderPreviewFrame } from '@capacitor-community/video-recorder';
import { Capacitor } from '@capacitor/core';
import { Filesystem, Directory } from '@capacitor/filesystem';

@Injectable({ providedIn: 'root' })
export class VideoService {
  constructor() {}

  async startVideoRecording() {
    try {
      const config: VideoRecorderPreviewFrame = {
        id: 'video-record',
        stackPosition: 'back',
        width: 'fill',
        height: 'fill',
        x: 0,
        y: 0,
        borderRadius: 0
      };
      await VideoRecorder.initialize({
        camera: VideoRecorderCamera.BACK,
        previewFrames: [config]
      });
      await VideoRecorder.startRecording();
    } catch (error) {
      console.error('Error al iniciar la grabación de video:', error);
      throw error;
    }
  }

async stopVideoRecording(): Promise<File | null> {
  try {
    const res = await VideoRecorder.stopRecording();
    await VideoRecorder.destroy();
    if (res && res.videoUrl) {
      if (Capacitor.getPlatform() === 'web') {
        const response = await fetch(res.videoUrl);
        const blob = await response.blob();
        return new File([blob], `video_${Date.now()}.mp4`, { type: 'video/mp4' });
      } else {
        let path = res.videoUrl;
        if (path.startsWith('file://')) path = path.replace('file://', '');
        const fileRead = await Filesystem.readFile({
          path,
          directory: Directory.External,
        });
        let blob: Blob;
        if (typeof fileRead.data === 'string') {
          const base64ToBlob = (base64: string, contentType = '', sliceSize = 512) => {
            const byteCharacters = atob(base64);
            const byteArrays = [];
            for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
              const slice = byteCharacters.slice(offset, offset + sliceSize);
              const byteNumbers = new Array(slice.length);
              for (let i = 0; i < slice.length; i++) {
                byteNumbers[i] = slice.charCodeAt(i);
              }
              const byteArray = new Uint8Array(byteNumbers);
              byteArrays.push(byteArray);
            }
            return new Blob(byteArrays, { type: contentType });
          };
          blob = base64ToBlob(fileRead.data, 'video/mp4');
        } else {
          blob = fileRead.data;
        }
        return new File([blob], `video_${Date.now()}.mp4`, { type: 'video/mp4' });
      }
    }
    return null;
  } catch (e) {
    console.error('Error al detener la grabación de video:', e);
    return null;
  }
}
}