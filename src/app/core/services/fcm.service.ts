import { EventEmitter, Injectable } from '@angular/core';
import { PushNotifications, Token, ActionPerformed } from '@capacitor/push-notifications';
import { FirestoreService } from './firestore.service';
import { AuthService } from './auth.service';
import { Router } from '@angular/router';
import { ModalController } from '@ionic/angular';

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
    });
    

    PushNotifications.addListener('pushNotificationActionPerformed', (action: ActionPerformed) => {
      console.log('Acción de notificación:', action);
    
      const notification = action.notification;
      console.log('Datos de la notificación:', notification.data);
    
      if (notification.data) {
        const callerName = notification.data.name || 'Desconocido';
        const meetingId = notification.data.meetingId || '';
      
        if (meetingId) {
          this.router.navigate(['/incoming-call'], {
            queryParams: { callerName, meetingId }
          });
          return;
        }
      }      
    });           
  }
}
