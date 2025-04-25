import { EventEmitter, Injectable } from '@angular/core';
import { PushNotifications, Token, ActionPerformed } from '@capacitor/push-notifications';
import { FirestoreService } from './firestore.service';
import { AuthService } from './auth.service';
import { Router } from '@angular/router';
import { ModalController } from '@ionic/angular';
import { IncomingCallModalComponent } from 'src/app/shared/components/incoming-call-modal/incoming-call-modal.component';

@Injectable({
  providedIn: 'root'
})
export class FcmService {
  public notificationReceived = new EventEmitter<any>();

  constructor(
    private firestoreService: FirestoreService,
    private authService: AuthService,
    private router: Router,
    private modalCtrl: ModalController
  ) {}

  async initPushNotifications() {
    const permission = await PushNotifications.requestPermissions();
    if (permission.receive === 'granted') {
      PushNotifications.register();
    }

    PushNotifications.addListener('registration', async (token: Token) => {
      console.log('FCM Token:', token.value);
      const currentUser = this.authService.getCurrentUser();
      if (currentUser) {
        await this.firestoreService.updateUserToken(currentUser.uid, token.value);
      }
    });

    PushNotifications.addListener('registrationError', (error) => {
      console.error('Error al registrar notificaciones:', error);
    });

    PushNotifications.addListener('pushNotificationReceived', async (notification) => {
      console.log('Notificación recibida en primer plano:', notification);
    
      const currentRoute = this.router.url;
      if (notification.data?.type === 'incoming_call' && (currentRoute === '/home' || currentRoute === '/add')) {
        this.showIncomingCallModal(notification);
      } else {
        this.notificationReceived.emit(notification);
      }
    });
    

    PushNotifications.addListener('pushNotificationActionPerformed', async (action: ActionPerformed) => {
      console.log('Acción de notificación:', action);
      if (action.notification.data?.type === 'incoming_call') {
        this.showIncomingCallModal(action.notification);
      }
    });    
  }

  async showIncomingCallModal(notification: any) {
    const { name, meetingId, userFrom } = notification.data;
    const modal = await this.modalCtrl.create({
      component: IncomingCallModalComponent,
      componentProps: {
        name: name || 'Contacto',
        meetingId: meetingId || '',
        userFrom: userFrom || '',
      },
    });
    await modal.present();
  }
}
