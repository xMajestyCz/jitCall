import { Component, OnInit } from '@angular/core';
import { FirestoreService } from 'src/app/core/services/firestore.service';
import { Users } from 'src/app/models/users.models';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/core/services/auth.service';
import { ToastService } from 'src/app/core/services/toast.service';

@Component({
  selector: 'app-add',
  templateUrl: './add.page.html',
  styleUrls: ['./add.page.scss'],
  standalone: false
})
export class AddPage implements OnInit {
  searchResults: Users[] = [];

  constructor(
    private firestoreService: FirestoreService,
    private router: Router,
    private toastService: ToastService,
    private authService: AuthService
  ) {}

  ngOnInit() {}

  async onSearch(event: any) {
    const searchValue = event.detail.value?.trim();
    if (!searchValue) {
      this.searchResults = [];
      return;
    }

    this.searchResults = await this.firestoreService.searchUsersByPhone(searchValue);
  }

  async addContact(user: Users) {
    try {
      const currentUser = this.authService.getCurrentUser();
      const currentUserPhone = await this.authService.getCurrentUserPhone();

      if (currentUser && currentUserPhone) {
        // Asegurarse de que el usuario autenticado no se agregue a sí mismo
        if (user.phone === currentUserPhone) {
          this.toastService.showToast('No puedes agregarte a ti mismo 😅', 2500, 'warning');
          return;
        }

        // Guardar el contacto en la colección específica del usuario
        await this.firestoreService.addContact(user, currentUser.uid);
        this.toastService.showToast('Contacto agregado con éxito ✅', 2000, 'success');
        this.router.navigate(['/home']);
      } else {
        this.toastService.showToast('No se pudo obtener el usuario autenticado ❌', 2500, 'danger');
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'No se pudo agregar el contacto ❌';
      this.toastService.showToast(message, 2500, 'danger');
    }
  }
}