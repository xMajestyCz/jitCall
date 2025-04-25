import { Component, OnDestroy, OnInit } from '@angular/core';
import { FirestoreService } from 'src/app/core/services/firestore.service';
import { Users } from 'src/app/models/users.models';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/core/services/auth.service';
import { ToastService } from 'src/app/shared/services/toast.service';
import { ExternalApiService } from 'src/app/core/services/external-api.service';
import { FcmService } from 'src/app/core/services/fcm.service';
import { ModalController } from '@ionic/angular';
import { IncomingCallModalComponent } from 'src/app/shared/components/incoming-call-modal/incoming-call-modal.component';
import { Subscription } from 'rxjs';
import { JitsiService } from 'src/app/core/services/jitsi.service';
import { v4 as uuidv4 } from 'uuid';
import { CallService } from 'src/app/core/services/call.service';


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
    private fcmService: FcmService,
    private modalCtrl: ModalController,
    private jitsiService: JitsiService,
    private callService: CallService
  ) {}

  ngOnInit() {
    this.loadContacts();

    this.notificationSub = this.fcmService.notificationReceived.subscribe((notification) => {
      this.showIncomingCallModal(notification);
    });
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

        const meetingId = uuidv4();

        await this.callService.createCall({
            meetingId,
            callerId: currentUser.uid,
            //recipientId: contact.id,
            status: 'calling',
            timestamp: new Date()
        });

        await this.externalApiService.notifyContact({
            token: contact.token,
            id: contact.phone,
            firstName: contact.firstName,
            lastName: contact.lastName,
            userFrom: currentUser.uid,
            meetingId: meetingId  
        });

        setTimeout(() => {
            this.jitsiService.startCall(meetingId);
        }, 2000);

        this.toastService.showToast('Llamada iniciada correctamente ✅', 2500, 'success');
    } catch (error) {
        console.error('Error al iniciar la llamada:', error);
        this.toastService.showToast('Error al iniciar la llamada ❌', 2500, 'danger');
    }
}

  goToToggle() {
    this.router.navigate(['/add']);
  }
}
