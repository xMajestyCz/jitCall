import { Component, OnInit, Input } from '@angular/core';
import { Location } from '@angular/common';
import { AlertService } from 'src/app/core/services/alert.service';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/core/services/auth.service';
import { ToastService } from 'src/app/core/services/toast.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  standalone: false
})
export class HeaderComponent  implements OnInit {
  @Input() noShowButton = true;
  @Input() noShowExitButton = true;

  constructor(
      private location: Location,
      private router: Router,
      private authService: AuthService,
      private toastService: ToastService,
      private alertService: AlertService,
    ) {}

  ngOnInit() {}

  public goBack(): void {
    this.location.back();
  }

  async logout() {
    try {
      await this.authService.logout();
      await this.toastService.showToast('Sesión cerrada correctamente ✅');
      this.router.navigate(['/log-in']);
    } catch (err) {
      console.error('Error al cerrar sesión:', err);
      await this.toastService.showToast('Error al cerrar sesión 🔐', 3000, 'danger');
    }
  }

  async presentLogoutAlert() {
    const confirm = await this.alertService.presentConfirmAlert(
      '¿Cerrar sesión?',
      '¿Estás seguro que deseas cerrar sesión?',
      'Cancelar',
      'Cerrar sesión'
    );

    if (confirm) {
      this.logout();
    }
  }
}
