import { Injectable } from '@angular/core';
import { VoiceRecorder } from 'capacitor-voice-recorder';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from 'src/environments/environment';
import { Filesystem, Directory } from '@capacitor/filesystem';

@Injectable({
  providedIn: 'root'
})
export class VoiceRecorderService {
  private supabase: SupabaseClient;
  isRecording = false;
  audioBlob: Blob | null = null;
  audioDuration = 0;
  private recordingInterval: any;

  constructor() {
    this.supabase = createClient(
      environment.supabaseUrl, 
      environment.supabaseKey
    );
  }

  async requestPermissions(): Promise<boolean> {
    const permissionResult = await VoiceRecorder.requestAudioRecordingPermission();
    return permissionResult.value;
  }

  async startRecording(): Promise<boolean> {
    try {
      if (!await this.requestPermissions()) {
        throw new Error('Permiso de grabación denegado');
      }

      await VoiceRecorder.startRecording();
      this.isRecording = true;
      this.audioDuration = 0;
      
      this.recordingInterval = setInterval(() => {
        this.audioDuration++;
      }, 1000);

      return true;
    } catch (error) {
      console.error('Error al grabar:', error);
      this.stopRecording();
      return false;
    }
  }

  async stopRecording(): Promise<{blob: Blob | null, duration: number}> {
    if (!this.isRecording) return {blob: null, duration: 0};

    try {
      const recordingResult = await VoiceRecorder.stopRecording();
      clearInterval(this.recordingInterval);
      this.isRecording = false;

      if (recordingResult.value?.recordDataBase64) {
        const blob = await this.base64ToBlob(
          recordingResult.value.recordDataBase64, 
          'audio/aac'
        );
        this.audioBlob = blob;
        return {blob, duration: this.audioDuration};
      }
      return {blob: null, duration: 0};
    } catch (error) {
      console.error('Error al detener grabación:', error);
      return {blob: null, duration: 0};
    } finally {
      this.cleanUp();
    }
  }

  private async base64ToBlob(base64: string, mimeType: string): Promise<Blob> {
    const response = await fetch(`data:${mimeType};base64,${base64}`);
    return await response.blob();
  }

  async uploadAudioToSupabase(blob: Blob, userId: string): Promise<string> {
    const fileName = `audio_${userId}_${Date.now()}.aac`;
    const filePath = `audios/${fileName}`;

    const { data, error } = await this.supabase.storage
      .from('audios')
      .upload(filePath, blob);

    if (error) {
      console.error('Error uploading audio:', error);
      throw error;
    }

    const { data: { publicUrl } } = this.supabase.storage
      .from('audios')
      .getPublicUrl(data.path);

    return publicUrl;
  }

  async playAudio(blob: Blob): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      const audio = new Audio();
      audio.src = URL.createObjectURL(blob);
      audio.onended = () => resolve();
      audio.onerror = (ev) => reject(ev);
      audio.play().catch(reject);
    });
  }

  private cleanUp(): void {
    clearInterval(this.recordingInterval);
    this.isRecording = false;
  }

  resetRecording(): void {
    this.audioBlob = null;
    this.audioDuration = 0;
  }
}