import { Component, OnDestroy, OnInit } from '@angular/core';
import { Firestore, collection, doc, getDocs, query, setDoc, where } from '@angular/fire/firestore';
import { Users } from 'src/app/models/users.models';
import { ToastService } from 'src/app/shared/services/toast.service';
import { FirestoreService } from 'src/app/core/services/firestore.service';
import { AuthService } from 'src/app/core/services/auth.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-add',
  templateUrl: './add.page.html',
  styleUrls: ['./add.page.scss'],
  standalone: false
})
export class AddPage implements OnInit, OnDestroy {
  searchResults: Users[] = [];
  private notificationSub?: Subscription;

  constructor(
    private firestore: Firestore,
    private firestoreService: FirestoreService,
    private toastService: ToastService,
    private authService: AuthService,
  ) {}

  ngOnInit() {
  }
  
  ngOnDestroy() {
    if (this.notificationSub) {
      this.notificationSub.unsubscribe();
    }
  }

  async onSearch(event: any) {
    const searchValue = event.detail.value?.trim();
    if (!searchValue) {
      this.searchResults = [];
      return;
    }
  
    this.searchResults = await this.firestoreService.searchUsersByPhone(searchValue);
  }

  async addContact(user: any): Promise<void> {
    try {
      const currentUser = this.authService.getCurrentUser();
      if (!currentUser) {
        this.toastService.showToast('No se pudo obtener el usuario autenticado ❌', 'danger');
        return;
      }

      const currentUserPhone = await this.authService.getCurrentUserPhone();
      if (!currentUserPhone) {
        this.toastService.showToast('No se pudo obtener el número de teléfono del usuario autenticado ❌', 'danger');
        return;
      }

      if (user.phone === currentUserPhone) {
        this.toastService.showToast('No puedes agregarte a ti mismo ❌', 'warning');
        return;
      }

      await this.firestoreService.addContact(user, currentUser.uid);
      this.toastService.showToast('Contacto agregado correctamente ✅', 'success');
      this.searchResults = this.searchResults.filter(u => u.phone !== user.phone);
    } catch (error) {
      this.toastService.showToast(error instanceof Error ? error.message : 'Error al agregar contacto ❌', 'danger');
    }
  }
}