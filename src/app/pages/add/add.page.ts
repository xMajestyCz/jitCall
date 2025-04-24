import { Component, OnInit } from '@angular/core';
import { Firestore, collection, doc, getDocs, query, setDoc, where } from '@angular/fire/firestore';
import { Users } from 'src/app/models/users.models';
import { ToastService } from 'src/app/core/services/toast.service';
import { FirestoreService } from 'src/app/core/services/firestore.service';
import { AuthService } from 'src/app/core/services/auth.service';

@Component({
  selector: 'app-add',
  templateUrl: './add.page.html',
  styleUrls: ['./add.page.scss'],
  standalone: false
})
export class AddPage implements OnInit {
  searchResults: Users[] = [];

  constructor(
    private firestore: Firestore,
    private firestoreService: FirestoreService,
    private toastService: ToastService,
    private authService: AuthService,
  ) {}

  ngOnInit() {}

  async onSearch(event: any) {
    const searchValue = event.detail.value?.trim();
    if (!searchValue) {
      this.searchResults = [];
      return;
    }
  
    this.searchResults = await this.firestoreService.searchUsersByPhone(searchValue);
    console.log('Resultados de búsqueda:', this.searchResults);
  }

  async addContact(user: any): Promise<void> {
    try {
      const currentUser = this.authService.getCurrentUser();
      if (!currentUser) {
        this.toastService.showToast('No se pudo obtener el usuario autenticado ❌', 2500, 'danger');
        return;
      }
  
      const currentUserPhone = await this.authService.getCurrentUserPhone();
      if (!currentUserPhone) {
        this.toastService.showToast('No se pudo obtener el número de teléfono del usuario autenticado ❌', 2500, 'danger');
        return;
      }
  
      // Validación para evitar que el usuario se agregue a sí mismo
      if (user.phone === currentUserPhone) {
        this.toastService.showToast('No puedes agregarte a ti mismo como contacto ❌', 2500, 'warning');
        return;
      }
  
      const currentUserId = currentUser.uid;
      const contactRef = collection(this.firestore, `users/${currentUserId}/contacts`);
      const q = query(contactRef, where('phone', '==', user.phone));
      const querySnapshot = await getDocs(q);
  
      if (!querySnapshot.empty) {
        this.toastService.showToast('El contacto ya ha sido agregado ❌', 2500, 'warning');
        return;
      }
  
      const contactData = {
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        token: user.token || '',
      };
  
      await setDoc(doc(contactRef, user.phone), contactData);
      this.toastService.showToast('Contacto agregado correctamente ✅', 2500, 'success');
    } catch (error) {
      console.error('Error al agregar contacto:', error);
      this.toastService.showToast('Error al agregar contacto ❌', 2500, 'danger');
    }
  }
}