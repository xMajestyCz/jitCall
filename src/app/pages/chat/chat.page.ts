import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Subscription } from 'rxjs';
import { CallService } from 'src/app/core/services/call.service';
import { FirestoreService } from 'src/app/core/services/firestore.service';
import { UserService } from 'src/app/core/services/user.service';
import { Message } from 'src/app/models/message.model';
import { Router } from '@angular/router';
import { VoiceRecorderService } from 'src/app/core/services/voice-recorder.service';
import { CameraSource } from '@capacitor/camera';
import { ActionSheetService } from 'src/app/shared/services/action-sheet.service';
import { CameraService } from 'src/app/core/services/camera.service';
import { ToastService } from 'src/app/shared/services/toast.service';
import { SupabaseService } from 'src/app/core/services/supabase.service';
import { FilePickerService } from 'src/app/core/services/file-picker.service';
import { VideoService } from 'src/app/core/services/video.service';
import { LocationService } from 'src/app/core/services/location.service';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.page.html',
  styleUrls: ['./chat.page.scss'],
  standalone: false
})
export class ChatPage implements OnInit {
  messages: Message[] = [];
  messageControl = new FormControl('');
  currentUser: any;
  selectedContact: any;
  chatId: string = '';
  private messagesSub!: Subscription;
  hasText: boolean = false;
  recordingState = {
    isRecording: false,
    audioBlob: null as Blob | null,
    duration: 0,
    showPreview: false
  };
  private recordingInterval: any;

  constructor(
    private callService: CallService,
    private userService: UserService,
    private firestoreService: FirestoreService,
    private router: Router,
    private voiceRecorder: VoiceRecorderService,
    private actionSheetService: ActionSheetService,  
    private cameraService: CameraService,         
    private supabaseService: SupabaseService,      
    private toastService: ToastService,
    private filePickerService: FilePickerService,
    private videoService: VideoService,
    private locationService: LocationService,
  ) {}

  ngOnInit() {
    this.currentUser = this.userService.getCurrentUser();
    const navigation = this.router.getCurrentNavigation();
    this.selectedContact = navigation?.extras.state?.['contact'];
    this.setupChat();
  }

  async setupChat() {
    if (this.currentUser && this.selectedContact) {
      this.chatId = this.firestoreService.getChatId(
        this.currentUser.id, 
        this.selectedContact.id
      );
      
      this.messagesSub = this.firestoreService.getMessages(this.chatId).subscribe({
        next: (messages) => {
          this.messages = (messages as Message[]).map(msg => {
            if (msg.senderId !== this.currentUser.id && !msg.senderImage) {
              return {
                ...msg,
                senderImage: this.selectedContact.profileImage
              };
            }
            return msg;
          });
          setTimeout(() => this.scrollToBottom(), 100);
        },
        error: (err) => console.error('Error obteniendo mensajes:', err)
      });
    }
  }

  async sendMessage() {
    const text = this.messageControl.value?.trim();
    if (!text || !this.currentUser || !this.chatId) return;

    const newMessage: Message = {
      senderId: this.currentUser.id,
      senderImage: this.currentUser.profileImage,
      text: text,
      content: text,
      type: 'text',
      status: 'sent',
      createdAt: new Date()
    };

    try {
      await this.firestoreService.sendMessage(this.chatId, newMessage);
      this.messageControl.setValue('');
      this.hasText = false;
    } catch (error) {
      console.error('Error enviando mensaje:', error);
    }
  }

  scrollToBottom() {
    const content = document.querySelector('.chat-messages');
    if (content) {
      content.scrollTop = content.scrollHeight;
    }
  }

  async startCall() {
    if (this.selectedContact) {
      await this.callService.startVideoCall(this.currentUser, this.selectedContact);
    }
  }

  ngOnDestroy() {
    this.callService.cleanUp();
    if (this.messagesSub) {
      this.messagesSub.unsubscribe();
    }
  }

  checkTextareaContent() {
    const value = this.messageControl.value;
    this.hasText = !!value && typeof value === 'string' && value.trim().length > 0;
  }

  async startRecording() {
    if (this.recordingState.isRecording) return;
    
    try {
      this.recordingState = {
        isRecording: true,
        audioBlob: null,
        duration: 0,
        showPreview: false
      };
      this.recordingInterval = setInterval(() => {
        this.recordingState.duration++;
      }, 1000);
      
      const success = await this.voiceRecorder.startRecording();
      if (!success) {
        clearInterval(this.recordingInterval);
        this.resetRecordingState();
      }
    } catch (error) {
      clearInterval(this.recordingInterval);
      console.error('Error al iniciar grabación:', error);
      this.resetRecordingState();
    }
  }

  async stopRecording() {
    if (!this.recordingState.isRecording) return;
    
    try {
      const result = await this.voiceRecorder.stopRecording();
      clearInterval(this.recordingInterval);
      this.recordingState = {
        isRecording: false,
        audioBlob: result.blob,
        duration: result.duration,
        showPreview: !!result.blob
      };
    } catch (error) {
      clearInterval(this.recordingInterval);
      console.error('Error al detener grabación:', error);
      this.resetRecordingState();
    }
  }

  async sendAudioMessage() {
    if (!this.recordingState.audioBlob || !this.currentUser || !this.chatId) return;

    try {
      const audioUrl = await this.voiceRecorder.uploadAudioToSupabase(
        this.recordingState.audioBlob,
        this.currentUser.id
      );

      const audioMessage: Message = {
        senderId: this.currentUser.id,
        senderImage: this.currentUser.profileImage,
        text: '',
        content: audioUrl,
        duration: this.recordingState.duration,
        type: 'audio',
        status: 'sent',
        createdAt: new Date()
      };

      await this.firestoreService.sendMessage(this.chatId, audioMessage);
      
      this.resetRecordingState();

    } catch (error) {
      console.error('Error enviando audio:', error);
    }
  }

  async playRecordedAudio() {
    if (this.recordingState.audioBlob) {
      try {
        await this.voiceRecorder.playAudio(this.recordingState.audioBlob);
      } catch (error) {
        console.error('Error reproduciendo audio:', error);
      }
    }
  }

  cancelRecording() {
    this.voiceRecorder.resetRecording();
    this.resetRecordingState();
  }

  private resetRecordingState() {
    this.recordingState = {
      isRecording: false,
      audioBlob: null,
      duration: 0,
      showPreview: false
    };
  }

  async playAudioMessage(message: Message) {
    if (!message.content) return;
    
    try {
      const response = await fetch(message.content);
      const blob = await response.blob();
      await this.voiceRecorder.playAudio(blob);
    } catch (error) {
      console.error('Error reproduciendo audio:', error);
    }
  }

  async selectImageSource(event: Event) {
    event.stopPropagation();
    await this.actionSheetService.show({
      header: 'Seleccionar medio',
      buttons: [
        {
          text: 'Tomar Foto',
          icon: 'camera',
          handler: async () => {
            await this.handleImageMessage(CameraSource.Camera);
          }
        },
        {
          text: 'Elegir Imagen de Galería',
          icon: 'image',
          handler: async () => {
            await this.handleImageMessage(CameraSource.Photos);
          }
        },
        {
          text: 'Grabar Video',
          icon: 'videocam',
          handler: async () => {
            await this.recordVideo();
          }
        },
        {
          text: 'Seleccionar archivo',
          icon: 'folder',
          handler: async () => {
            await this.pickAndSendFile();
          }
        },
        {
          text: 'Mandar ubicación',
          icon: 'location',
          handler: async () => {
            await this.sendLocationMessage();
          }
        },
        {
          text: 'Cancelar',
          icon: 'close',
          role: 'cancel'
        }
      ]
    });
  }

  private async handleImageMessage(source: CameraSource) {
    if (!this.currentUser || !this.chatId) return;
    try {
      const { file } = await this.cameraService.captureImage(source);
      if (!file) return;
      console.log('Imagen capturada:', file);
      const imageUrl = await this.supabaseService.uploadImage('images', file);
      console.log('URL de imagen subida:', imageUrl);
      if (!imageUrl) {
        this.toastService.showToast('No se pudo subir la imagen', 'danger');
        return;
      }
      const imageMessage: Message = {
        senderId: this.currentUser.id,
        senderImage: this.currentUser.profileImage,
        text: '',
        content: imageUrl,
        type: 'image',
        status: 'sent',
        createdAt: new Date()
      };
      await this.firestoreService.sendMessage(this.chatId, imageMessage);
      this.toastService.showToast('Imagen enviada', 'success');
    } catch (error) {
      console.error('Error enviando imagen:', error);
      this.toastService.showToast('Error enviando imagen', 'danger');
    }
  }

  async recordVideo() {
    await this.videoService.startVideoRecording();
    const file = await this.videoService.stopVideoRecording();
    if (file) {
      const videoUrl = await this.supabaseService.uploadImage('videos', file);
      const videoMessage: Message = {
        senderId: this.currentUser.id,
        senderImage: this.currentUser.profileImage,
        text: '',
        content: videoUrl,
        type: 'video',
        status: 'sent',
        createdAt: new Date()
      };
      await this.firestoreService.sendMessage(this.chatId, videoMessage);
      this.toastService.showToast('Video enviado', 'success');
    } else {
      this.toastService.showToast('No se pudo grabar el video', 'danger');
    }
  }

  async pickAndSendFile() {
    if (!this.currentUser || !this.chatId) return;
    try {
      const file = await this.filePickerService.pickAnyFile();
      if (!file) return;
      const fileUrl = await this.supabaseService.uploadImage('files', file);
      if (!fileUrl) {
        this.toastService.showToast('No se pudo subir el archivo', 'danger');
        return;
      }
      const fileMessage: Message = {
        senderId: this.currentUser.id,
        senderImage: this.currentUser.profileImage,
        text: file.name,
        content: fileUrl,
        type: 'file',
        status: 'sent',
        createdAt: new Date()
      };
      await this.firestoreService.sendMessage(this.chatId, fileMessage);
      this.toastService.showToast('Archivo enviado', 'success');
    } catch (error) {
      this.toastService.showToast('Error enviando archivo', 'danger');
      console.error('Error enviando archivo:', error);
    }
  }

  async sendLocationMessage() {
    if (!this.currentUser || !this.chatId) return;
    try {
      const location = await this.locationService.getCurrentLocation();
      if (!location) {
        this.toastService.showToast('No se pudo obtener la ubicación', 'danger');
        return;
      }
      const mapsUrl = `https://maps.google.com/?q=${location.latitude},${location.longitude}`;
      const locationMessage: Message = {
        senderId: this.currentUser.id,
        senderImage: this.currentUser.profileImage,
        text: 'Ubicación',
        content: mapsUrl,
        type: 'location',
        status: 'sent',
        createdAt: new Date()
      };
      await this.firestoreService.sendMessage(this.chatId, locationMessage);
      this.toastService.showToast('Ubicación enviada', 'success');
    } catch (error) {
      this.toastService.showToast('Error enviando ubicación', 'danger');
      console.error('Error enviando ubicación:', error);
    }
  }

  getLatLngFromUrl(url: string): { lat: number, lng: number } | null {
    try {
      const urlObj = new URL(url);
      const params = new URLSearchParams(urlObj.search);
      const coords = params.get('q')?.split(',') || urlObj.pathname.split('/').filter(Boolean).slice(-2);
      
      if (coords.length === 2) {
        const lat = parseFloat(coords[0]);
        const lng = parseFloat(coords[1]);
        
        if (!isNaN(lat) && !isNaN(lng)) {
          return { lat, lng };
        }
      }
    } catch (e) {
      console.error('Error parsing location URL:', e);
    }
    return null;
  }
}