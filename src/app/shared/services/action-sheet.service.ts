import { Injectable } from '@angular/core';
import { ActionSheetController } from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class ActionSheetService {
  constructor(
    private actionSheetCtrl: ActionSheetController,
  ) {}

  async show(options: {
    header?: string;
    subHeader?: string;
    buttons: {
      text: string;
      role?: 'cancel' | 'destructive' | 'selected';
      icon?: string;
      handler?: () => any;
    }[];
  }): Promise<void> {
    const actionSheet = await this.actionSheetCtrl.create(options);
    await actionSheet.present();
  }
}