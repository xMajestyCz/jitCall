import { Component, OnInit, ViewChild } from '@angular/core';
import { UserService } from 'src/app/core/services/user.service';
import { Users } from 'src/app/models/users.models';
import { IonModal } from '@ionic/angular';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from 'src/app/core/services/auth.service';
import { FirestoreService } from 'src/app/core/services/firestore.service';
import { ToastService } from 'src/app/shared/services/toast.service';

@Component({
  selector: 'app-account',
  templateUrl: './account.page.html',
  styleUrls: ['./account.page.scss'],
  standalone: false
})
export class AccountPage implements OnInit {
  loading: boolean = true;
  currentUser?: Users;

  @ViewChild('modalEmail') modalEmail!: IonModal;
  @ViewChild('modalPassword') modalPassword!: IonModal;
  @ViewChild('modalDelete') modalDelete!: IonModal;

  emailForm!: FormGroup;
  passwordForm!: FormGroup;

  constructor(
    private userService: UserService,
    private fb: FormBuilder,
    private authService: AuthService,
    private firestoreService: FirestoreService,
    private toastService: ToastService
  ) {}

  async ngOnInit() {
    this.userService.currentUser$.subscribe(user => {
      this.currentUser = user || undefined;
      this.loading = false;
    });
    this.emailForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
    this.passwordForm = this.fb.group({
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  closeModal(modal: 'modalEmail' | 'modalPassword' | 'modalDelete') {
    if (this[modal]) {
      this[modal].dismiss();
    }
  }

  async onChangeEmail() {
    if (this.emailForm.invalid) return;
    this.closeModal('modalEmail');
  }

  async onChangePassword() {
    if (this.passwordForm.invalid) return;
    this.closeModal('modalPassword');
  }

  async onDeleteAccount() {
    if (!this.currentUser) return;
    try {
      await this.firestoreService.deleteUser(this.currentUser.id);
      await this.authService.logout();
      this.toastService.showToast('Cuenta eliminada correctamente', 'success');
      this.closeModal('modalDelete');
      window.location.href = '/log-in';
    } catch (error) {
      this.toastService.showToast('Error al eliminar cuenta', 'danger');
      console.error('Error al eliminar cuenta:', error);
    }
  }
}
