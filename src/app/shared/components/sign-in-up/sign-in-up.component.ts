import { Component, OnInit, Input } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Users } from 'src/app/models/users.models';
import { FirestoreService } from 'src/app/core/services/firestore.service';
import { ToastService } from '../../../core/services/toast.service';
import { AuthService } from 'src/app/core/services/auth.service';

@Component({
  selector: 'app-sign-in-up',
  templateUrl: './sign-in-up.component.html',
  styleUrls: ['./sign-in-up.component.scss'],
  standalone: false
})
export class SignInUpComponent  implements OnInit {
  @Input() isLogin = false;
  @Input() toggleRoute: string = '';

  form!: FormGroup;
  showPassword: boolean = false;

  constructor(private router: Router, private fb: FormBuilder, private firestoreService: FirestoreService, private toastService: ToastService, private authService: AuthService) { }

  ngOnInit() {
    if (!this.isLogin) {
      this.form = this.fb.group({
        firstName: ['', Validators.required],
        lastName: ['', Validators.required],
        email: ['', [Validators.required, Validators.email]],
        phone: ['', [Validators.required, Validators.pattern(/^[0-9]{10}$/)]],
        password: ['', [Validators.required, Validators.minLength(6)]]
      });
    } else {
      this.form = this.fb.group({
        email: ['', [Validators.required, Validators.email]],
        password: ['', [Validators.required, Validators.minLength(6)]]
      });
    }
  }

  goToToggle() {
    this.router.navigate([this.toggleRoute]);
  }

  async onSubmit() {
    if (this.form.valid) {
      const { firstName, lastName, phone, email, password } = this.form.value;
  
      if (!this.isLogin) {
        // Validar si el número ya existe
        const exists = await this.firestoreService.checkPhoneExists(phone);
        if (exists) {
          await this.toastService.showToast('Este número ya está registrado 📱', 3000, 'warning');
          return;
        }
  
        // Si no existe, registrar usuario
        this.authService.register(email, password).then(cred => {
          const uid = cred.user.uid;
          const userData: Users = { firstName, lastName, phone };
  
          this.firestoreService.createDocumentWithId(userData, 'users', uid).then(async () => {
            await this.toastService.showToast('Usuario registrado correctamente ✅');
  
            setTimeout(() => {
              this.router.navigate(['/log-in']);
            }, 2000);
          }).catch(async err => {
            await this.toastService.showToast('Error al guardar datos 🔥', 3000, 'danger');
          });
  
        }).catch(async err => {
          await this.toastService.showToast('Error al registrar usuario 🔐', 3000, 'danger');
        });
  
      } else {
        // LOGIN
        this.authService.login(email, password).then(async () => {
          await this.toastService.showToast('Accediendo a la página de inicio... 🔑', 3000, 'success');
          this.router.navigate(['/home']);
        }).catch(async err => {
          await this.toastService.showToast('Error. Verifique sus datos 🔐', 3000, 'danger');
        });
      }
    }
  }
  

  togglePassword() {
    this.showPassword = !this.showPassword;
  }
}
