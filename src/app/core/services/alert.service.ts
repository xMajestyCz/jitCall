import { Injectable } from '@angular/core';
import { AlertController } from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class AlertService {

  constructor(private alertController: AlertController) { }

  async presentAlert(header: string, message: string, confirmText: string = 'Aceptar'): Promise<void> {
    const alert = await this.alertController.create({
      header,
      message,
      buttons: [confirmText]
    });
    await alert.present();
  }

  async presentConfirmAlert(header: string, message: string, cancelText = 'Cancelar', confirmText = 'Aceptar'): Promise<boolean> {
    return new Promise(async (resolve) => {
      const alert = await this.alertController.create({
        header,
        message,
        buttons: [
          {
            text: cancelText,
            role: 'cancel',
            handler: () => resolve(false)
          },
          {
            text: confirmText,
            handler: () => resolve(true)
          }
        ]
      });
      await alert.present();
    });
  }
}