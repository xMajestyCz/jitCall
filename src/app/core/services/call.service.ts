import { Injectable } from '@angular/core';
import { Firestore, collection, doc, docData, onSnapshot, query, setDoc, updateDoc, where } from '@angular/fire/firestore';
import { ModalController } from '@ionic/angular';
import { Observable } from 'rxjs';
import { IncomingCallModalComponent } from 'src/app/shared/components/incoming-call-modal/incoming-call-modal.component';

@Injectable({
  providedIn: 'root'
})
export class CallService {
  constructor(
    private firestore: Firestore,
    private modalCtrl: ModalController
  ) {}

  setupIncomingCallListener(userId: string) {
    const callsRef = collection(this.firestore, 'calls');
    const q = query(callsRef, where('recipientId', '==', userId), where('status', '==', 'calling'));
    
    onSnapshot(q, (snapshot) => {
      snapshot.docChanges().forEach(async (change) => {
        if (change.type === 'added') {
          const callData = change.doc.data();
          this.showIncomingCallModal(callData);
        }
      });
    });
  }

  private async showIncomingCallModal(callData: any) {
    const modal = await this.modalCtrl.create({
      component: IncomingCallModalComponent,
      componentProps: {
        meetingId: callData.meetingId,
        userFrom: callData.callerId
      }
    });
    await modal.present();
  }

  async createCall(callData: any): Promise<void> {
    const callRef = doc(this.firestore, 'calls', callData.meetingId);
    await setDoc(callRef, callData);
  }

  async updateCallStatus(meetingId: string, status: string): Promise<void> {
      const callRef = doc(this.firestore, 'calls', meetingId);
      await updateDoc(callRef, { status });
  }

  getCall(meetingId: string): Observable<any> {
      const callRef = doc(this.firestore, 'calls', meetingId);
      return docData(callRef) as Observable<any>;
  }
}