import { Component, OnInit } from '@angular/core';
import { FcmService } from './core/services/fcm.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: false,
})
export class AppComponent implements OnInit{
  constructor(private fcmService: FcmService) {}

  ngOnInit() {
    this.fcmService.initPushNotifications();
  }
}
