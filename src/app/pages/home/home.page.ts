import { Component, OnDestroy, OnInit } from '@angular/core';
import { FirestoreService } from 'src/app/core/services/firestore.service';
import { Users } from 'src/app/models/users.models';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/core/services/auth.service';
import { ToastService } from 'src/app/shared/services/toast.service';
import { ExternalApiService } from 'src/app/core/services/external-api.service';
import { Subscription } from 'rxjs';
import { v4 as uuidv4 } from 'uuid';
import { Jitsi } from 'capacitor-jitsi-meet';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  standalone: false
})
export class HomePage implements OnInit, OnDestroy {
  contacts: Users[] = [];
  allContacts: Users[] = [];
  private notificationSub?: Subscription;


  constructor(
    private firestoreService: FirestoreService,
    private router: Router,
    private authService: AuthService,
    private toastService: ToastService,
    private externalApiService: ExternalApiService,
  ) {}

  ngOnInit() {
    this.loadContacts();
  }

  ngOnDestroy() {
    if (this.notificationSub) {
      this.notificationSub.unsubscribe();
    }
  }

  async loadContacts() {
    try {
      const currentUser = this.authService.getCurrentUser();
      if (currentUser && currentUser.uid) {
        this.firestoreService.getContacts(currentUser.uid).subscribe((contacts) => {
          this.contacts = contacts.map((contact: any) => ({
            ...contact,
            token: contact.token || '', 
          }));
          this.allContacts = this.contacts;
        });
      } else {
        this.toastService.showToast('No se pudo obtener el usuario autenticado ❌', 2500, 'danger');
      }
    } catch (error) {
      this.toastService.showToast('Hubo un error al cargar los contactos ❌', 2500, 'danger');
    }
  }
  
  normalizeText(text: string): string {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
  }
  
  filterContacts(event: any) {
    const input = this.normalizeText(event.target.value || '');
  
    if (!input.trim()) {
      this.contacts = this.allContacts;
      return;
    }
  
    this.contacts = this.allContacts.filter((user) => {
      const fullName = `${user.firstName} ${user.lastName}`;
      const reversedFullName = `${user.lastName} ${user.firstName}`;
      const phone = user.phone;
  
      const normalizedFullName = this.normalizeText(fullName);
      const normalizedReversed = this.normalizeText(reversedFullName);
      const normalizedPhone = this.normalizeText(phone);
  
      return (
        normalizedFullName.includes(input) ||
        normalizedReversed.includes(input) ||
        normalizedPhone.includes(input)
      );
    });
  }  

  async sendCallNotification(contact: Users) {
    if (!contact.token) {
      this.toastService.showToast('El contacto no tiene un token válido ❌', 2500, 'danger');
      return;
    }

    try {
      const currentUser = this.authService.getCurrentUser();
      if (!currentUser) {
        this.toastService.showToast('No se pudo obtener el usuario autenticado ❌', 2500, 'danger');
        return;
      }

      const meetingId = uuidv4()

      await this.firestoreService.createCall({
        meetingId,
        callerId: currentUser.uid,
        receiverId: contact.id,
        status: 'ringing',
        createdAt: Date.now(),
      });

      await this.externalApiService.notifyContact({
        token: contact.token,
        id: contact.phone,
        firstName: contact.firstName,
        lastName: contact.lastName,
        userFrom: currentUser.uid,
        meetingId, 
      });

      this.notificationSub = this.firestoreService.listenCallStatus(meetingId).subscribe(async callData => {
        console.log('Estado de la llamada recibido:', callData);
      
        if (callData.status === 'accepted') {
          try {
            const displayName = await this.authService.getUserDisplayName();
            const result = await Jitsi.joinConference({
              roomName: meetingId,
              displayName: displayName || '',  
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
      
            console.log('Conferencia iniciada', result);
          } catch (error) {
            console.error('Error al unirse a la conferencia', error);
          }
        }
      
        if (callData.status === 'rejected') {
          console.log('La llamada fue rechazada');
        }
      });
      

      this.toastService.showToast('Llamando... 🔔', 2500, 'primary');
    } catch (error) {
      console.error('Error al iniciar llamada:', error);
      this.toastService.showToast('Error al iniciar la llamada ❌', 2500, 'danger');
    }
  }

  goToToggle() {
    this.router.navigate(['/add']);
  }
}
