import { Injectable } from '@angular/core';
import { FirestoreService } from './firestore.service';
import { ExternalApiService } from './external-api.service';
import { Jitsi } from 'capacitor-jitsi-meet';
import { v4 as uuidv4 } from 'uuid';
import { ToastService } from 'src/app/shared/services/toast.service';

@Injectable({
  providedIn: 'root'
})
export class CallService {
  private callSub: any;

  constructor(
    private firestoreService: FirestoreService,
    private externalApiService: ExternalApiService,
    private toastService: ToastService
  ) {}

  async startVideoCall(caller: any, receiver: any) {
    if (!receiver.token) {
      this.toastService.showToast('El contacto no tiene token válido', 'danger');
      return;
    }

    try {
      const meetingId = uuidv4();
      
      await this.firestoreService.createCall({
        meetingId,
        callerId: caller.id,
        receiverId: receiver.id,
        status: 'ringing',
        createdAt: Date.now()
      });

      await this.externalApiService.notifyContact({
        token: receiver.token,
        id: receiver.phone,
        firstName: receiver.firstName,
        lastName: receiver.lastName,
        userFrom: caller.id,
        meetingId
      });

      this.listenForCallResponse(meetingId, caller);
      
      this.toastService.showToast('Llamando...', 'primary');
    } catch (error) {
      console.error('Error al iniciar llamada:', error);
      this.toastService.showToast('Error al iniciar la llamada', 'danger');
    }
  }

  private listenForCallResponse(meetingId: string, caller: any) {
    this.callSub = this.firestoreService.listenCallStatus(meetingId).subscribe({
      next: async (callData) => {
        if (callData.status === 'accepted') {
          await this.joinJitsiMeeting(meetingId, caller);
        } else if (callData.status === 'rejected') {
          this.toastService.showToast('Llamada rechazada', 'warning');
          this.cleanUp();
        }
      },
      error: (err) => console.error('Error en llamada:', err)
    });
  }

  private async joinJitsiMeeting(meetingId: string, caller: any) {
    try {
      await Jitsi.joinConference({
        roomName: meetingId,
        displayName: `${caller.firstName} ${caller.lastName}`,
        url: 'https://jitsi1.geeksec.de',
        featureFlags: {
          'prejoinpage.enabled': false,
          'recording.enabled': false
        }
      });
    } catch (error) {
      console.error('Error al unirse a la reunión:', error);
    }
  }

  cleanUp() {
    if (this.callSub) {
      this.callSub.unsubscribe();
    }
  }
}