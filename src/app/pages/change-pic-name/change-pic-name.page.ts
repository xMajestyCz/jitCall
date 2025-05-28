import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UserService } from 'src/app/core/services/user.service';
import { FirestoreService } from 'src/app/core/services/firestore.service';
import { IonModal } from '@ionic/angular';
import { ToastService } from 'src/app/shared/services/toast.service';

@Component({
  selector: 'app-change-pic-name',
  templateUrl: './change-pic-name.page.html',
  styleUrls: ['./change-pic-name.page.scss'],
  standalone: false
})
export class ChangePicNamePage implements OnInit {
  @ViewChild('modal', { static: true }) modal!: IonModal;
  currentUser: any;
  form!: FormGroup;

  constructor(private userService: UserService, private fb: FormBuilder, private firestoreService: FirestoreService, private toastService: ToastService) {}

  ngOnInit() {
    this.userService.currentUser$.subscribe(user => {
      this.currentUser = user;
      this.initForm();
    });
  }

  private initForm() {
    this.form = this.fb.group({
      firstName: [this.currentUser?.firstName || '', Validators.required],
      lastName:  [this.currentUser?.lastName  || '', Validators.required],
    });
  }

  async onSubmit() {
    if (this.form.invalid || !this.currentUser) {
      return;
    }

    const { firstName, lastName } = this.form.value;

    try {
      await this.firestoreService.updateUserData(this.currentUser.id, { 
        firstName, 
        lastName 
      });
      
      this.currentUser = {
        ...this.currentUser,
        firstName,
        lastName
      };
      
      await this.userService.refreshUserData();
      
      this.modal.dismiss();
      this.toastService.showToast('Nombre actualizado correctamente', 'success');
    } catch (err) {
      console.error('Error guardando cambios:', err);
    }
  }

  cancel() {
    this.modal.dismiss();
  }
}
