import { Component } from '@angular/core';
import { FcmService } from './core/services/fcm.service';


@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: false,
})
export class AppComponent {
  constructor(private fcmService: FcmService) {
    this.fcmService.initPushNotifications();
  }
}
