import { Component, OnInit } from '@angular/core';
import { NavController } from '@ionic/angular';
import { Jitsi } from 'capacitor-jitsi-meet';
import { Subscription } from 'rxjs';
import { FirestoreService } from 'src/app/core/services/firestore.service';

@Component({
  selector: 'app-incoming-call',
  templateUrl: './incoming-call.page.html',
  styleUrls: ['./incoming-call.page.scss'],
  standalone: false
})
export class IncomingCallPage implements OnInit {
  callerName: string = '';
  meetingId: string = '';
  callStatusSub?: Subscription;

  constructor(
    private navController: NavController,
    private firestoreService: FirestoreService,
  ) {}

  ngOnInit() {
    const params = new URLSearchParams(window.location.search);
    this.callerName = params.get('callerName') || 'Desconocido';
    this.meetingId = params.get('meetingId') || '';

    if (!this.meetingId) {
      console.warn('Meeting ID no encontrado');
    }
  }

  async acceptCall() {
    try {
      const result = await Jitsi.joinConference({
        roomName: this.meetingId,
        displayName: this.callerName,
        url: 'https://jitsi1.geeksec.de',
        featureFlags: {
          'prejoinpage.enabled': false,
          'recording.enabled': false, 
          'live-streaming.enabled': false, 
          'android.screensharing.enabled': false, 
          'invite.enabled': false, 
          'add-people.enabled': false, 
          'calendar.enabled': false, 
          'close-captions.enabled': false,
        },
        configOverrides: {
          startWithAudioMuted: false, 
          startWithVideoMuted: false,
          enableLobby: false, 
          disableInviteFunctions: true, 
          requireDisplayName: false, 
          enableUserRolesBasedOnToken: false, 
          startAudioOnly: false, 
          disableModeratorIndicator: true,
          disableJoinLeaveNotifications: true, 
        },
        chatEnabled: false,
        inviteEnabled: false, 
      });
    
      await this.firestoreService.updateCallStatus(this.meetingId, 'accepted');
      this.navController.pop();
    } catch (error) {
      console.error('Error al unirse a la llamada:', error);
    }
  }
  
  rejectCall() {
    console.log('Llamada rechazada');
    this.navController.pop();
  }
}
