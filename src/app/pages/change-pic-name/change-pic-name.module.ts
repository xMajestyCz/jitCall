import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SharedModule } from 'src/app/shared/shared.module';
import { IonicModule } from '@ionic/angular';
import { ReactiveFormsModule }from '@angular/forms';
import { ChangePicNamePageRoutingModule } from './change-pic-name-routing.module';

import { ChangePicNamePage } from './change-pic-name.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ChangePicNamePageRoutingModule,
    SharedModule,
    ReactiveFormsModule
  ],
  declarations: [ChangePicNamePage]
})
export class ChangePicNamePageModule {}
