import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';
import { Location } from '@angular/common';
import { AlertService } from 'src/app/shared/services/alert.service';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/core/services/auth.service';
import { ToastService } from 'src/app/shared/services/toast.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  standalone: false
})
export class HeaderComponent  implements OnInit {
  @Input() noShowButton = true;
  @Input() noShowExitButton = true;
  @Input() noShowCamButton = true;
  @Output() callButtonClick = new EventEmitter<void>();

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

  onCallClick() {
    this.callButtonClick.emit();
  }

  async logout() {
    try {
      await this.authService.logout();
      await this.toastService.showToast('Sesión cerrada correctamente ✅', 'success');
      this.router.navigate(['/log-in']);
    } catch (err) {
      await this.toastService.showToast('Error al cerrar sesión 🔐', 'danger');
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

  toggleRoute(){
    this.router.navigate(['/account']);
  }
}
