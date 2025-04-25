import { Injectable } from '@angular/core';
import { registerPlugin, Capacitor } from '@capacitor/core';
import { Firestore, doc, setDoc } from '@angular/fire/firestore';
import { v4 as uuidv4 } from 'uuid';

const JitsiMeet = registerPlugin<any>('JitsiMeet');

@Injectable({
  providedIn: 'root'
})
export class JitsiService {
  constructor(private firestore: Firestore) {}

  async startCall(recipientUserId: string): Promise<string> {
    const meetingId = uuidv4();
    
    await this.saveCallData(recipientUserId, meetingId);
    
    if (Capacitor.isNativePlatform()) {
      await JitsiMeet.startCall({ room: meetingId });
    } else {
      window.open(`https://jitsi1.geeksec.de/${meetingId}`, '_blank');
    }
    
    return meetingId;
  }

  private async saveCallData(recipientUserId: string, meetingId: string): Promise<void> {
    const callRef = doc(this.firestore, 'calls', meetingId);
    await setDoc(callRef, {
      meetingId,
      recipientId: recipientUserId,
      timestamp: new Date(),
      status: 'calling'
    });
  }

  async joinCall(meetingId: string): Promise<void> {
    if (Capacitor.isNativePlatform()) {
      await JitsiMeet.startCall({ room: meetingId });
    } else {
      window.open(`https://jitsi1.geeksec.de/${meetingId}`, '_blank');
    }
  }
}