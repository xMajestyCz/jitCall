import { Component, OnInit, Input } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { FirestoreService } from 'src/app/core/services/firestore.service';
import { ToastService } from '../../services/toast.service';
import { AuthService } from 'src/app/core/services/auth.service';
import { PushNotifications, Token } from '@capacitor/push-notifications';

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
      const { email, password } = this.form.value;
  
      if (this.isLogin) {
        try {
          await this.authService.login(email, password);
          await this.toastService.showToast('Accediendo a la página de inicio... 🔑', 3000, 'success');
          this.router.navigate(['/home']);
        } catch (err) {
          console.error('Error al iniciar sesión:', err);
          await this.toastService.showToast('Error. Verifique sus datos 🔐', 3000, 'danger');
        }
      } else {
        const { firstName, lastName, phone } = this.form.value;
        const exists = await this.firestoreService.checkPhoneExists(phone);
        if (exists) {
          await this.toastService.showToast('Este número ya está registrado 📱', 3000, 'warning');
          return;
        }
  
        try {
          const cred = await this.authService.register(email, password);
          const uid = cred.user.uid;
  
          let fcmToken = '';
          try {
            const permission = await PushNotifications.requestPermissions();
            if (permission.receive === 'granted') {
              PushNotifications.register();
              const token: Token = await new Promise((resolve, reject) => {
                PushNotifications.addListener('registration', resolve);
                PushNotifications.addListener('registrationError', reject);
              });
              fcmToken = token.value;
            }
          } catch (error) {
            console.error('Error al obtener el token FCM:', error);
          }

          const userData = { firstName, lastName, phone, token: fcmToken };
          await this.firestoreService.createDocumentWithId(userData, 'users', uid);
          await this.toastService.showToast('Usuario registrado correctamente ✅', 3000, 'success');
          setTimeout(() => {
            this.router.navigate(['/log-in']);
          }, 2000);
        } catch (err) {
          console.error('Error al registrar usuario:', err);
          await this.toastService.showToast('Error al registrar usuario 🔐', 3000, 'danger');
        }
      }
    }
  }

  togglePassword() {
    this.showPassword = !this.showPassword;
  }
}
