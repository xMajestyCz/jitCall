import { Injectable } from '@angular/core';
import { PushNotifications, Token, ActionPerformed } from '@capacitor/push-notifications';
import { FirestoreService } from './firestore.service';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class FcmService {

  constructor(private firestoreService: FirestoreService, private authService: AuthService) {}

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

    PushNotifications.addListener('pushNotificationReceived', (notification) => {
      console.log('Notificación recibida:', notification);
    });

    PushNotifications.addListener('pushNotificationActionPerformed', (action: ActionPerformed) => {
      console.log('Acción de notificación:', action);
    });
  }
}
